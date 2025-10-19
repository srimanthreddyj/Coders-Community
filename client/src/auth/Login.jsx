import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [emailOrUsername, setEU] = useState("");
  const [password, setPwd] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(emailOrUsername, password);
      navigate("/"); // ✅ redirect to Dashboard
    } catch (e) {
      setErr(e?.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 420 }}>
      <h3>Login</h3>
      {err && <div className="alert alert-danger">{err}</div>}
      <form onSubmit={submit}>
        <input
          className="form-control mb-2"
          placeholder="Email or Username"
          value={emailOrUsername}
          onChange={(e) => setEU(e.target.value)}
        />
        <input
          className="form-control mb-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPwd(e.target.value)}
        />
        <button className="btn btn-primary w-100">Login</button>
      </form>

      <p className="mt-3">
        Don’t have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
}
