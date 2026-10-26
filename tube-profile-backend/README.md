<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Tube Profile admin authentication

The admin login uses Laravel Sanctum's first-party session-cookie flow. Set
`SANCTUM_STATEFUL_DOMAINS` and `CORS_ALLOWED_ORIGINS` to the exact frontend
host and port. The frontend and API should use the same hostname in local
development (for example, both `127.0.0.1`). In production, use HTTPS and set
`SESSION_SECURE_COOKIE=true`; do not use wildcard CORS origins with cookies.

After confirming that the database has the `roles` and `user_roles` tables, run
`php artisan tube-profile:create-admin` to create an admin interactively. The
command prompts for an email and a password of at least 12 characters with
uppercase and lowercase letters, a number, and a symbol. It was not run as
part of this audit. The role-table migration creates either table only if it is
missing and does not drop existing role data when rolled back.

The admin login page is `/admin/login`. Protected API requests must use the
`auth:sanctum` and `admin` middleware. The public profile and service endpoints
remain public.

Admins can manage the existing company profile at `/admin/company-profile`.
The protected `GET` and `PUT /api/admin/company-profile` endpoints use the
existing `company_profiles` table; no schema migration is required. Public
profile endpoints return only published profile fields.

## Tube Profile projects

Project records extend the existing `projects` table without removing legacy
columns or data. Run `php artisan migrate` to add the month/year period, work
type, and image-path fields. Project images use Laravel's public storage disk;
run `php artisan storage:link` so URLs under `/storage` can be served.

The public `GET /api/projects` endpoint returns only published projects with
complete portfolio details. Admins manage all records through the protected
`GET`, `POST`, `PUT`, and `DELETE /api/admin/projects` endpoints. Create and
update requests accept multipart form data and JPG, PNG, or WebP images up to
5 MB.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Agentic Development

Laravel's predictable structure and conventions make it ideal for AI coding agents like Claude Code, Cursor, and GitHub Copilot. Install [Laravel Boost](https://laravel.com/docs/ai) to supercharge your AI workflow:

```bash
composer require laravel/boost --dev

php artisan boost:install
```

Boost provides your agent 15+ tools and skills that help agents build Laravel applications while following best practices.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
