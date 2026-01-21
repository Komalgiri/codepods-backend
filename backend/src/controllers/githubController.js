import prisma from "../utils/prismaClient.js";
import {
  fetchUserRepos,
  fetchRepoCommits,
  syncGitHubActivity,
} from "../services/githubService.js";

// GET /api/github/repos - Fetch user's repos
export const getUserRepos = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware

    // Get user with GitHub token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubToken: true, githubId: true },
    });

    if (!user || !user.githubToken) {
      return res.status(403).json({
        error: "GitHub account not linked. Please connect your GitHub account first.",
      });
    }

    // Fetch repos from GitHub
    const repos = await fetchUserRepos(user.githubToken);

    // Format response
    const formattedRepos = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      private: repo.private,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      owner: {
        login: repo.owner.login,
        avatarUrl: repo.owner.avatar_url,
      },
    }));

    return res.status(200).json({
      repos: formattedRepos,
      count: formattedRepos.length,
    });
  } catch (error) {
    console.error("Error fetching user repos:", error);
    res.status(500).json({ error: error.message || "Failed to fetch repositories" });
  }
};

// GET /api/github/commits - Fetch commits (weekly)
export const getCommits = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
    const { owner, repo, since } = req.query; // Query params: owner, repo, since (optional ISO date)

    if (!owner || !repo) {
      return res.status(400).json({
        error: "owner and repo query parameters are required",
      });
    }

    // Get user with GitHub token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubToken: true },
    });

    if (!user || !user.githubToken) {
      return res.status(403).json({
        error: "GitHub account not linked. Please connect your GitHub account first.",
      });
    }

    // Parse since date if provided, otherwise default to 7 days ago
    let sinceDate = null;
    if (since) {
      sinceDate = new Date(since);
      if (isNaN(sinceDate.getTime())) {
        return res.status(400).json({
          error: "Invalid 'since' date format. Use ISO 8601 format (e.g., 2024-01-01T00:00:00Z)",
        });
      }
    }

    // Fetch commits from GitHub
    const commits = await fetchRepoCommits(user.githubToken, owner, repo, sinceDate);

    // Format response
    const formattedCommits = commits.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        date: commit.commit.author.date,
        login: commit.author?.login,
        avatarUrl: commit.author?.avatar_url,
      },
      url: commit.html_url,
      repo: {
        name: repo,
        fullName: `${owner}/${repo}`,
      },
    }));

    return res.status(200).json({
      commits: formattedCommits,
      count: formattedCommits.length,
      owner,
      repo,
      since: sinceDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Error fetching commits:", error);
    res.status(500).json({ error: error.message || "Failed to fetch commits" });
  }
};

// POST /api/github/sync - Sync GitHub activity and create rewards
export const syncActivity = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware

    // Get user with GitHub token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubToken: true, githubId: true },
    });

    if (!user || !user.githubToken) {
      return res.status(403).json({
        error: "GitHub account not linked. Please connect your GitHub account first.",
      });
    }

    // Sync GitHub activity
    const results = await syncGitHubActivity(userId, user.githubToken);

    return res.status(200).json({
      message: "GitHub activity synced successfully ✅",
      results: {
        reposFetched: results.reposFetched,
        commitsFetched: results.commitsFetched,
        activitiesCreated: results.activitiesCreated,
        rewardsCreated: results.rewardsCreated,
        errors: results.errors.length > 0 ? results.errors : undefined,
      },
    });
  } catch (error) {
    console.error("Error syncing GitHub activity:", error);
    res.status(500).json({ error: error.message || "Failed to sync GitHub activity" });
  }
};

