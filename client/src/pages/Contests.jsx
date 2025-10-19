import { useEffect, useState } from 'react';
import api from "../api";

export default function Contests() {
  const [contests, setContests] = useState([]);

  useEffect(() => {
    api.get('/contests').then(({ data }) => setContests(data));
  }, []);

  return (
    <div className="container mt-4">
      <h4>Upcoming Contests</h4>
      <ul className="list-group">
        {contests.map((c) => (
          <li
            key={`${c.platform}-${c.name}`}
            className="list-group-item d-flex justify-content-between"
          >
            <div>
              <div className="fw-semibold">{c.name}</div>
              <small>{c.platform} • {new Date(c.startTime).toLocaleString()}</small>
            </div>
            <a className="btn btn-outline-primary" href={c.url} target="_blank">Open</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
