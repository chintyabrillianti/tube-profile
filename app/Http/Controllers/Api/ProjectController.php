<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Services\ImageKitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use RuntimeException;

class ProjectController extends Controller
{
    public function __construct(
        private ImageKitService $imageKit
    ) {}

    public function index(): JsonResponse
    {
        $projects = Project::query()
            ->where('is_published', true)
            ->whereIn('work_type', ['dry_pigging', 'ect'])
            ->whereNotNull('work_type')
            ->whereNotNull('start_month')
            ->whereNotNull('start_year')
            ->whereNotNull('end_month')
            ->whereNotNull('end_year')
            ->whereNotNull('image_path')
            ->orderByDesc('end_year')
            ->orderByDesc('end_month')
            ->orderBy('title')
            ->get()
            ->map(fn (Project $project): array => $this->projectData($project));

        return response()->json([
            'success' => true,
            'data' => $projects,
        ]);
    }

    public function adminIndex(): JsonResponse
    {
        $projects = Project::query()
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (Project $project): array => $this->projectData($project));

        return response()->json([
            'success' => true,
            'data' => $projects,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateProject($request, true);

        $uploadedImage = $this->imageKit->upload(
            $request->file('image')
        );

        try {
            $project = Project::query()->create([
                ...$validated,
                'slug' => $this->uniqueSlug($validated['title']),
                'summary' => $validated['description'] ?? '',
                'description' => $validated['description'] ?? '',
                'image_path' => $uploadedImage['url'],
                'imagekit_file_id' => $uploadedImage['file_id'],
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]);
        } catch (\Throwable $exception) {
            $this->deleteRemoteImage($uploadedImage['file_id']);
            throw $exception;
        }

        return response()->json([
            'success' => true,
            'data' => $this->projectData($project),
        ], 201);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $validated = $this->validateProject(
            $request,
            $project->image_path === null
        );

        $oldImagePath = $project->image_path;
        $oldImageKitFileId = $project->imagekit_file_id;

        $newImage = $request->hasFile('image')
            ? $this->imageKit->upload($request->file('image'))
            : null;

        try {
            $project->fill([
                'title' => $validated['title'],
                'work_type' => $validated['work_type'],
                'summary' => $validated['description'] ?? '',
                'start_month' => $validated['start_month'],
                'start_year' => $validated['start_year'],
                'end_month' => $validated['end_month'],
                'end_year' => $validated['end_year'],
                'is_published' => $validated['is_published'],
                ...($newImage ? [
                    'image_path' => $newImage['url'],
                    'imagekit_file_id' => $newImage['file_id'],
                ] : []),
                'updated_by' => $request->user()->id,
            ]);

            $project->save();
        } catch (\Throwable $exception) {
            if ($newImage) {
                $this->deleteRemoteImage($newImage['file_id']);
            }

            throw $exception;
        }

        if ($newImage && $oldImagePath) {
            $this->deleteImageIfUnused(
                $oldImagePath,
                $oldImageKitFileId
            );
        }

        return response()->json([
            'success' => true,
            'data' => $this->projectData($project->refresh()),
        ]);
    }

    public function destroy(Project $project): JsonResponse
    {
        $imagePath = $project->image_path;
        $imageKitFileId = $project->imagekit_file_id;

        $project->delete();

        if ($imagePath) {
            $this->deleteImageIfUnused(
                $imagePath,
                $imageKitFileId
            );
        }

        return response()->json([
            'success' => true,
        ]);
    }

    private function validateProject(
        Request $request,
        bool $imageRequired
    ): array {
        $rules = [
            'title' => ['required', 'string', 'max:200'],
            'work_type' => ['required', Rule::in(['dry_pigging', 'ect'])],
            'description' => ['nullable', 'string', 'max:5000'],
            'start_month' => ['required', 'integer', 'between:1,12'],
            'start_year' => ['required', 'integer', 'between:1900,2200'],
            'end_month' => ['required', 'integer', 'between:1,12'],
            'end_year' => ['required', 'integer', 'between:1900,2200'],
            'is_published' => ['required', 'boolean'],
            'image' => [
                $imageRequired ? 'required' : 'sometimes',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ];

        $validator = Validator::make($request->all(), $rules, [
            'work_type.in' => 'Pilih jenis pekerjaan yang tersedia.',
            'start_month.between' => 'Bulan mulai harus di antara Januari dan Desember.',
            'end_month.between' => 'Bulan selesai harus di antara Januari dan Desember.',
            'image.required' => 'Gambar proyek wajib diunggah.',
            'image.image' => 'File harus berupa gambar.',
            'image.mimes' => 'Format gambar harus JPG, PNG, atau WebP.',
            'image.max' => 'Ukuran gambar maksimal 5 MB.',
        ]);

        $validator->after(function ($validator) use ($request): void {
            foreach (['start_month', 'start_year', 'end_month', 'end_year'] as $field) {
                if ($validator->errors()->has($field)) {
                    return;
                }
            }

            $start = ((int) $request->input('start_year') * 12)
                + (int) $request->input('start_month');

            $end = ((int) $request->input('end_year') * 12)
                + (int) $request->input('end_month');

            if ($end < $start) {
                $validator->errors()->add(
                    'end_month',
                    'Periode selesai harus sama dengan atau setelah periode mulai.'
                );
            }
        });

        $validated = $validator->validate();
        unset($validated['image']);

        return $validated;
    }

    private function deleteImageIfUnused(
        string $path,
        ?string $fileId
    ): void {
        if ($fileId) {
            $stillUsed = Project::query()
                ->where('imagekit_file_id', $fileId)
                ->exists();

            if (! $stillUsed) {
                $this->deleteRemoteImage($fileId);
            }

            return;
        }

        $disk = Storage::disk('public');

        $stillUsed = Project::query()
            ->where('image_path', $path)
            ->exists();

        if (
            ! $stillUsed
            && $disk->exists($path)
            && ! $disk->delete($path)
        ) {
            Log::warning('Gambar proyek lokal gagal dihapus.', [
                'path' => $path,
            ]);
        }
    }

    private function deleteRemoteImage(string $fileId): void
    {
        try {
            $this->imageKit->delete($fileId);
        } catch (\Throwable $exception) {
            Log::warning('Gambar proyek gagal dihapus dari ImageKit.', [
                'file_id' => $fileId,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function projectData(Project $project): array
    {
        $data = $project->only([
            'id',
            'title',
            'slug',
            'work_type',
            'start_month',
            'start_year',
            'end_month',
            'end_year',
            'is_published',
        ]);

        $data['description'] = $project->summary !== null
            ? $project->summary
            : ($project->description ?: null);

        $data['image_url'] = $project->imagekit_file_id
            ? $project->image_path
            : ($project->image_path
                ? Storage::disk('public')->url($project->image_path)
                : null);

        return $data;
    }

    private function uniqueSlug(string $title): string
    {
        $slug = \Illuminate\Support\Str::slug($title);
        $base = $slug !== '' ? $slug : 'project';
        $slug = $base;
        $suffix = 2;

        while (Project::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }
}
