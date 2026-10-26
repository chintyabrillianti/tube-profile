<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminPasswordOtp extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $otp,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Kode verifikasi reset kata sandi BENE')
            ->greeting('Halo,')
            ->line('Gunakan kode verifikasi berikut untuk mengatur ulang kata sandi akun admin Anda:')
            ->line($this->otp)
            ->line('Kode ini berlaku selama 5 menit dan hanya dapat digunakan satu kali.')
            ->line('Jika Anda tidak meminta kode ini, abaikan email ini.');
    }
}
