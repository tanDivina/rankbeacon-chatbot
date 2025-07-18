// app/intake/page.tsx

import { IntakeChat } from '@/components/intake-chat';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function IntakePage() {
  const session = await auth();

  // Protect this page - only logged-in users can see it
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <main className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-2xl">
        <h1 className="mb-4 text-center text-2xl font-bold tracking-tight">
          Let's Set Up Your Content Profile
        </h1>
        <div className="h-[70vh] rounded-lg border bg-white shadow-lg dark:bg-black dark:border-gray-800">
          <IntakeChat />
        </div>
      </div>
    </main>
  );
}