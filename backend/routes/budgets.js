import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/budgets — every category that has a limit set, alongside how much
// the user has actually spent in that category this calendar month.
router.get("/", (req, res) => {
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  const budgets = db
    .prepare("SELECT category, monthly_limit FROM budgets WHERE user_id = ? ORDER BY category")
    .all(req.user.id);

  const spentRows = db
    .prepare(
      `SELECT category, SUM(amount) as spent
       FROM expenses
       WHERE user_id = ? AND strftime('%Y-%m', spent_on) = ?
       GROUP BY category`
    )
    .all(req.user.id, currentMonth);

  const spentByCategory = Object.fromEntries(spentRows.map((r) => [r.category, r.spent]));

  const result = budgets.map((b) => {
    const spent = spentByCategory[b.category] || 0;
    return {
      category: b.category,
      monthly_limit: b.monthly_limit,
      spent,
      remaining: b.monthly_limit - spent,
      percent: b.monthly_limit > 0 ? Math.round((spent / b.monthly_limit) * 100) : 0,
    };
  });

  res.json(result);
});

// PUT /api/budgets/:category — create or update the limit for one category.
router.put("/:category", (req, res) => {
  const { category } = req.params;
  const { monthly_limit } = req.body;

  if (monthly_limit === undefined || typeof monthly_limit !== "number" || monthly_limit <= 0) {
    return res.status(400).json({ error: "monthly_limit must be a positive number" });
  }

  db.prepare(
    `INSERT INTO budgets (user_id, category, monthly_limit)
     VALUES (?, ?, ?)
     ON CONFLICT (user_id, category) DO UPDATE SET monthly_limit = excluded.monthly_limit`
  ).run(req.user.id, category, monthly_limit);

  const row = db
    .prepare("SELECT category, monthly_limit FROM budgets WHERE user_id = ? AND category = ?")
    .get(req.user.id, category);

  res.json(row);
});

// DELETE /api/budgets/:category — remove the limit (category becomes unlimited again).
router.delete("/:category", (req, res) => {
  db.prepare("DELETE FROM budgets WHERE user_id = ? AND category = ?").run(req.user.id, req.params.category);
  res.status(204).send();
});

export default router;
