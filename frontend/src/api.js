const BASE_URL = "/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),

  getExpenses: (token, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/expenses${params ? `?${params}` : ""}`, { token });
  },
  createExpense: (token, payload) => request("/expenses", { method: "POST", body: payload, token }),
  updateExpense: (token, id, payload) =>
    request(`/expenses/${id}`, { method: "PUT", body: payload, token }),
  deleteExpense: (token, id) => request(`/expenses/${id}`, { method: "DELETE", token }),
  getSummary: (token) => request("/expenses/stats/summary", { token }),

  getBudgets: (token) => request("/budgets", { token }),
  setBudget: (token, category, monthly_limit) =>
    request(`/budgets/${encodeURIComponent(category)}`, {
      method: "PUT",
      body: { monthly_limit },
      token,
    }),
  deleteBudget: (token, category) =>
    request(`/budgets/${encodeURIComponent(category)}`, { method: "DELETE", token }),
};
