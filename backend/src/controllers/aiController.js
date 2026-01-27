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
        const apiKey = process.env.GEMINI_API_KEY;

        const pod = await prisma.pod.findUnique({
            where: { id: podId },
            include: {
                tasks: { orderBy: { createdAt: 'desc' }, take: 10 },
                activities: { orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { name: true } } } },
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

        if (pod.aiRoadmap && pod.roadmapUpdatedAt) {
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

        let roadmap;
        let confidence = 0.92;
        let duration = "7 Days";
        let efficiency = "+15%";
        let stage = "Development";

        if (apiKey) {
            try {
                const brainContext = pod.projectBrain ? `Previous Strategic Context: ${JSON.stringify(pod.projectBrain)}` : "No previous strategic context recorded.";
                const prompt = `
                Analyze the project state and generate both:
                1. A strategic 7-day roadmap.
                2. An updated "Project Brain" summary (Long-term memory).
                
                Project: ${pod.name}
                Description: ${pod.description}
                ${brainContext}
                
                Team Members:
                ${pod.members.map(m => `- ${m.user.name} (ID: ${m.userId}, Role: ${m.role})`).join('\n')}
                
                Recent Activity:
                ${activityContext || 'No activity.'}
                
                Current Tasks:
                ${pod.tasks.length > 0 ? pod.tasks.map(t => `${t.title} (${t.status})`).join(', ') : 'None'}
                
                Return ONLY a JSON object:
                {
                  "stage": "...",
                  "roadmap": [...],
                  "projectBrain": {
                    "summary": "...",
                    "decisions": ["...", "..."],
                    "milestones": ["...", "..."],
                    "techStackAdjustments": "..."
                  },
                  "confidence": 0.95,
                  "duration": "7 Days",
                  "efficiency": "+18%"
                }
                `;

                const geminiRes = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
                    { contents: [{ parts: [{ text: prompt }] }] }
                );

                if (geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    const text = geminiRes.data.candidates[0].content.parts[0].text;
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const data = JSON.parse(jsonMatch[0]);
                        roadmap = data.roadmap;
                        confidence = data.confidence;
                        duration = data.duration;
                        efficiency = data.efficiency;
                        stage = data.stage;

                        if (data.projectBrain) {
                            await prisma.pod.update({
                                where: { id: podId },
                                data: { projectBrain: data.projectBrain }
                            });
                            pod.projectBrain = data.projectBrain;
                        }
                    }
                }
            } catch (e) { console.error("Gemini Roadmap Error:", e.message); }
        }

        if (!roadmap) {
            roadmap = [{ id: 1, title: 'Strategic Start', description: 'Initial setup.', status: 'IN PROGRESS', tasks: [] }];
        }

        const teamAllocation = calculateTeamAllocation(pod.members, pod.name, pod.description);
        const result = { stage, roadmap, confidence, duration, efficiency, meta: { memberCount: pod.members.length, lastUpdated: new Date() } };

        await prisma.pod.update({
            where: { id: podId },
            data: { aiRoadmap: result, roadmapUpdatedAt: new Date() }
        });

        return res.status(200).json({ ...result, members: teamAllocation, projectBrain: pod.projectBrain || null });

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
