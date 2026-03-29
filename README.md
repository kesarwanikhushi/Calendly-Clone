# Calendly Clone

A lightweight scheduling and booking web application inspired by Calendly. This repository contains a React + Vite frontend and a Node.js + Express backend using Prisma for database access.

Table of contents
- Features
- Tech stack
- Quick start (dev)
- Environment variables
- Database & Prisma
- Project structure
- Notes
- Contributing

## Features

- Create and manage event types (duration, buffers, questions)
- Public booking pages for event types
- Availability and slot generation based on schedules
- Email notifications for bookings (via SMTP)

## Tech stack

- Frontend: React 19 + Vite
- Styling: Tailwind CSS
- Backend: Node.js + Express
- ORM: Prisma
- Database: PostgreSQL (development)
- Date handling: date-fns + date-fns-tz
- Email: Nodemailer

## Quick start (development)

Prerequisites
- Node.js 18+ and npm
- PostgreSQL (or another DB supported by Prisma)

Backend

```bash
cd server
npm install
cp .env.example .env      # set DATABASE_URL, PORT, SMTP_... values
npx prisma generate
npx prisma migrate dev    # creates the database schema
node seed.js              # (optional) seed sample data
npm run dev               # starts backend (nodemon) on configured PORT
```

Frontend

```bash
cd client
npm install
cp .env.example .env      # set VITE_API_URL (e.g. http://localhost:5000)
npm run dev               # starts frontend on Vite default port (5173)
```

If you prefer to use the provided npm scripts from the workspace root, adjust paths accordingly.

## Environment variables

Server `.env` (examples)

- `DATABASE_URL` — database connection string (Postgres example: `postgresql://user:pass@localhost:5432/calendly`)
- `PORT` — server port (default `5000`)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — for Nodemailer

Client `.env` (Vite)

- `VITE_API_URL` — API base URL (e.g. `http://localhost:5000`)

## Database & Prisma

This project uses Prisma. After setting `DATABASE_URL`, run:

```bash
npx prisma generate
npx prisma migrate dev
```

To reset the DB in development:

```bash
npx prisma migrate reset
node prisma/seed.js
```

## Project structure

```
calendly-clone/
  client/                # React + Vite frontend
    src/
      api/               # API helper functions (axios)
      components/        # UI components (admin, booking, shared)
      layouts/           # Admin and public layouts
      pages/             # App pages (Home, Booking, Profile...)
      utils/             # helpers (formatting, timezone)
  server/                # Node + Express backend
    prisma/               # Prisma schema and seed
    src/
      controllers/       # route handlers
      routes/            # express route definitions
      lib/               # prisma client, mailer, slot logic
```

## Notes

- The center scheduling UI was refactored to a single "Event types" tab, a search input, and full-width event cards with a colored left stripe. See `client/src/pages/Home.jsx` and `client/src/components/admin/EventTypeCard.jsx`.
- The search input in the UI is present but not yet wired to filter results (can be implemented on request).

## Contributing

1. Fork the repository and create a feature branch.
2. Run the app locally and add tests where appropriate.
3. Open a PR with a clear description of changes.

## License

MIT


  ## Recent UI updates

  - Center scheduling UI updated to a cleaner layout: a single "Event types" tab, a search input, and full-width event cards with a colored left stripe and right-side actions.
  - Files changed: `client/src/pages/Home.jsx`, `client/src/components/admin/EventTypeCard.jsx`.

  To preview the changes locally, run the frontend dev server:

  ```bash
  cd client
  npm install
  npm run dev
  ```
