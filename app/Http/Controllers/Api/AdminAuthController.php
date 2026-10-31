<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ]);
        $remember = (bool) ($credentials['remember'] ?? false);
        unset($credentials['remember']);
        $credentials['email'] = strtolower($credentials['email']);

        if (! Auth::guard('web')->attempt($credentials, $remember)) {
            return response()->json([
                'message' => 'Email atau password tidak sesuai.',
            ], 422);
        }

        $request->session()->regenerate();

        $user = Auth::guard('web')->user();

        if (! $user instanceof User || ! $user->hasRole('admin')) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Email atau password tidak sesuai.',
            ], 422);
        }

        return response()->json([
            'data' => $user->only(['id', 'name', 'email']),
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->only(['id', 'name', 'email']),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        Auth::guard('sanctum')->forgetUser();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Anda telah keluar.',
        ]);
    }
}
