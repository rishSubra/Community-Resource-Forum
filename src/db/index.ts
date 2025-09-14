import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2/promise";
import { seed } from "drizzle-seed";
import { env } from "~/env";
import * as schema from "./schema";

async function getDB() {
  const globalForDb = globalThis as unknown as {
    conn: Pool | undefined;
  };

  const conn = globalForDb.conn ?? createPool({ uri: env.DATABASE_URL });
  const db = drizzle(conn, { schema, mode: "default" });

  if (env.NODE_ENV === "production") {
    return db;
  }

  if (!globalForDb.conn) {
    await seed(db, schema).catch(() => {
      console.warn("Database already seeded.");
    });
  }

  globalForDb.conn = conn;
  return db;
}

export const db = await getDB();
