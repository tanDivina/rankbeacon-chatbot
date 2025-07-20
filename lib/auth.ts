// lib/auth.ts

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';
import { user, type UserTypeEnum } from '@/lib/db/schema';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: DrizzleAdapter(db),
  
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch the full user data including type from database
        const fullUser = await db.query.user.findFirst({
          where: (users, { eq }) => eq(users.id, user.id),
        });
        if (fullUser) {
          session.user.type = fullUser.type;
        }
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  // Add cookie configuration to prevent PKCE issues
  cookies: {
    pkceCodeVerifier: {
      name: 'authjs.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  
  // Add session configuration
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

// Export UserType from schema
export type UserType = UserTypeEnum;
