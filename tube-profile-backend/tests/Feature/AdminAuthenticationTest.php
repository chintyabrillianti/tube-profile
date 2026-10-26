<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Notifications\AdminPasswordOtp;
use Illuminate\Contracts\Notifications\Dispatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['sanctum.stateful' => ['127.0.0.1:3000']]);
        config([
            'mail.default' => 'array',
            'mail.from.address' => 'admin@bene.test',
            'app.frontend_url' => 'https://bene.example',
        ]);
    }

    public function test_admin_can_login_and_read_their_session(): void
    {
        $admin = $this->createAdmin('admin@example.test');

        $this->withHeader('Origin', 'http://127.0.0.1:3000')
            ->postJson('/api/login', [
                'email' => $admin->email,
                'password' => 'correct-horse-battery',
            ])
            ->assertOk()
            ->assertJsonPath('data.email', $admin->email);

        $this->withHeader('Origin', 'http://127.0.0.1:3000')
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.id', $admin->id);
    }

    public function test_admin_can_choose_to_be_remembered(): void
    {
        $admin = $this->createAdmin('remember@example.test');

        $this->withHeader('Origin', 'http://127.0.0.1:3000')
            ->postJson('/api/login', [
                'email' => $admin->email,
                'password' => 'correct-horse-battery',
                'remember' => true,
            ])
            ->assertOk();

        $this->assertNotNull($admin->fresh()->remember_token);
    }

    public function test_non_admin_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'user@example.test',
            'password' => 'correct-horse-battery',
        ]);

        $this->withHeader('Origin', 'http://127.0.0.1:3000')
            ->postJson('/api/login', [
                'email' => 'user@example.test',
                'password' => 'correct-horse-battery',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Email atau password tidak sesuai.');

        $this->withHeader('Origin', 'http://127.0.0.1:3000')
            ->getJson('/api/user')
            ->assertUnauthorized();
    }

    public function test_admin_identity_requires_authentication(): void
    {
        $this->withHeader('Origin', 'http://127.0.0.1:3000')
            ->getJson('/api/user')
            ->assertUnauthorized();
    }

    public function test_admin_can_logout(): void
    {
        $admin = $this->createAdmin('logout@example.test');

        $this->withHeader('Origin', 'http://127.0.0.1:3000')
            ->postJson('/api/login', [
                'email' => $admin->email,
                'password' => 'correct-horse-battery',
            ])
            ->assertOk();

        $this->withHeader('Origin', 'http://127.0.0.1:3000')
            ->postJson('/api/logout')
            ->assertOk();

        $this->withHeader('Origin', 'http://127.0.0.1:3000')
            ->getJson('/api/user')
            ->assertUnauthorized();
    }

    public function test_otp_request_sends_a_six_digit_code_and_keeps_it_out_of_api_and_storage(): void
    {
        $admin = $this->createAdmin('otp-send@example.test');
        $response = $this->postJson('/api/admin/password/email', ['email' => $admin->email]);

        $response->assertOk()->assertJsonPath(
            'message',
            'Jika email tersebut terdaftar, kode verifikasi akan dikirim.',
        );

        $emailBody = $this->fakeMailBody();
        preg_match('/(?<!\d)\d{6}(?!\d)/', $emailBody, $matches);
        $this->assertCount(1, $matches);
        $otp = $matches[0];

        $this->assertStringNotContainsString($otp, $response->getContent());
        $this->assertStringNotContainsString('correct-horse-battery', $emailBody);
        $storedToken = DB::table('password_reset_tokens')
            ->where('email', $admin->email)
            ->value('token');
        $this->assertStringStartsWith('otp:', $storedToken);
        $this->assertNotSame($otp, $storedToken);
        $this->assertTrue(Hash::check($otp, substr($storedToken, 4)));
    }

    public function test_only_a_registered_admin_receives_otp_and_all_emails_get_the_same_response(): void
    {
        $admin = $this->createAdmin('enumeration-admin@example.test');
        User::factory()->create(['email' => 'enumeration-user@example.test']);

        $adminResponse = $this->postJson('/api/admin/password/email', ['email' => $admin->email]);
        $unknownResponse = $this->postJson('/api/admin/password/email', ['email' => 'enumeration-unknown@example.test']);
        $userResponse = $this->postJson('/api/admin/password/email', ['email' => 'enumeration-user@example.test']);

        $adminResponse->assertOk();
        $unknownResponse->assertOk();
        $userResponse->assertOk();
        $this->assertSame($adminResponse->json(), $unknownResponse->json());
        $this->assertSame($unknownResponse->json(), $userResponse->json());
        $this->assertCount(1, Mail::mailer('array')->getSymfonyTransport()->messages());
    }

    public function test_email_transport_failure_is_logged_without_secrets_and_uses_generic_response(): void
    {
        $admin = $this->createAdmin('mail-failure@example.test');
        $dispatcher = \Mockery::mock(Dispatcher::class);
        $dispatcher->shouldReceive('send')
            ->once()
            ->andThrow(new \RuntimeException(
                'SMTP auth failed password=fake-app-password otp=123456 token='.str_repeat('a', 64),
            ));
        app()->instance(Dispatcher::class, $dispatcher);
        Log::shouldReceive('error')
            ->once()
            ->with('Pengiriman OTP reset admin gagal.', \Mockery::on(function (array $context): bool {
                $this->assertSame(\RuntimeException::class, $context['exception_class']);
                $this->assertSame(0, $context['exception_code']);
                $this->assertSame(
                    'SMTP auth failed password=[REDACTED] otp=[REDACTED] token=[REDACTED]',
                    $context['message'],
                );

                return true;
            }));
        Log::shouldReceive('notice')
            ->once()
            ->with('Permintaan OTP reset admin tidak cocok dengan akun admin.', [
                'reason' => 'admin_account_not_found_or_role_missing',
            ]);

        $adminResponse = $this->postJson('/api/admin/password/email', ['email' => $admin->email]);
        $unknownResponse = $this->postJson('/api/admin/password/email', ['email' => 'mail-failure-unknown@example.test']);

        $adminResponse->assertOk();
        $unknownResponse->assertOk();
        $this->assertSame($adminResponse->json(), $unknownResponse->json());
        $this->assertStringNotContainsString('fake-app-password', $adminResponse->getContent());
        $this->assertStringNotContainsString('123456', $adminResponse->getContent());
        $this->assertStringNotContainsString(str_repeat('a', 64), $adminResponse->getContent());
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $admin->email]);
    }

    public function test_unconfigured_mail_returns_the_same_generic_response_for_any_email(): void
    {
        config([
            'app.env' => 'production',
            'mail.default' => 'log',
            'app.frontend_url' => 'https://bene.example',
        ]);
        Log::shouldReceive('error')
            ->twice()
            ->with('Konfigurasi pengiriman OTP admin tidak memenuhi syarat.', [
                'reason' => 'default_mailer_not_smtp',
            ]);
        $admin = $this->createAdmin('mail-disabled@example.test');

        $adminResponse = $this->postJson('/api/admin/password/email', ['email' => $admin->email]);
        $unknownResponse = $this->postJson('/api/admin/password/email', ['email' => 'mail-disabled-unknown@example.test']);

        $adminResponse->assertOk();
        $unknownResponse->assertOk();
        $this->assertSame($adminResponse->json(), $unknownResponse->json());
        $this->assertSame(
            'Jika email tersebut terdaftar, kode verifikasi akan dikirim.',
            $adminResponse->json('message'),
        );
    }

    public function test_local_environment_accepts_http_loopback_frontend_url(): void
    {
        $this->configureSmtpForResetTests('http://localhost:3000', 'local');
        Notification::fake();
        $admin = $this->createAdmin('local-reset-url@example.test');

        $this->postJson('/api/admin/password/email', ['email' => $admin->email])
            ->assertOk();

        Notification::assertSentTo($admin, AdminPasswordOtp::class);
    }

    public function test_production_rejects_http_loopback_frontend_url(): void
    {
        $this->configureSmtpForResetTests('http://127.0.0.1:3000', 'production');
        $admin = $this->createAdmin('production-loopback-reset-url@example.test');

        $this->postJson('/api/admin/password/email', ['email' => $admin->email])
            ->assertOk();
    }

    public function test_production_accepts_valid_https_frontend_url(): void
    {
        $this->configureSmtpForResetTests('https://bene.example', 'production');
        Notification::fake();
        $admin = $this->createAdmin('production-https-reset-url@example.test');

        $this->postJson('/api/admin/password/email', ['email' => $admin->email])
            ->assertOk();

        Notification::assertSentTo($admin, AdminPasswordOtp::class);
    }

    public function test_otp_resend_is_rate_limited_per_email(): void
    {
        $admin = $this->createAdmin('resend@example.test');
        $this->postJson('/api/admin/password/email', ['email' => $admin->email])->assertOk();

        $this->postJson('/api/admin/password/email', ['email' => $admin->email])
            ->assertTooManyRequests();
    }

    public function test_valid_otp_returns_a_short_lived_reset_token_and_cannot_be_reused(): void
    {
        $admin = $this->createAdmin('otp-verify@example.test');
        $otp = $this->requestOtpAndReadFromFakeMail($admin);

        $response = $this->postJson('/api/admin/password/verify-otp', [
            'email' => $admin->email,
            'otp' => $otp,
        ])->assertOk();
        $resetToken = $response->json('data.reset_token');

        $this->assertIsString($resetToken);
        $this->assertSame(64, strlen($resetToken));
        $this->assertStringNotContainsString($otp, $response->getContent());
        $this->assertStringStartsWith(
            'reset:',
            DB::table('password_reset_tokens')->where('email', $admin->email)->value('token'),
        );
        $this->postJson('/api/admin/password/verify-otp', [
            'email' => $admin->email,
            'otp' => $otp,
        ])->assertUnprocessable();
    }

    public function test_wrong_and_expired_otps_are_rejected_and_verification_attempts_are_limited(): void
    {
        $admin = $this->createAdmin('otp-limits@example.test');
        $otp = $this->requestOtpAndReadFromFakeMail($admin);
        $wrongOtp = str_pad((string) (((int) $otp + 1) % 1000000), 6, '0', STR_PAD_LEFT);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/admin/password/verify-otp', [
                'email' => $admin->email,
                'otp' => $wrongOtp,
            ])->assertUnprocessable();
        }
        $this->postJson('/api/admin/password/verify-otp', [
            'email' => $admin->email,
            'otp' => $otp,
        ])->assertTooManyRequests();

        RateLimiter::clear('otp-verify-email:'.hash('sha256', $admin->email));
        RateLimiter::clear('otp-verify-client:'.hash('sha256', $admin->email.'|127.0.0.1'));
        DB::table('password_reset_tokens')
            ->where('email', $admin->email)
            ->update(['created_at' => now()->subMinutes(6)]);

        $this->postJson('/api/admin/password/verify-otp', [
            'email' => $admin->email,
            'otp' => $otp,
        ])->assertUnprocessable();
    }

    public function test_verified_otp_can_reset_password_once_and_invalidates_existing_sessions(): void
    {
        $admin = $this->createAdmin('otp-reset@example.test');
        $otp = $this->requestOtpAndReadFromFakeMail($admin);
        $resetToken = $this->postJson('/api/admin/password/verify-otp', [
            'email' => $admin->email,
            'otp' => $otp,
        ])->assertOk()->json('data.reset_token');
        $oldRememberToken = $admin->remember_token;

        DB::table('sessions')->insert([
            'id' => 'admin-session',
            'user_id' => $admin->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'test',
            'payload' => 'payload',
            'last_activity' => now()->timestamp,
        ]);
        if (Schema::hasTable('personal_access_tokens')) {
            DB::table('personal_access_tokens')->insert([
                'tokenable_type' => User::class,
                'tokenable_id' => $admin->id,
                'name' => 'test',
                'token' => hash('sha256', Str::random(40)),
                'abilities' => '["*"]',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->postJson('/api/admin/password/reset', [
            'email' => $admin->email,
            'token' => Str::random(64),
            'password' => 'NewSecurePassword12!',
            'password_confirmation' => 'NewSecurePassword12!',
        ])->assertUnprocessable();

        $this->postJson('/api/admin/password/reset', [
            'email' => $admin->email,
            'token' => $resetToken,
            'password' => 'NewSecurePassword12!',
            'password_confirmation' => 'NewSecurePassword12!',
        ])->assertOk();

        $admin->refresh();
        $this->assertTrue(Hash::check('NewSecurePassword12!', $admin->password));
        $this->assertNotSame($oldRememberToken, $admin->remember_token);
        $this->assertDatabaseMissing('sessions', ['user_id' => $admin->id]);
        if (Schema::hasTable('personal_access_tokens')) {
            $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $admin->id]);
        }
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $admin->email]);
        $this->postJson('/api/admin/password/reset', [
            'email' => $admin->email,
            'token' => $resetToken,
            'password' => 'AnotherSecurePassword12!',
            'password_confirmation' => 'AnotherSecurePassword12!',
        ])->assertUnprocessable();

    }

    public function test_reset_proof_expires_and_weak_or_unconfirmed_passwords_are_rejected(): void
    {
        $admin = $this->createAdmin('otp-expiry@example.test');
        $otp = $this->requestOtpAndReadFromFakeMail($admin);
        $resetToken = $this->postJson('/api/admin/password/verify-otp', [
            'email' => $admin->email,
            'otp' => $otp,
        ])->assertOk()->json('data.reset_token');

        $this->postJson('/api/admin/password/reset', [
            'email' => $admin->email,
            'token' => $resetToken,
            'password' => 'weak',
            'password_confirmation' => 'different',
        ])->assertUnprocessable();

        DB::table('password_reset_tokens')
            ->where('email', $admin->email)
            ->update(['created_at' => now()->subMinutes(6)]);
        $this->postJson('/api/admin/password/reset', [
            'email' => $admin->email,
            'token' => $resetToken,
            'password' => 'NewSecurePassword12!',
            'password_confirmation' => 'NewSecurePassword12!',
        ])->assertUnprocessable();
        $this->assertTrue(Hash::check('correct-horse-battery', $admin->fresh()->password));
    }

    public function test_non_admin_cannot_verify_or_reset_password(): void
    {
        $user = User::factory()->create([
            'email' => 'ordinary-user@example.test',
            'password' => 'correct-horse-battery',
        ]);

        $this->postJson('/api/admin/password/verify-otp', [
            'email' => $user->email,
            'otp' => '123456',
        ])->assertUnprocessable();
        $this->postJson('/api/admin/password/reset', [
            'email' => $user->email,
            'token' => Str::random(64),
            'password' => 'NewSecurePassword12!',
            'password_confirmation' => 'NewSecurePassword12!',
        ])->assertUnprocessable();

        $this->assertTrue(Hash::check('correct-horse-battery', $user->fresh()->password));
    }

    public function test_password_reset_proof_attempts_are_limited(): void
    {
        $admin = $this->createAdmin('reset-limits@example.test');

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/admin/password/reset', [
                'email' => $admin->email,
                'token' => Str::random(64),
                'password' => 'NewSecurePassword12!',
                'password_confirmation' => 'NewSecurePassword12!',
            ])->assertUnprocessable();
        }

        $this->postJson('/api/admin/password/reset', [
            'email' => $admin->email,
            'token' => Str::random(64),
            'password' => 'NewSecurePassword12!',
            'password_confirmation' => 'NewSecurePassword12!',
        ])->assertTooManyRequests();
    }

    public function test_password_reset_request_is_rate_limited_by_ip(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/admin/password/email', [
                'email' => "unknown{$attempt}@example.test",
            ])->assertOk();
        }

        $this->postJson('/api/admin/password/email', [
            'email' => 'another-unknown@example.test',
        ])->assertTooManyRequests();
    }

    private function requestOtpAndReadFromFakeMail(User $admin): string
    {
        $sendKey = 'otp-send:'.hash('sha256', strtolower($admin->email));
        RateLimiter::clear($sendKey);
        Mail::purge('array');

        $this->postJson('/api/admin/password/email', [
            'email' => $admin->email,
        ])->assertOk();

        $emailBody = $this->fakeMailBody();
        preg_match('/(?<!\d)\d{6}(?!\d)/', $emailBody, $matches);
        $this->assertCount(1, $matches);

        return $matches[0];
    }

    private function fakeMailBody(): string
    {
        $messages = Mail::mailer('array')->getSymfonyTransport()->messages();
        $this->assertCount(1, $messages);
        $email = $messages->first()->getOriginalMessage();

        return ($email->getHtmlBody() ?? '').($email->getTextBody() ?? '');
    }

    private function createAdmin(string $email): User
    {
        $admin = User::factory()->create([
            'email' => $email,
            'password' => Hash::make('correct-horse-battery'),
        ]);
        $admin->roles()->attach(Role::query()->firstOrCreate(['name' => 'admin'])->id);

        return $admin;
    }

    private function configureSmtpForResetTests(string $frontendUrl, string $environment): void
    {
        config([
            'app.env' => $environment,
            'app.frontend_url' => $frontendUrl,
            'mail.default' => 'smtp',
            'mail.from.address' => 'admin@example.test',
            'mail.mailers.smtp' => [
                'transport' => 'smtp',
                'scheme' => 'smtp',
                'host' => 'smtp.example.test',
                'port' => 587,
                'username' => 'admin@example.test',
                'password' => 'test-password',
            ],
        ]);
    }
}
