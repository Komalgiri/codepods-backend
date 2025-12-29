# CodePods Backend - API Implementation Status

## ✅ **IMPLEMENTED APIs**

### Step 1: Auth Layer
- ✅ `POST /api/users/signup` - Email+password signup
- ✅ `POST /api/users/login` - Email+password login
- ✅ `GET /api/auth/github/login` - GitHub OAuth redirect
- ✅ `GET /api/auth/github/callback` - GitHub OAuth callback (creates/fetches user by email/githubId)
- ✅ User creation/fetch logic in place

### Step 2: Pod Management (Partial)
- ✅ `POST /api/pods/create` - Create pod (route name differs from requirement)

---

## ❌ **MISSING APIs**

### Step 1: Auth Layer
- ❌ **Google OAuth** - No Google OAuth implementation
  - Need: `GET /api/auth/google/login`
  - Need: `GET /api/auth/google/callback`

### Step 2: Pod Management
- ❌ `POST /api/pods` - Create pod (currently `/pods/create`, should be `/pods`)
- ❌ `POST /api/pods/:id/members` - Add member to pod
- ❌ `GET /api/pods/:id` - Fetch pod details with members & tasks

### Step 3: Task Assignment & AI Suggestions
- ❌ `POST /api/pods/:id/tasks` - Create task (can be AI-suggested later)
- ❌ `PATCH /api/tasks/:id/status` - Update task progress
- ❌ AI logic for task suggestions (LLM endpoint) - mentioned as "later"

### Step 4: Rewards System
- ❌ `POST /api/rewards` - Add reward points (when user commits, fixes bug, completes task)
- ❌ `GET /api/users/:id/rewards` - List a user's rewards

### Step 5: GitHub Integration (Tracking Activity)
- ✅ GitHub OAuth setup - DONE
- ✅ Store GitHub access token - DONE
- ❌ **Service function**: Fetch repo creation (`/user/repos`)
- ❌ **Service function**: Fetch weekly commits (`/repos/{owner}/{repo}/commits?since=...`)
- ❌ **Service function**: Store results → convert into Reward
- ❌ **API endpoint**: `GET /api/github/repos` - Fetch user's repos
- ❌ **API endpoint**: `GET /api/github/commits` - Fetch commits (weekly)
- ❌ **API endpoint**: `POST /api/github/sync` - Sync GitHub activity and create rewards

### Step 6: Skill Exchange Feature
- ✅ Skill model exists in schema
- ❌ `GET /api/skills` - List all available skills
- ❌ `POST /api/users/:id/skills` - Add skills to user
- ❌ `GET /api/users/:id/skills` - Get user's skills
- ❌ `DELETE /api/users/:id/skills/:skillId` - Remove skill from user
- ❌ `GET /api/skills/:skillId/users` - Find users with a specific skill (for mentorship)
- ❌ `POST /api/pods/:id/mentorship-request` - Request mentorship in a pod context

---

## 📋 **SUMMARY**

### Total APIs Required: ~20
### APIs Implemented: ~4
### APIs Missing: ~16

### Priority Order (Based on Your Flow):
1. **Pod Management** (2 APIs) - `POST /pods/:id/members`, `GET /pods/:id`
2. **Task Assignment** (2 APIs) - `POST /pods/:id/tasks`, `PATCH /tasks/:id/status`
3. **Rewards System** (2 APIs) - `POST /rewards`, `GET /users/:id/rewards`
4. **GitHub Integration** (3 APIs + service functions) - Sync repos, commits, convert to rewards
5. **Skill Exchange** (6 APIs) - Full skill management and mentorship
6. **Google OAuth** (2 APIs) - Optional, if needed

---

## 🔧 **NOTES**

1. **Route Naming**: Current pod creation route is `/api/pods/create` but requirement says `/api/pods`. Consider standardizing.

2. **Task Controller**: Need to create `taskController.js` with task CRUD operations.

3. **Reward Controller**: Need to create `rewardController.js` for reward management.

4. **GitHub Service**: Need to create a service file (e.g., `githubService.js`) to handle:
   - Fetching repos
   - Fetching commits
   - Converting activities to rewards

5. **Skill Controller**: Need to create `skillController.js` for skill management.

6. **Google OAuth**: If implementing, similar structure to `githubAuth.js` route.

