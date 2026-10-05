import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Dot, FriendLink, roundButton, signButton } from "@/components/paper-ui";
import { PostCard, PostFrame, postGrid } from "@/components/post-card";
import { StoriesLink, sectionHead, sectionTitle } from "@/components/stories-magazine";
import { cn } from "@/lib/utils";
import { getAllContents, getCategories } from "@/lib/supabase/contents";
import { toPost } from "@/lib/posts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function findPost(id: string) {
  const [rows, categories] = await Promise.all([
    getAllContents(),
    getCategories(),
  ]);
  const posts = rows.map((row) => toPost(row, categories));
  const index = posts.findIndex((post) => String(post.id) === id);
  return { posts, index, post: posts[index] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { post } = await findPost((await params).id);
  return {
    title: post ? `${post.title} · Pawsons` : "Little Stories · Pawsons",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { posts, index, post } = await findPost((await params).id);
  if (!post) notFound();

  const c = post.character;
  // Newest first, so "next" walks back in time and wraps around.
  const next = posts.length > 1 ? posts[(index + 1) % posts.length] : null;
  const related = posts
    .filter(
      (item) =>
        item.id !== post.id &&
        (item.character.type === c.type ||
          (post.situationNo !== null && item.situationNo === post.situationNo)),
    )
    .slice(0, 4);

  return (
    <article className="wrap focus-ink min-h-[70vh] overflow-x-clip pt-10 pb-[110px] max-md:pt-6">
      <div className="mb-7 flex items-center justify-between gap-4">
        <Link href="/contents" className={roundButton} aria-label="กลับไปหน้าเรื่องราว">
          <ArrowLeftIcon size={20} weight="bold" aria-hidden="true" />
        </Link>
        <Link
          className="rounded-full bg-cream px-4 py-2 text-[13px] font-semibold tabular-nums shadow-ledge-sm"
          href={`/contents?category=${post.category.slug}`}
        >
          {post.category.label}
          {post.situationNo !== null &&
            ` · #${String(post.situationNo).padStart(2, "0")}`}
        </Link>
      </div>

      <div className="grid grid-cols-2 items-start gap-14 max-split:grid-cols-1 max-split:gap-8">
        <div className="sticky top-[110px] max-w-[540px] rounded-panel bg-cream p-2.5 shadow-ledge max-split:static max-split:mx-auto max-split:w-full">
          <PostFrame
            post={post}
            sizes="(max-width: 860px) 100vw, 50vw"
            priority
            className="rounded-card max-md:rounded-card"
          />
        </div>

        <div>
          <p className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-muted">
            <Dot color={c.house.badgeColor} />
            {c.name} · {c.type} · บ้าน {c.house.name}
          </p>
          {post.category.layout === "quote" ? (
            <blockquote className="mt-5">
              <p className="mb-4 text-[clamp(24px,2.8vw,34px)] leading-[1.45] font-semibold">
                “{post.title}”
              </p>
              {post.author && <footer className="text-[16px] text-ink-muted">— {post.author}</footer>}
            </blockquote>
          ) : (
            <>
              <h1 className="mt-3 mb-6 text-[clamp(28px,3.4vw,42px)] leading-[1.25] tracking-[-0.02em]">
                {post.title}
              </h1>
              {post.lines.length > 0 && (
                <div>
                  {post.lines.map((line) => (
                    <p
                      key={line}
                      className="mb-3.5 text-[18px] leading-[1.8] first:font-medium first:text-ink max-md:text-[16px]"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}

          {next && (
            <div className="mt-9 mb-7 flex flex-wrap gap-3 border-b border-line pb-7">
              <Link className={cn(signButton, "max-md:flex-1")} href={`/contents/${next.id}`}>
                <span>โพสต์ถัดไป</span>
                <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
              </Link>
            </div>
          )}

          <FriendLink character={c} title={`รู้จัก ${c.name}`} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20" aria-labelledby="related-title">
          <div className={sectionHead}>
            <h2 id="related-title" className={sectionTitle}>
              อ่านต่อ
            </h2>
            <StoriesLink href={`/contents?character=${c.type}`}>
              โพสต์ทั้งหมดของ {c.name}
              <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
            </StoriesLink>
          </div>
          <div className={postGrid}>
            {related.map((item) => (
              <PostCard key={item.id} post={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
