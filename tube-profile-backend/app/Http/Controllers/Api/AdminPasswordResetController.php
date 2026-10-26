<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\AdminPasswordOtp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Throwable;

class AdminPasswordResetController extends Controller
{
    private const OTP_LIFETIME_SECONDS = 300;

    private const OTP_RESEND_SECONDS = 60;

    private const MAX_OTP_ATTEMPTS = 5;

    private const MAX_RESET_ATTEMPTS = 5;

    public function sendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);
        $email = strtolower($validated['email']);
        $sendLimitKey = $this->rateLimitKey('otp-send', $email);

        if (RateLimiter::tooManyAttempts($sendLimitKey, 1)) {
            return $this->throttledResponse();
        }
        RateLimiter::hit($sendLimitKey, self::OTP_RESEND_SECONDS);

        if (($configurationIssue = $this->resetEmailConfigurationIssue()) !== null) {
            Log::error('Konfigurasi pengiriman OTP admin tidak memenuhi syarat.', [
                'reason' => $configurationIssue,
            ]);

            return $this->genericRequestResponse();
        }

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if (! $user?->hasRole('admin')) {
            Log::notice('Permintaan OTP reset admin tidak cocok dengan akun admin.', [
                'reason' => 'admin_account_not_found_or_role_missing',
            ]);

            return $this->genericRequestResponse();
        }

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $tokenTable = config('auth.passwords.users.table');
        $otpHash = 'otp:'.Hash::make($otp);

        DB::table($tokenTable)->updateOrInsert(
            ['email' => $user->email],
            ['token' => $otpHash, 'created_at' => now()],
        );

        try {
            $user->notify(new AdminPasswordOtp($otp));
        } catch (Throwable $exception) {
            DB::table($tokenTable)
                ->where('email', $user->email)
                ->where('token', $otpHash)
                ->delete();

            Log::error('Pengiriman OTP reset admin gagal.', [
                'exception_class' => $exception::class,
                'exception_code' => $exception->getCode(),
                'message' => $this->sanitizeMailError($exception->getMessage()),
            ]);

            return $this->genericRequestResponse();
        }

        return $this->genericRequestResponse();
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'otp' => ['required', 'digits:6'],
        ]);
        $email = strtolower($validated['email']);
        $attemptKeys = [
            $this->rateLimitKey('otp-verify-email', $email),
            $this->rateLimitKey('otp-verify-client', $email, $request),
        ];

        if ($this->hasExceededAttempts($attemptKeys, self::MAX_OTP_ATTEMPTS)) {
            return $this->throttledResponse();
        }
        $this->recordAttempts($attemptKeys, self::OTP_LIFETIME_SECONDS);

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if (! $user?->hasRole('admin')) {
            return $this->invalidOtpResponse();
        }

        $resetToken = Str::random(64);
        $tokenTable = config('auth.passwords.users.table');
        $verified = DB::transaction(function () use ($user, $validated, $tokenTable, $resetToken): bool {
            $record = DB::table($tokenTable)
                ->where('email', $user->email)
                ->lockForUpdate()
                ->first();

            if (
                ! $user->hasRole('admin')
                || ! $record
                || ! str_starts_with($record->token, 'otp:')
                || ! $record->created_at
                || Carbon::parse($record->created_at)->addSeconds(self::OTP_LIFETIME_SECONDS)->isPast()
                || ! Hash::check($validated['otp'], substr($record->token, 4))
            ) {
                return false;
            }

            DB::table($tokenTable)
                ->where('email', $user->email)
                ->update([
                    'token' => 'reset:'.hash('sha256', $resetToken),
                    'created_at' => now(),
                ]);

            return true;
        });

        if (! $verified) {
            return $this->invalidOtpResponse();
        }

        $this->clearAttempts($attemptKeys);

        return response()->json([
            'data' => ['reset_token' => $resetToken],
        ]);
    }

    public function reset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'token' => ['required', 'string', 'size:64'],
            'password' => ['required', 'confirmed', PasswordRule::min(12)->mixedCase()->numbers()->symbols()],
        ]);
        $email = strtolower($validated['email']);
        $attemptKeys = [
            $this->rateLimitKey('password-reset-email', $email),
            $this->rateLimitKey('password-reset-client', $email, $request),
        ];

        if ($this->hasExceededAttempts($attemptKeys, self::MAX_RESET_ATTEMPTS)) {
            return $this->throttledResponse();
        }
        $this->recordAttempts($attemptKeys, self::OTP_LIFETIME_SECONDS);

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if (! $user?->hasRole('admin')) {
            return $this->invalidResetResponse();
        }

        $tokenTable = config('auth.passwords.users.table');
        $reset = DB::transaction(function () use ($user, $validated, $tokenTable): bool {
            $record = DB::table($tokenTable)
                ->where('email', $user->email)
                ->lockForUpdate()
                ->first();

            if (
                ! $user->hasRole('admin')
                || ! $record
                || ! str_starts_with($record->token, 'reset:')
                || ! $record->created_at
                || Carbon::parse($record->created_at)->addSeconds(self::OTP_LIFETIME_SECONDS)->isPast()
                || ! hash_equals(substr($record->token, 6), hash('sha256', $validated['token']))
            ) {
                return false;
            }

            $user->forceFill([
                'password' => $validated['password'],
                'remember_token' => Str::random(60),
            ])->save();

            DB::table($tokenTable)->where('email', $user->email)->delete();

            if (Schema::hasTable('sessions')) {
                DB::table('sessions')->where('user_id', $user->getKey())->delete();
            }

            if (Schema::hasTable('personal_access_tokens')) {
                DB::table('personal_access_tokens')
                    ->where('tokenable_type', $user::class)
                    ->where('tokenable_id', $user->getKey())
                    ->delete();
            }

            return true;
        });

        if (! $reset) {
            return $this->invalidResetResponse();
        }

        $this->clearAttempts($attemptKeys);

        return response()->json([
            'message' => 'Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru.',
        ]);
    }

    private function genericRequestResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'Jika email tersebut terdaftar, kode verifikasi akan dikirim.',
        ]);
    }

    private function invalidOtpResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'Kode verifikasi tidak valid atau telah kedaluwarsa.',
        ], 422);
    }

    private function invalidResetResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'Verifikasi tidak valid atau telah kedaluwarsa. Minta kode baru.',
        ], 422);
    }

    private function throttledResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'Terlalu banyak percobaan. Tunggu sebentar sebelum mencoba lagi.',
        ], 429);
    }

    private function rateLimitKey(string $purpose, string $email, ?Request $request = null): string
    {
        $source = $request ? $email.'|'.$request->ip() : $email;

        return $purpose.':'.hash('sha256', $source);
    }

    /**
     * @param  array<int, string>  $keys
     */
    private function hasExceededAttempts(array $keys, int $maxAttempts): bool
    {
        foreach ($keys as $key) {
            if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<int, string>  $keys
     */
    private function recordAttempts(array $keys, int $decaySeconds): void
    {
        foreach ($keys as $key) {
            RateLimiter::hit($key, $decaySeconds);
        }
    }

    /**
     * @param  array<int, string>  $keys
     */
    private function clearAttempts(array $keys): void
    {
        foreach ($keys as $key) {
            RateLimiter::clear($key);
        }
    }

    private function resetEmailConfigurationIssue(): ?string
    {
        $frontendUrl = config('app.frontend_url');
        $parsedFrontendHost = is_string($frontendUrl) ? parse_url($frontendUrl, PHP_URL_HOST) : null;
        $frontendHost = is_string($parsedFrontendHost) ? strtolower($parsedFrontendHost) : null;
        $frontendScheme = is_string($frontendUrl) ? parse_url($frontendUrl, PHP_URL_SCHEME) : null;
        $isLoopbackHost = in_array($frontendHost, ['localhost', '127.0.0.1'], true);
        $isLocalEnvironment = in_array(config('app.env'), ['local', 'development'], true);
        $isLocalHttpUrl = $isLocalEnvironment && $frontendScheme === 'http' && $isLoopbackHost;
        $isPublicHttpsUrl = $frontendScheme === 'https' && ! $isLoopbackHost;

        if (
            ! is_string($frontendUrl)
            || filter_var($frontendUrl, FILTER_VALIDATE_URL) === false
            || (! $isLocalHttpUrl && ! $isPublicHttpsUrl)
        ) {
            return 'frontend_url_invalid_or_disallowed';
        }

        if (app()->environment('testing') && config('mail.default') === 'array') {
            return null;
        }

        $smtp = config('mail.mailers.smtp');
        $fromAddress = config('mail.from.address');
        $host = is_array($smtp) ? strtolower((string) ($smtp['host'] ?? '')) : '';
        $scheme = is_array($smtp) ? ($smtp['scheme'] ?? 'smtp') : null;
        $port = is_array($smtp) ? filter_var($smtp['port'] ?? null, FILTER_VALIDATE_INT) : false;

        if (config('mail.default') !== 'smtp' || ! is_array($smtp) || ($smtp['transport'] ?? null) !== 'smtp') {
            return 'default_mailer_not_smtp';
        }

        if (
            ! in_array($scheme, ['smtp', 'smtps'], true)
            || ! filled($host)
            || in_array($host, ['localhost', '127.0.0.1', 'example.com'], true)
            || $port === false
            || $port < 1
            || $port > 65535
            || ! filled($smtp['username'] ?? null)
            || ! filled($smtp['password'] ?? null)
        ) {
            return 'smtp_settings_incomplete_or_invalid';
        }

        if (
            ! is_string($fromAddress)
            || filter_var($fromAddress, FILTER_VALIDATE_EMAIL) === false
            || str_ends_with(strtolower($fromAddress), '@example.com')
        ) {
            return 'from_address_invalid';
        }

        return null;
    }

    private function sanitizeMailError(string $message): string
    {
        $smtp = config('mail.mailers.smtp');
        $secrets = [
            is_array($smtp) ? ($smtp['username'] ?? null) : null,
            is_array($smtp) ? ($smtp['password'] ?? null) : null,
        ];

        foreach ($secrets as $secret) {
            if (is_string($secret) && $secret !== '') {
                $message = str_replace($secret, '[REDACTED]', $message);
            }
        }

        $message = preg_replace(
            '/\b(password|pass|secret|token|otp|authorization)\b\s*[:=]\s*["\']?[^\s,"\']+/i',
            '$1=[REDACTED]',
            $message,
        ) ?? '';
        $message = preg_replace('/(?<!\d)\d{6}(?!\d)/', '[REDACTED]', $message) ?? '';
        $message = preg_replace('/\b[A-Za-z0-9_-]{32,}\b/', '[REDACTED]', $message) ?? '';
        $message = preg_replace('/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i', '[REDACTED]', $message) ?? '';
        $message = preg_replace('/(smtps?:\/\/)[^@\s]+@/i', '$1[REDACTED]@', $message) ?? '';
        $message = preg_replace('/[\r\n\t]+/', ' ', $message) ?? '';

        return mb_substr(trim($message), 0, 500);
    }
}
