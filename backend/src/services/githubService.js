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
 * Fetch commits for a specific repository
 * @param {string} accessToken - GitHub access token
 * @param {string} owner - Repository owner (username or org)
 * @param {string} repo - Repository name
 * @param {Date} since - Date to fetch commits since (optional)
 * @returns {Promise<Array>} Array of commits
 */
export const fetchRepoCommits = async (accessToken, owner, repo, since = null) => {
  try {
    const params = {
      per_page: 100,
    };

    if (since) {
      params.since = since.toISOString();
    }

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        params: params,
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching commits for ${owner}/${repo}:`, error.response?.data || error.message);
    throw new Error(`Failed to fetch commits for ${owner}/${repo}`);
  }
};

/**
 * Fetch weekly pull requests for a specific repository
 * @param {string} accessToken - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {Date} since - Date to fetch PRs since
 * @returns {Promise<Array>} Array of PRs
 */
export const fetchWeeklyPRs = async (accessToken, owner, repo, since = null) => {
  try {
    if (!since) {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      since = date;
    }

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        params: {
          state: "all",
          sort: "created",
          direction: "desc",
          per_page: 100,
        },
      }
    );

    // Filter by date since GitHub API pulls endpoint doesn't have a 'since' parameter for PRs like commits does
    return response.data.filter(pr => new Date(pr.created_at) >= since || new Date(pr.updated_at) >= since);
  } catch (error) {
    console.error(`Error fetching PRs for ${owner}/${repo}:`, error.response?.data || error.message);
    return [];
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

  // Use the actual activity date if provided in meta, otherwise default to now
  const activityDate = meta.createdAt ? new Date(meta.createdAt) : new Date();

  if (type === "commit" && meta.sha) {
    // Check for commit SHA across a longer window to prevent duplicates during re-syncs
    const recentActivities = await prisma.activity.findMany({
      where: {
        userId,
        type,
        createdAt: {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
        },
      },
    });

    existingActivity = recentActivities.find(
      (activity) => activity.meta && activity.meta.sha === meta.sha
    );
  } else if (type === "repo_created" && meta.repoFullName) {
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

    existingActivity = recentActivities.find(
      (activity) => activity.meta && activity.meta.repoFullName === meta.repoFullName
    );
  }

  // If activity already exists, update the date if it's incorrect (Self-healing for wrong dates)
  if (existingActivity) {
    if (existingActivity.createdAt.getTime() !== activityDate.getTime()) {
      await prisma.activity.update({
        where: { id: existingActivity.id },
        data: { createdAt: activityDate }
      });
    }
    return null;
  }

  // Handle PR duplicates by HTML URL
  if ((type === "pr_opened" || type === "pr_merged") && meta.prUrl) {
    const recentPRActivities = await prisma.activity.findMany({
      where: {
        userId,
        type,
        createdAt: {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
        },
      },
    });

    if (recentPRActivities.find(a => a.meta && a.meta.prUrl === meta.prUrl)) {
      return null;
    }
  }

  const points = getActivityPoints(type);

  const activity = await prisma.activity.create({
    data: {
      userId,
      type,
      meta,
      value: points,
      podId,
      createdAt: activityDate, // Use the ACTUAL commit/PR date here 🚀
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
    prsFetched: 0,
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

    // 2. For each repo, check if it's new (created in last 30 days) and fetch commits
    const syncPeriod = new Date();
    syncPeriod.setDate(syncPeriod.getDate() - 30); // 30 days for general activity sync

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

        // Fetch commits for this repo
        const commits = await fetchRepoCommits(
          accessToken,
          repo.owner.login,
          repo.name,
          syncPeriod
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

        // Fetch PRs
        const prs = await fetchWeeklyPRs(accessToken, repo.owner.login, repo.name, syncPeriod);
        results.prsFetched += prs.length;

        for (const pr of prs) {
          if (pr.user?.login === userLogin) {
            const isMerged = pr.merged_at && new Date(pr.merged_at) >= syncPeriod;
            const isOpened = new Date(pr.created_at) >= syncPeriod;

            if (isOpened) {
              const activity = await storeActivity(userId, "pr_opened", {
                prNumber: pr.number,
                title: pr.title,
                repoName: repo.name,
                repoFullName: repo.full_name,
                prUrl: pr.html_url,
                createdAt: pr.created_at,
              });
              if (activity) {
                newActivities.push(activity);
                results.activitiesCreated++;
              }
            }

            if (isMerged) {
              const activity = await storeActivity(userId, "pr_merged", {
                prNumber: pr.number,
                title: pr.title,
                repoName: repo.name,
                repoFullName: repo.full_name,
                prUrl: pr.html_url,
                createdAt: pr.merged_at,
              });
              if (activity) {
                newActivities.push(activity);
                results.activitiesCreated++;
              }
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


/**
 * Sync GitHub activity for a specific repository and pod
 * @param {string} podId - Pod ID
 * @param {string} owner - Repo owner
 * @param {string} repoName - Repo name
 * @returns {Promise<object>} Results
 */
export const syncRepoActivity = async (podId, owner, repoName) => {
  const results = {
    commitsFetched: 0,
    prsFetched: 0,
    activitiesCreated: 0,
    errors: [],
  };

  try {
    // 1. Get the pod to find members (we need to match GitHub usernames to users)
    const pod = await prisma.pod.findUnique({
      where: { id: podId },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!pod) throw new Error("Pod not found");

    // 2. Fetch weekly commits for this repo
    // Note: We might not have an access token here since this is triggered by an admin
    // We can use any member's token or a generic one if configured.
    // For now, we'll try to find an admin with a token.
    const adminWithToken = pod.members.find(m => m.role === 'admin' && m.user.githubToken);
    const accessToken = adminWithToken?.user.githubToken;

    if (!accessToken) {
      // Falling back to public API if possible, or failing
      results.errors.push("No admin with GitHub token found to sync private repos. Trying public fetch.");
    }

    const syncWindow = new Date();
    syncWindow.setDate(syncWindow.getDate() - 365); // Fetch last 365 days for pods

    const commits = await fetchRepoCommits(
      accessToken,
      owner,
      repoName,
      syncWindow
    );

    results.commitsFetched = commits.length;

    // 3. For each commit, find the corresponding user in the pod
    for (const commit of commits) {
      const githubLogin = commit.author?.login || commit.committer?.login;
      if (!githubLogin) continue;

      // Find member with this github login
      const member = pod.members.find(m =>
        m.user.githubUsername === githubLogin ||
        (m.user.name === githubLogin && !m.user.githubUsername)
      );
      if (member) {
        const activity = await storeActivity(
          member.userId,
          "commit",
          {
            sha: commit.sha,
            message: commit.commit.message,
            repoName: repoName,
            repoFullName: `${owner}/${repoName}`,
            repoUrl: commit.html_url.split('/commit/')[0],
            commitUrl: commit.html_url,
            author: githubLogin,
            createdAt: commit.commit.author.date,
          },
          podId
        );
        if (activity) {
          results.activitiesCreated++;
        }
      }
    }

    // 4. Fetch PRs
    const prs = await fetchWeeklyPRs(accessToken, owner, repoName, syncWindow);
    results.prsFetched = prs.length;

    for (const pr of prs) {
      const githubLogin = pr.user?.login;
      if (!githubLogin) continue;

      const member = pod.members.find(m =>
        m.user.githubUsername === githubLogin ||
        (m.user.name === githubLogin && !m.user.githubUsername)
      );
      if (member) {
        // PR Opened
        if (new Date(pr.created_at) >= syncWindow) {
          const activity = await storeActivity(
            member.userId,
            "pr_opened",
            {
              prNumber: pr.number,
              title: pr.title,
              repoName: repoName,
              repoFullName: `${owner}/${repoName}`,
              prUrl: pr.html_url,
              createdAt: pr.created_at,
            },
            podId
          );
          if (activity) results.activitiesCreated++;
        }

        // PR Merged
        if (pr.merged_at && new Date(pr.merged_at) >= syncWindow) {
          const activity = await storeActivity(
            member.userId,
            "pr_merged",
            {
              prNumber: pr.number,
              title: pr.title,
              repoName: repoName,
              repoFullName: `${owner}/${repoName}`,
              prUrl: pr.html_url,
              createdAt: pr.merged_at,
            },
            podId
          );
          if (activity) results.activitiesCreated++;
        }
      }
    }

    return results;
  } catch (error) {
    console.error(`Error syncing repo activity for ${owner}/${repoName}:`, error);
    results.errors.push(error.message);
    return results;
  }
};

/**
 * Analyze user's GitHub profile to detect tech stack and infer role
 * @param {string} userId - User ID
 * @param {string} accessToken - GitHub access token
 * @returns {Promise<object>} Analysis results
 */
export const analyzeAndSaveProfile = async (userId, accessToken) => {
  try {
    // 1. Fetch Repos
    const repos = await fetchUserRepos(accessToken);

    // 2. Aggregate Languages
    const languageCounts = {};
    repos.forEach(repo => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    });

    // Sort languages by frequency
    const sortedLanguages = Object.entries(languageCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([lang]) => lang);

    const topStack = sortedLanguages.slice(0, 10); // Top 10 languages

    // 3. Infer Role
    const frontendLangs = ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'Svelte', 'Dart', 'Swift', 'Kotlin', 'Objective-C'];
    const backendLangs = ['Python', 'Java', 'Go', 'Ruby', 'PHP', 'C#', 'C++', 'Rust', 'Shell', 'C'];

    let frontendScore = 0;
    let backendScore = 0;

    topStack.forEach(lang => {
      if (frontendLangs.includes(lang)) frontendScore++;
      if (backendLangs.includes(lang)) backendScore++;
    });

    let role = 'Fullstack Developer';
    if (frontendScore > backendScore * 1.5) role = 'Frontend Developer';
    else if (backendScore > frontendScore * 1.5) role = 'Backend Developer';

    if (topStack.length === 0) role = 'Developer'; // Fallback

    // 4. Update User
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        techStack: topStack,
        inferredRole: role
      }
    });

    return {
      techStack: topStack,
      inferredRole: role
    };

  } catch (error) {
    console.error("Error analyzing profile:", error);
    throw new Error("Failed to analyze GitHub profile");
  }
};

