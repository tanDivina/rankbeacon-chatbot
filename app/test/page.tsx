import { auth, signOut } from '@/lib/auth';

export default async function TestPage() {
  const session = await auth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      {session ? (
        <div>
          <p className="mb-4">✅ Logged in as: {session.user?.email}</p>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Sign Out
            </button>
          </form>
        </div>
      ) : (
        <p>❌ Not logged in</p>
      )}
    </div>
  );
}
