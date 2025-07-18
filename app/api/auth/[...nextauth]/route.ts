// app/api/auth/[...nextauth]/route.ts

// This line is the crucial fix.
// It forces this route to run on the Node.js runtime, which is required
// by our database library (postgres.js).
export const runtime = 'nodejs';

// This line imports the pre-configured GET and POST handlers from our
// main auth configuration file and exports them as API endpoints.
export { GET, POST } from '@/lib/auth';