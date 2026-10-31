<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use App\Models\Project;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminProjectsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    public function test_public_api_only_returns_published_projects(): void
    {
        Storage::fake('public');
        $published = $this->createProject(['is_published' => true]);
        $this->createProject(['title' => 'Draft project', 'is_published' => false]);

        $this->getJson('/api/projects')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $published->id)
            ->assertJsonPath('data.0.work_type', 'dry_pigging')
            ->assertJsonPath('data.0.image_url', Storage::disk('public')->url($published->image_path));
    }

    public function test_guests_and_non_admins_cannot_manage_projects(): void
    {
        $project = $this->createProject();

        $this->getJson('/api/admin/projects')->assertUnauthorized();
        $this->postJson('/api/admin/projects', $this->projectData())
            ->assertUnauthorized();
        $this->putJson('/api/admin/projects/' . $project->id, $this->projectData())
            ->assertUnauthorized();
        $this->deleteJson('/api/admin/projects/' . $project->id)->assertUnauthorized();

        $this->actingAs(User::factory()->create());
        $this->getJson('/api/admin/projects')->assertForbidden();
        $this->deleteJson('/api/admin/projects/' . $project->id)->assertForbidden();
    }

    public function test_admin_can_upload_create_edit_and_delete_project(): void
    {
        $this->fakeImageKitUploads(2);
        Storage::fake('public');
        $admin = $this->admin();
        $this->actingAs($admin);

        $this->post('/api/admin/projects', [
            ...$this->projectData(),
            'image' => UploadedFile::fake()->image('project.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Tube inspection project')
            ->assertJsonPath('data.is_published', true);

        $project = Project::query()->firstOrFail();

        $oldImagePath = $project->image_path;
        $oldFileId = $project->imagekit_file_id;

        self::assertStringStartsWith(
            'https://ik.imagekit.io/',
            $oldImagePath
        );

        self::assertNotEmpty($oldFileId);

        $this->post('/api/admin/projects/' . $project->id, [
            '_method' => 'PUT',
            ...$this->projectData([
                'title' => 'Updated project title',
                'work_type' => 'ect',
                'is_published' => '0',
            ]),
            'image' => UploadedFile::fake()->image('replacement.png'),
        ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated project title')
            ->assertJsonPath('data.work_type', 'ect')
            ->assertJsonPath('data.is_published', false);

        $project->refresh();

        self::assertNotSame($oldImagePath, $project->image_path);
        self::assertNotSame($oldFileId, $project->imagekit_file_id);

        $replacementPath = $project->image_path;

        self::assertStringStartsWith(
            'https://ik.imagekit.io/',
            $replacementPath
        );

        self::assertNotEmpty($project->imagekit_file_id);

        $this->getJson('/api/projects')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->deleteJson('/api/admin/projects/' . $project->id)
            ->assertOk()
            ->assertJsonPath('success', true);

        self::assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    public function test_admin_project_validation_rejects_bad_type_period_and_image(): void
    {
        Storage::fake('public');
        $this->actingAs($this->admin());

        $invalid = $this->projectData([
            'work_type' => 'unknown',
            'start_month' => 5,
            'start_year' => 2026,
            'end_month' => 4,
            'end_year' => 2026,
        ]);
        $this->post('/api/admin/projects', [
            ...$invalid,
            'image' => UploadedFile::fake()->create('document.pdf', 10, 'application/pdf'),
        ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['work_type', 'end_month', 'image']);
        self::assertDatabaseCount('projects', 0);
    }

    public function test_admin_project_validation_rejects_missing_fields_and_oversized_image(): void
    {
        $this->actingAs($this->admin());

        $this->post('/api/admin/projects', [], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'title',
                'work_type',
                'start_month',
                'start_year',
                'end_month',
                'end_year',
                'is_published',
                'image',
            ]);

        $this->post('/api/admin/projects', [
            ...$this->projectData(),
            'image' => UploadedFile::fake()->image('too-large.jpg')->size(5121),
        ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('image');
        self::assertDatabaseCount('projects', 0);
    }

    public function test_admin_can_edit_project_without_replacing_existing_image(): void
    {
        $this->actingAs($this->admin());
        $project = $this->createProject();
        $imagePath = $project->image_path;

        $this->post('/api/admin/projects/' . $project->id, [
            '_method' => 'PUT',
            ...$this->projectData(['title' => 'Updated without image']),
        ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated without image');

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'image_path' => $imagePath,
        ]);
        Storage::disk('public')->assertExists($imagePath);
    }

    public function test_shared_image_is_not_removed_when_another_project_uses_it(): void
    {
        Storage::fake('public');
        $this->actingAs($this->admin());
        $project = $this->createProject();
        $anotherProject = $this->createProject([
            'title' => 'Second project',
            'image_path' => $project->image_path,
        ]);

        $this->deleteJson('/api/admin/projects/' . $project->id)->assertOk();

        Storage::disk('public')->assertExists($project->image_path);
        self::assertDatabaseHas('projects', ['id' => $anotherProject->id]);
    }

    public function test_legacy_project_can_receive_portfolio_fields_and_an_image(): void
    {
        $this->fakeImageKitUploads(1);
        $this->actingAs($this->admin());
        $project = $this->createProject([
            'summary' => null,
            'work_type' => null,
            'start_month' => null,
            'start_year' => null,
            'end_month' => null,
            'end_year' => null,
            'image_path' => null,
            'is_published' => false,
            'description' => 'Long legacy project description retained.',
        ]);

        $this->post('/api/admin/projects/' . $project->id, [
            '_method' => 'PUT',
            ...$this->projectData(['title' => $project->title]),
            'image' => UploadedFile::fake()->image('legacy-project.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.work_type', 'dry_pigging')
            ->assertJsonPath('data.start_month', 1)
            ->assertJsonPath('data.is_published', true);

        self::assertDatabaseHas('projects', [
            'id' => $project->id,
            'slug' => $project->slug,
            'image_path' => $project->fresh()->image_path,
            'description' => 'Long legacy project description retained.',
            'summary' => 'Short description of the work.',
        ]);

        $project->refresh();

        self::assertStringStartsWith(
            'https://ik.imagekit.io/',
            $project->image_path
        );

        self::assertNotEmpty($project->imagekit_file_id);
    }
    private function fakeImageKitUploads(int $count): void
    {
        config([
            'services.imagekit.private_key' => 'test-private-key',
        ]);

        $sequence = Http::sequence();

        for ($i = 1; $i <= $count; $i++) {
            $sequence->push([
                'fileId' => 'test-imagekit-file-' . $i,
                'url' => 'https://ik.imagekit.io/bene/tube-profile/projects/test-image-' . $i . '.jpg',
            ], 200);
        }

        Http::fake([
            'https://upload.imagekit.io/api/v1/files/upload' => $sequence,
            'https://api.imagekit.io/v1/files/*' => Http::response([], 204),
        ]);
    }
    private function createProject(array $overrides = []): Project
    {
        Storage::disk('public')->put('projects/existing.jpg', 'image-data');

        return Project::query()->create([
            'slug' => 'test-project-' . bin2hex(random_bytes(6)),
            ...$this->projectData(),
            'summary' => 'Short description of the work.',
            'image_path' => 'projects/existing.jpg',
            'created_by' => null,
            'updated_by' => null,
            ...$overrides,
        ]);
    }

    private function admin(): User
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::query()->create(['name' => 'admin'])->id);

        return $admin;
    }

    private function projectData(array $overrides = []): array
    {
        return [
            'title' => 'Tube inspection project',
            'work_type' => 'dry_pigging',
            'description' => 'Short description of the work.',
            'start_month' => '1',
            'start_year' => '2026',
            'end_month' => '3',
            'end_year' => '2026',
            'is_published' => '1',
            ...$overrides,
        ];
    }
}
