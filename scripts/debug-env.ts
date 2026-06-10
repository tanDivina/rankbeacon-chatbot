import * as dotenv from 'dotenv';
const result = dotenv.config({ path: '.env.local' });
console.log("Dotenv result error:", result.error);
console.log("Dotenv parsed keys:", result.parsed ? Object.keys(result.parsed) : "none");
console.log("process.env.DATABASE_URL:", process.env.DATABASE_URL ? "defined" : "undefined");
console.log("process.env.POSTGRES_URL:", process.env.POSTGRES_URL ? "defined" : "undefined");
