// lib/db/schema.ts

import type { AdapterAccount } from 'next-auth/adapters';
import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  primaryKey,
  integer,
} from 'drizzle-orm/pg-core';

// --- THIS IS THE CORRECTED USER TABLE DEFINITION ---
export const user = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull(),
  // emailVerified is now correctly placed inside the object
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
});

// --- Our Custom Profile Table ---
export const profile = pgTable('profile', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  isDefault: boolean('isDefault').notNull().default(false),
  projectType: varchar('projectType', { length: 255 }).notNull(),
  niche: varchar('niche', { length: 255 }).notNull(),
  targetAudience: text('targetAudience').notNull(),
  contentTypes: varchar('contentTypes', { length: 255 }).notNull(),
  primaryGoal: varchar('primaryGoal', { length: 255 }).notNull(),
  brandVoice: varchar('brandVoice', { length: 255 }).notNull(),
  language: varchar('language', { length: 50 }).notNull().default('English'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// --- NextAuth.js Required Tables ---
export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);