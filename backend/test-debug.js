
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient({
    log: ["query", "error", "warn"],
});

async function debugPrisma() {
    try {
        console.log("🔍 Starting debug script...");

        // 1. Fetch a user
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log("No users found.");
            return;
        }
        console.log("User:", user.id);

        // 2. Fetch a pod
        const pod = await prisma.pod.findFirst();
        if (!pod) {
            console.log("No pods found.");
            return;
        }
        console.log("Pod:", pod.id);

        // 3. Try to find membership using the compound unique key
        console.log(`Trying findUnique for podMember with user ${user.id} and pod ${pod.id}...`);

        // We don't know if this user is in this pod, but we want to test if the QUERY throws logic error
        const membership = await prisma.podMember.findUnique({
            where: {
                userId_podId: {
                    userId: user.id,
                    podId: pod.id,
                },
            },
        });

        console.log("Membership result:", membership);
        console.log("✅ Query executed successfully (found or null)");

    } catch (error) {
        console.error("❌ Error encountered:");
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

debugPrisma();
