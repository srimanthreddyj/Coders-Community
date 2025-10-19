import User from "../models/User.js";

/**
 * Fetches and sorts leaderboard data.
 * @param {string} [platform] - Optional platform to filter by (e.g., 'codeforces').
 * @returns {Promise<User[]>} - A sorted list of users.
 */
export const getLeaderboardData = async (platform) => {
  // Validate the platform to prevent sorting on arbitrary fields
  const allowedPlatforms = ["codeforces", "leetcode", "codechef"];
  const isValidPlatform = platform && allowedPlatforms.includes(platform);

  // Determine the sort key based on the platform query parameter
  const sortKey = isValidPlatform ? `solvedCounts.${platform}` : "solvedCounts.total";

  // Find users, select necessary fields, sort, and limit the results
  const leaderboard = await User.find({})
    .select("username solvedCounts")
    .sort({ [sortKey]: -1 })
    .limit(100); // Limit to top 100 users

  return leaderboard;
};

/**
 * Seeds the database with some mock users for demonstration.
 * This should only be run once.
 */
export const seedMockUsers = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log("✅ Mock users already exist. Skipping seeding.");
      return;
    }

    console.log("🌱 Seeding mock users for the leaderboard...");
    const users = [
      { username: "code_master", email: "a@a.com", password: "password", solvedCounts: { codeforces: 150, leetcode: 200, codechef: 100 } },
      { username: "algo_queen", email: "b@b.com", password: "password", solvedCounts: { codeforces: 250, leetcode: 180, codechef: 120 } },
      { username: "binary_brawler", email: "c@c.com", password: "password", solvedCounts: { codeforces: 100, leetcode: 300, codechef: 50 } },
      { username: "java_genius", email: "d@d.com", password: "password", solvedCounts: { codeforces: 50, leetcode: 150, codechef: 200 } },
      { username: "python_pro", email: "e@e.com", password: "password", solvedCounts: { codeforces: 200, leetcode: 100, codechef: 150 } },
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }

    console.log("✅ Mock users seeded successfully.");
  } catch (error) {
    // Ignore duplicate key errors if seeding runs concurrently
    if (error.code !== 11000) {
      console.error("❌ Error seeding mock users:", error.message);
    }
  }
};