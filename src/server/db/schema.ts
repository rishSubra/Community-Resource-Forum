import { createId } from "@paralleldrive/cuid2";
import { SQL, sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  type AnyMySqlColumn,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm/relations";

export const events = mysqlTable("event", (d) => ({
  id: d.varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  organizerId: d.varchar({ length: 255 }).references(() => profiles.id),
  title: d.varchar({ length: 255 }).notNull(),
  start: d.datetime().notNull(),
  end: d.datetime().notNull(),
  allDay: d.boolean().notNull(),
  // TODO: add recurrence rules!
  location: d.varchar({ length: 255 }),
}));

export const posts = mysqlTable(
  "post",
  (d) => ({
    id: d.varchar({ length: 255 }).primaryKey().$defaultFn(createId),
    content: d.text(),
    authorId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => profiles.id),
    eventId: d.varchar({ length: 255 }).references(() => events.id),
    createdAt: d.timestamp().defaultNow().notNull(),
    updatedAt: d.timestamp().onUpdateNow(),
  }),
  (t) => [index("author_idx").on(t.authorId)],
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  tagsToPosts: many(tagsToPosts),
  replies: many(replies),
  author: one(profiles, {
    fields: [posts.authorId],
    references: [profiles.id],
  }),
  event: one(events, {
    fields: [posts.eventId],
    references: [events.id],
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
      .references(() => profiles.id),
    postId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => posts.id),
    parentId: d.varchar({ length: 255 }),
    createdAt: d.timestamp().defaultNow().notNull(),
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
  author: one(profiles, {
    fields: [replies.authorId],
    references: [profiles.id],
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

export const profiles = mysqlTable("profile", (d) => ({
  id: d.varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  name: d.varchar({ length: 255 }).notNull(),
  type: d.mysqlEnum(["user", "organization"]).notNull(),
  displayName: d.varchar({ length: 255 }),
  image: d.varchar({ length: 255 }),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  posts: many(posts),
  replies: many(replies),
  events: many(events),
}));

export function lower(email: AnyMySqlColumn): SQL {
  return sql`(lower(${email}))`;
}

export const users = mysqlTable(
  "user",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .primaryKey()
      .references(() => profiles.id),
    email: varchar("email", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  }),
  (t) => [uniqueIndex("email_idx").on(lower(t.email))],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.id],
  }),
  subscriptions: many(usersToTags),
  organizations: many(organizations),
  sessions: many(sessions),
}));

export const usersToTags = mysqlTable(
  "users_to_tags",
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

export const organizations = mysqlTable(
  "organizations",
  (d) => ({
    organizationId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => profiles.id),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    role: d.mysqlEnum(["member", "officer", "owner"]),
  }),
  (t) => [
    primaryKey({ columns: [t.organizationId, t.userId] }),
    check("profile_is_organization", sql`${t.organizationId} = 'organization'`),
  ],
);

export const organizationsRelations = relations(organizations, ({ one }) => ({
  organization: one(profiles, {
    fields: [organizations.organizationId],
    references: [profiles.id],
  }),
  user: one(users, {
    fields: [organizations.userId],
    references: [users.id],
  }),
}));

export const sessions = mysqlTable("session", (d) => ({
  createdAt: d.timestamp().defaultNow().notNull(),
  userAgent: d.text(),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: d
    .varchar({ length: 255 })
    .primaryKey()
    .$defaultFn(() =>
      Buffer.from(crypto.getRandomValues(new Uint8Array(128))).toString(
        "base64",
      ),
    ),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
