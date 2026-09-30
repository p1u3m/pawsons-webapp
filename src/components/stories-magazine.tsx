import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { EmptySlot, PostCard } from "@/components/post-card";
import { houseBackground, houses } from "@/lib/data";
import type { ContentCategory, Post } from "@/lib/posts";
import titleStyles from "./section-title.module.css";

// Posts per category shelf; missing ones show as frames waiting for a picture.
const shelfSize = 4;

// Band colours for the shelves below the first (green) band, in turn, each
// with its matching doodle tile from scripts/build-patterns.mjs.
const bandPalette = [
  ["#dcefff", "shop"],
  ["#fff0bd", "home"],
  ["#eee9f5", "house-lavender"],
  ["#e4f3dc", "contents"],
] as const;

function bandStyle(i: number) {
  const [color, pattern] = bandPalette[i % bandPalette.length];
  return {
    "--pw-band": color,
    "--pattern": `url("/patterns/${pattern}.svg")`,
  } as React.CSSProperties;
}

/** The admin's picks: a lead story beside four smaller ones. */
export function MagazineSpread({ featured }: { featured: (Post | null)[] }) {
  const [lead, ...side] = featured;
  return (
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
  );
}

/** Default /contents view below the spread: one wavy band per shelf, then
 *  the houses, stacked like the /characters page. */
export function MagazineBands({
  posts,
  categories,
  featured,
}: {
  posts: Post[];
  categories: ContentCategory[];
  featured: (Post | null)[];
}) {
  // One shelf per tag that has posts, in the order set in admin.
  const shelves = categories
    .map((category) => {
      const inCategory = posts.filter(
        (post) => post.category.slug === category.slug,
      );
      return {
        category,
        total: inCategory.length,
        posts: inCategory
          .filter((post) => !featured.includes(post))
          .slice(0, shelfSize),
      };
    })
    .filter((shelf) => shelf.total > 0);

  return (
    <>
      {shelves.map(({ category, posts: shelf }, i) => (
        <section
          key={category.slug}
          className="stories-band mag-band"
          style={bandStyle(i)}
          aria-labelledby={`mag-${category.slug}-title`}
        >
          <div className="wrap" data-reveal>
            <div className="mag-section-head">
              <h2 id={`mag-${category.slug}-title`}>
                <span className={titleStyles.label}>
                  {category.english?.trim() ||
                    category.slug.replace(/[-_]/g, " ")}
                </span>
              </h2>
              <Link
                className="stories-text-link"
                href={`/contents?category=${category.slug}`}
              >
                ดูทั้งหมด
                <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
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
          </div>
        </section>
      ))}
      {/* The last band ends in a wave instead of a straight cut. */}
      <div
        className="stories-band-end"
        style={shelves.length ? bandStyle(shelves.length - 1) : undefined}
        aria-hidden="true"
      />

      {/* On the plain page below the bands: the house cards carry their own
          colours. */}
      <section
        className="wrap mag-houses"
        aria-labelledby="mag-houses-title"
        data-reveal
      >
        <div className="mag-section-head">
          <h2 id="mag-houses-title">
            <span className={titleStyles.label}>Explore by House</span>
          </h2>
        </div>
        <div className="mag-house-grid">
          {houses.map((house) => {
            const count = posts.filter(
              (post) => post.character.house.id === house.id,
            ).length;
            return (
              <Link
                key={house.id}
                href={`/contents?house=${house.id}`}
                className="mag-house"
                style={{
                  background: houseBackground(house),
                  color: house.ink,
                }}
              >
                <Image
                  className="mag-house-crest"
                  src={`/characters/reference/crests/${house.id}s.png`}
                  alt=""
                  width={120}
                  height={196}
                  sizes="48px"
                />

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

        <div className="mag-more">
          <Link className="stories-cta" href="/contents?view=all">
            ดูทั้งหมด
            <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
