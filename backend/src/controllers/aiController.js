import axios from "axios";
import prisma from "../utils/prismaClient.js";
import { fetchRepoStructure } from "../services/githubService.js";

/**
 * Helper: Calculate team allocation with AI match percentages
 */
const calculateTeamAllocation = (members, podName = '', podDescription = '') => {
    const projectKeywords = `${podName} ${podDescription}`.toLowerCase();

    return members.map((member, idx) => {
        const userStack = member.user.techStack || [];
        const userRole = member.user.inferredRole || 'Developer';

        // 1. Calculate Keyword Match
        let matchScore = 0;
        let skillMatches = 0;

        userStack.forEach(skill => {
            if (projectKeywords.includes(skill.toLowerCase())) {
                skillMatches++;
            }
        });

        if (skillMatches > 0) {
            matchScore = 70 + (skillMatches * 5);
        } else {
            matchScore = 60 + Math.floor(Math.random() * 20);
        }

        if (projectKeywords.includes('backend') && userRole.includes('Backend')) matchScore += 10;
        if (projectKeywords.includes('frontend') && userRole.includes('Frontend')) matchScore += 10;
        if (projectKeywords.includes('mobile') && userRole.includes('Mobile')) matchScore += 15;
        if (projectKeywords.includes('data') && userRole.includes('Data')) matchScore += 15;

        matchScore = Math.min(99, matchScore);

        let displayRole = userRole;
        if (displayRole === 'Developer' || !displayRole) {
            displayRole = idx === 0 ? 'Lead Engineer' : idx === 1 ? 'Product Manager' : 'Developer';
        }

        return {
            id: member.userId,
            name: member.user.name,
            role: displayRole,
            match: Math.round(matchScore)
        };
    });
};

/**
 * Generate a strategic roadmap for a pod using Gemini AI
 * GET /api/ai/pods/:id/plan
 */
export const getPodRoadmap = async (req, res) => {
    try {
        const { id: podId } = req.params;
        const { force } = req.query;
        const apiKey = process.env.GEMINI_API_KEY;

        const pod = await prisma.pod.findUnique({
            where: { id: podId },
            include: {
                tasks: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                    include: { user: { select: { name: true, inferredRole: true } } }
                },
                activities: { orderBy: { createdAt: 'desc' }, take: 30, include: { user: { select: { name: true, techStack: true } } } },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                githubUsername: true,
                                techStack: true,
                                inferredRole: true
                            }
                        }
                    }
                }
            }
        });

        if (!pod) return res.status(404).json({ error: "Pod not found" });

        const now = new Date();
        const CACHE_STALE_TIME = 7 * 24 * 60 * 60 * 1000;
        let isCacheValid = false;

        // Skip cache if 'force' is present
        if (pod.aiRoadmap && pod.roadmapUpdatedAt && force !== 'true') {
            const timeSinceUpdate = now - new Date(pod.roadmapUpdatedAt);
            const cachedData = typeof pod.aiRoadmap === 'string' ? JSON.parse(pod.aiRoadmap) : pod.aiRoadmap;
            const previousMemberCount = cachedData.meta?.memberCount || 0;
            const currentMemberCount = pod.members.length;

            if (previousMemberCount === currentMemberCount && timeSinceUpdate < CACHE_STALE_TIME) {
                isCacheValid = true;
            }
        }

        if (isCacheValid) {
            const cachedData = typeof pod.aiRoadmap === 'string' ? JSON.parse(pod.aiRoadmap) : pod.aiRoadmap;
            const teamAllocation = calculateTeamAllocation(pod.members, pod.name, pod.description);
            return res.status(200).json({
                ...cachedData,
                members: teamAllocation,
                projectBrain: pod.projectBrain || null
            });
        }

        console.log(`[AI] Cache miss/stale for pod ${podId}, generating new roadmap...`);

        const activityContext = pod.activities.map(a => `${a.user.name} did ${a.type} ${a.meta?.repoName ? `in ${a.meta.repoName}` : ''} at ${a.createdAt}`).join('\n');

        console.log(`[AI] Preparing prompt with ${pod.activities.length} activities and ${pod.tasks.length} tasks.`);

        let roadmap;
        let confidence = 0.92;
        let duration = "7 Days";
        let efficiency = "+15%";
        let stage = "Development";
        let projectBrain = pod.projectBrain;

        if (apiKey) {
            try {
                const brainContext = pod.projectBrain ? `Previous Strategic Context: ${JSON.stringify(pod.projectBrain)}` : "No previous strategic context recorded.";
                const prompt = `
                Act as an AI Project Manager for "${pod.name}".
                Generate a strategic development plan in valid JSON format.
                
                PROJECT CONTEXT:
                Description: ${pod.description}
                ${brainContext}
                
                TEAM:
                ${pod.members.map(m => `- ${m.user.name} (Role: ${m.role}, Stack: ${m.user.techStack?.join(', ') || 'Generalist'})`).join('\n')}
                
                RECENT VELOCITY:
                ${activityContext || 'No recent activity.'}
                
                CURRENT TASKS:
                ${pod.tasks.length > 0 ? pod.tasks.map(t => `- "${t.title}" (Status: ${t.status}, Assigned: ${t.user?.name || 'Open'}, Created: ${t.createdAt})`).join('\n') : 'No tasks recorded.'}
                
                REQUIRED JSON OUTPUT (Return ONLY this object):
                {
                  "stage": "Strategy|Development|Testing|Deployment",
                  "roadmap": [
                    { 
                      "id": 1, 
                      "title": "Strategy & Scope Definition", 
                      "description": "Establish clear MVP boundaries and tech debt audit.", 
                      "status": "IN PROGRESS", 
                      "tasks": [{ "name": "Formalize MVP Scope", "status": "pending", "assignee": "Lead" }] 
                    },
                    { 
                      "id": 2, 
                      "title": "Core Architecture", 
                      "description": "Setting up the foundation for scalability.", 
                      "status": "UPCOMING", 
                      "tasks": [] 
                    }
                  ],
                  "projectBrain": {
                    "summary": "Full project state summary...",
                    "decisions": ["Why X was chosen", "Technical debt identified"],
                    "milestones": ["Completed Auth", "Database migration"],
                    "techStackAdjustments": "Switching to X for Y"
                  },
                  "pmInsights": [
                    { "type": "blocker", "message": "API design is stalling frontend", "priority": "high" },
                    { "type": "warning", "message": "Mobile dev velocity is low", "priority": "medium" }
                  ],
                  "confidence": 0.95,
                  "duration": "7 Days",
                  "efficiency": "+18%"
                }
                
                COLD START DIRECTIVE:
                If the project has zero tasks or activity, focus the roadmap on "Project Onboarding", "Infrastructure Setup", and "Scope Definition". ALWAYS return at least 3-4 roadmap stages.
                `;

                const geminiRes = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
                    { contents: [{ parts: [{ text: prompt }] }] }
                );

                const responseText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (responseText) {
                    console.log(`[AI] Gemini Responded. Extracting JSON...`);
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const data = JSON.parse(jsonMatch[0]);
                        console.log(`[AI] Successfully parsed JSON structure. Roadmap steps count: ${data.roadmap?.length || 0}`);

                        projectBrain = data.projectBrain || projectBrain;
                        confidence = data.confidence || confidence;
                        duration = data.duration || duration;
                        efficiency = data.efficiency || efficiency;
                        stage = data.stage || stage;

                        if (data.roadmap && data.roadmap.length > 0) {
                            roadmap = {
                                steps: data.roadmap,
                                pmInsights: data.pmInsights || []
                            };
                        } else {
                            console.warn(`[AI] Gemini returned valid JSON but empty roadmap array.`);
                        }
                    } else {
                        console.warn(`[AI] Gemini returned text but no JSON block found.`);
                    }
                } else {
                    console.error(`[AI] Gemini returned empty response.`);
                }
            } catch (e) {
                console.error(`[AI] Error during generation:`, e.message);
            }
        }

        if (!roadmap || !roadmap.steps || roadmap.steps.length === 0) {
            console.log(`[AI] Applying Strategic Onboarding Baseline (Roadmap was empty).`);
            roadmap = {
                steps: [
                    { id: 1, title: 'Strategic Initialization', description: 'Aligning team goals and repository structure.', status: 'IN PROGRESS', tasks: [{ name: 'Define MVP Scope', status: 'pending' }] },
                    { id: 2, title: 'Role Assignment', description: 'Matching members to core modules.', status: 'UPCOMING', tasks: [] },
                    { id: 3, title: 'Infrastructure Setup', description: 'Environment config and CI/CD audit.', status: 'UPCOMING', tasks: [] }
                ],
                pmInsights: [{ type: "suggestion", message: "Initialize your project roadmap to see real-time AI insights.", priority: "medium" }]
            };
        }

        const teamAllocation = calculateTeamAllocation(pod.members, pod.name, pod.description);
        const result = {
            stage,
            roadmap: roadmap.steps || roadmap,
            pmInsights: roadmap.pmInsights || [],
            confidence,
            duration,
            efficiency,
            projectBrain,
            meta: { memberCount: pod.members.length, lastUpdated: new Date() }
        };

        // Single atomic update
        await prisma.pod.update({
            where: { id: podId },
            data: {
                aiRoadmap: result,
                roadmapUpdatedAt: new Date(),
                projectBrain: projectBrain
            }
        });

        console.log(`[AI] Roadmap successfully generated and saved for pod ${podId}.`);
        return res.status(200).json({ ...result, members: teamAllocation });

    } catch (error) {
        console.error("AI Plan Error:", error);
        res.status(500).json({ error: "Failed to generate AI plan" });
    }
};

/**
 * Suggest new tasks based on current pod state
 */
export const suggestTasks = async (req, res) => {
    try {
        const { id: podId } = req.params;
        const apiKey = process.env.GEMINI_API_KEY;

        const pod = await prisma.pod.findUnique({
            where: { id: podId },
            include: {
                tasks: { take: 20, orderBy: { createdAt: 'desc' } },
                members: { include: { user: { select: { id: true, name: true, githubToken: true, inferredRole: true } } } }
            }
        });

        if (!pod) return res.status(404).json({ error: "Pod not found" });

        let repoContext = "Repository not linked.";
        if (pod.repoOwner && pod.repoName) {
            const adminMember = pod.members.find(m => m.user.githubToken);
            if (adminMember) {
                const fileStructure = await fetchRepoStructure(adminMember.user.githubToken, pod.repoOwner, pod.repoName);
                if (fileStructure.length > 0) {
                    repoContext = `Files:\n${fileStructure.slice(0, 50).join('\n')}`;
                }
            }
        }

        let suggestedTasks = [
            { title: "Review Project Scope", description: "Align goals.", priority: "high", assigneeId: pod.members[0]?.userId }
        ];

        if (apiKey) {
            try {
                const prompt = `Suggest 3-5 tasks for "${pod.name}". Current: ${pod.tasks.map(t => t.title).join(', ')}. ${repoContext}. Team: ${pod.members.map(m => m.user.name).join(', ')}. Return JSON array.`;
                const geminiRes = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
                    { contents: [{ parts: [{ text: prompt }] }] }
                );

                if (geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    const text = geminiRes.data.candidates[0].content.parts[0].text;
                    const jsonMatch = text.match(/\[[\s\S]*\]/);
                    if (jsonMatch) suggestedTasks = JSON.parse(jsonMatch[0]);
                }
            } catch (e) { console.error("Gemini Suggest Error:", e.message); }
        }

        return res.status(200).json({ suggestions: suggestedTasks });
    } catch (error) {
        res.status(500).json({ error: "Failed to suggest tasks" });
    }
};

/**
 * Get the Project Brain
 */
export const getProjectBrain = async (req, res) => {
    try {
        const { id: podId } = req.params;
        const pod = await prisma.pod.findUnique({
            where: { id: podId },
            select: { projectBrain: true, name: true }
        });

        if (!pod) return res.status(404).json({ error: "Pod not found" });

        return res.status(200).json({
            name: pod.name,
            brain: pod.projectBrain || {
                summary: "Strategic memory initializing...",
                decisions: [],
                milestones: [],
                techStackAdjustments: "None."
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch brain" });
    }
};
