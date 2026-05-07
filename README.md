# House of Celebs — Booking & Admin Platform

A modern **room/experience booking website** with **real-time slot availability**, **Razorpay payments**, and a **secure admin dashboard** to manage bookings.

## Major Features

- **Experience booking flow**
  - Choose package → select date/time → add-ons → checkout → confirmation.
- **Live availability + conflict prevention**
  - Public availability endpoint returns **blocked ranges** and **suggested slots**.
  - Overlap checks happen on both **frontend** (UX) and **backend** (data integrity).
- **Payment-ready booking holds**
  - When checkout starts, the backend creates a **pending booking** (temporary hold) and a Razorpay order.
  - **Expired pending holds** are released automatically (15 minute window).
- **Razorpay integration (end-to-end)**
  - Create order → client checkout → server-side signature verification → booking confirmation.
  - Webhook endpoint updates booking status as a safety net.
- **Admin Dashboard (session-based)**
  - Session check (`/api/auth/me`) before loading booking data.
  - View bookings, edit/reschedule, cancel, delete, toggle payment status.
  - Calendar view grouped by date.
- **Notifications**
  - Email notifications via Nodemailer service (best-effort; failures won’t break booking).

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, Framer Motion
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Auth (Admin)**: JWT stored in **httpOnly cookie** (`adminToken`)
- **Payments**: Razorpay (orders + verification + webhooks)

## Project Structure

- `src/`: React app (pages + reusable components)
- `public/`: static assets
- `backend/`: Express API (routes, controllers, models, middleware, services)

## Booking Flow (High Level)

1. User checks availability: `GET /api/bookings/availability`
2. User proceeds to payment:
   - `POST /api/bookings/create-order` creates:
     - Razorpay order
     - **pending** MongoDB booking (slot hold)
3. On success, client calls `POST /api/bookings/verify-payment`
4. Backend verifies signature + payment status, then marks booking:
   - `paymentStatus: completed`
   - `status: confirmed`

## Running Locally

### Prerequisites

- Node.js (LTS recommended)
- MongoDB connection string
- Razorpay keys (for payments)

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000` by default.

### 2) Frontend

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Environment Variables

### Backend (`backend/.env`)

```bash
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

MONGO_URI=your_mongodb_connection_string

SESSION_SECRET=some_session_secret
JWT_SECRET=some_jwt_secret

# Admin bootstrap (optional; creates admin on first boot if missing)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strongpassword123

# Razorpay
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Email (notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM="House of Celebs <no-reply@example.com>"
```

### Frontend (`.env`)

```bash
VITE_API_URL=http://localhost:5000
```

## Admin Access

- Admin UI is served at `GET /admin`.
- The dashboard checks session first via `GET /api/auth/me`.
- If not authenticated, the **login form is shown** inside `/admin` and data loads only after login success.

## Deployment Notes

- `vercel.json`: configured for Vercel (frontend)
- `render.yaml`: configured for Render (backend)
- If deploying cross-site (different domains), ensure:
  - `FRONTEND_URL` is correct
  - cookies are set with appropriate `secure`/`sameSite` settings
  - CORS allows credentials

## API (Key Routes)

- **Public**
  - `GET /api/bookings/availability`
  - `POST /api/bookings/create-order`
  - `POST /api/bookings/verify-payment`
  - `POST /api/bookings/payment-failed`
  - `POST /api/bookings/webhook` (Razorpay)
- **Admin (requires session)**
  - `GET /api/bookings`
  - `PUT /api/bookings/:id`
  - `PATCH /api/bookings/:id/cancel`
  - `PATCH /api/bookings/:id/payment-status`
  - `DELETE /api/bookings/:id`

## License

Add a license if you plan to open-source this repository.
