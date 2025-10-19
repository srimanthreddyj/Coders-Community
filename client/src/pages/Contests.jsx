import React, { useState, useEffect } from "react";
import api from "../api";
import useCountdown from "../hooks/useCountdown";

const platformLogos = {
  Codeforces: "https://sta.codeforces.com/s/95295/images/codeforces-logo-with-telegram.png",
  LeetCode: "https://leetcode.com/static/images/LeetCode_logo_rvs.png",
  CodeChef: "https://cdn.codechef.com/images/cc-logo.svg",
};

const CountdownTimer = ({ targetDate }) => {
  const { days, hours, minutes, seconds } = useCountdown(targetDate);

  if (days + hours + minutes + seconds <= 0) {
    return <div style={styles.timerEnded}>Contest has started!</div>;
  }

  return (
    <div style={styles.timerContainer}>
      <div style={styles.timerSegment}>
        <span style={styles.timerValue}>{String(days).padStart(2, "0")}</span>
        <span style={styles.timerLabel}>Days</span>
      </div>
      <div style={styles.timerSegment}>
        <span style={styles.timerValue}>{String(hours).padStart(2, "0")}</span>
        <span style={styles.timerLabel}>Hours</span>
      </div>
      <div style={styles.timerSegment}>
        <span style={styles.timerValue}>{String(minutes).padStart(2, "0")}</span>
        <span style={styles.timerLabel}>Mins</span>
      </div>
      <div style={styles.timerSegment}>
        <span style={styles.timerValue}>{String(seconds).padStart(2, "0")}</span>
        <span style={styles.timerLabel}>Secs</span>
      </div>
    </div>
  );
};

const ContestCard = ({ contest }) => {
  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m > 0 ? `${m}m` : ""}`;
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <img src={platformLogos[contest.platform]} alt={`${contest.platform} logo`} style={styles.logo} />
        <h3 style={styles.cardTitle}>{contest.name}</h3>
      </div>
      <div style={styles.cardBody}>
        <CountdownTimer targetDate={contest.startTime} />
        <div style={styles.infoRow}>
          <span><strong>Starts:</strong> {new Date(contest.startTime).toLocaleString()}</span>
          <span><strong>Duration:</strong> {formatDuration(contest.durationSeconds)}</span>
        </div>
      </div>
      <div style={styles.cardFooter}>
        <a href={contest.url} target="_blank" rel="noopener noreferrer" style={styles.cardButton}>
          Go to Contest
        </a>
      </div>
    </div>
  );
};

const Contests = () => {
  const [contests, setContests] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await api.get("/contests");
        // Group contests by platform
        const grouped = response.data.reduce((acc, contest) => {
          const { platform } = contest;
          if (!acc[platform]) {
            acc[platform] = [];
          }
          acc[platform].push(contest);
          return acc;
        }, {});
        setContests(grouped);
      } catch (err) {
        setError("Failed to fetch contest data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Upcoming Contests</h1>
      {loading && <p style={styles.message}>Loading contests...</p>}
      {error && <p style={{ ...styles.message, color: "red" }}>{error}</p>}
      {!loading && !error && Object.keys(contests).map((platform) => (
        <div key={platform} style={styles.platformSection}>
          <h2 style={styles.platformHeader}>{platform}</h2>
          <div style={styles.cardGrid}>
            {contests[platform].map((contest) => (
              <ContestCard key={contest._id} contest={contest} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Styles ---
const styles = {
  container: { width: "100%", padding: "2rem 4rem", fontFamily: "sans-serif" }, // Use more horizontal padding
  header: { textAlign: "center", marginBottom: "2rem", color: "#333" },
  message: { textAlign: "center", fontSize: "1.2rem", marginTop: "2rem" },
  platformSection: { marginBottom: "3rem" },
  platformHeader: { borderBottom: "2px solid #eee", paddingBottom: "0.5rem", marginBottom: "1.5rem", color: "#555" },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": { transform: "translateY(-5px)", boxShadow: "0 8px 16px rgba(0,0,0,0.12)" },
  },
  cardHeader: { display: "flex", alignItems: "center", padding: "1rem", borderBottom: "1px solid #f0f0f0", gap: "1rem" },
  logo: { height: "24px", width: "auto", objectFit: "contain" },
  cardTitle: { margin: 0, fontSize: "1.1rem", color: "#333", flex: 1 },
  cardBody: { padding: "1.5rem", flexGrow: 1 },
  timerContainer: { display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1.5rem" },
  timerSegment: { textAlign: "center" },
  timerValue: { fontSize: "1.8rem", fontWeight: "bold", color: "#2c3e50", display: "block" },
  timerLabel: { fontSize: "0.75rem", color: "#7f8c8d", textTransform: "uppercase" },
  timerEnded: { textAlign: "center", fontSize: "1.2rem", fontWeight: "bold", color: "#27ae60", padding: "1.5rem 0" },
  infoRow: { display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#555", borderTop: "1px solid #f0f0f0", paddingTop: "1rem" },
  cardFooter: { padding: "1rem", borderTop: "1px solid #f0f0f0", marginTop: "auto" },
  cardButton: {
    display: "block",
    width: "100%",
    padding: "0.75rem",
    textAlign: "center",
    backgroundColor: "#3498db",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    transition: "background-color 0.2s ease",
    "&:hover": { backgroundColor: "#2980b9" },
  },
};

export default Contests;