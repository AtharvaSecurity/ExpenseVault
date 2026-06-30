# ExpenseVault

A full-stack, production-ready expense management application. Track expenses, organize them into categories, view analytics on a dashboard, and export reports as CSV or PDF.

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, React Router, Axios, Tailwind CSS, Recharts, React Hook Form, Zod

**Backend:** NestJS, TypeScript, Prisma ORM, MySQL, JWT Authentication (Passport), bcrypt

**Infrastructure:** Docker, Docker Compose, GitHub Actions CI/CD, ESLint, Prettier

## Features

- JWT-based authentication (register, login, logout, protected routes)
- Dashboard with total/monthly/weekly expense stats, category breakdown, and a 6-month trend chart
- Full expense CRUD with search, filtering, sorting, and pagination
- Custom expense categories with color coding
- Monthly/weekly reports, category analytics, and CSV/PDF export
- Profile management: update profile info, change password
- Responsive UI with dark mode and toast notifications

## Project Structure

```
expensevault/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/            # Authentication module
│   │   ├── users/           # User profile module
│   │   ├── expenses/        # Expense CRUD + dashboard stats
│   │   ├── categories/      # Category CRUD
│   │   ├── reports/         # Reports + CSV/PDF export
│   │   ├── prisma/          # Prisma service/module
│   │   └── common/          # Shared decorators/filters
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts
├── frontend/                 # React + Vite SPA
│   └── src/
│       ├── api/              # Axios API clients
│       ├── components/       # UI, layout, chart, domain components
│       ├── context/          # Auth & Theme context
│       ├── pages/            # Route-level pages
│       ├── routes/           # Route guards
│       ├── types/            # Shared TypeScript types
│       └── utils/            # Formatting & validation helpers
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Getting Started with Docker (Recommended)

This is the fastest way to run the entire stack.

```bash
cp .env.example .env
docker compose up -d --build
```

This starts:
- MySQL on port `3306`
- Backend API on `http://localhost:3000/api/v1`
- Frontend on `http://localhost:5173`

The backend container automatically runs `prisma migrate deploy` on startup. To seed demo data:

```bash
docker compose exec backend npx prisma db seed
```

Demo login: `demo@expensevault.com` / `Password123!`

To stop everything:

```bash
docker compose down
```

To stop and wipe the database volume:

```bash
docker compose down -v
```

## Running Locally Without Docker

### Prerequisites
- Node.js 20+
- A running MySQL 8 instance

### Backend

```bash
cd backend
cp .env.example .env
# edit .env to point DATABASE_URL at your MySQL instance
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

The API will be available at `http://localhost:3000/api/v1`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost:3306/expensevault` |
| `JWT_SECRET` | Secret used to sign JWTs | long random string |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `PORT` | API port | `3000` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:3000/api/v1` |

## API Overview

All endpoints are prefixed with `/api/v1`.

- `POST /auth/register` — create an account
- `POST /auth/login` — authenticate and receive a JWT
- `POST /auth/logout` — logout
- `GET /auth/me` — get current user (requires auth)
- `GET/PATCH /users/me` — view/update profile (requires auth)
- `POST /users/me/change-password` — change password (requires auth)
- `GET/POST /expenses`, `GET/PATCH/DELETE /expenses/:id` — expense CRUD (requires auth)
- `GET /expenses/dashboard/stats` — dashboard summary (requires auth)
- `GET /expenses/dashboard/trend` — monthly trend data (requires auth)
- `GET/POST /categories`, `GET/PATCH/DELETE /categories/:id` — category CRUD (requires auth)
- `GET /reports/monthly/:year/:month` — monthly report (requires auth)
- `GET /reports/weekly` — weekly report (requires auth)
- `GET /reports/categories` — category analytics (requires auth)
- `GET /reports/export/csv` — export expenses as CSV (requires auth)
- `GET /reports/export/pdf` — export expenses as PDF (requires auth)

## Testing & Linting

```bash
# Backend
cd backend
npm run lint
npm run test

# Frontend
cd frontend
npm run lint
```

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push/PR to `main`/`develop`:
1. Installs backend & frontend dependencies
2. Runs lint checks on both
3. Runs backend tests against a MySQL service container
4. Builds both backend and frontend
5. Validates that both Docker images build successfully

## Security Notes

- Passwords are hashed with bcrypt (cost factor 10)
- All mutating endpoints are protected by JWT auth guards
- All input is validated via `class-validator` DTOs with whitelist/forbid-non-whitelisted enabled
- Prisma's parameterized queries protect against SQL injection
- CORS is restricted to the configured frontend origin
- Secrets are supplied via environment variables, never hardcoded

## License

MIT
