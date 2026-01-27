
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findAndMerge(criteria, value) {
    if (!value) return;

    const users = await prisma.user.findMany({
        where: { [criteria]: value },
        include: {
            _count: {
                select: {
                    pods: true,
                    tasks: true,
                    rewards: true,
                    activities: true
                }
            }
        }
    });

    if (users.length <= 1) return;

    console.log(`\nFound ${users.length} duplicate accounts for ${criteria}: ${value}`);

    // Sort users: 1. GitHub Linked, 2. Highest activity
    users.sort((a, b) => {
        if (a.githubId && !b.githubId) return -1;
        if (!a.githubId && b.githubId) return 1;
        const scoreA = a._count.pods + a._count.tasks + a._count.activities;
        const scoreB = b._count.pods + b._count.tasks + b._count.activities;
        return scoreB - scoreA;
    });

    const primary = users[0];
    const secondaries = users.slice(1);

    console.log(`  Merging into Primary: ${primary.id} (${primary.email || 'No email'})`);

    for (const secondary of secondaries) {
        console.log(`  Processing secondary: ${secondary.id}...`);

        // 1. PodMember
        const pods = await prisma.podMember.findMany({ where: { userId: secondary.id } });
        for (const pod of pods) {
            try {
                await prisma.podMember.update({
                    where: { id: pod.id },
                    data: { userId: primary.id }
                });
            } catch (e) {
                await prisma.podMember.delete({ where: { id: pod.id } });
            }
        }

        // 2. Relations
        await prisma.task.updateMany({ where: { assignedTo: secondary.id }, data: { assignedTo: primary.id } });
        await prisma.activity.updateMany({ where: { userId: secondary.id }, data: { userId: primary.id } });
        await prisma.reward.updateMany({ where: { userId: secondary.id }, data: { userId: primary.id } });

        // 3. GitHub Fields
        const ghData = {};
        if (!primary.githubId && secondary.githubId) ghData.githubId = secondary.githubId;
        if (!primary.githubUsername && secondary.githubUsername) ghData.githubUsername = secondary.githubUsername;
        if (!primary.githubToken && secondary.githubToken) ghData.githubToken = secondary.githubToken;
        if (!primary.email && secondary.email) ghData.email = secondary.email;
        if (!primary.password && secondary.password) ghData.password = secondary.password;

        await prisma.user.update({
            where: { id: primary.id },
            data: {
                techStack: [...new Set([...(primary.techStack || []), ...(secondary.techStack || [])])],
                ...ghData
            }
        });

        await prisma.user.delete({ where: { id: secondary.id } });
        console.log(`  Deleted secondary ${secondary.id}.`);
    }
}

async function runMerge() {
    console.log('--- Merge Script Initialization ---');

    const allUsers = await prisma.user.findMany({
        select: { email: true, githubId: true }
    });

    const uniqueEmails = [...new Set(allUsers.map(u => u.email).filter(Boolean))];
    const uniqueGithubs = [...new Set(allUsers.map(u => u.githubId).filter(Boolean))];

    console.log(`Scanning ${uniqueEmails.length} emails and ${uniqueGithubs.length} GitHub IDs...`);

    for (const email of uniqueEmails) await findAndMerge('email', email);
    for (const gid of uniqueGithubs) await findAndMerge('githubId', gid);

    console.log('\n--- Final Merge Check Complete ---');
}

runMerge()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
