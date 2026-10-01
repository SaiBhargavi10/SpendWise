import { useState } from "react";
import { CATEGORIES } from "../constants.js";

const formatMoney = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function barColor(percent) {
  if (percent >= 100) return "var(--danger)";
  if (percent >= 80) return "var(--brass)";
  return "var(--success)";
}

export default function BudgetPanel({ budgets, onSetBudget, onDeleteBudget }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [limit, setLimit] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const budgetedCategories = new Set(budgets.map((b) => b.category));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const numeric = parseFloat(limit);
    if (!numeric || numeric <= 0) return setError("Enter a valid limit");

    setSaving(true);
    try {
      await onSetBudget(category, numeric);
      setLimit("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel">
      <h3>Monthly budgets</h3>

      {budgets.length === 0 ? (
        <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginBottom: 16 }}>
          No budgets set yet. Add a monthly limit per category below to get warnings when you're close to it.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
          {budgets.map((b) => (
            <div key={b.category}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 4 }}>
                <span>
                  <strong>{b.category}</strong>
                  {b.percent >= 100 && (
                    <span style={{ color: "var(--danger)", marginLeft: 6, fontWeight: 600 }}>
                      Over budget
                    </span>
                  )}
                  {b.percent >= 80 && b.percent < 100 && (
                    <span style={{ color: "var(--brass)", marginLeft: 6, fontWeight: 600 }}>
                      Almost there
                    </span>
                  )}
                </span>
                <span style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                  {formatMoney(b.spent)} / {formatMoney(b.monthly_limit)}
                </span>
              </div>
              <div style={{ background: "var(--parchment-dim)", borderRadius: 6, height: 8, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${Math.min(b.percent, 100)}%`,
                    height: "100%",
                    background: barColor(b.percent),
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <button
                className="icon-btn danger"
                style={{ fontSize: "0.72rem", padding: "2px 0", marginTop: 2 }}
                onClick={() => onDeleteBudget(b.category)}
              >
                Remove limit
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <div className="field" style={{ marginBottom: 0, flex: 1 }}>
          <label htmlFor="budget-category">Category</label>
          <select id="budget-category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
                {budgetedCategories.has(c) ? " (set)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0, width: 120 }}>
          <label htmlFor="budget-limit">Limit (₹)</label>
          <input
            id="budget-limit"
            type="number"
            min="0"
            step="1"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="5000"
          />
        </div>
        <button className="btn-add" type="submit" disabled={saving} style={{ height: 38 }}>
          {saving ? "Saving…" : "Set"}
        </button>
      </form>
    </div>
  );
}
