import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { ChipLink, DoodleLabel } from "@/components/character-ui";
import { signButton } from "@/components/paper-ui";
import { EmptySlot, PostCard, postGrid } from "@/components/post-card";
import { houseBackground, houses, houseSigilSrc } from "@/lib/data";
import type { ContentCategory, Post } from "@/lib/posts";
import { cn } from "@/lib/utils";

// Posts per category shelf; missing ones show as frames waiting for a picture.
const shelfSize = 4;

// Band colours for the shelves below the first band, in turn, each with its
// matching doodle tile from scripts/build-patterns.mjs.
const bandPalette = [
  ["#dcefff", "shop"],
  ["#fff0bd", "home"],
  ["#eee9f5", "house-lavender"],
  ["#e4f3dc", "contents"],
] as const;

function bandVars(i: number) {
  const [color, pattern] = bandPalette[i % bandPalette.length];
  return {
    "--band": color,
    "--pattern": `url("/patterns/${pattern}.svg")`,
  } as CSSProperties;
}

/** Wave height shared by the /contents bands. */
export const storiesWave = "[--wave:120px] max-md:[--wave:64px]";

/** Heading row above a shelf: title on the left, a link on the right. */
export const sectionHead =
  "mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2";
export const sectionTitle =
  "flex max-w-full flex-wrap items-baseline gap-2.5 text-[30px] tracking-normal max-md:text-[26px]";

/** Paper chip link with an arrow that slides right on hover. */
export function StoriesLink({
  className,
  ...props
}: React.ComponentProps<typeof ChipLink>) {
  return (
    <ChipLink
      className={cn(
        "gap-2 text-ink hover:[&_svg]:translate-y-0 active:translate-y-0.5 active:shadow-ledge-pressed",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The admin's picks: a lead story beside four smaller ones.
 * Desktop:  lead lead  2  3
 *           lead lead  4  5
 */
export function MagazineSpread({ featured }: { featured: (Post | null)[] }) {
  const [lead, ...side] = featured;
  return (
    <section
      className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:gap-3"
      aria-label="เรื่องแนะนำ"
    >
      {lead ? (
        <PostCard
          post={lead}
          lead
          sizes="(max-width: 767px) 100vw, 50vw"
          priority
        />
      ) : (
        <EmptySlot lead />
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
          // Each band's wave laps over the one above; the last one ends in a
          // flipped wave below instead of a straight cut.
          className={cn(
            "band band-wave-top band-pattern pt-2",
            storiesWave,
            i === shelves.length - 1 ? "pb-6" : "pb-[calc(var(--wave)+56px)]",
          )}
          style={bandVars(i)}
          aria-labelledby={`mag-${category.slug}-title`}
        >
          <div className="wrap">
            <div className={sectionHead}>
              <h2 id={`mag-${category.slug}-title`} className={sectionTitle}>
                <DoodleLabel>
                  {category.english?.trim() ||
                    category.slug.replace(/[-_]/g, " ")}
                </DoodleLabel>
              </h2>
              <StoriesLink href={`/contents?category=${category.slug}`}>
                ดูทั้งหมด
                <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
              </StoriesLink>
            </div>
            <div className={postGrid}>
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
      <div
        className={cn(
          "mb-6 -mt-px h-(--wave) -scale-y-100 bg-(--band) mask-[url(/home-wave-mask.svg)] mask-size-[100%_100%] mask-center mask-no-repeat",
          storiesWave,
        )}
        style={shelves.length ? bandVars(shelves.length - 1) : undefined}
        aria-hidden="true"
      />

      {/* On the plain page below the bands: the house cards carry their own
          colours. */}
      <section className="wrap pt-2" aria-labelledby="mag-houses-title">
        <div className={sectionHead}>
          <h2 id="mag-houses-title" className={sectionTitle}>
            <DoodleLabel>Explore by House</DoodleLabel>
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:gap-3 max-xs:grid-cols-1">
          {houses.map((house) => {
            const count = posts.filter(
              (post) => post.character.house.id === house.id,
            ).length;
            return (
              // Text on the left, the house crest on the right.
              <Link
                key={house.id}
                href={`/contents?house=${house.id}`}
                className="group grid grid-cols-[minmax(0,1fr)_auto] content-center gap-x-3 gap-y-0.5 rounded-card px-5 pt-[18px] pb-4 shadow-ledge-sm hover:-translate-y-1 max-md:rounded-card-sm max-md:p-3.5"
                style={{ background: houseBackground(house), color: house.ink }}
              >
                <Image
                  className="col-start-2 row-span-3 row-start-1 size-[88px] self-center object-contain group-hover:-rotate-6 max-md:size-16"
                  src={houseSigilSrc(house)}
                  alt=""
                  width={120}
                  height={196}
                  sizes="48px"
                />
                <strong className="col-start-1 text-[18px]">
                  {house.name}
                </strong>
                <small className="col-start-1 text-[13px] opacity-80 max-md:hidden">
                  {house.thai}
                </small>
                <span className="col-start-1 mt-3 flex items-center gap-1.5 text-[13px] font-semibold">
                  {count} โพสต์
                  <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-14 flex justify-center">
          <Link className={signButton} href="/contents?view=all">
            ดูทั้งหมด
            <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
