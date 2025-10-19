import axios from "axios";
import Contest from "../models/Contest.js";
import { fetchCodeforces, scrapeLeetCode, scrapeCodeChef } from "./scrapers.js";

// --- Refresh contests ---
export default async function refreshContests() {
  try {
    // Step 1: Fetch from all sources
    const cfPromise = fetchCodeforces();
    const lcPromise = scrapeLeetCode();
    const ccPromise = scrapeCodeChef();

    const results = await Promise.allSettled([cfPromise, lcPromise, ccPromise]);

    const cf = results[0].status === "fulfilled" ? results[0].value : [];
    const lc = results[1].status === "fulfilled" ? results[1].value : [];
    const cc = results[2].status === "fulfilled" ? results[2].value : [];

    if (results[0].status === "fulfilled") {
      console.log(`✅ Codeforces contests: ${cf.length}`);
    } else {
      console.error("❌ Codeforces fetch failed:", results[0].reason.message);
    }
    if (results[1].status === "fulfilled") {
      console.log(`✅ LeetCode scraped contests: ${lc.length}`);
    } else {
      console.error("❌ LeetCode scrape failed:", results[1].reason.message);
    }
    if (results[2].status === "fulfilled") {
      console.log(`✅ CodeChef scraped contests: ${cc.length}`);
    } else {
      console.error("❌ CodeChef scrape failed:", results[2].reason.message);
    }

    // Step 2: Combine all contests
    let allContests = [...cf, ...lc, ...cc];

    // Step 3: De-duplicate contests
    // Use a Map to keep only the first occurrence of a contest based on a unique key.
    const uniqueContestsMap = new Map();
    for (const contest of allContests) {
      const key = `${contest.platform}:${contest.name.trim()}`;

      // Handle CodeChef de-duplication with a more robust check,
      // as names can differ between the API and the scraper.
      if (contest.platform === "CodeChef") {
        // Find if a similar CodeChef contest already exists
        const existingKey = Array.from(uniqueContestsMap.keys()).find(
          (k) => k.startsWith("CodeChef:") && (k.includes(key) || key.includes(k))
        );
        if (!existingKey) {
          uniqueContestsMap.set(key, contest);
        }
      } else if (!uniqueContestsMap.has(key)) {
        uniqueContestsMap.set(key, contest);
      }
    }
    const contests = Array.from(uniqueContestsMap.values());

    // Step 4: Upsert into DB
    for (const c of contests) {
      await Contest.updateOne(
        // Find document based on the stable key
        { platform: c.platform, name: c.name },
        { $set: c },
        { upsert: true }
      );
    }

    console.log(`🎉 Total contests refreshed: ${contests.length}`);
  } catch (err) {
    console.error("❌ Error in refreshContests:", err.message);
  }
}
