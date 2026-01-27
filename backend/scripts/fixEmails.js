
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const finalEmails = {
    "cmkwf81wf0000uab4j5b20dee": "tanu@creditoracademy.com",
    "cmkwfbihp0001tfw0stt7kvfs": "prerna@creditoracademy.com",
    "cmkwgunr90009vqiwjvger54e": "ankit@creditoracademy.com",
    "cmkwgzjg5000bvqiwqbr7p5cl": "sahil.sinha@lmsathena.com",
    "cmkl0d8oy0000vqi0bugieh8i": "komal.giri@lmsathena.com"
};

async function fixFinalEmails() {
    for (const [userId, email] of Object.entries(finalEmails)) {
        console.log(`Setting email ${email} for user ${userId}...`);
        try {
            await prisma.user.update({
                where: { id: userId },
                data: { email }
            });
            console.log(`  Success.`);
        } catch (e) {
            console.log(`  Failed: ${e.message}`);
        }
    }
}

fixFinalEmails().finally(() => prisma.$disconnect());
