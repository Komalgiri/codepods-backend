import prisma from "./src/utils/prismaClient.js";

async function checkTasks() {
    const tasks = await prisma.task.findMany({
        include: {
            user: true,
            pod: {
                include: {
                    members: {
                        include: {
                            user: true
                        }
                    }
                }
            }
        }
    });

    console.log("Total Tasks:", tasks.length);
    tasks.forEach(t => {
        console.log(`Task: ${t.title} | Pod: ${t.pod.name} | Assigned To: ${t.user?.name || 'NULL'} (ID: ${t.assignedTo || 'NULL'})`);
        console.log(`Available Members in Pod: ${t.pod.members.map(m => m.user.name).join(', ')}`);
        console.log('---');
    });
}

checkTasks();
