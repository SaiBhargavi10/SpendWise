import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import Navbar from "../components/Navbar.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import ExpenseForm from "../components/ExpenseForm.jsx";
import ExpenseCharts from "../components/ExpenseCharts.jsx";
import BudgetPanel from "../components/BudgetPanel.jsx";

const formatMoney = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

export default function Dashboard() {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ byCategory: [], byMonth: [], total: 0, count: 0 });
  const [budgets, setBudgets] = useState([]);
  const [filters, setFilters] = useState({ category: "", from: "", to: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const [expenseData, summaryData, budgetData] = await Promise.all([
        api.getExpenses(token, cleanFilters),
        api.getSummary(token),
        api.getBudgets(token),
      ]);
      setExpenses(expenseData);
      setSummary(summaryData);
      setBudgets(budgetData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (payload) => {
    if (editingExpense) {
      await api.updateExpense(token, editingExpense.id, payload);
    } else {
      await api.createExpense(token, payload);
    }
    setShowForm(false);
    setEditingExpense(null);
    await loadData();
  };

  const handleDelete = async (expense) => {
    if (!window.confirm(`Delete "${expense.title}"? This can't be undone.`)) return;
    try {
      await api.deleteExpense(token, expense.id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSetBudget = async (category, monthlyLimit) => {
    await api.setBudget(token, category, monthlyLimit);
    await loadData();
  };

  const handleDeleteBudget = async (category) => {
    await api.deleteBudget(token, category);
    await loadData();
  };

  const thisMonthTotal = summary.byMonth.length
    ? summary.byMonth[summary.byMonth.length - 1].total
    : 0;
  const avgPerEntry = summary.count ? summary.total / summary.count : 0;

  return (
    <>
      <Navbar />
      <div className="dashboard">
        {error && <div className="error-box">{error}</div>}

        <div className="summary-row">
          <div className="SpendWise-card balance">
            <div className="label">Total spent</div>
            <div className="value">{formatMoney(summary.total)}</div>
            <div className="sub">{summary.count} recorded transactions</div>
          </div>
          <div className="SpendWise-card">
            <div className="label">This month</div>
            <div className="value">{formatMoney(thisMonthTotal)}</div>
            <div className="sub">Based on latest entries</div>
          </div>
          <div className="SpendWise-card">
            <div className="label">Average per entry</div>
            <div className="value">{formatMoney(avgPerEntry)}</div>
            <div className="sub">Across all categories</div>
          </div>
        </div>

        <ExpenseCharts byCategory={summary.byCategory} byMonth={summary.byMonth} />

        <div style={{ marginBottom: 28 }}>
          <BudgetPanel budgets={budgets} onSetBudget={handleSetBudget} onDeleteBudget={handleDeleteBudget} />
        </div>

        {loading ? (
          <div className="main-panel">
            <p style={{ color: "var(--text-dim)" }}>Loading your expenses…</p>
          </div>
        ) : (
          <ExpenseList
            expenses={expenses}
            filters={filters}
            onFilterChange={setFilters}
            onEdit={(exp) => {
              setEditingExpense(exp);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onAddClick={() => {
              setEditingExpense(null);
              setShowForm(true);
            }}
          />
        )}
      </div>

      {showForm && (
        <ExpenseForm
          initial={editingExpense}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
        />
      )}
    </>
  );
}
