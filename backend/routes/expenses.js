import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Every route below requires a valid token, and every query is scoped to
// req.user.id so one user can never read or modify another user's data.
router.use(requireAuth);

// GET /api/expenses?category=Food&from=2026-07-01&to=2026-07-31
router.get("/", (req, res) => {
  const { category, from, to } = req.query;

  let query = "SELECT * FROM expenses WHERE user_id = ?";
  const params = [req.user.id];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }
  if (from) {
    query += " AND spent_on >= ?";
    params.push(from);
  }
  if (to) {
    query += " AND spent_on <= ?";
    params.push(to);
  }

  query += " ORDER BY spent_on DESC, id DESC";

  const expenses = db.prepare(query).all(...params);
  res.json(expenses);
});

router.get("/:id", (req, res) => {
  const expense = db
    .prepare("SELECT * FROM expenses WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!expense) return res.status(404).json({ error: "Expense not found" });
  res.json(expense);
});

router.post("/", (req, res) => {
  const { title, amount, category, note, spent_on } = req.body;

  if (!title || amount === undefined || !category || !spent_on) {
    return res.status(400).json({ error: "title, amount, category and spent_on are required" });
  }
  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  const result = db
    .prepare(
      `INSERT INTO expenses (user_id, title, amount, category, note, spent_on)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(req.user.id, title, amount, category, note || null, spent_on);

  const expense = db.prepare("SELECT * FROM expenses WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(expense);
});

router.put("/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM expenses WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!existing) return res.status(404).json({ error: "Expense not found" });

  const { title, amount, category, note, spent_on } = req.body;

  db.prepare(
    `UPDATE expenses SET title = ?, amount = ?, category = ?, note = ?, spent_on = ?
     WHERE id = ? AND user_id = ?`
  ).run(
    title ?? existing.title,
    amount ?? existing.amount,
    category ?? existing.category,
    note ?? existing.note,
    spent_on ?? existing.spent_on,
    req.params.id,
    req.user.id
  );

  const updated = db.prepare("SELECT * FROM expenses WHERE id = ?").get(req.params.id);
  res.json(updated);
});

router.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.user.id);

  if (result.changes === 0) return res.status(404).json({ error: "Expense not found" });
  res.status(204).send();
});

// GET /api/expenses/stats/summary — totals grouped by category and by month,
// used to feed the pie and bar charts on the dashboard.
router.get("/stats/summary", (req, res) => {
  const byCategory = db
    .prepare(
      `SELECT category, SUM(amount) as total
       FROM expenses WHERE user_id = ?
       GROUP BY category ORDER BY total DESC`
    )
    .all(req.user.id);

  const byMonth = db
    .prepare(
      `SELECT strftime('%Y-%m', spent_on) as month, SUM(amount) as total
       FROM expenses WHERE user_id = ?
       GROUP BY month ORDER BY month ASC`
    )
    .all(req.user.id);

  const totalRow = db
    .prepare("SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM expenses WHERE user_id = ?")
    .get(req.user.id);

  res.json({ byCategory, byMonth, total: totalRow.total, count: totalRow.count });
});

export default router;
