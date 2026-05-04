# 🏥 Clinic Management System — Backend API

Production-ready REST API built with Node.js, Express, TypeScript, PostgreSQL and Drizzle ORM.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Auth**: JWT + bcrypt
- **Docs**: Swagger / OpenAPI 3.0
- **Validation**: express-validator
- **Security**: helmet, cors, rate-limit

## Quick Start

```bash
# 1. Clone and install
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your values

# 3. Generate and run migrations
npm run db:generate
npm run db:migrate

# 4. Start dev server
npm run dev
```

## API Docs
Open `http://localhost:5000/api-docs` after starting the server.

## Roles & Permissions

| Role       | Permissions |
|------------|-------------|
| admin      | Full access — manage users, view everything |
| doctor     | View own appointments, create prescriptions & records |
| patient    | View own appointments, prescriptions, records, payments |
| reception  | Create/edit appointments, patients, payments |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/roles` — Get all roles

### Users
- `GET /api/users/me` — My profile
- `GET /api/users/doctors` — All doctors (admin, reception)
- `GET /api/users/patients` — All patients (admin, doctor, reception)
- `GET /api/users/:id` — User by ID (admin)
- `PATCH /api/users/:id` — Update user (admin)
- `DELETE /api/users/:id` — Deactivate user (admin)

### Appointments
- `POST /api/appointments` — Create (reception, admin)
- `GET /api/appointments` — All (admin, reception)
- `GET /api/appointments/my` — Mine (doctor, patient)
- `GET /api/appointments/:id` — By ID
- `PATCH /api/appointments/:id` — Update (admin, reception)
- `PATCH /api/appointments/:id/cancel` — Cancel

### Medical Records
- `POST /api/medical-records` — Create (doctor)
- `GET /api/medical-records/my` — Mine (patient)
- `GET /api/medical-records/doctor` — My created (doctor)
- `GET /api/medical-records/patient/:id` — By patient (doctor, admin)

### Prescriptions
- `POST /api/prescriptions` — Create (doctor)
- `GET /api/prescriptions/my` — Mine (patient)
- `GET /api/prescriptions/doctor` — My issued (doctor)

### Payments
- `POST /api/payments` — Create (reception, admin)
- `GET /api/payments` — All (admin)
- `GET /api/payments/my` — Mine (patient)
- `PATCH /api/payments/:id/pay` — Mark as paid

## Deployment

### Railway / Render
1. Set all environment variables from `.env.example`
2. Build command: `npm run build`
3. Start command: `npm start`
4. Run migrations: `npm run db:migrate`

### Docker
```bash
docker build -t clinic-api .
docker run -p 5000:5000 --env-file .env clinic-api
```

## Project Structure

```
src/
├── config/          # Environment config
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # API routes + Swagger docs
├── middlewares/     # Auth, error, validation
├── validators/      # express-validator rules
├── db/
│   ├── schema/      # Drizzle schema + relations
│   ├── migrations/  # Auto-generated migrations
│   └── index.ts     # DB connection
├── utils/           # JWT, pagination, response helpers
├── types/           # TypeScript types
├── docs/            # Swagger config
├── app.ts           # Express app
└── server.ts        # Entry point
```
# clinic-backend
