import axios from "axios";

export const fetchCodeforcesUpcoming = async () => {
  const { data } = await axios.get("https://codeforces.com/api/contest.list");
  if (data.status !== "OK") return [];
  // Filter by future contests (phase "BEFORE")
  return data.result
    .filter(c => c.phase === "BEFORE")
    .map(c => ({
      platform: "Codeforces",
      name: c.name,
      url: `https://codeforces.com/contests/${c.id}`,
      startTime: new Date((c.startTimeSeconds ?? 0) * 1000),
      durationSeconds: c.durationSeconds ?? 0
    }));
};
