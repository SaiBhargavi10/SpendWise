import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="auth-wrap">
      <div className="landing-card">
        <div className="landing-mark">₹</div>
        <p className="auth-brand" style={{ fontSize: "2rem", marginBottom: 10 }}>
          Welcome to SpendWise
        </p>
        <p className="landing-sub">Your expense tracker — log spending, set budgets, see where it goes.</p>

        <div className="landing-actions">
          <Link to="/login" className="btn-primary" style={{ textAlign: "center", textDecoration: "none" }}>
            Sign in
          </Link>
          <Link to="/register" className="btn-secondary-full" style={{ textAlign: "center", textDecoration: "none" }}>
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
