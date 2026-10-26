<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password as PasswordRule;

class CreateAdminUser extends Command
{
    protected $signature = 'tube-profile:create-admin';

    protected $description = 'Create an administrator account interactively';

    public function handle(): int
    {
        $name = trim((string) $this->ask('Nama admin'));
        $email = strtolower(trim((string) $this->ask('Email admin')));
        $password = (string) $this->secret('Password (minimal 12 karakter, huruf besar-kecil, angka, dan simbol)');
        $passwordConfirmation = (string) $this->secret('Ulangi password');
        $passwordIsValid = Validator::make(
            ['password' => $password],
            ['password' => [PasswordRule::min(12)->mixedCase()->numbers()->symbols()]],
        )->passes();

        if ($name === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Nama dan alamat email yang valid wajib diisi.');

            return self::FAILURE;
        }

        if (! $passwordIsValid || $password !== $passwordConfirmation) {
            $this->error('Password harus minimal 12 karakter dengan huruf besar, huruf kecil, angka, dan simbol, serta harus cocok.');

            return self::FAILURE;
        }

        if (User::query()->whereRaw('LOWER(email) = ?', [$email])->exists()) {
            $this->error('Email tersebut sudah digunakan. Tidak ada perubahan dibuat.');

            return self::FAILURE;
        }

        DB::transaction(function () use ($name, $email, $password): void {
            $role = Role::query()->firstOrCreate(
                ['name' => 'admin'],
                ['description' => 'Administrator'],
            );

            $user = User::query()->create([
                'name' => $name,
                'email' => $email,
                'password' => $password,
            ]);

            $user->roles()->attach($role->id);
        });

        $this->info('Akun admin berhasil dibuat.');

        return self::SUCCESS;
    }
}
