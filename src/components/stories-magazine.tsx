import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { EmptySlot, PostCard } from "@/components/post-card";
import { characters, houseBackground, houses } from "@/lib/data";
import { postCategories, type Post, type PostCategory } from "@/lib/posts";

// Posts per category shelf; missing ones show as frames waiting for a picture.
const shelfSize = 4;

/** Default /contents view: the admin's picks laid out like a magazine. */
export function StoriesMagazine({
  posts,
  featured,
}: {
  posts: Post[];
  featured: (Post | null)[];
}) {
  const [lead, ...side] = featured;
  const shelves = (Object.keys(postCategories) as PostCategory[]).map(
    (category) => ({
      category,
      total: posts.filter((post) => post.category === category).length,
      posts: posts
        .filter((post) => post.category === category && !featured.includes(post))
        .slice(0, shelfSize),
    }),
  );

  return (
    <div className="mag">
      <section className="mag-spread" aria-label="เรื่องแนะนำ">
        {lead ? (
          <PostCard
            post={lead}
            className="mag-lead"
            sizes="(max-width: 767px) 100vw, 50vw"
            priority
          />
        ) : (
          <EmptySlot className="mag-lead" />
        )}
        {side.map((post, i) =>
          post ? (
            <PostCard key={post.id} post={post} />
          ) : (
            <EmptySlot key={`empty-${i}`} />
          ),
        )}
      </section>

      {shelves.map(({ category, total, posts: shelf }) => (
        <section
          key={category}
          className="mag-shelf"
          aria-labelledby={`mag-${category}-title`}
          data-reveal
        >
          <div className="mag-section-head">
            <h2 id={`mag-${category}-title`}>
              {postCategories[category].label}
              <small>{postCategories[category].english}</small>
            </h2>
            <Link className="stories-text-link" href={`/contents?category=${category}`}>
              ดูทั้งหมด {total}
            </Link>
          </div>
          <div className="stories-grid">
            {shelf.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {Array.from({ length: shelfSize - shelf.length }, (_, i) => (
              <EmptySlot key={`empty-${i}`} />
            ))}
          </div>
        </section>
      ))}

      <section className="mag-houses" aria-labelledby="mag-houses-title" data-reveal>
        <div className="mag-section-head">
          <h2 id="mag-houses-title">อ่านตามบ้าน</h2>
          <p>สี่บ้าน สี่มุมมองต่อวันธรรมดา</p>
        </div>
        <div className="mag-house-grid">
          {houses.map((house) => {
            const friends = characters.filter((c) => c.house.id === house.id);
            const count = posts.filter(
              (post) => post.character.house.id === house.id,
            ).length;
            return (
              <Link
                key={house.id}
                href={`/contents?house=${house.id}`}
                className="mag-house"
                style={{ background: houseBackground(house), color: house.ink }}
              >
                <span className="mag-house-friends" aria-hidden="true">
                  {friends.map((c) => (
                    <Image key={c.type} src={c.image} alt="" width={96} height={96} sizes="56px" />
                  ))}
                </span>
                <strong>{house.name}</strong>
                <small>{house.thai}</small>
                <span className="mag-house-foot">
                  {count} โพสต์
                  <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mag-more" data-reveal>
        <Link className="stories-cta" href="/contents?view=all">
          ดูทั้งหมด {posts.length} โพสต์
          <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
