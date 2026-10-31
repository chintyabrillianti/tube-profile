<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class ImageKitService
{
    private function privateKey(): string
    {
        $key = config('services.imagekit.private_key');

        if (! is_string($key) || $key === '') {
            throw new RuntimeException(
                'ImageKit Private Key belum dikonfigurasi.'
            );
        }

        return $key;
    }

    public function upload(UploadedFile $file): array
    {
        $response = Http::timeout(60)
            ->withBasicAuth($this->privateKey(), '')
            ->attach(
                'file',
                file_get_contents($file->getRealPath()),
                $file->hashName()
            )
            ->post('https://upload.imagekit.io/api/v1/files/upload', [
                'fileName' => $file->hashName(),
                'folder' => '/tube-profile/projects',
                'useUniqueFileName' => 'true',
            ]);

        $response->throw();

        $result = $response->json();

        if (
            ! is_array($result)
            || empty($result['fileId'])
            || empty($result['url'])
        ) {
            throw new RuntimeException(
                'ImageKit tidak memberikan data file yang valid.'
            );
        }

        return [
            'file_id' => $result['fileId'],
            'url' => $result['url'],
        ];
    }

    public function delete(string $fileId): void
    {
        $response = Http::timeout(30)
            ->withBasicAuth($this->privateKey(), '')
            ->delete(
                'https://api.imagekit.io/v1/files/'
                .rawurlencode($fileId)
            );

        $response->throw();
    }
}