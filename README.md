# Employee Task Tracker

Employee Task Tracker is a role-based task-management application. Administrators manage employees, administrators and managers create and update tasks, and employees manage the status of tasks assigned to them.

The project contains an Angular frontend and an Express/Sequelize/PostgreSQL backend with Socket.IO notifications.

## Features

- JWT-based authentication with `ADMIN`, `MANAGER`, and `USER` roles
- Employee creation, editing, filtering, pagination, and deactivation
- Task creation, editing, assignment, filtering, and Excel export
- Personal task view and status updates for assigned users
- Role-specific dashboards
- Profile editing, password changes, and profile-picture uploads
- Real-time task and status notifications through Socket.IO

## Project structure

```text
employee-task-tracker/
├── backend/
│   ├── migrations/       # Sequelize schema migrations
│   ├── seeders/          # Initial data seeders
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # HTTP request handlers
│   │   ├── middlewares/  # Authentication, roles, upload handling
│   │   ├── models/       # Sequelize models and relationships
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic and database access
│   │   └── utils/        # JWT and password utilities
│   └── tests/            # Backend integration tests
└── frontend/
    └── src/app/
        ├── core/         # Models, guards, interceptors, shared services
        ├── features/     # Auth, dashboard, employees, profile, tasks
        └── shared/       # Reusable layout and UI components
```

## Prerequisites

- Node.js 20+ recommended
- npm
- PostgreSQL 14+

## Backend setup

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Configure `backend/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_task_tracker
DB_USER=postgres
DB_PASSWORD=replace-with-your-database-password
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
```

Create the database, then apply migrations:

```powershell
npx sequelize-cli db:migrate --config src/config/sequelize-cli-config.js
```

Optional: seed the initial administrator.

```powershell
npx sequelize-cli db:seed:all --config src/config/sequelize-cli-config.js
```

Start the API:

```powershell
node src/server.js
```

The API listens on `http://localhost:3000` unless `PORT` is changed.

## Frontend setup

```powershell
cd frontend
npm install
npm start
```

The Angular development server normally runs at `http://localhost:4200`.

> **Configuration note:** The current client, CORS configuration, and Socket.IO configuration use `http://192.168.0.127` directly. Update these values for your environment before running locally or deploying. A future improvement is to centralize them in Angular environment files and backend environment variables.

## API overview

All protected routes expect:

```http
Authorization: Bearer <jwt>
```

| Area | Method and endpoint | Allowed roles |
| --- | --- | --- |
| Authentication | `POST /api/auth/login` | Public |
| Employees | `GET /api/users` | ADMIN |
| Employees | `POST /api/users` | ADMIN |
| Employees | `PUT /api/users/:id` | ADMIN |
| Employees | `PATCH /api/users/:id/deactivate` | ADMIN |
| Tasks | `GET /api/tasks` | ADMIN, MANAGER |
| Tasks | `POST /api/tasks` | ADMIN, MANAGER |
| Tasks | `PUT /api/tasks/:id` | ADMIN, MANAGER |
| Tasks | `GET /api/tasks/my` | USER, MANAGER |
| Tasks | `PATCH /api/tasks/:id/status` | USER, MANAGER |
| Tasks | `GET /api/tasks/assignable-users` | ADMIN, MANAGER |
| Profile | `GET /api/profile` | Authenticated users |
| Profile | `PUT /api/profile` | Authenticated users |
| Profile | `PUT /api/profile/change-password` | Authenticated users |
| Profile image | `POST /api/profile/picture` | Authenticated users |

Profile images accept JPEG, PNG, or WebP files up to 2 MB.

## Tests and builds

Backend tests use a separate test environment file. Create a local `backend/.env.test` with a dedicated test database before running them.

```powershell
cd backend
npm test -- --runInBand
```

Run frontend unit tests:

```powershell
cd frontend
npm test -- --watch=false
```

Create a production frontend build:

```powershell
cd frontend
npm run build
```

## Security and deployment checklist

- Never commit `.env`, `.env.test`, production credentials, or private keys.
- Use a long, unique `JWT_SECRET` for every environment.
- Configure CORS with the deployed frontend origin rather than a hard-coded development IP.
- Keep profile uploads out of Git; use persistent storage or object storage in production.
- Run migrations as part of deployment before starting the server.
- Serve the frontend and API over HTTPS in production.
- Add rate limiting and security headers before exposing the login API publicly.

## Current development notes

The repository is actively being developed. Before a production release, ensure that the frontend bundle meets its configured size budget and that the backend integration suite passes against a clean migrated test database.
