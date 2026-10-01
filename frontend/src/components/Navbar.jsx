import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="navbar">
      <div className="navbar-brand">
        <span className="mark" />
        SpendWise
      </div>
      <div className="navbar-user">
        <span>{user?.name}</span>
        <button className="btn-ghost" onClick={logout}>
          Sign out
        </button>
      </div>
    </div>
  );
}
