# Tube Profile frontend

The public BENE website and admin interface use Next.js, React, TypeScript,
Tailwind CSS, and a Laravel JSON API.

## Local development

Use Node.js 20.9 or newer. From this directory:

```bash
npm ci
```

The API URL defaults to `http://127.0.0.1:8000/api`. To override it, create a
local `.env.local` file (do not commit it) with:

```dotenv
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Start Laravel and Next.js in separate terminals, then open
`http://127.0.0.1:3000`. For cookie-based admin authentication, use the same
hostname for both applications and configure Laravel's
`SANCTUM_STATEFUL_DOMAINS` and `CORS_ALLOWED_ORIGINS` for that exact frontend
host and port. Production deployments must use HTTPS and credentialed CORS
with explicit origins; never use `*` for allowed origins.

## Admin and API

The public pages read company profiles from `GET /api/company-profiles` and
projects from `GET /api/projects`. The admin interface is available at
`/admin/login`; its authenticated API requests use Laravel Sanctum session
cookies and CSRF protection. Configure the Laravel environment and create an
admin account using the backend README instructions. Do not put credentials
or server-only secrets in `NEXT_PUBLIC_*` variables.

The price dialog currently explains that official service tariffs are not
available and directs visitors to contact BENE; it does not calculate a quote.

## Checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```
