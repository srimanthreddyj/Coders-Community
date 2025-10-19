import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    codingHandles: { leetcode: "", codeforces: "", codechef: "" },
  });
  const [err, setErr] = useState("");

  const upd = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const updHandle = (p, v) =>
    setForm((s) => ({ ...s, codingHandles: { ...s.codingHandles, [p]: v } }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate("/"); // ✅ redirect to Dashboard
    } catch (e) {
      setErr(e?.response?.data?.error || "Register failed");
    }
  };

  return (
    <div className="container-fluid mt-5" style={{ padding: "0 2rem", width: "100%" }}>
      <h3>Create Account</h3>
      {err && <div className="alert alert-danger">{err}</div>}
      <form onSubmit={submit}>
        <input
          className="form-control mb-2"
          placeholder="Username"
          onChange={(e) => upd("username", e.target.value)}
        />
        <input
          className="form-control mb-2"
          placeholder="Email"
          onChange={(e) => upd("email", e.target.value)}
        />
        <input
          className="form-control mb-2"
          type="password"
          placeholder="Password"
          onChange={(e) => upd("password", e.target.value)}
        />
        <div className="row">
          <div className="col">
            <input
              className="form-control mb-2"
              placeholder="LeetCode"
              onChange={(e) => updHandle("leetcode", e.target.value)}
            />
          </div>
          <div className="col">
            <input
              className="form-control mb-2"
              placeholder="Codeforces"
              onChange={(e) => updHandle("codeforces", e.target.value)}
            />
          </div>
          <div className="col">
            <input
              className="form-control mb-2"
              placeholder="CodeChef"
              onChange={(e) => updHandle("codechef", e.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-success w-100">Register</button>
      </form>
    </div>
  );
}
