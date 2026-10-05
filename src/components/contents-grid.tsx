import { PostCard, postGrid } from "@/components/post-card";
import type { Post } from "@/lib/posts";

/** Filtered /contents view: every matching post. */
export default function ContentsGrid({ posts }: { posts: Post[] }) {
  return (
    <div className={postGrid}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
