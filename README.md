# SpendWise — Expense Tracker

A full-stack expense tracker: React frontend, Node/Express backend, SQLite database,
JWT-based login, and category/monthly charts.

## Stack (and why, for your explanation)

- **Frontend:** React (Vite) + `react-router-dom` for pages + `recharts` for the two charts.
- **Backend:** Node.js + Express, a small REST API.
- **Database:** SQLite via `better-sqlite3` — a single file (`backend/expenses.db`), no
  separate database server to install. Easy to demo, easy to explain, still "real SQL."
- **Auth:** Passwords are hashed with `bcryptjs` (never stored in plain text). On login,
  the server signs a JWT that the frontend stores and sends back on every request in the
  `Authorization: Bearer <token>` header. The backend's `requireAuth` middleware checks
  that token on every expense route, and every database query is scoped to
  `WHERE user_id = ?` — so one user can never see or edit another user's data.

## Folder structure

```
expense-tracker/
  backend/
    server.js          entry point, mounts routes
    db.js               creates the SQLite tables
    middleware/auth.js  verifies the JWT on protected routes
    routes/auth.js      register + login
    routes/expenses.js  CRUD + filtering + summary (for charts)
    routes/budgets.js   set/view monthly spending limits per category
  frontend/
    src/
      pages/            Login, Register, Dashboard
      components/       Navbar, ExpenseForm (modal), ExpenseList (table), ExpenseCharts, BudgetPanel
      context/           AuthContext — holds the logged-in user + token
      api.js             one place that talks to the backend
```

## Running it locally

You'll need Node.js (v18+) installed. Two terminals — backend and frontend run separately.

### 1. Backend

```bash
cd backend
cp .env.example .env      # then optionally edit JWT_SECRET
npm install
npm run dev
```

This starts the API on `http://localhost:5000` and creates `expenses.db` automatically
on first run — no manual database setup needed.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

This starts the app on `http://localhost:5173`. The Vite dev server proxies `/api`
requests to the backend (see `vite.config.js`), so the frontend just calls `/api/...`.

Open `http://localhost:5173`, register an account, and start adding expenses.

## API endpoints (for reference)

| Method | Route                        | Description                          |
|--------|-------------------------------|---------------------------------------|
| POST   | `/api/auth/register`          | Create an account                    |
| POST   | `/api/auth/login`              | Log in, returns a JWT                |
| GET    | `/api/expenses`                | List expenses (supports `?category=&from=&to=`) |
| POST   | `/api/expenses`                | Add an expense                       |
| PUT    | `/api/expenses/:id`             | Edit an expense                      |
| DELETE | `/api/expenses/:id`             | Delete an expense                    |
| GET    | `/api/expenses/stats/summary`   | Totals by category and by month, for the charts |
| GET    | `/api/budgets`                  | List budgets with this month's spend vs. limit |
| PUT    | `/api/budgets/:category`         | Set or update the monthly limit for a category |
| DELETE | `/api/budgets/:category`         | Remove the limit for a category |

## Things you could mention if asked "what would you add next"

- Password reset via email
- Recurring expenses
- Pagination for very large expense lists
- CSV export of expenses
- Deploying with a hosted Postgres instead of SQLite for multi-instance scaling
