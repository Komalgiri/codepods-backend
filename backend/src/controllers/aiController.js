import axios from "axios";
import prisma from "../utils/prismaClient.js";

/**
 * Helper: Calculate team allocation with AI match percentages
 * TODO: Replace random match % with real skill-based calculation
 */
const calculateTeamAllocation = (members) => {
    return members.map((member, idx) => ({
        id: member.userId,
        name: member.user.name,
        role: idx === 0 ? 'Lead Engineer' : idx === 1 ? 'Product Manager' : 'Developer',
        match: 85 + Math.floor(Math.random() * 14) // TODO: Calculate based on GitHub activity
    }));
};

/**
 * Generate a strategic roadmap for a pod using Gemini AI
 * GET /api/ai/pods/:id/plan
 */
export const getPodRoadmap = async (req, res) => {
    try {
        const { id: podId } = req.params;
        const userId = req.user.id;

        const apiKey = process.env.GEMINI_API_KEY;

        const pod = await prisma.pod.findUnique({
            where: { id: podId },
            include: {
                tasks: { orderBy: { createdAt: 'desc' }, take: 10 },
                activities: { orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { name: true } } } },
                members: { include: { user: { select: { id: true, name: true, githubUsername: true } } } }
            }
        });

        if (!pod) return res.status(404).json({ error: "Pod not found" });

        // Check cache: 7 Day Expiry
        const CACHE_STALE_TIME = 7 * 24 * 60 * 60 * 1000;
        const now = new Date();
        const isCacheValid = pod.aiRoadmap && pod.roadmapUpdatedAt && (now - new Date(pod.roadmapUpdatedAt) < CACHE_STALE_TIME);

        if (isCacheValid) {
            console.log(`[AI] Returning cached roadmap for pod ${podId}`);
            const cachedData = typeof pod.aiRoadmap === 'string' ? JSON.parse(pod.aiRoadmap) : pod.aiRoadmap;

            // Re-calculate team allocation to be dynamic even if roadmap is cached
            const teamAllocation = calculateTeamAllocation(pod.members);

            return res.status(200).json({
                ...cachedData,
                members: teamAllocation
            });
        }

        console.log(`[AI] Cache miss or stale for pod ${podId}, generating new roadmap...`);

        // Prepare context for AI
        const teamContext = pod.members.map((m, i) => `${m.user.name} (Role: ${m.role || (i === 0 ? 'Lead' : 'Member')})`).join(', ');
        const activityContext = pod.activities.map(a => `${a.user.name} did ${a.type} ${a.meta?.repoName ? `in ${a.meta.repoName}` : ''} at ${a.createdAt}`).join('\n');

        let roadmap;
        let confidence = 0.92;
        let duration = "7 Days";
        let efficiency = "+15%";
        let stage = "Inception";

        if (apiKey) {
            try {
                const prompt = `
                Analyze the project state and generate a strategic 7-day roadmap.
                
                Project: ${pod.name}
                Description: ${pod.description}
                
                Team Members (Assign tasks using their ID):
                ${pod.members.map(m => `- ${m.user.name} (ID: ${m.userId}, Role: ${m.role})`).join('\n')}
                
                Recent Repository Activity:
                ${activityContext || 'No recent activity recorded.'}
                
                Current Tasks:
                ${pod.tasks.length > 0 ? pod.tasks.map(t => `${t.title} (${t.status})`).join(', ') : 'No manual tasks yet'}
                
                Your Task:
                1. Infer the current project stage from the activity.
                2. Generate a 3-phase roadmap for the NEXT 7 DAYS.
                3. For each task in the roadmap, ASSIGN it to a specific team member using their ID from the list above.
                
                Return ONLY a JSON object:
                {
                  "stage": "Project Stage Name",
                  "roadmap": [
                    { 
                      "id": 1, 
                      "title": "Phase Title", 
                      "description": "Desc", 
                      "status": "UPCOMING", 
                      "tasks": [
                        { "name": "Task Name", "status": "pending", "assigneeId": "User-ID-Here", "assignee": "Member Name", "progress": 0 }
                      ] 
                    }
                  ],
                  "confidence": 0.95,
                  "duration": "7 Days",
                  "efficiency": "+18%"
                }
                `;

                const geminiRes = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
                    {
                        contents: [{ parts: [{ text: prompt }] }]
                    }
                );

                if (geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    const text = geminiRes.data.candidates[0].content.parts[0].text;
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        try {
                            const data = JSON.parse(jsonMatch[0]);
                            roadmap = data.roadmap;
                            confidence = data.confidence;
                            duration = data.duration;
                            efficiency = data.efficiency;
                            stage = data.stage || "Development";
                        } catch (parseError) {
                            console.error("JSON Parse Error in Roadmap:", parseError);
                        }
                    }
                }
            } catch (aiError) {
                console.error("Gemini API Error (Roadmap):", aiError.response?.data || aiError.message);
                // Fallback to mock logic below if API fails
            }
        }

        // If AI failed or no API key, use enhanced mock logic
        if (!roadmap) {
            const hasAuth = pod.tasks.some(t => t.title.toLowerCase().includes('auth') && t.status === 'done');
            roadmap = [
                {
                    id: 1,
                    title: 'Strategic Foundation (Days 1-2)',
                    description: `Core architecture setup for ${pod.name}.`,
                    status: hasAuth ? 'COMPLETED' : 'IN PROGRESS',
                    tasks: [
                        { name: 'Architecture Review', status: hasAuth ? 'done' : 'progress', progress: 80, assignee: pod.members[0]?.user.name || "Lead", assigneeId: pod.members[0]?.userId },
                        { name: 'Schema Finalization', status: 'done', assignee: pod.members[1]?.user.name || pod.members[0]?.user.name, assigneeId: pod.members[1]?.userId || pod.members[0]?.userId }
                    ]
                },
                {
                    id: 2,
                    title: 'Weekly Feature Sprint (Days 3-5)',
                    description: 'Accelerated development of primary user stories.',
                    status: 'IN PROGRESS',
                    tasks: [
                        { name: 'API Implementation', status: 'progress', progress: 40, assignee: pod.members[0]?.user.name || "Lead", assigneeId: pod.members[0]?.userId },
                        { name: 'Frontend Skeleton', status: 'pending', assignee: pod.members[1]?.user.name || pod.members[0]?.user.name, assigneeId: pod.members[1]?.userId || pod.members[0]?.userId }
                    ]
                },
                {
                    id: 3,
                    title: 'Deployment Prep (Days 6-7)',
                    description: 'Testing and staging environment provisioning.',
                    status: 'UPCOMING',
                    tasks: []
                }
            ];
        }

        const teamAllocation = calculateTeamAllocation(pod.members);

        const result = {
            stage,
            roadmap,
            confidence,
            duration,
            efficiency
        };

        // Cache the result in DB
        try {
            await prisma.pod.update({
                where: { id: podId },
                data: {
                    aiRoadmap: result,
                    roadmapUpdatedAt: new Date()
                }
            });
        } catch (dbError) {
            console.error("[AI] Failed to cache roadmap in DB:", dbError.message);
        }

        return res.status(200).json({
            ...result,
            members: teamAllocation
        });

    } catch (error) {
        console.error("AI Plan Error:", error);
        res.status(500).json({ error: "Failed to generate AI plan" });
    }
};

/**
 * Suggest new tasks based on current pod state
 * POST /api/ai/pods/:id/suggest-tasks
 */
export const suggestTasks = async (req, res) => {
    try {
        const { id: podId } = req.params;
        const apiKey = process.env.GEMINI_API_KEY;

        const pod = await prisma.pod.findUnique({
            where: { id: podId },
            include: {
                tasks: { take: 10, orderBy: { createdAt: 'desc' } },
                members: { include: { user: { select: { name: true } } } }
            }
        });

        if (!pod) return res.status(404).json({ error: "Pod not found" });

        let suggestedTasks = [
            { title: "Implement Unit Tests for Auth", description: "Bulletproof JWT validation.", priority: "high", assigneeId: pod.members[0]?.userId },
            { title: "Setup CI/CD Pipeline", description: "Automate builds.", priority: "medium", assigneeId: pod.members[0]?.userId },
            { title: "Dynamic Dashboard Scaling", description: "Optimize frontend.", priority: "medium", assigneeId: pod.members[1]?.userId || pod.members[0]?.userId }
        ];

        if (apiKey) {
            try {
                const prompt = `
                Based on the project "${pod.name}" (${pod.description}) and recent tasks [${pod.tasks.map(t => t.title).join(', ')}], 
                suggest 3 high-impact next tasks.
                
                Team Members (Assign tasks using their ID):
                ${pod.members.map(m => `- ${m.user.name} (ID: ${m.userId})`).join('\n')}
                
                Return ONLY a JSON array of objects:
                [{ "title": "...", "description": "...", "priority": "high|medium|low", "assigneeId": "User-ID-Here" }]
                `;

                const geminiRes = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
                    { contents: [{ parts: [{ text: prompt }] }] }
                );

                if (geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    const text = geminiRes.data.candidates[0].content.parts[0].text;
                    const jsonMatch = text.match(/\[[\s\S]*\]/);
                    if (jsonMatch) {
                        try {
                            suggestedTasks = JSON.parse(jsonMatch[0]);
                        } catch (parseError) {
                            console.error("JSON Parse Error in Suggestions:", parseError);
                        }
                    }
                }
            } catch (aiError) {
                console.error("Gemini Suggest Error:", aiError.response?.data || aiError.message);
            }
        }

        return res.status(200).json({ suggestions: suggestedTasks });
    } catch (error) {
        console.error("AI Suggestion Error:", error);
        res.status(500).json({ error: "Failed to suggest tasks" });
    }
};

