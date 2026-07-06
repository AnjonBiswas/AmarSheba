# AmarSheba

AmarSheba is a full-stack Bangladesh citizen-services platform that helps people discover public services, understand application requirements, save useful services, track reminders, and quickly access emergency contacts.

It includes:

- a bilingual React frontend
- a Node.js + Express API
- a MySQL database
- an admin dashboard for service and application management

## Highlights

- Bangla and English interface
- Searchable public service directory
- Individual service detail pages with:
  - required documents
  - fees
  - processing timelines
  - step-by-step guidance
  - checklist tracking
- Emergency contact directory with favorites and nearby sorting
- Authentication with registration, login, and OTP email verification
- Personal dashboard for saved services, favorites, reminders, and recent visits
- Admin dashboard for services, contacts, applications, and overview stats
- Rule-based assistant for service guidance
- Light/dark theme support

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express, JWT, bcryptjs, nodemailer
- Database: MySQL

## Project Structure

```text
AmarSheba/
  frontend/
  backend/
  database/
  README.md
```

## Getting Started

This project is set up for local development on Windows with XAMPP, but it can be adapted to other environments.

### 1. Requirements

- Node.js
- npm
- MySQL
- XAMPP or another local MySQL setup

### 2. Import the Database

Create a database named `amarsheba`, then import:

```text
database/amarsheba.sql
```

That file creates the tables and seeds sample data, including the admin account and starter services.

### 3. Configure the Backend

Create `backend/.env` with values like these:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=amarsheba
PORT=5000
JWT_SECRET=amarsheba_secret_key
JWT_EXPIRES_IN=7d
OTP_EXPIRES_MINUTES=10
```

Optional SMTP settings for OTP email delivery:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
SMTP_FROM=AmarSheba <no-reply@example.com>
```

If SMTP is not configured, OTP codes are logged in the backend console for development.

### 4. Run the Backend

```bash
cd backend
npm install
npm run dev
```

Backend URL:

- `http://localhost:5000`

Health check:

- `http://localhost:5000/api/health`

### 5. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://localhost:5173`

## Environment Variables

### Backend

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=amarsheba
PORT=5000
JWT_SECRET=amarsheba_secret_key
JWT_EXPIRES_IN=7d
OTP_EXPIRES_MINUTES=10
```

### Frontend

Optional:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

If this is not set, the frontend falls back to `http://localhost:5000/api`.

## Main Pages

- `/` Home
- `/services` Service directory
- `/services/:serviceId` Service details
- `/services/emergency` Emergency contacts
- `/assistant` Service assistant
- `/dashboard` User dashboard
- `/admin` Admin dashboard
- `/profile` Profile page
- `/login` Login
- `/register` Registration
- `/contact` Contact form
- `/about` About page
- `/faq` FAQ page

## Admin Access

Seeded admin account:

```text
Email: admin@amarsheba.com
Password: admin123
```

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-otp`
- `POST /api/auth/resend-otp`
- `GET /api/auth/me`

### Services

- `GET /api/services`
- `GET /api/services/:id`
- `POST /api/services`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`

### Contact

- `POST /api/contact`
- `GET /api/contact`

### Applications

- `GET /api/applications`
- `PUT /api/applications/:id`

### Admin

- `GET /api/admin/overview`

### Emergency

- `GET /api/emergency`
- `GET /api/emergency/:id`
- `POST /api/emergency`
- `PUT /api/emergency/:id`
- `DELETE /api/emergency/:id`

## Notes

- Browser `localStorage` is used for some user-specific features like favorites, recent activity, reminders, and checklist progress.
- The app supports Bangla/English localization and theme switching.
- The frontend and backend are designed to run locally without extra infrastructure beyond MySQL and optional SMTP.

## Troubleshooting

### Backend cannot connect to MySQL

- Make sure MySQL is running
- Confirm the database name is `amarsheba`
- Check the values in `backend/.env`

### Frontend cannot reach the API

- Make sure the backend is running on port `5000`
- Set `VITE_API_BASE_URL` if your API runs on a different host or port

### OTP email is not sent

- Configure SMTP settings in `backend/.env`
- If SMTP is not configured, check the backend terminal for the fallback OTP log

## License

No license has been specified yet.
