
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listUsers() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            githubUsername: true,
            githubId: true,
            _count: {
                select: {
                    pods: true,
                    tasks: true
                }
            }
        }
    });
    console.log(JSON.stringify(users, null, 2));
}

listUsers().finally(() => prisma.$disconnect());
