import { db } from "~/server/db";

export default async function HomePage() {
  const posts = await db.query.posts.findMany({ with: { author: true }});
  
  return (
    <div>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.content} - {post.author.displayName ?? post.author.name}</li>
        ))}
      </ul>
    </div>
  );
}
