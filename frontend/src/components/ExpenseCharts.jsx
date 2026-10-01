import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#b8863b", "#3f6e4e", "#a8402f", "#5b7a99", "#8a6d9c", "#c98a4b", "#4f7a6f", "#7a6a4f"];

const formatMoney = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function ExpenseCharts({ byCategory, byMonth }) {
  return (
    <div className="panel-row">
      <div className="panel">
        <h3>Spending by category</h3>
        {byCategory.length === 0 ? (
          <p style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>Add expenses to see this breakdown.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={byCategory}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {byCategory.map((entry, i) => (
                  <Cell key={entry.category} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatMoney(value)} />
            </PieChart>
          </ResponsiveContainer>
        )}
        {byCategory.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 8 }}>
            {byCategory.map((entry, i) => (
              <div key={entry.category} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "var(--text-dim)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length], display: "inline-block" }} />
                {entry.category}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <h3>Spending by month</h3>
        {byMonth.length === 0 ? (
          <p style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>Add expenses to see this trend.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatMoney(value)} />
              <Bar dataKey="total" fill="#b8863b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
