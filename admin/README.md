# GoCourier Admin

Dark admin console for managing campuses, restaurants, menu items, categories, banners, orders, users, payments, revenue, and app settings.

## Setup

```bash
npm install
cp .env.example .env   # if present; otherwise ensure VITE_BACKEND_BASE_URL is set
npm run dev
```

Runs on [http://localhost:5174](http://localhost:5174) by default.

Env:

```
VITE_BACKEND_BASE_URL=http://localhost:8000/api/v1
```

## Backend requirements

1. Configure S3 vars on the API (`AWS_*`, `S3_BUCKET`, `S3_PUBLIC_BASE_URL`).
2. Seed an admin user:

```bash
cd ../backend
npm run seed:admin -- admin@gocourier.com 'YourStrongPassword' "Admin"
```

3. Ensure `ADMIN_ORIGIN=http://localhost:5174` is set for CORS cookies.
