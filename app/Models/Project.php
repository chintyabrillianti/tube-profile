<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'summary',
        'work_type',
        'description',
        'start_month',
        'start_year',
        'end_month',
        'end_year',
        'image_path',
        'imagekit_file_id',
        'is_published',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'start_month' => 'integer',
            'start_year' => 'integer',
            'end_month' => 'integer',
            'end_year' => 'integer',
            'is_published' => 'boolean',
        ];
    }
}