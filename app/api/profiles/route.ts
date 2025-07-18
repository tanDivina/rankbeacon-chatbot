// app/api/profiles/route.ts

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { profile as profileTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// This is the crucial fix. It forces this route to run on the Node.js runtime,
// which is required by our database library.
export const runtime = 'nodejs';


/**
 * GET /api/profiles
 * Fetches all profiles for the currently authenticated user.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const profiles = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.userId, session.user.id))
      .orderBy(profileTable.isDefault, profileTable.createdAt); // Show default first

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Failed to fetch profiles:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


/**
 * POST /api/profiles
 * Creates a new content profile for the currently authenticated user based on intake answers.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { answers, profileName } = body;

    if (!answers || !profileName) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Check if this is the user's first profile to set it as default
    const profileCount = await db
      .select({ id: profileTable.id })
      .from(profileTable)
      .where(eq(profileTable.userId, session.user.id))
      .limit(1);

    const isFirstProfile = profileCount.length === 0;

    // Insert the new profile into the database
    const [newProfile] = await db
      .insert(profileTable)
      .values({
        userId: session.user.id,
        name: profileName,
        isDefault: isFirstProfile,
        projectType: answers.projectType,
        niche: answers.niche,
        targetAudience: answers.targetAudience,
        contentTypes: answers.contentTypes,
        primaryGoal: answers.primaryGoal,
        brandVoice: answers.brandVoice,
        language: answers.language,
        // The createdAt and updatedAt fields will use their default values
      })
      .returning();

    return NextResponse.json({ profile: newProfile });
  } catch (error) {
    console.error('Profile creation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}