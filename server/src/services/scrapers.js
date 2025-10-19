import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import fs from "fs";

// --- Codeforces (official API) ---
export async function fetchCodeforces() {
  try {
    const res = await axios.get("https://codeforces.com/api/contest.list");
    return res.data.result
      .filter(c => c.phase === "BEFORE")
      .map(c => ({
        platform: "Codeforces",
        name: c.name,
        url: `https://codeforces.com/contests/${c.id}`,
        startTime: new Date(c.startTimeSeconds * 1000),
        endTime: new Date((c.startTimeSeconds + c.durationSeconds) * 1000),
        durationSeconds: c.durationSeconds,
      }));
  } catch (err) {
    console.error("❌ Codeforces fetch failed:", err.message);
    throw err; // Re-throw the error to be handled by the caller
  }
}

// --- LeetCode scraper (GraphQL API) ---
export async function scrapeLeetCode() {
  try {
    const res = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: `
          query {
            upcomingContests {
              title
              titleSlug
              startTime
              duration
            }
          }
        `,
      },
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://leetcode.com/contest/",
        },
      }
    );

    const contests = res.data.data.upcomingContests;

    return contests.map(c => ({
      platform: "LeetCode",
      name: c.title,
      url: `https://leetcode.com/contest/${c.titleSlug}`,
      startTime: new Date(c.startTime * 1000),
      endTime: new Date((c.startTime + c.duration) * 1000),
      durationSeconds: c.duration,
    }));
  } catch (err) {
    console.error("❌ LeetCode GraphQL fetch failed:", err.message);
    throw err; // Re-throw the error to be handled by the caller
  }
}

// --- CodeChef scraper (Puppeteer) ---
// export async function scrapeCodeChef() {
//   let browser;
//   try {
//     console.log("🌐 Opening CodeChef contests page...");
//     browser = await puppeteer.launch({
//       headless: true,
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });
//     const page = await browser.newPage();
//     await page.goto("https://www.codechef.com/contests", {
//       waitUntil: "networkidle2",
//     });

//     console.log("⏳ Waiting for content to load...");
//     await page.waitForSelector("._table__container_14pun_344");

//     const contests = await page.evaluate(() => {
//       const contestsData = [];
//       const contestTables = document.querySelectorAll(
//         "._table__container_14pun_344"
//       );

//       if (contestTables.length > 1) {
//         const upcomingContestsTable = contestTables[1]; // Assuming upcoming is the second table
//         const contestRows =
//           upcomingContestsTable.querySelectorAll("._flex__container_14pun_528");

//         contestRows.forEach(row => {
//           const nameElement = row.querySelector("a");
//           const timeElement = row.querySelector("._timer__container_14pun_590");

//           if (nameElement && timeElement) {
//             const name = nameElement.innerText;
//             const url = nameElement.href;

//             // This part is tricky as start time is relative ("Starts in X days Y hrs")
//             // We'll skip parsing startTime from the page for now and focus on getting the structure right.
//             // A proper implementation would need to calculate the absolute date.
//             contestsData.push({
//               platform: "CodeChef",
//               name: name,
//               url: url,
//               startTime: new Date(), // Placeholder
//               endTime: new Date(), // Placeholder
//             });
//           }
//         });
//       }
//       return contestsData;
//     });

//     console.log(`✅ CodeChef scraped contests: ${contests.length}`);
//     return contests;
//   } catch (err) {
//     console.error("❌ CodeChef scraping failed:", err.message);
//     return [];
//   } finally {
//     if (browser) {
//       await browser.close();
//     }
//   }
// }

export async function scrapeCodeChef() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto("https://www.codechef.com/contests", {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector("._table__container_14pun_344");

    const contests = await page.evaluate(() => {
      const contestsData = [];
      const contestTables = document.querySelectorAll("._table__container_14pun_344");

      if (contestTables.length > 1) {
        const upcomingContestsTable = contestTables[1];
        const contestRows = upcomingContestsTable.querySelectorAll("._flex__container_14pun_528");

        contestRows.forEach(row => {
          const nameElement = row.querySelector("a");
          const timeElement = row.querySelector("._timer__container_14pun_590");

          if (nameElement && timeElement) {
            const daysText = timeElement.querySelector("p:nth-child(1)")?.innerText || "0";
            const hoursText = timeElement.querySelector("p:nth-child(2)")?.innerText || "0";

            contestsData.push({
              platform: "CodeChef",
              name: nameElement.innerText.trim(),
              url: nameElement.href,
              daysText,
              hoursText,
            });
          }
        });
      }

      return contestsData;
    });

    // Calculate start and end times
    return contests.map(c => {
      const { startTime, endTime } = parseCodeChefTime(c.daysText, c.hoursText);
      return {
        ...c,
        startTime,
        endTime,
        relativeTime: `${c.daysText} ${c.hoursText}`,
      };
    });

  } catch (err) {
    console.error("❌ CodeChef scraping failed:", err.message);
    throw err; // Re-throw the error to be handled by the caller
  } finally {
    if (browser) await browser.close();
  }
}
function parseCodeChefTime(daysText = "0", hoursText = "0") {
  const days = parseInt(daysText) || 0;
  const hours = parseInt(hoursText) || 0;

  // Start time = now + X days + Y hours
  const startTime = new Date(Date.now() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000);

  // End time = start time + 2 hours
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

  return { startTime, endTime };
}

// --- User Stats Scrapers ---

/**
 * Fetches the number of unique problems solved by a user on Codeforces.
 * @param {string} handle - The Codeforces user handle.
 * @returns {Promise<number>} The number of problems solved.
 */
export async function fetchCodeforcesUser(handle) {
  if (!handle) return 0;
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.status?handle=${handle}`
    );
    if (response.data.status !== "OK") {
      console.error(`Codeforces API error for ${handle}:`, response.data.comment);
      return 0;
    }
    const submissions = response.data.result;
    const solvedProblems = new Set();
    submissions.forEach(sub => {
      if (sub.verdict === "OK") {
        solvedProblems.add(sub.problem.contestId + sub.problem.index);
      }
    });
    return solvedProblems.size;
  } catch (error) {
    console.error(`Failed to fetch Codeforces user ${handle}:`, error.message);
    return 0; // Return 0 on error to not break the entire update process
  }
}

/**
 * Scrapes the number of fully solved problems by a user on CodeChef.
 * @param {string} handle - The CodeChef user handle.
 * @returns {Promise<number>} The number of problems solved.
 */
export async function scrapeCodeChefUser(handle) {
  if (!handle) return 0;
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(`https://www.codechef.com/users/${handle}`);

    // Wait for the new selector that contains the stats
    await page.waitForSelector('.problems-solved');

    const solvedCount = await page.evaluate(() => {
      // Find the h3 tag that contains "Total Problems Solved"
      const headers = Array.from(document.querySelectorAll('h3'));
      const solvedHeader = headers.find(h => h.innerText.startsWith('Total Problems Solved:'));
      
      if (solvedHeader) {
        const text = solvedHeader.innerText; // e.g., "Total Problems Solved: 50"
        const match = text.match(/\d+/); // Extract the number
        return match ? parseInt(match[0], 10) : 0;
      }
      return 0; // Return 0 if the element isn't found
    });

    return solvedCount;
  } catch (error) {
    console.error(`Failed to scrape CodeChef user ${handle}:`, error.message);
    return 0;
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Fetches the contest rating for a user on Codeforces.
 * @param {string} handle - The Codeforces user handle.
 * @returns {Promise<number>} The user's rating.
 */
export async function fetchCodeforcesUserRating(handle) {
  if (!handle) return 0;
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.info?handles=${handle}`
    );
    if (response.data.status !== "OK") {
      console.error(`Codeforces API error for ${handle}:`, response.data.comment);
      return 0;
    }
    // The API returns an array, we take the first user.
    return response.data.result[0]?.rating || 0;
  } catch (error) {
    console.error(`Failed to fetch Codeforces rating for ${handle}:`, error.message);
    return 0;
  }
}

/**
 * Scrapes the contest rating for a user on CodeChef.
 * @param {string} handle - The CodeChef user handle.
 * @returns {Promise<number>} The user's rating.
 */
export async function scrapeCodeChefUserRating(handle) {
  if (!handle) return 0;
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(`https://www.codechef.com/users/${handle}`);

    await page.waitForSelector('.rating-number');

    const rating = await page.evaluate(() => {
      const ratingElement = document.querySelector('.rating-number');
      return ratingElement ? parseInt(ratingElement.innerText, 10) : 0;
    });

    return rating;
  } catch (error) {
    console.error(`Failed to scrape CodeChef rating for ${handle}:`, error.message);
    return 0;
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Fetches comprehensive user data from LeetCode using a single GraphQL query.
 * @param {string} handle - The LeetCode user handle.
 * @returns {Promise<{solvedCount: number, rating: number}>} An object with solved count and rating.
 */
export async function fetchLeetCodeUserData(handle) {
  if (!handle) {
    return { solvedCount: 0, rating: 0 };
  }

  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      userContestRanking(username: $username) {
        rating
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query,
        variables: { username: handle },
      },
      {
        headers: {
          "Referer": `https://leetcode.com/${handle}/`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.errors) {
      console.error(`LeetCode API error for ${handle}:`, response.data.errors[0].message);
      return { solvedCount: 0, rating: 0 };
    }

    const data = response.data.data;
    if (!data.matchedUser) {
      return { solvedCount: 0, rating: 0 };
    }

    const solvedStats = data.matchedUser.submitStats.acSubmissionNum;
    const solvedCount = solvedStats.find(s => s.difficulty === 'All')?.count || 0;
    const rating = Math.round(data.userContestRanking?.rating || 0);

    return { solvedCount, rating };

  } catch (error) {
    console.error(`Failed to fetch LeetCode data for ${handle}:`, error.message);
    return { solvedCount: 0, rating: 0 };
  }
}
