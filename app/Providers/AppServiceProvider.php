<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $resetUrl = function ($notifiable, string $token): string {
            $query = http_build_query([
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);

            return rtrim((string) config('app.frontend_url'), '/').'/admin/reset-password?'.$query;
        };

        ResetPassword::createUrlUsing($resetUrl);
        ResetPassword::toMailUsing(fn ($notifiable, string $token): MailMessage => (new MailMessage)
            ->subject('Atur ulang kata sandi admin BENE')
            ->greeting('Halo,')
            ->line('Kami menerima permintaan untuk mengatur ulang kata sandi akun admin Anda.')
            ->action('Atur Ulang Kata Sandi', $resetUrl($notifiable, $token))
            ->line('Tautan ini berlaku selama '.config('auth.passwords.users.expire').' menit.')
            ->line('Jika Anda tidak meminta pengaturan ulang ini, Anda dapat mengabaikan email ini.'));
    }
}
