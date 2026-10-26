<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof User || ! $user->hasRole('admin')) {
            return response()->json([
                'message' => 'Akses hanya tersedia untuk admin.',
            ], 403);
        }

        return $next($request);
    }
}
