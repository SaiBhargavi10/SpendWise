import { useState } from "react";
import { CATEGORIES } from "../constants.js";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function ExpenseForm({ initial, onSave, onClose }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [category, setCategory] = useState(initial?.category || CATEGORIES[0]);
  const [spentOn, setSpentOn] = useState(initial?.spent_on || todayStr());
  const [note, setNote] = useState(initial?.note || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const numericAmount = parseFloat(amount);
    if (!title.trim()) return setError("Please enter a title");
    if (!numericAmount || numericAmount <= 0) return setError("Enter a valid amount");
    if (!spentOn) return setError("Please pick a date");

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        amount: numericAmount,
        category,
        spent_on: spentOn,
        note: note.trim() || null,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{initial ? "Edit expense" : "Add expense"}</h3>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grocery run"
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="amount">Amount (₹)</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="field">
              <label htmlFor="date">Date</label>
              <input id="date" type="date" value={spentOn} onChange={(e) => setSpentOn(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="note">Note (optional)</label>
            <input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any extra detail"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-add" disabled={saving}>
              {saving ? "Saving…" : initial ? "Save changes" : "Add expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
