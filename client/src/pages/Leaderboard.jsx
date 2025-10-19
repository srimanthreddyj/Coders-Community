import React, { useState, useEffect } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import styles from "./Leaderboard.module.css";

const LEADERBOARD_TYPES = ["Problems Solved", "Contest Rating"];
const PLATFORMS = ["Overall", "Codeforces", "LeetCode", "CodeChef"];

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [platform, setPlatform] = useState("Overall");
  const [leaderboardType, setLeaderboardType] = useState("Problems Solved");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const isRating = leaderboardType === "Contest Rating";
        const activePlatform = isRating && platform === "Overall" ? "Codeforces" : platform;

        const params = {
          sortBy: isRating ? "rating" : "solved",
          platform: activePlatform !== "Overall" ? activePlatform.toLowerCase() : undefined,
        };
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
  }, [platform, leaderboardType]);

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Leaderboard</h1>

      <div className={styles.filters}>
        {LEADERBOARD_TYPES.map((type) => (
          <button
            key={type}
            className={`${styles.button} ${type === leaderboardType ? styles.activeButton : ""}`}
            onClick={() => setLeaderboardType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className={styles.filters}>
        {PLATFORMS.map((p) => {
          // Disable "Overall" for rating leaderboard as ratings are not comparable across platforms
          const isDisabled = leaderboardType === "Contest Rating" && p === "Overall";
          return (
            <button
              key={p}
              className={`${styles.button} ${p === platform && !isDisabled ? styles.activeButton : ""} ${isDisabled ? styles.disabledButton : ""}`}
              onClick={() => !isDisabled && setPlatform(p)}
              disabled={isDisabled}
            >
              {p}
            </button>
          );
        })}
      </div>

      {loading && <p className={styles.message}>Loading...</p>}
      {error && <p className={styles.message} style={{ color: "var(--error-color)" }}>{error}</p>}

      {!loading && !error && leaderboardType === "Problems Solved" && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Rank</th>
              <th className={styles.th}>Username</th>
              <th className={styles.th}>Codeforces</th>
              <th className={styles.th}>LeetCode</th>
              <th className={styles.th}>CodeChef</th>
              <th className={styles.th}>Total</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map(
              (user, index) =>
                user.solvedCounts && ( // Add this check
                  <tr key={user._id}>
                    <td className={`${styles.td} ${styles.rank}`}>{index + 1}</td>
                    <td className={styles.td}>
                      <Link to={`/profile/${user.username}`} className={styles.usernameLink}>
                        {user.username}
                      </Link>
                    </td>
                    <td className={styles.td}>{user.solvedCounts.codeforces}</td>
                    <td className={styles.td}>{user.solvedCounts.leetcode}</td>
                    <td className={styles.td}>{user.solvedCounts.codechef}</td>
                    <td className={styles.td}>{user.solvedCounts.total}</td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      )}

      {!loading && !error && leaderboardType === "Contest Rating" && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Rank</th>
              <th className={styles.th}>Username</th>
              <th className={styles.th}>Codeforces</th>
              <th className={styles.th}>LeetCode</th>
              <th className={styles.th}>CodeChef</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map(
              (user, index) =>
                user.ratings && ( // Add this check
                  <tr key={user._id}>
                    <td className={`${styles.td} ${styles.rank}`}>{index + 1}</td>
                    <td className={styles.td}>
                      <Link to={`/profile/${user.username}`} className={styles.usernameLink}>
                        {user.username}
                      </Link>
                    </td>
                    <td className={styles.td}>{user.ratings.codeforces}</td>
                    <td className={styles.td}>{user.ratings.leetcode}</td>
                    <td className={styles.td}>{user.ratings.codechef}</td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;