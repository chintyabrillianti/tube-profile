<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyProfile extends Model
{
    protected $fillable = [
        'legal_name',
        'display_name',
        'slug',
        'background',
        'vision',
        'mission',
        'address',
        'email',
        'whatsapp_number',
        'website_url',
        'business_hours',
        'is_published',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'business_hours' => 'array',
            'is_published' => 'boolean',
        ];
    }
}
