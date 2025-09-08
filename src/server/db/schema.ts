import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  varchar,
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
  name: d.varchar({ length: 255 }).default("UGA Student"),
  displayName: d.varchar({ length: 255 }),
  image: d.varchar({ length: 255 }),
  type: d.mysqlEnum(["user", "organization"]),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  posts: many(posts),
  replies: many(replies),
  events: many(events),
}));

/**
 * Everything below this point is carefully configured for better-auth to work. Tread lightly!
 */

export const users = mysqlTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .primaryKey()
    .references(() => profiles.id),
  /**
   * @deprecated
   */
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  /**
   * @deprecated
   */
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.id],
  }),
  subscriptions: many(usersToTags),
  organizations: many(organizations),
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
    organization: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => profiles.id),
    user: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => profiles.id),
    role: d.mysqlEnum(["member", "officer", "owner"]),
  }),
  (t) => [
    primaryKey({ columns: [t.organization, t.user] }),
    check("profile_is_organization", sql`${t.organization} = 'organization'`),
  ],
);

export const sessions = mysqlTable("session", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(createId),
  expiresAt: timestamp("expires_at").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = mysqlTable("account", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(createId),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verifications = mysqlTable("verification", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(createId),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
