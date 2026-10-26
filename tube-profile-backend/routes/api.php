<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AdminCompanyProfileController;
use App\Http\Controllers\Api\AdminPasswordResetController;
use App\Http\Controllers\Api\CompanyProfileController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ServiceController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AdminAuthController::class, 'login'])
    ->middleware('throttle:5,1');
Route::post('/admin/password/email', [AdminPasswordResetController::class, 'sendOtp'])
    ->middleware('throttle:5,1');
Route::post('/admin/password/verify-otp', [AdminPasswordResetController::class, 'verifyOtp'])
    ->middleware('throttle:10,1');
Route::post('/admin/password/reset', [AdminPasswordResetController::class, 'reset'])
    ->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/user', [AdminAuthController::class, 'user'])
        ->middleware('admin');

    Route::middleware('admin')->prefix('admin')->group(function (): void {
        Route::get('/company-profile', [AdminCompanyProfileController::class, 'show']);
        Route::put('/company-profile', [AdminCompanyProfileController::class, 'update']);
        Route::get('/projects', [ProjectController::class, 'adminIndex']);
        Route::post('/projects', [ProjectController::class, 'store']);
        Route::put('/projects/{project}', [ProjectController::class, 'update']);
        Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
    });
});

Route::get('/company-profiles', [CompanyProfileController::class, 'index']);
Route::get('/company-profiles/{slug}', [CompanyProfileController::class, 'show']);

Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{slug}', [ServiceController::class, 'show']);

Route::get('/projects', [ProjectController::class, 'index']);
