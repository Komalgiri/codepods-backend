# ✅ GitHub Integration APIs - Implementation Complete

## Summary
Successfully implemented all GitHub integration APIs for tracking user activity and converting it to rewards.

---

## 📁 Files Created

### New Service:
- ✅ `src/services/githubService.js` - GitHub API integration service with:
  - `fetchUserRepos()` - Fetch user's repositories
  - `fetchWeeklyCommits()` - Fetch commits for a specific repo
  - `getGitHubUser()` - Get authenticated GitHub user info
  - `storeActivity()` - Store activities with duplicate prevention
  - `convertActivitiesToReward()` - Convert activities to rewards
  - `syncGitHubActivity()` - Main sync function

### New Controller:
- ✅ `src/controllers/githubController.js` - GitHub API endpoints:
  - `getUserRepos()` - GET /api/github/repos
  - `getCommits()` - GET /api/github/commits
  - `syncActivity()` - POST /api/github/sync

### New Routes:
- ✅ `src/routes/githubRoutes.js` - GitHub API routes

### Updated Files:
- ✅ `src/routes/githubAuth.js` - Updated to refresh GitHub token on login
- ✅ `src/index.js` - Registered new GitHub routes

---

## 🔌 API Endpoints

### 1. GET /api/github/repos
**Description:** Fetch authenticated user's GitHub repositories

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "repos": [
    {
      "id": 123456,
      "name": "my-repo",
      "fullName": "username/my-repo",
      "description": "Repo description",
      "url": "https://github.com/username/my-repo",
      "private": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "language": "JavaScript",
      "stars": 10,
      "forks": 5,
      "owner": {
        "login": "username",
        "avatarUrl": "https://avatars.githubusercontent.com/..."
      }
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `403` - GitHub account not linked
- `500` - Failed to fetch repositories

---

### 2. GET /api/github/commits
**Description:** Fetch weekly commits for a specific repository

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `owner` (required) - Repository owner (username or org)
- `repo` (required) - Repository name
- `since` (optional) - ISO 8601 date string (default: 7 days ago)

**Example:**
```
GET /api/github/commits?owner=username&repo=my-repo&since=2024-01-01T00:00:00Z
```

**Response:**
```json
{
  "commits": [
    {
      "sha": "abc123...",
      "message": "Fix bug",
      "author": {
        "name": "John Doe",
        "email": "john@example.com",
        "date": "2024-01-15T10:00:00Z",
        "login": "johndoe",
        "avatarUrl": "https://avatars.githubusercontent.com/..."
      },
      "url": "https://github.com/username/my-repo/commit/abc123",
      "repo": {
        "name": "my-repo",
        "fullName": "username/my-repo"
      }
    }
  ],
  "count": 5,
  "owner": "username",
  "repo": "my-repo",
  "since": "2024-01-08T00:00:00Z"
}
```

**Error Responses:**
- `400` - Missing owner/repo or invalid date format
- `403` - GitHub account not linked
- `500` - Failed to fetch commits

---

### 3. POST /api/github/sync
**Description:** Sync GitHub activity and automatically create rewards

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**What it does:**
1. Fetches all user's repositories
2. Checks for new repos created in the last 7 days → creates `repo_created` activities
3. Fetches weekly commits for each repo → creates `commit` activities (only for commits by the authenticated user)
4. Prevents duplicate activities (checks by commit SHA and repo name)
5. Converts all new activities into a single reward with badges

**Response:**
```json
{
  "message": "GitHub activity synced successfully ✅",
  "results": {
    "reposFetched": 10,
    "commitsFetched": 25,
    "activitiesCreated": 8,
    "rewardsCreated": 1,
    "errors": [] // Only present if there were errors
  }
}
```

**Error Responses:**
- `403` - GitHub account not linked
- `500` - Failed to sync activity

---

## 🎯 Activity Types & Points

The system tracks the following activity types with corresponding points:

| Activity Type | Points | Description |
|--------------|--------|-------------|
| `commit` | 10 | Each commit by the user |
| `repo_created` | 50 | New repository created |
| `pr_opened` | 25 | Pull request opened (future) |
| `pr_merged` | 50 | Pull request merged (future) |
| `issue_opened` | 15 | Issue opened (future) |
| `issue_closed` | 20 | Issue closed (future) |
| Other | 5 | Default points for unknown activities |

---

## 🏆 Badge System

Badges are automatically awarded based on activity:

- **repo-creator** - Created a new repository
- **committer** - 10+ commits in sync period
- **super-committer** - 50+ commits in sync period

---

## 🔒 Security Features

1. **Authentication Required:** All endpoints require JWT token
2. **GitHub Token Validation:** Checks if user has linked GitHub account
3. **User Verification:** Only tracks commits authored by the authenticated user
4. **Duplicate Prevention:** Prevents storing the same commit/repo activity twice

---

## 🔄 Duplicate Prevention

The system prevents duplicate activities by:

1. **Commits:** Checks commit SHA in the last 7 days
2. **Repos:** Checks repo full name within 24 hours of creation

This ensures that running sync multiple times won't create duplicate rewards.

---

## 📝 Activity Storage

Activities are stored in the `Activity` model with:
- `type` - Activity type (commit, repo_created, etc.)
- `meta` - JSON object with activity details (SHA, repo info, etc.)
- `value` - Points for this activity
- `userId` - User who performed the activity
- `podId` - Optional pod association (for future use)

---

## 🎁 Reward Conversion

When activities are synced:
1. All new activities are collected
2. Total points are calculated
3. Badges are determined based on activity patterns
4. A single `Reward` record is created with:
   - Total points from all activities
   - Badges earned
   - Reason: "GitHub activity sync: X activities"

---

## 🚀 Usage Example

```javascript
// 1. User connects GitHub (via OAuth)
GET /api/auth/github/login

// 2. User syncs their activity
POST /api/github/sync
// Returns: { reposFetched: 5, commitsFetched: 20, activitiesCreated: 8, rewardsCreated: 1 }

// 3. User views their rewards
GET /api/users/:id/rewards
// Returns: { totalPoints: 180, rewards: [...], count: 1 }

// 4. User can also manually fetch repos/commits
GET /api/github/repos
GET /api/github/commits?owner=username&repo=my-repo
```

---

## ⚠️ Notes

1. **GitHub Token Storage:** Tokens are currently stored in plain text. Consider encryption for production.
2. **Rate Limiting:** GitHub API has rate limits. The service handles errors gracefully.
3. **Pagination:** Currently fetches up to 100 repos/commits per request. Can be extended with pagination.
4. **Scope Requirements:** GitHub OAuth app needs `repo` scope to access private repositories and commits.

---

## ✅ Status

All GitHub integration APIs are complete and ready to use! 🎉

