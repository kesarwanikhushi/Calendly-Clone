# Calendly Clone

A fully functional scheduling and booking web application that replicates Calendly's core design and user experience.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Backend | Node.js + Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Date/Timezone | date-fns + date-fns-tz |
| Calendar | react-calendar |
| Email | Nodemailer |

## Setup Instructions

### Backend

```bash
cd server
npm install
cp .env.example .env        # fill DATABASE_URL, PORT, SMTP fields
npx prisma migrate dev
npx prisma db seed
npm run dev                 # starts on port 5000
```

### Frontend

```bash
cd client
npm install
cp .env.example .env        # set VITE_API_URL=http://localhost:5000
npm run dev                 # starts on port 5173
```

## Assumptions

- Single default admin user, no authentication.
- Availability is global and applies to all event types equally.
- Timezone is stored with availability and used for slot computation.
- Email sending is optional. If SMTP is not configured, booking still succeeds silently.
- Reschedule replaces the existing meeting's times without creating a new record.
- Slug is unique and serves as the public identifier for each event type.

## Database

This project uses **PostgreSQL**.

`DATABASE_URL` format:
```
postgresql://user:password@localhost:5432/calendly
```

For MySQL, change the provider in `prisma/schema.prisma` to `"mysql"` and use:
```
mysql://root:password@localhost:3306/calendly
```

## Project Structure

```
/calendly-clone
  /client           React frontend (Vite)
    /src
      /api           Axios API modules
      /components    UI, admin, and booking components
      /layouts       Admin and public layouts
      /pages         All application pages
      /utils         Date and timezone utilities
  /server           Node.js + Express backend
    /src
      /routes        Express route definitions
      /controllers   Business logic handlers
      /lib           Prisma client, slot computation, mailer
    /prisma          Schema and seed data
```

  ## Recent UI updates

  - Center scheduling UI updated to a cleaner layout: a single "Event types" tab, a search input, and full-width event cards with a colored left stripe and right-side actions.
  - Files changed: `client/src/pages/Home.jsx`, `client/src/components/admin/EventTypeCard.jsx`.

  To preview the changes locally, run the frontend dev server:

  ```bash
  cd client
  npm install
  npm run dev
  ```
