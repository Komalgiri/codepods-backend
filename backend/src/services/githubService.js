import axios from "axios";
import prisma from "../utils/prismaClient.js";

/**
 * Fetch user's GitHub repositories
 * @param {string} accessToken - GitHub access token
 * @returns {Promise<Array>} Array of repositories
 */
export const fetchUserRepos = async (accessToken) => {
  try {
    const response = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      params: {
        sort: "created",
        direction: "desc",
        per_page: 100, // Max repos per page
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user repos:", error.response?.data || error.message);
    throw new Error("Failed to fetch GitHub repositories");
  }
};

/**
 * Fetch weekly commits for a specific repository
 * @param {string} accessToken - GitHub access token
 * @param {string} owner - Repository owner (username or org)
 * @param {string} repo - Repository name
 * @param {Date} since - Date to fetch commits since (default: 7 days ago)
 * @returns {Promise<Array>} Array of commits
 */
export const fetchWeeklyCommits = async (accessToken, owner, repo, since = null) => {
  try {
    // Default to 7 days ago if not provided
    if (!since) {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      since = date;
    }

    const sinceISO = since.toISOString();

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        params: {
          since: sinceISO,
          per_page: 100,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching commits for ${owner}/${repo}:`, error.response?.data || error.message);
    throw new Error(`Failed to fetch commits for ${owner}/${repo}`);
  }
};

/**
 * Calculate points for different activity types
 * @param {string} activityType - Type of activity
 * @returns {number} Points value
 */
const getActivityPoints = (activityType) => {
  const pointMap = {
    commit: 10,
    repo_created: 50,
    pr_opened: 25,
    pr_merged: 50,
    issue_opened: 15,
    issue_closed: 20,
  };
  return pointMap[activityType] || 5; // Default 5 points
};

/**
 * Store activity in database (with duplicate prevention)
 * @param {string} userId - User ID
 * @param {string} type - Activity type
 * @param {object} meta - Activity metadata
 * @param {string} podId - Optional pod ID
 * @returns {Promise<Activity|null>} Created activity or null if duplicate
 */
export const storeActivity = async (userId, type, meta, podId = null) => {
  // Check for duplicate activities
  // For commits, check by SHA; for repos, check by repo name
  let existingActivity = null;
  
  if (type === "commit" && meta.sha) {
    // Query activities and filter in memory (Prisma JSON queries can be complex)
    const recentActivities = await prisma.activity.findMany({
      where: {
        userId,
        type,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });
    
    // Check if commit SHA already exists
    existingActivity = recentActivities.find(
      (activity) => activity.meta && activity.meta.sha === meta.sha
    );
  } else if (type === "repo_created" && meta.repoFullName) {
    // Check if we already tracked this repo creation in the last day
    const repoCreatedDate = new Date(meta.createdAt);
    const oneDayAfter = new Date(repoCreatedDate);
    oneDayAfter.setDate(oneDayAfter.getDate() + 1);
    
    const recentActivities = await prisma.activity.findMany({
      where: {
        userId,
        type,
        createdAt: {
          gte: repoCreatedDate,
          lte: oneDayAfter,
        },
      },
    });
    
    // Check if repo already exists
    existingActivity = recentActivities.find(
      (activity) => activity.meta && activity.meta.repoFullName === meta.repoFullName
    );
  }

  // If activity already exists, return null
  if (existingActivity) {
    return null;
  }

  const points = getActivityPoints(type);

  const activity = await prisma.activity.create({
    data: {
      userId,
      type,
      meta,
      value: points,
      podId,
    },
  });

  return activity;
};

/**
 * Convert activities to rewards
 * @param {string} userId - User ID
 * @param {Array<Activity>} activities - Array of activities to convert
 * @returns {Promise<Reward>} Created reward
 */
export const convertActivitiesToReward = async (userId, activities) => {
  if (activities.length === 0) {
    return null;
  }

  // Calculate total points
  const totalPoints = activities.reduce((sum, activity) => sum + activity.value, 0);

  // Determine badges based on activity types
  const badges = [];
  const activityTypes = activities.map((a) => a.type);
  
  if (activityTypes.includes("repo_created")) {
    badges.push("repo-creator");
  }
  if (activityTypes.filter((t) => t === "commit").length >= 10) {
    badges.push("committer");
  }
  if (activityTypes.filter((t) => t === "commit").length >= 50) {
    badges.push("super-committer");
  }

  // Create reward
  const reward = await prisma.reward.create({
    data: {
      userId,
      points: totalPoints,
      badges,
      reason: `GitHub activity sync: ${activities.length} activities`,
    },
  });

  return reward;
};

/**
 * Get authenticated GitHub user info
 * @param {string} accessToken - GitHub access token
 * @returns {Promise<object>} User info
 */
export const getGitHubUser = async (accessToken) => {
  try {
    const response = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching GitHub user:", error.response?.data || error.message);
    throw new Error("Failed to fetch GitHub user info");
  }
};

/**
 * Sync GitHub activity for a user
 * @param {string} userId - User ID
 * @param {string} accessToken - GitHub access token
 * @returns {Promise<object>} Sync results
 */
export const syncGitHubActivity = async (userId, accessToken) => {
  const results = {
    reposFetched: 0,
    commitsFetched: 0,
    activitiesCreated: 0,
    rewardsCreated: 0,
    errors: [],
  };

  try {
    // 1. Get authenticated user's GitHub username
    const githubUser = await getGitHubUser(accessToken);
    const userLogin = githubUser.login;

    // 2. Fetch user's repositories
    const repos = await fetchUserRepos(accessToken);
    results.reposFetched = repos.length;

    // 2. For each repo, check if it's new (created in last 7 days) and fetch commits
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newActivities = [];

    for (const repo of repos) {
      try {
        // Check if repo was created in the last 7 days
        const repoCreatedAt = new Date(repo.created_at);
        if (repoCreatedAt >= sevenDaysAgo) {
          // Store repo creation activity
          const activity = await storeActivity(
            userId,
            "repo_created",
            {
              repoName: repo.name,
              repoFullName: repo.full_name,
              repoUrl: repo.html_url,
              createdAt: repo.created_at,
            }
          );
          if (activity) {
            newActivities.push(activity);
            results.activitiesCreated++;
          }
        }

        // Fetch weekly commits for this repo
        const commits = await fetchWeeklyCommits(
          accessToken,
          repo.owner.login,
          repo.name,
          sevenDaysAgo
        );

        results.commitsFetched += commits.length;

        // Store commit activities
        // Only count commits authored by the authenticated user
        for (const commit of commits) {
          const commitAuthor = commit.author?.login || commit.committer?.login;
          // Only track commits by the authenticated user
          if (commitAuthor === userLogin) {
            const activity = await storeActivity(
              userId,
              "commit",
              {
                sha: commit.sha,
                message: commit.commit.message,
                repoName: repo.name,
                repoFullName: repo.full_name,
                repoUrl: repo.html_url,
                commitUrl: commit.html_url,
                author: commitAuthor,
                createdAt: commit.commit.author.date,
              }
            );
            if (activity) {
              newActivities.push(activity);
              results.activitiesCreated++;
            }
          }
        }
      } catch (error) {
        results.errors.push(`Error processing repo ${repo.full_name}: ${error.message}`);
      }
    }

    // 3. Convert activities to rewards (batch by day or create one reward for all)
    if (newActivities.length > 0) {
      const reward = await convertActivitiesToReward(userId, newActivities);
      if (reward) {
        results.rewardsCreated = 1;
      }
    }

    return results;
  } catch (error) {
    console.error("Error syncing GitHub activity:", error);
    results.errors.push(error.message);
    throw error;
  }
};

