import { useAuth } from "../auth/AuthContext";

export default function Dashboard(){
  const { user, logout } = useAuth();
  return (
    <div className="container mt-4">
      <h4>Welcome, {user?.username}</h4>
      <p>Email: {user?.email}</p>
      <pre className="bg-light p-2 rounded">{JSON.stringify(user?.codingHandles, null, 2)}</pre>
      <button className="btn btn-outline-danger" onClick={logout}>Logout</button>
    </div>
  );
}
