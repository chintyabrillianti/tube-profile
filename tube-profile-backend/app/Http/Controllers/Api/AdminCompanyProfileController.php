<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCompanyProfileController extends Controller
{
    private const PROFILE_FIELDS = [
        'legal_name',
        'display_name',
        'slug',
        'background',
        'vision',
        'mission',
        'address',
        'email',
        'whatsapp_number',
        'website_url',
        'business_hours',
        'is_published',
    ];

    public function show(): JsonResponse
    {
        $profile = CompanyProfile::query()
            ->select([...self::PROFILE_FIELDS, 'updated_by'])
            ->orderBy('id')
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $profile,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'legal_name' => ['required', 'string', 'max:200'],
            'display_name' => ['required', 'string', 'max:200'],
            'background' => ['required', 'string', 'max:20000'],
            'vision' => ['required', 'string', 'max:10000'],
            'mission' => ['required', 'string', 'max:10000'],
            'address' => ['required', 'string', 'max:10000'],
            'email' => ['nullable', 'email', 'max:255'],
            'whatsapp_number' => ['nullable', 'string', 'max:30'],
            'website_url' => ['nullable', 'url', 'max:2048'],
        ]);

        $profile = CompanyProfile::query()->orderBy('id')->firstOrFail();
        $profile->fill($validated);
        $profile->updated_by = $request->user()->id;
        $profile->save();
        $profile->refresh();

        return response()->json([
            'success' => true,
            'data' => $profile->only([...self::PROFILE_FIELDS, 'updated_by']),
        ]);
    }
}
