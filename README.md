# Tube Profile

**Company Profile & Lead Generation Platform for Tube and Pipe Cleaning Services**

Tube Profile is a web-based platform designed to introduce industrial tube and pipe cleaning services, showcase company information and project portfolios, and help potential customers request cleaning estimates.

The platform consists of a public-facing website and an administrative dashboard for managing company information and project portfolios.

## Features

### Public Website
- Company profile, background, vision, and mission.
- Information about services and products.
- Project portfolio and project details.
- Tube and pipe cleaning estimate form.
- Contact information and WhatsApp integration.

### Admin Dashboard
- Admin authentication and access control.
- Company profile management.
- Project portfolio management.
- Project image upload, preview, and validation.
- Forgot-password and password-reset workflows with OTP support, where configured.

### Estimate Request
The estimate form collects:
- Inner diameter (mm).
- Tube or pipe length (mm).
- Quantity.
- Contaminant type: soft, medium, or hard.

The estimated price excludes mobilization and demobilization costs. Final pricing and operational terms should be confirmed with the service provider.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Laravel, PHP |
| Database | PostgreSQL |
| API | REST API |
| Authentication | Laravel Sanctum |
| Image Storage | ImageKit |
| Frontend Testing | Vitest |
| Backend Testing | PHPUnit |
| Version Control | Git and GitHub |

## Project Structure

```text
tube-profile/
├── app/                    # Laravel application
├── bootstrap/
├── config/
├── database/
├── public/
├── resources/
├── routes/
├── storage/
├── tests/
├── frontend/               # Next.js application
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── artisan
├── composer.json
├── composer.lock
└── README.md
```

## Getting Started

### Prerequisites

- Git
- Node.js and npm
- PHP compatible with Laravel dependencies
- Composer
- PostgreSQL

### 1. Clone the Repository

```bash
git clone https://github.com/chintyabrillianti/tube-profile.git
cd tube-profile
```

### 2. Backend Setup

Install dependencies:

```bash
composer install
```

Create the environment file:

```powershell
Copy-Item .env.example .env
```

Configure PostgreSQL and the required application environment variables in `.env`.

Generate the application key:

```bash
php artisan key:generate
```

Run database migrations after confirming the target database:

```bash
php artisan migrate
```

Configure ImageKit credentials:

```dotenv
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
```

Do not commit the actual `.env` file or expose credentials.

Create an administrator after the required role tables exist:

```bash
php artisan tube-profile:create-admin
```

Start the backend:

```bash
php artisan serve
```

The default local backend address is `http://127.0.0.1:8000`.

### 3. Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
```

Configure the frontend API environment variable according to the API client and authentication setup.

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

The frontend and backend must be configured to communicate correctly. Authentication requires appropriate Sanctum stateful domains, CORS, CSRF, and session-cookie settings.

## Admin Authentication

The admin login uses Laravel Sanctum's session-cookie authentication.

Configure `SANCTUM_STATEFUL_DOMAINS` and `CORS_ALLOWED_ORIGINS` for the intended frontend host. In production, use HTTPS and secure session cookies.

The admin login page is:

```text
/admin/login
```

Protected API endpoints require authenticated administrator access. Public company profile, service, and project endpoints remain accessible without admin authentication.

## Project Portfolio Management

Administrators can manage project portfolio records through protected API endpoints:

- `GET /api/admin/projects`
- `POST /api/admin/projects`
- `PUT /api/admin/projects/{project}`
- `DELETE /api/admin/projects/{project}`

Public projects are available through:

```text
GET /api/projects
```

Project images are stored using ImageKit. The database stores the image URL and ImageKit file identifier to support image updates and deletion.

## Testing

### Backend

From the project root:

```bash
php artisan test
```

### Frontend

From the `frontend` directory:

```bash
npm test
npm run lint
npm run build
```

Test results may vary depending on the environment and available services.

## Security Notes

- Never commit `.env` files, API keys, passwords, or production credentials.
- Use environment variables for sensitive configuration.
- Restrict administrative functionality to authorized administrators.
- Validate uploaded files and user input on the server.
- Configure CORS, CSRF, Sanctum, and secure cookies correctly.
- Use HTTPS in production.
- Use a dedicated test database for automated tests.

## Project Status

The project includes a Next.js frontend, Laravel backend, PostgreSQL database integration, administrative features, project portfolio management, and external image storage through ImageKit.

Production deployment, database connectivity, authentication, and email/OTP delivery should be verified in the target hosting environment before the application is considered production-ready.

## Author

**Chintya Ayu Brillianti**

GitHub: [@chintyabrillianti](https://github.com/chintyabrillianti)

## License

No license has been specified yet. All rights are reserved by the project owner unless a license is added to this repository.
