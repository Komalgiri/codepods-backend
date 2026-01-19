// Test database connection script
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

async function testConnection() {
  try {
    console.log("🔍 Testing database connection...");
    console.log("📝 DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Not set");
    
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL is not set in .env file");
      process.exit(1);
    }

    // Mask password in connection string for display
    const maskedUrl = process.env.DATABASE_URL.replace(
      /:([^:@]+)@/,
      ":****@"
    );
    console.log("🔗 Connection string:", maskedUrl);

    // Test connection
    await prisma.$connect();
    console.log("✅ Successfully connected to database!");

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database is accessible. User count: ${userCount}`);

    await prisma.$disconnect();
    console.log("✅ Connection closed successfully");
  } catch (error) {
    console.error("❌ Database connection failed!");
    console.error("Error:", error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.error("\n💡 Troubleshooting tips:");
      console.error("1. Check if the database server is running in Aiven dashboard");
      console.error("2. Verify the host and port are correct");
      console.error("3. Check if your IP is whitelisted in Aiven");
      console.error("4. Ensure SSL mode is set correctly (sslmode=require)");
      console.error("5. Check network/firewall settings");
    } else if (error.message.includes("authentication failed")) {
      console.error("\n💡 Authentication failed:");
      console.error("1. Check username and password in DATABASE_URL");
      console.error("2. Verify credentials in Aiven dashboard");
    } else if (error.message.includes("does not exist")) {
      console.error("\n💡 Database does not exist:");
      console.error("1. Check database name in connection string");
      console.error("2. Create the database if it doesn't exist");
    }

    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

testConnection();

