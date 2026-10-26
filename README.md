# Tube Profile

**Company Profile & Lead Generation Platform for Tube and Pipe Cleaning Services**

Tube Profile is a web-based platform designed to introduce industrial tube and pipe cleaning services, showcase company information and project portfolios, and help potential customers request cleaning estimates.

The platform consists of a public-facing website and an administrative interface for managing company information and project portfolios.

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
- Project image upload and validation.
- Login, forgot-password, and password-reset workflows with OTP support, where configured.

### Estimate Request
The estimate form is designed to collect relevant tube and pipe cleaning requirements, including:
- Inner diameter (mm).
- Tube or pipe length (mm).
- Quantity.
- Contaminant type: soft, medium, or hard.

The estimate is intended to exclude mobilization and demobilization costs. Final pricing and operational terms should be confirmed with the service provider.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Laravel, PHP |
| Database | PostgreSQL |
| API | REST API |
| Authentication | Laravel Sanctum, with admin authorization |
| Frontend Testing | Vitest |
| Backend Testing | Laravel PHPUnit test suite |
| Version Control | Git and GitHub |

## Project Structure

```text
tube-profile/
├── tube-profile-frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── tube-profile-backend/
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── tests/
│   ├── composer.json
│   └── ...
└── README.md
```

## Getting Started

### Prerequisites

Install the following tools before running the application:

- Git
- Node.js and npm
- PHP compatible with the backend dependencies
- Composer
- PostgreSQL
- A web browser

### 1. Clone the Repository

```bash
git clone https://github.com/chintyabrillianti/tube-profile.git
cd tube-profile
```

### 2. Set Up the Backend

Open a terminal in the backend directory:

```bash
cd tube-profile-backend
composer install
```

Create a local environment configuration from the example file if one is provided:

```bash
cp .env.example .env
```

On Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

Configure the local environment with your PostgreSQL connection details and the required application settings. Do not commit your `.env` file or expose credentials.

Generate the Laravel application key:

```bash
php artisan key:generate
```

Create the PostgreSQL database according to your local configuration.

**Database setup:** Review the existing migrations and confirm the target database before running any migration. Never run migrations against a production database unintentionally.

Once the local database is ready, run the migrations if appropriate:

```bash
php artisan migrate
```

Start the backend development server:

```bash
php artisan serve
```

Laravel typically serves the application at `http://127.0.0.1:8000`.

### 3. Set Up the Frontend

Open another terminal:

```bash
cd tube-profile-frontend
npm install
```

Create the frontend environment configuration using the variable names expected by the project's API client. Configure the API base URL to point to your local Laravel backend.

Start the Next.js development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

> **Note:** The frontend and backend must be configured to communicate correctly. Authentication cookies, CSRF protection, CORS, and Sanctum stateful domains may also require local configuration.

## Testing

### Backend

From `tube-profile-backend`:

```bash
php artisan test
```

### Frontend

From `tube-profile-frontend`:

```bash
npm test
npm run lint
npm run build
```

The commands above are intended for local validation. Test results can vary depending on the environment and available services.

## Security Notes

- Never commit `.env` files, API keys, passwords, access tokens, or production credentials.
- Use environment variables for sensitive configuration.
- Restrict administrative functionality to authorized administrators.
- Validate uploaded files and user input on the server.
- Configure CORS, CSRF protection, and authentication settings for the intended deployment environment.
- Use HTTPS and secure cookie settings in production.
- Use a dedicated test database for automated tests.

## Project Status

The project includes a Next.js frontend, Laravel backend, administrative features, and automated tests.

Production deployment, external PostgreSQL connectivity, and real SMTP/OTP delivery should be verified in the target environment before the application is considered production-ready.

## Author

**Chintya Ayu Brillianti**

GitHub: [@chintyabrillianti](https://github.com/chintyabrillianti)

## License

No license has been specified yet. All rights are reserved by the project owner unless a license is added to this repository.
