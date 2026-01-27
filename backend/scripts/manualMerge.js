
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const mergeMap = {
    // Tanu Shri
    "cmkp8lxoi0003vq7ghcvvea4g": "cmkwf81wf0000uab4j5b20dee",
    "cmkwf3szl0000uafs3wd28pke": "cmkwf81wf0000uab4j5b20dee",

    // Prerna
    "cmkwfax650000tfw08x6im30w": "cmkwfbihp0001tfw0stt7kvfs",

    // Ankit
    "cmkwgmw710004vqiwb70pdlqq": "cmkwgunr90009vqiwjvger54e",
    "cmkwgp0q70005vqiwqy1ivyj4": "cmkwgunr90009vqiwjvger54e",

    // Sahil
    "cmkwgxk9b000avqiwypt15as1": "cmkwgzjg5000bvqiwqbr7p5cl",

    // Komal
    "cmkpayh5d0000vqvkgpljnf6w": "cmkl0d8oy0000vqi0bugieh8i",
    "cmhedccgw0000vqbgogubcmps": "cmkl0d8oy0000vqi0bugieh8i"
};

async function mergeSpecifiUsers() {
    for (const [sourceId, targetId] of Object.entries(mergeMap)) {
        console.log(`\n--- Merging ${sourceId} into ${targetId} ---`);

        // Skip if target is already deleted or source doesn't exist
        const sourceUser = await prisma.user.findUnique({ where: { id: sourceId } });
        if (!sourceUser) {
            console.log(`  Source ${sourceId} not found.`);
            continue;
        }

        const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
        if (!targetUser) {
            console.log(`  Target ${targetId} not found.`);
            continue;
        }

        // Move PodMembers
        const pods = await prisma.podMember.findMany({ where: { userId: sourceId } });
        for (const pm of pods) {
            try {
                await prisma.podMember.update({ where: { id: pm.id }, data: { userId: targetId } });
            } catch (e) {
                console.log(`  Duplicate pod member ${pm.podId}, deleting.`);
                await prisma.podMember.delete({ where: { id: pm.id } });
            }
        }

        // Move Tasks/Activities/Rewards
        await prisma.task.updateMany({ where: { assignedTo: sourceId }, data: { assignedTo: targetId } });
        await prisma.activity.updateMany({ where: { userId: sourceId }, data: { userId: targetId } });
        await prisma.reward.updateMany({ where: { userId: sourceId }, data: { userId: targetId } });

        // Update target info if empty
        const updateData = {};
        if (!targetUser.email && sourceUser.email) {
            // Double check if email is taken
            const existingWithEmail = await prisma.user.findUnique({ where: { email: sourceUser.email } });
            if (!existingWithEmail || existingWithEmail.id === targetId) {
                updateData.email = sourceUser.email;
            } else {
                console.log(`  Email ${sourceUser.email} already exists on ${existingWithEmail.id}. Skipping email update.`);
            }
        }
        if (!targetUser.password && sourceUser.password) updateData.password = sourceUser.password;
        if (!targetUser.name && sourceUser.name) updateData.name = sourceUser.name;

        if (Object.keys(updateData).length > 0) {
            await prisma.user.update({ where: { id: targetId }, data: updateData });
        }

        // DELETE SOURCE
        await prisma.user.delete({ where: { id: sourceId } });
        console.log(`  Successfully merged and deleted ${sourceId}.`);
    }
}

mergeSpecifiUsers()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
