<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;

class CompanyProfileController extends Controller
{
    private const PUBLIC_FIELDS = [
        'id',
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
    ];

    public function index()
    {
        $profiles = CompanyProfile::query()
            ->where('is_published', true)
            ->select(self::PUBLIC_FIELDS)
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $profiles,
        ]);
    }

    public function show(string $slug)
    {
        $profile = CompanyProfile::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->select(self::PUBLIC_FIELDS)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $profile,
        ]);
    }
}
