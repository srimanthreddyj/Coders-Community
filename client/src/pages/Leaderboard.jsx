import React, { useState, useEffect } from "react";
import api from "../api";

// Basic styling for the component
const styles = {
  container: {
    padding: "2rem",
    maxWidth: "900px",
    margin: "2rem auto",
    fontFamily: "sans-serif",
    backgroundColor: "#1a1a1a", // Dark background for the container
    borderRadius: "8px",
    color: "#e0e0e0", // Lighter text for better contrast on dark bg
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
    color: "#9c27b0", // Changed to a vibrant purple
  },
  filters: {
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  button: {
    padding: "0.5rem 1rem",
    margin: "0 0.5rem",
    fontSize: "1rem",
    cursor: "pointer", // Changed to a vibrant purple
    border: "1px solid #9c27b0",
    borderRadius: "5px",
    backgroundColor: "transparent",
    color: "#9c27b0",
    transition: "all 0.3s ease",
  },
  activeButton: {
    backgroundColor: "#9c27b0", // Changed to a vibrant purple
    color: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "0.75rem",
    borderBottom: "2px solid #9c27b0", // Changed to a vibrant purple
    backgroundColor: "rgba(156, 39, 176, 0.1)",
  },
  td: {
    padding: "0.75rem",
    borderBottom: "1px solid #333",
  },
  rank: {
    fontWeight: "bold",
    color: "#9c27b0", // Changed to a vibrant purple
  },
  message: {
    textAlign: "center",
    fontSize: "1.2rem",
    marginTop: "2rem",
  },
};

const PLATFORMS = ["Overall", "Codeforces", "LeetCode", "CodeChef"];

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [platform, setPlatform] = useState("Overall");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = platform !== "Overall" ? { platform: platform.toLowerCase() } : {};
        const response = await api.get("/leaderboard", { params });
        setLeaderboard(response.data);
      } catch (err) {
        setError("Failed to fetch leaderboard data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [platform]);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Leaderboard</h1>

      <div style={styles.filters}>
        {PLATFORMS.map((p) => (
          <button
            key={p}
            style={
              p === platform
                ? { ...styles.button, ...styles.activeButton }
                : styles.button
            }
            onClick={() => setPlatform(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {loading && <p style={styles.message}>Loading...</p>}
      {error && <p style={{ ...styles.message, color: "red" }}>{error}</p>}

      {!loading && !error && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Rank</th>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Codeforces</th>
              <th style={styles.th}>LeetCode</th>
              <th style={styles.th}>CodeChef</th>
              <th style={styles.th}>Total</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => (
              <tr key={user._id}>
                <td style={{ ...styles.td, ...styles.rank }}>{index + 1}</td>
                <td style={styles.td}>{user.username}</td>
                <td style={styles.td}>{user.solvedCounts.codeforces}</td>
                <td style={styles.td}>{user.solvedCounts.leetcode}</td>
                <td style={styles.td}>{user.solvedCounts.codechef}</td>
                <td style={styles.td}>{user.solvedCounts.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;