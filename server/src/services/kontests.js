import axios from "axios";

export const fetchAllContests = async () => {
  const { data } = await axios.get("https://kontests.net/api/v1/all");
  // Map to your schema format
  return data.map((c) => ({
    platform: c.site,
    name: c.name,
    url: c.url,
    startTime: new Date(c.start_time),
    durationSeconds: c.duration,
  }));
};
