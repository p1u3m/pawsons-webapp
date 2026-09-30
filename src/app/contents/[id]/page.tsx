import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { PostArt, PostCard } from "@/components/post-card";
import { houseBackground } from "@/lib/data";
import { getAllContents } from "@/lib/supabase/contents";
import { postCategories, toPost } from "@/lib/posts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function findPost(id: string) {
  const posts = (await getAllContents()).map(toPost);
  const index = posts.findIndex((post) => String(post.id) === id);
  return { posts, index, post: posts[index] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { post } = await findPost((await params).id);
  return { title: post ? `${post.title} · Pawsons` : "Little Stories · Pawsons" };
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
    <article className="wrap stories stories-detail">
      <div className="stories-detail-top">
        <Link
          href="/contents"
          className="stories-round-button"
          aria-label="กลับไปหน้าเรื่องราว"
        >
          <ArrowLeftIcon size={20} weight="bold" aria-hidden="true" />
        </Link>
        <Link
          className="stories-pill"
          href={`/contents?category=${post.category}`}
        >
          {postCategories[post.category].label}
          {post.situationNo !== null && ` · #${String(post.situationNo).padStart(2, "0")}`}
        </Link>
      </div>

      <div className="stories-detail-grid">
        <div className="stories-detail-art">
          <span className="post-frame">
            <PostArt post={post} sizes="(max-width: 860px) 100vw, 50vw" priority />
          </span>
        </div>

        <div className="stories-read">
          <p className="stories-meta">
            <span
              className="stories-dot"
              style={{ background: c.house.badgeColor }}
              aria-hidden="true"
            />
            {c.name} · {c.type} · บ้าน {c.house.name}
          </p>
          {post.category === "quote" ? (
            <blockquote className="stories-quote">
              <p>“{post.title}”</p>
              {post.author && <footer>— {post.author}</footer>}
            </blockquote>
          ) : (
            <>
              <h1>{post.title}</h1>
              {post.lines.length > 0 && (
                <div className="stories-body">
                  {post.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              )}
            </>
          )}

          {next && (
            <div className="stories-actions">
              <Link className="stories-cta" href={`/contents/${next.id}`}>
                <span>โพสต์ถัดไป</span>
                <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
              </Link>
            </div>
          )}

          <Link className="stories-friend" href={`/characters/${c.type.toLowerCase()}`}>
            <span
              className="stories-friend-avatar"
              style={{ background: houseBackground(c.house) }}
            >
              <Image src={c.image} alt="" width={96} height={96} sizes="56px" />
            </span>
            <span>
              <strong>รู้จัก {c.name}</strong>
              <small>{c.tagline}</small>
            </span>
            <span aria-hidden="true" className="stories-friend-arrow">
              ↗
            </span>
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <section className="stories-related" aria-labelledby="related-title">
          <div className="mag-section-head">
            <h2 id="related-title">อ่านต่อ</h2>
            <Link className="stories-text-link" href={`/contents?character=${c.type}`}>
              โพสต์ทั้งหมดของ {c.name}
            </Link>
          </div>
          <div className="stories-grid">
            {related.map((item) => (
              <PostCard key={item.id} post={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
