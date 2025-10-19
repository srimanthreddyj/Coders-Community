import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AuthProvider, { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Dashboard from "./pages/Dashboard";
import Contests from "./pages/Contests";
import Feed from "./pages/Feed";
import Leaderboard from "./pages/Leaderboard.jsx";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/">Coders Community</Link>
      <div className="navbar-nav ms-auto">
        {user ? (
          <>
            <Link className="nav-link" to="/contests">Contests</Link>
            <Link className="nav-link" to="/feed">Feed</Link>
            <Link className="nav-link" to="/leaderboard">Leaderboard</Link>
            <button
              className="btn btn-sm btn-outline-light ms-2"
              onClick={logout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="nav-link" to="/login">Login</Link>
            <Link className="nav-link" to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contests"
            element={
              <ProtectedRoute>
                <Contests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
