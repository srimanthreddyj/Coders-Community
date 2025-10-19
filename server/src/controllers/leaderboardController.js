import * as leaderboardService from "../services/leaderboardService.js";

export const getLeaderboard = async (req, res) => {
  try {
    const { platform, sortBy } = req.query;
    const leaderboard = await leaderboardService.getLeaderboardData(platform, sortBy);
    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching leaderboard data",
      error: error.message,
    });
  }
};