# Go Courier Service Backend

Week 1 backend implementation for the campus food delivery MVP.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to a reachable Postgres database.
3. Set `JWT_SECRET` to a long random value.
4. Install dependencies:

```bash
npm install
```

## Database

The migration script applies `Instructions/01-database-schema.sql` directly. It does not use a copied or renamed schema file.

```bash
npm run db:migrate
```

## Run

```bash
npm run dev
```

The API is mounted at `/api/v1`.

## Verify

```bash
npm run build
npm audit
npm test
```

`npm test` starts an embedded Postgres instance, resets the public schema, applies `Instructions/01-database-schema.sql`, and exercises OTP login, JWT role context, role blocking, and admin create/update endpoints.
