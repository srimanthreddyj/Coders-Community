import User from "../models/User.js";
import {
  fetchCodeforcesUser,
  scrapeLeetCodeUser,
  scrapeCodeChefUser,
} from "./scrapers.js";

/**
 * Iterates through all users and updates their solved problem counts.
 * This function is designed to be called by a scheduled job.
 */
export default async function updateAllUsersStats() {
  console.log("🚀 Starting scheduled job: Update all users' stats...");
  try {
    const users = await User.find(); // Use .find() to get full Mongoose documents
    if (users.length === 0) {
      console.log("No users found to update.");
      return;
    }

    const updatePromises = users.map(async (user) => {
      try {
        console.log(`\n--- Updating stats for user: ${user.username} ---`);

        // Fetch stats in parallel for a single user
        const [leetcodeCount, codeforcesCount, codechefCount] = await Promise.all([
          scrapeLeetCodeUser(user.codingHandles?.leetcode),
          fetchCodeforcesUser(user.codingHandles?.codeforces),
          scrapeCodeChefUser(user.codingHandles?.codechef),
        ]);

        console.log(`LeetCode (${user.codingHandles?.leetcode}): ${leetcodeCount}`);
        console.log(`Codeforces (${user.codingHandles?.codeforces}): ${codeforcesCount}`);
        console.log(`CodeChef (${user.codingHandles?.codechef}): ${codechefCount}`);

        user.solvedCounts.leetcode = leetcodeCount;
        user.solvedCounts.codeforces = codeforcesCount;
        user.solvedCounts.codechef = codechefCount;

        await user.save();
        console.log(`✅ Successfully updated stats for ${user.username}`);
      } catch (error) {
        console.error(`❌ Failed to update stats for user ${user.username}:`, error.message);
      }
    });

    await Promise.all(updatePromises);

    console.log(`\n🎉 Finished updating all users' stats.`);

  } catch (error) {
    console.error("❌ A critical error occurred during the user stats update job:", error);
  }
}