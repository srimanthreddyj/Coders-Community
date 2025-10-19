import User from "../models/User.js";
import {
  fetchCodeforcesUser,
  fetchCodeforcesUserRating,
  scrapeCodeChefUser,
  scrapeCodeChefUserRating,
  fetchLeetCodeUserData,
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
        
        const leetcodeDataPromise = fetchLeetCodeUserData(user.codingHandles?.leetcode);
        const codeforcesCountPromise = fetchCodeforcesUser(user.codingHandles?.codeforces);
        const codechefCountPromise = scrapeCodeChefUser(user.codingHandles?.codechef);
        const codeforcesRatingPromise = fetchCodeforcesUserRating(user.codingHandles?.codeforces);
        const codechefRatingPromise = scrapeCodeChefUserRating(user.codingHandles?.codechef);

        const [
          leetcodeData,
          codeforcesCount, codechefCount,
          codeforcesRating, codechefRating,
        ] = await Promise.all([leetcodeDataPromise, codeforcesCountPromise, codechefCountPromise, codeforcesRatingPromise, codechefRatingPromise]);

        console.log(`LeetCode (${user.codingHandles?.leetcode}): ${leetcodeData.solvedCount}`);
        console.log(`Codeforces (${user.codingHandles?.codeforces}): ${codeforcesCount}`);
        console.log(`CodeChef (${user.codingHandles?.codechef}): ${codechefCount}`);
        console.log(`LeetCode Rating: ${leetcodeData.rating}`);
        console.log(`Codeforces Rating: ${codeforcesRating}`);
        console.log(`CodeChef Rating: ${codechefRating}`);

        user.solvedCounts.leetcode = leetcodeData.solvedCount;
        user.solvedCounts.codeforces = codeforcesCount;
        user.solvedCounts.codechef = codechefCount;
        user.ratings.leetcode = leetcodeData.rating;
        user.ratings.codeforces = codeforcesRating;
        user.ratings.codechef = codechefRating;

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