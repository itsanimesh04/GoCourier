# Campus Food Delivery MVP (Go Courier Service)

This repository is organized into distinct frontend and backend directories:

- `backend/`: Express, TypeScript, and PostgreSQL backend service.
- `frontend/`: React, Vite, and Tailwind CSS frontend application.

---

## Getting Started

You can run commands directly from the root of the workspace using the helper scripts in the root `package.json`.

### 1. Installation

To install dependencies for both the backend and frontend at once:
```bash
npm run install:all
```

Or install them individually:
```bash
npm run install:backend
npm run install:frontend
```

### 2. Configuration

#### Backend Configuration
1. Navigate to the `backend/` directory.
2. Copy `.env.example` to `.env`.
3. Configure your local PostgreSQL `DATABASE_URL` and `JWT_SECRET`.

#### Frontend Configuration
1. Navigate to the `frontend/` directory.
2. Copy `.env.example` to `.env`.

---

## Development

You can run the development servers from the root of the project:

### Run Backend
```bash
npm run dev:backend
```

### Run Frontend
```bash
npm run dev:frontend
```

---

## Build & Test

### Backend
- Run backend tests: `npm run test:backend`
- Build backend: `npm run build:backend`

### Frontend
- Build frontend: `npm run build:frontend`
