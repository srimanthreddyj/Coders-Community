import { useEffect, useState } from "react";
import api from "../api";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/posts");
      setPosts(data);
    } catch (err) {
      console.error("Failed to load posts", err);
    }
  };

  useEffect(() => {
    load(); // ✅ call function here
  }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api.post("/posts", { text });
      setText("");
      load();
    } catch (err) {
      console.error("Failed to create post", err);
    }
  };

  return (
    <div className="container mt-4">
      <form onSubmit={create} className="mb-3 d-flex gap-2">
        <input
          className="form-control"
          placeholder="Share something…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary">Post</button>
      </form>

      <div className="list-group">
        {posts.map((p) => (
          <div key={p._id} className="list-group-item">
            <div className="small text-muted">
              {new Date(p.createdAt).toLocaleString()}
            </div>
            <div>{p.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
