import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr";
import type { Post } from "@/lib/posts";

/** Picture area of a post: the artwork, or a frame waiting for it. */
export function PostArt({
  post,
  sizes,
  priority,
}: {
  post: Post;
  sizes: string;
  priority?: boolean;
}) {
  return post.image ? (
    <Image
      src={post.image}
      alt={post.title}
      width={1080}
      height={1350}
      sizes={sizes}
      priority={priority}
      className="post-image"
    />
  ) : (
    <PostWaiting />
  );
}

export function PostWaiting({ label = "รอรูปอยู่นะ" }: { label?: string }) {
  return (
    <span className="post-waiting">
      <span className="material-symbols-rounded" aria-hidden="true">
        image
      </span>
      {label}
    </span>
  );
}

/** A post in a grid or on the magazine spread. */
export function PostCard({
  post,
  sizes = "(max-width: 767px) 50vw, 25vw",
  priority,
  className = "",
}: {
  post: Post;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const c = post.character;
  return (
    <Link href={`/contents/${post.id}`} className={`post-card ${className}`}>
      <span className="post-frame">
        <PostArt post={post} sizes={sizes} priority={priority} />
      </span>
      <span className="post-caption">
        <span className="stories-meta">
          <span
            className="stories-dot"
            style={{ background: c.house.badgeColor }}
            aria-hidden="true"
          />
          {post.category.label} · {c.name} {c.type}
        </span>
        <span className="post-title">
          {post.category.layout === "quote" ? `“${post.title}”` : post.title}
        </span>
      </span>
    </Link>
  );
}

/** A magazine slot no post fills yet. */
export function EmptySlot({ className = "" }: { className?: string }) {
  return (
    <div className={`post-card is-empty ${className}`} aria-hidden="true">
      <span className="post-frame">
        <ImageIcon className="post-empty-icon" />
      </span>
    </div>
  );
}
