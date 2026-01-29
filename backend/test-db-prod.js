
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: 'd:/codepods-backend/backend/.env' });

const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log('Testing connection to:', process.env.DATABASE_URL.split('@')[1]); // Don't log credentials
        const users = await prisma.user.findMany({ take: 1 });
        console.log('User query successful. Current users count >=', users.length);

        // Check if new columns exist
        const user = await prisma.user.findFirst();
        if (user) {
            console.log('Columns check:');
            console.log('- techStack:', user.techStack !== undefined ? 'EXISTS' : 'MISSING');
            console.log('- inferredRole:', user.inferredRole !== undefined ? 'EXISTS' : 'MISSING');
        } else {
            console.log('No users in DB to check columns.');
        }
    } catch (error) {
        console.error('DATABASE ERROR:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
