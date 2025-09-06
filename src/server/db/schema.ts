import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import {
  foreignKey,
  index,
  mysqlTable,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm/relations";
import type { AdapterAccount } from "next-auth/adapters";

export const posts = mysqlTable(
  "post",
  (d) => ({
    id: d.varchar({ length: 255 }).primaryKey().$defaultFn(createId),
    content: d.text(),
    authorId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp()
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp().onUpdateNow(),
  }),
  (t) => [index("author_idx").on(t.authorId)],
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  tagsToPosts: many(tagsToPosts),
  replies: many(replies),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

export const replies = mysqlTable(
  "reply",
  (d) => ({
    id: d.varchar({ length: 255 }).primaryKey().$defaultFn(createId),
    content: d.text(),
    authorId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    postId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => posts.id),
    parentId: d.varchar({ length: 255 }),
    createdAt: d
      .timestamp()
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp().onUpdateNow(),
  }),
  (t) => [
    foreignKey({
      columns: [t.parentId],
      foreignColumns: [t.id],
    }),
    index("author_idx").on(t.authorId),
  ],
);

export const repliesRelations = relations(replies, ({ one }) => ({
  post: one(posts, {
    fields: [replies.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [replies.authorId],
    references: [users.id],
  }),
}));

export const tags = mysqlTable(
  "tag",
  (d) => ({
    id: d.varchar({ length: 255 }).primaryKey().$defaultFn(createId),
    name: d.varchar({ length: 255 }).notNull().unique(),
    parentId: d.varchar({ length: 255 }),
  }),
  (t) => [
    foreignKey({
      columns: [t.parentId],
      foreignColumns: [t.id],
    }),
  ],
);

export const tagsRelations = relations(tags, ({ many }) => ({
  tagsToPosts: many(tagsToPosts),
  subscribers: many(usersToTags),
}));

export const tagsToPosts = mysqlTable(
  "tags_to_posts",
  (d) => ({
    tagId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => tags.id),
    postId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => posts.id),
  }),
  (t) => [primaryKey({ columns: [t.tagId, t.postId] })],
);

export const tagsToPostsRelations = relations(tagsToPosts, ({ one }) => ({
  tag: one(tags, {
    fields: [tagsToPosts.tagId],
    references: [tags.id],
  }),
  post: one(posts, {
    fields: [tagsToPosts.postId],
    references: [posts.id],
  }),
}));

export const users = mysqlTable("user", (d) => ({
  id: d.varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  email: d.varchar({ length: 255 }).notNull().unique(),
  name: d.varchar({ length: 255 }).notNull(),
  displayName: d.varchar({ length: 255 }),
  createdAt: d
    .timestamp()
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp().onUpdateNow(),
  // Required for Auth.js
  emailVerified: d
    .timestamp({
      mode: "date",
      fsp: 3,
    })
    .default(sql`CURRENT_TIMESTAMP(3)`),
  // Required for Auth.js
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  replies: many(replies),
  subscriptions: many(usersToTags),
  accounts: many(accounts), // Required for Auth.js
  sessions: many(sessions), // Required for Auth.js
}));

export const usersToTags = mysqlTable(
  "usersToTags",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    tagId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => tags.id),
  }),
  (t) => [primaryKey({ columns: [t.userId, t.tagId] })],
);

export const usersToTagsRelations = relations(usersToTags, ({ one }) => ({
  user: one(users, {
    fields: [usersToTags.userId],
    references: [users.id],
  }),
  tag: one(tags, {
    fields: [usersToTags.tagId],
    references: [tags.id],
  }),
}));

/**
 * Everything below this point is required for Auth.js to work. Avoid changes unless absolutely necessary!
 */

export const accounts = mysqlTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.int(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({
      columns: [t.provider, t.providerAccountId],
    }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date" }).notNull(),
  }),
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mysqlTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date" }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);
