import prisma from "../utils/prismaClient.js";

/**
 * Generate a strategic roadmap for a pod
 * GET /api/ai/pods/:id/plan
 */
export const getPodRoadmap = async (req, res) => {
    try {
        const { id: podId } = req.params;
        const userId = req.user.id;

        // Check membership
        const membership = await prisma.podMember.findUnique({
            where: { userId_podId: { userId, podId } },
        });

        if (!membership) {
            return res.status(403).json({ error: "You are not a member of this pod" });
        }

        const pod = await prisma.pod.findUnique({
            where: { id: podId },
            include: { tasks: true }
        });

        // Simulate AI thinking time if needed, but for now just return "smart" mock data
        // derived from pod name and description

        const roadmap = [
            {
                id: 1,
                title: 'Project Inception & Core Architecture',
                description: `Analyzing ${pod.name} requirements...`,
                status: pod.tasks.length > 0 ? 'COMPLETED' : 'IN PROGRESS',
                tasks: [
                    { name: 'Initial Schema Design', status: 'done' },
                    { name: 'Environment Setup', status: 'done' }
                ]
            },
            {
                id: 2,
                title: 'Feature Development Sprint',
                description: pod.description || 'Implementing core primitives and business logic.',
                status: 'IN PROGRESS',
                tasks: [
                    { name: 'Core Controller Logic', status: 'progress', progress: 45 },
                    { name: 'Third-party Integrations', status: 'pending' }
                ]
            },
            {
                id: 3,
                title: 'Quality Assurance & Scaling',
                description: 'Load testing and security auditing before production release.',
                status: 'UPCOMING',
                tasks: []
            }
        ];

        return res.status(200).json({
            roadmap,
            confidence: 0.94,
            duration: "4 Weeks",
            efficiency: "+12%"
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

        // In a real scenario, this would use an LLM with the prompt:
        // "Given this project description and existing tasks, what are the next 3 logical tasks?"

        const suggestedTasks = [
            {
                title: "Implement Unit Tests for Auth",
                description: "Ensure that the JWT validation logic is bulletproof with 90%+ coverage.",
                priority: "high"
            },
            {
                title: "Setup CI/CD Pipeline",
                description: "Automate builds and deployments using GitHub Actions.",
                priority: "medium"
            },
            {
                title: "Dynamic Dashboard Scaling",
                description: "Optimize the frontend to handle 100+ active pods without performance degradation.",
                priority: "medium"
            }
        ];

        return res.status(200).json({ suggestions: suggestedTasks });
    } catch (error) {
        console.error("AI Suggestion Error:", error);
        res.status(500).json({ error: "Failed to suggest tasks" });
    }
};

/**
 * Chat with AI Consultant
 * POST /api/ai/pods/:id/chat
 */
export const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        // Mocking an AI response
        let responseText = "I see. I've analyzed your project roadmap. Adding a testing sprint is a wise decision. I recommend scheduling it right after the 'Core API Services' stage to ensure stability before frontend integration.";

        if (message.toLowerCase().includes("database") || message.toLowerCase().includes("schema")) {
            responseText = "Your current PostgreSQL schema looks normalized, but for high-scale telemetry data, we might want to consider a TimescaleDB extension or partitioning by 'pod_id'.";
        }

        return res.status(200).json({
            reply: responseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ error: "Chat system unavailable" });
    }
};
