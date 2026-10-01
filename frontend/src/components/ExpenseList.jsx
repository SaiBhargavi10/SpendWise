import { CATEGORIES } from "../constants.js";

const formatMoney = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function ExpenseList({ expenses, filters, onFilterChange, onEdit, onDelete, onAddClick }) {
  return (
    <div className="main-panel">
      <div className="main-panel-head">
        <h3>Transactions</h3>
        <div className="filters">
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => onFilterChange({ ...filters, from: e.target.value })}
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => onFilterChange({ ...filters, to: e.target.value })}
          />
          <button className="btn-add" onClick={onAddClick}>
            + Add expense
          </button>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="empty-state">
          <div className="stamp">₹</div>
          <p>No expenses match these filters yet. Add one to get started.</p>
        </div>
      ) : (
        <table className="expense-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id}>
                <td>
                  {exp.title}
                  {exp.note && <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{exp.note}</div>}
                </td>
                <td>
                  <span className="category-pill">{exp.category}</span>
                </td>
                <td>{formatDate(exp.spent_on)}</td>
                <td className="amount">{formatMoney(exp.amount)}</td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => onEdit(exp)}>
                      Edit
                    </button>
                    <button className="icon-btn danger" onClick={() => onDelete(exp)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
