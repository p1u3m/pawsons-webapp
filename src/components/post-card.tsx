import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr";
import { Dot, ImagePlaceholder } from "@/components/paper-ui";
import type { Post } from "@/lib/posts";
import { cn } from "@/lib/utils";

// Cream card on a ledge holding a 4:5 picture frame.
const card =
  "flex min-w-0 flex-col rounded-[30px] bg-cream p-2.5 max-md:rounded-[20px] max-md:p-1.5";
const frame =
  "relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[22px] max-md:rounded-[15px]";
// The lead story's picture grows to fill the two rows beside it.
const leadFrame =
  "flex-1 aspect-auto min-h-0 max-lg:flex-none max-lg:aspect-[4/5]";
const leadCard = "col-span-2 row-span-2 max-lg:row-auto";

/** Picture frame of a post: the artwork, or a placeholder until it is added. */
export function PostFrame({
  post,
  sizes,
  priority,
  className,
}: {
  post: Post;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <span className={cn(frame, "bg-[#f4efe1]", className)}>
      {post.image ? (
        <Image
          src={post.image}
          alt={post.title}
          width={1080}
          height={1350}
          sizes={sizes}
          priority={priority}
          className="size-full object-cover group-hover:scale-103"
        />
      ) : (
        <ImagePlaceholder label="รอรูปอยู่นะ" />
      )}
    </span>
  );
}

/** A post in a grid or on the magazine spread (lead: the big one). */
export function PostCard({
  post,
  sizes = "(max-width: 767px) 50vw, 25vw",
  priority,
  lead,
}: {
  post: Post;
  sizes?: string;
  priority?: boolean;
  lead?: boolean;
}) {
  const c = post.character;
  return (
    <Link
      href={`/contents/${post.id}`}
      data-post
      className={cn(
        card,
        "group shadow-ledge hover:-translate-y-[5px]",
        lead && leadCard,
      )}
    >
      <PostFrame
        post={post}
        sizes={sizes}
        priority={priority}
        className={cn(lead && leadFrame)}
      />
      <span
        className={cn(
          "flex flex-col gap-1 px-2 pt-3 pb-1.5 max-md:px-1.5 max-md:pt-2.5 max-md:pb-1",
          lead && "px-3 pt-4 pb-2 max-md:px-3 max-md:pt-4 max-md:pb-2",
        )}
      >
        <span
          className={cn(
            "flex flex-wrap items-center gap-1.5 text-[12px] text-ink-muted",
            lead && "text-[13px]",
          )}
        >
          <Dot color={c.house.badgeColor} />
          {post.category.label} · {c.name} {c.type}
        </span>
        <span
          className={cn(
            "line-clamp-2 text-[15px] leading-[1.45] font-semibold max-md:text-[13px]",
            lead &&
              "text-[clamp(20px,2vw,26px)] leading-[1.35] max-md:text-[17px]",
          )}
        >
          {post.category.layout === "quote" ? `“${post.title}”` : post.title}
        </span>
      </span>
    </Link>
  );
}

/** A magazine slot no post fills yet. */
export function EmptySlot({ lead }: { lead?: boolean }) {
  return (
    <div
      className={cn(
        card,
        "shadow-[inset_0_0_0_2px_var(--color-cream)]",
        lead && leadCard,
      )}
      aria-hidden="true"
    >
      <span className={cn(frame, lead && leadFrame)}>
        <ImageIcon className="size-12 text-[#c9c4b8]" />
      </span>
    </div>
  );
}

/** Post grid: four per row from 768px, two on phones, matching /characters. */
export const postGrid =
  "grid grid-cols-4 gap-5 max-md:grid-cols-2 max-md:gap-3";
