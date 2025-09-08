import { db } from "~/server/db";

export default async function HomePage() {
  const posts = await db.query.posts.findMany({ with: { author: true } });

  return (
    <div>
      {posts.map((post) => (
        <div
          key={post.id}
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.content! }}
        />
      ))}
    </div>
  );
}
