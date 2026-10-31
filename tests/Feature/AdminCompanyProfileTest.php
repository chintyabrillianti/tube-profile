<?php

namespace Tests\Feature;

use App\Models\CompanyProfile;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCompanyProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
{
    parent::setUp();
}

    public function test_guest_cannot_read_or_update_the_admin_profile(): void
    {
        $this->createProfile();

        $this->getJson('/api/admin/company-profile')->assertUnauthorized();
        $this->putJson('/api/admin/company-profile', $this->validChanges())
            ->assertUnauthorized();
    }

    public function test_non_admin_cannot_read_or_update_the_admin_profile(): void
    {
        $this->createProfile();
        $this->actingAs(User::factory()->create());

        $this->getJson('/api/admin/company-profile')->assertForbidden();
        $this->putJson('/api/admin/company-profile', $this->validChanges())
            ->assertForbidden();
    }

    public function test_admin_can_read_and_update_profile_and_public_api_returns_changes(): void
    {
        $profile = $this->createProfile();
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::query()->create(['name' => 'admin'])->id);
        $this->actingAs($admin);

        $this->getJson('/api/admin/company-profile')
            ->assertOk()
            ->assertJsonPath('data.display_name', 'Existing display name')
            ->assertJsonPath('data.email', null)
            ->assertJsonMissingPath('data.phone');

        $changes = $this->validChanges();
        $this->putJson('/api/admin/company-profile', $changes)
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.background', $changes['background'])
            ->assertJsonPath('data.updated_by', $admin->id)
            ->assertJsonPath('data.whatsapp_number', '+62 812 3456 7890')
            ->assertJsonMissingPath('data.phone');

        $this->assertDatabaseHas('company_profiles', [
            'id' => $profile->id,
            'display_name' => $changes['display_name'],
            'background' => $changes['background'],
            'updated_by' => $admin->id,
            'phone' => '0123456789',
        ]);

        $this->getJson('/api/company-profiles')
            ->assertOk()
            ->assertJsonPath('data.0.display_name', $changes['display_name'])
            ->assertJsonPath('data.0.background', $changes['background'])
            ->assertJsonPath('data.0.whatsapp_number', '+62 812 3456 7890')
            ->assertJsonMissingPath('data.0.phone')
            ->assertJsonMissingPath('data.0.updated_by');

        $this->getJson('/api/company-profiles/existing-profile')
            ->assertOk()
            ->assertJsonPath('data.display_name', $changes['display_name'])
            ->assertJsonMissingPath('data.updated_by')
            ->assertJsonMissingPath('data.is_published');
    }

    public function test_profile_update_validation_preserves_existing_data(): void
    {
        $profile = $this->createProfile();
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::query()->create(['name' => 'admin'])->id);
        $this->actingAs($admin);

        $invalid = $this->validChanges();
        $invalid['email'] = 'not-an-email';

        $this->putJson('/api/admin/company-profile', $invalid)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertDatabaseHas('company_profiles', [
            'id' => $profile->id,
            'display_name' => 'Existing display name',
        ]);
    }

    public function test_profile_update_preserves_existing_optional_fields_when_omitted(): void
    {
        $profile = $this->createProfile();
        $profile->email = 'existing@example.test';
        $profile->whatsapp_number = '+62 812 3456 7890';
        $profile->website_url = 'https://bene.example';
        $profile->business_hours = ['weekdays' => '08.00-17.00'];
        $profile->save();

        $admin = User::factory()->create();
        $admin->roles()->attach(Role::query()->create(['name' => 'admin'])->id);
        $this->actingAs($admin);

        $changes = $this->validChanges();
        unset($changes['email'], $changes['whatsapp_number'], $changes['website_url']);

        $this->putJson('/api/admin/company-profile', $changes)
            ->assertOk()
            ->assertJsonPath('data.email', 'existing@example.test')
            ->assertJsonPath('data.whatsapp_number', '+62 812 3456 7890')
            ->assertJsonPath('data.website_url', 'https://bene.example')
            ->assertJsonPath('data.business_hours.weekdays', '08.00-17.00');

        $this->assertDatabaseHas('company_profiles', [
            'id' => $profile->id,
            'email' => 'existing@example.test',
            'whatsapp_number' => '+62 812 3456 7890',
            'website_url' => 'https://bene.example',
        ]);
    }

    public function test_public_api_does_not_include_unpublished_profiles(): void
    {
        $this->createProfile();
        $unpublished = $this->createProfile('unpublished-profile');
        $unpublished->is_published = false;
        $unpublished->save();

        $this->getJson('/api/company-profiles')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonMissing(['slug' => 'unpublished-profile']);
    }

    private function createProfile(string $slug = 'existing-profile'): CompanyProfile
    {
        $profile = CompanyProfile::query()->create([
            'legal_name' => 'Existing legal name',
            'display_name' => 'Existing display name',
            'slug' => $slug,
            'background' => 'Existing background',
            'vision' => 'Existing vision',
            'mission' => 'Existing mission',
            'address' => 'Existing address',
            'email' => null,
            'whatsapp_number' => null,
            'website_url' => null,
            'business_hours' => [],
            'is_published' => true,
        ]);
        $profile->phone = '0123456789';
        $profile->save();

        return $profile;
    }

    /**
     * @return array<string, string|null>
     */
    private function validChanges(): array
    {
        return [
            'legal_name' => 'Updated legal name',
            'display_name' => 'Updated display name',
            'background' => 'Updated background text',
            'vision' => 'Updated vision text',
            'mission' => 'Updated mission text',
            'address' => 'Updated address',
            'email' => 'contact@example.test',
            'whatsapp_number' => '+62 812 3456 7890',
            'website_url' => null,
        ];
    }
}
