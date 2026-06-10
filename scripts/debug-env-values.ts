import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log("process.env.POSTGRES_URL:", process.env.POSTGRES_URL ? "(present)" : "undefined");
console.log("process.env.DATABASE_URL:", process.env.DATABASE_URL ? "(present)" : "undefined");
console.log("postgres URL raw:", process.env.POSTGRES_URL);
