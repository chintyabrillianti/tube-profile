<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::query()
            ->where('is_published', true)
            ->select([
                'id',
                'name',
                'slug',
                'summary',
                'description',
                'sort_order',
            ])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    public function show(string $slug)
    {
        $service = Service::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $service,
        ]);
    }
}
