import { auth, signOut } from '@/lib/auth';

export default async function AuthHeader() {
  const session = await auth();

  if (!session) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {session.user?.email}
        </span>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/login' });
          }}
        >
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
