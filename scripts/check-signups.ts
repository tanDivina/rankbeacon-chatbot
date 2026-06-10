import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkSignups() {
  console.log("Environment variables loaded. POSTGRES_URL is present:", !!process.env.POSTGRES_URL);
  
  // Dynamic import so it is executed AFTER dotenv.config()
  const { db } = await import('../lib/db');
  const { user, profile, chat } = await import('../lib/db/schema');
  const { sql } = await import('drizzle-orm');

  console.log("Connecting to database...");
  try {
    const usersCount = await db.select({ count: sql`count(*)` }).from(user);
    const profilesCount = await db.select({ count: sql`count(*)` }).from(profile);
    const chatsCount = await db.select({ count: sql`count(*)` }).from(chat);
    
    console.log(`\n--- DATABASE STATISTICS ---`);
    console.log(`Total Users: ${usersCount[0]?.count || 0}`);
    console.log(`Total Profiles: ${profilesCount[0]?.count || 0}`);
    console.log(`Total Chats: ${chatsCount[0]?.count || 0}`);

    if (Number(usersCount[0]?.count) > 0) {
      console.log(`\n--- RECENT USERS ---`);
      // Select only id, name, and email to avoid missing column errors
      const recentUsers = await db.select({
        id: user.id,
        name: user.name,
        email: user.email,
      }).from(user).limit(10);
      for (const u of recentUsers) {
        console.log(`- Name: ${u.name || 'Anonymous'}, Email: ${u.email}`);
      }
    } else {
      console.log("\nNo users found in database.");
    }
  } catch (err) {
    console.error("Error querying database:", err);
  }
  process.exit(0);
}

checkSignups();
