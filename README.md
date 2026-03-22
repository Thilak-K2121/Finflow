# Finflow — Personal Finance Tracker

A production-grade full-stack personal finance tracker built with React, Node.js, Express, and MongoDB Atlas.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Chart.js, React Router v6
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB Atlas
- **Auth:** JWT + bcrypt

## Quick Start

### 1. Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and set your values:
```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/finflow?retryWrites=true&w=majority
JWT_SECRET=your_strong_random_secret_here
PORT=5000
NODE_ENV=development
```

### 2. Install & run backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on http://localhost:5000

### 3. Install & run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free cluster
2. Under **Database Access**, create a user with read/write permissions
3. Under **Network Access**, add `0.0.0.0/0` (allow from anywhere) for development
4. Click **Connect → Connect your application** and copy the connection string
5. Paste it as `MONGO_URI` in `backend/.env`

## Project Structure

```
finance-tracker/
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/            # Route handlers
│   ├── middleware/             # JWT auth middleware
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express routes
│   └── server.js               # Entry point
└── frontend/
    └── src/
        ├── api/                # Axios instance
        ├── components/         # Reusable components
        ├── context/            # Auth context
        └── pages/              # Route pages
```

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/transactions | Yes | List transactions |
| POST | /api/transactions | Yes | Create transaction |
| PUT | /api/transactions/:id | Yes | Update transaction |
| DELETE | /api/transactions/:id | Yes | Delete transaction |
| GET | /api/transactions/summary | Yes | Dashboard analytics |
