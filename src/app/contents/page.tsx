import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { characters, getCharacter, houses } from "@/lib/data";
import { getAllContents, getCategories } from "@/lib/supabase/contents";
import { featuredPosts, toPost } from "@/lib/posts";
import ContentsGrid from "@/components/contents-grid";
import { FilterSheet } from "@/components/filter-sheet";
import { SearchField } from "@/components/search-field";
import { HeroFriends } from "@/components/character-ui";
import {
  BackButton,
  Dot,
  listFilters,
  listingPage,
  listReset,
  listResults,
  listResultsCount,
  listResultsTitle,
  listToolbar,
  pageHero,
  pageHeroText,
  pageHeroTitle,
  signButton,
} from "@/components/paper-ui";
import {
  MagazineBands,
  MagazineSpread,
  StoriesLink,
  storiesWave,
} from "@/components/stories-magazine";
import { cn } from "@/lib/utils";

export const metadata = { title: "Little Stories · Pawsons" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

// One friend from each house for the hero, in the order they stand.
const heroFriends = [
  characters[0],
  characters[5],
  characters[9],
  characters[14],
];

type Filters = {
  character?: string;
  category?: string;
  house?: string;
  view?: string;
  q?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Filters>;
}) {
  const { character, category, house, view, q } = await searchParams;
  const query = q?.trim().toLowerCase() ?? "";
  const selected = character ? getCharacter(character) : undefined;
  const [rows, categories] = await Promise.all([
    getAllContents(),
    getCategories(),
  ]);
  const currentCategory = categories.find(
    (item) => item.slug === category,
  )?.slug;
  const currentHouse = houses.find((item) => item.id === house);
  // The magazine is the default; any filter or search switches to the grid.
  const magazine =
    !selected && !currentCategory && !currentHouse && !query && view !== "all";

  const posts = rows.map((row) => toPost(row, categories));
  const featured = featuredPosts(posts);
  const visible = posts.filter(
    (post) =>
      (!selected || post.character.type === selected.type) &&
      (!currentCategory || post.category.slug === currentCategory) &&
      (!currentHouse || post.character.house.id === currentHouse.id) &&
      (!query ||
        [
          post.title,
          ...post.lines,
          post.author ?? "",
          post.category.label,
          post.character.name,
          post.character.type,
        ].some((text) => text.toLowerCase().includes(query))),
  );
  const filterHref = (next: {
    category?: string | null;
    house?: string | null;
  }) => {
    const params = new URLSearchParams();
    const nextCategory =
      next.category === undefined ? currentCategory : next.category;
    const nextHouse = next.house === undefined ? currentHouse?.id : next.house;
    if (selected) params.set("character", selected.type);
    if (nextCategory) params.set("category", nextCategory);
    if (nextHouse) params.set("house", nextHouse);
    if (query) params.set("q", q!.trim());
    if (!params.size) params.set("view", "all");
    return `/contents?${params}`;
  };
  const artFriends = selected ? [selected] : heroFriends;
  const activeFilters =
    Number(Boolean(currentCategory)) + Number(Boolean(currentHouse));
  // Rendered inline on desktop and inside the filter sheet on mobile.
  const filters = (inSheet: boolean) => (
    <>
      <nav
        className={cn(
          "flex flex-wrap gap-x-1.5 gap-y-2 pb-0.5",
          !inSheet && "min-w-0 flex-1 gap-2 max-[62.5rem]:flex-[1_1_100%]",
        )}
        aria-label="เลือกดูเรื่องราว"
      >
        {!selected && (
          <Link
            className={tab(magazine, inSheet)}
            href="/contents"
            aria-current={magazine ? "page" : undefined}
          >
            เรื่องแนะนำ
          </Link>
        )}
        <Link
          className={tab(!magazine && !currentCategory, inSheet)}
          href={filterHref({ category: null })}
          aria-current={!magazine && !currentCategory ? "page" : undefined}
        >
          ทั้งหมด
        </Link>
        {categories.map(({ slug, label }) => (
          <Link
            key={slug}
            className={tab(currentCategory === slug, inSheet)}
            href={filterHref({
              category: currentCategory === slug ? null : slug,
            })}
            aria-current={currentCategory === slug ? "page" : undefined}
          >
            {label}
            <small className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-cream px-1.5 text-caption tabular-nums">
              {posts.filter((post) => post.category.slug === slug).length}
            </small>
          </Link>
        ))}
      </nav>
      {!selected && (
        <nav
          className={cn(
            "flex flex-wrap gap-2",
            !inSheet && "max-[62.5rem]:flex-[1_1_100%]",
          )}
          aria-label="บ้าน"
        >
          {houses.map((item) => {
            const active = currentHouse?.id === item.id;
            return (
              <Link
                key={item.id}
                className={cn(
                  tab(false, inSheet),
                  "gap-[7px] bg-cream px-3.5 text-small shadow-[inset_0_0_0_1.5px_var(--color-outline)]",
                  active &&
                    "bg-(--house-bg) text-ink shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--house)_55%,transparent)]",
                  inSheet && "h-10 text-body-sm",
                )}
                href={filterHref({ house: active ? null : item.id })}
                aria-current={active ? "page" : undefined}
                style={
                  {
                    "--house": item.badgeColor,
                    "--house-bg": item.color,
                  } as React.CSSProperties
                }
              >
                <Dot className="bg-(--house)" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );

  return (
    <div
      className={cn(
        listingPage,
        "focus-ink min-h-[70vh] overflow-x-clip page-top",
      )}
    >
      {selected && (
        <div className="wrap mb-2">
          <BackButton href="/contents" label="ดูเรื่องราวของทุกคน" />
        </div>
      )}
      <section className={pageHero}>
        <div>
          <h1 className={pageHeroTitle}>
            {selected ? (
              <>
                วันเล็ก ๆ
                <br />
                ของ {selected.name}
              </>
            ) : (
              <>
                เรื่องธรรมดา
                <br />
                ที่ไม่ธรรมดาสำหรับเรา
              </>
            )}
          </h1>
          <p className={pageHeroText}>
            {selected
              ? `${selected.type} · ${selected.tagline}`
              : "บางเรื่องทำให้ยิ้ม บางเรื่องทำให้รู้ว่าเราไม่ได้รู้สึกแบบนี้คนเดียว"}
          </p>
        </div>
        <HeroFriends friends={artFriends} />
      </section>

      {/* The first band (toolbar + spread) sits on the plain paper; when the
          shelf bands follow, it leaves room for the first one's wave. */}
      <section
        className={cn(
          "relative mt-6 pt-6",
          storiesWave,
          magazine ? "pb-[calc(var(--wave)+56px)]" : "pb-[120px]",
        )}
        aria-label="เรื่องราว"
      >
        <div className="wrap">
          {/* Mobile: search + filter button (filters in the sheet). From 768px:
              one cream bar, search on top and the filters below a dashed line. */}
          <div
            className={cn(
              listToolbar,
              "mb-7 md:bg-cream md:shadow-ledge",
            )}
          >
            <Suspense>
              <SearchField
                className="h-[52px] min-w-0 flex-1 bg-cream shadow-ledge-sm max-md:flex-[1_1_calc(100%-64px)] md:h-[46px] md:bg-field md:shadow-none"
                placeholder="ค้นหาเรื่องหรือตัวละคร"
                label="ค้นหาเรื่องราว"
              />
            </Suspense>
            <FilterSheet activeCount={activeFilters}>
              {filters(true)}
            </FilterSheet>
            <div
              className={cn(
                listFilters,
                "hidden md:flex md:basis-full md:border-t md:border-line-strong md:pt-4",
              )}
            >
              {filters(false)}
            </div>
          </div>

          {selected && (
            <div className="-mt-4 mb-7 flex flex-wrap items-center justify-between gap-3 rounded-card-sm bg-cream py-3 pr-3 pl-5 text-body-sm shadow-ledge-sm">
              <p className="flex items-center gap-2">
                <Dot color={selected.house.badgeColor} />
                โพสต์ของ <strong>{selected.name}</strong> · {selected.type}
              </p>
              <StoriesLink href="/contents">
                ดูของทุกคน
                <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
              </StoriesLink>
            </div>
          )}

          <div className={listResults}>
            <div>
              <h2 className={listResultsTitle}>
                {magazine ? "เรื่องแนะนำสำหรับคุณ" : "เรื่องราวทั้งหมด"}
              </h2>
              <p className={listResultsCount}>
                {magazine
                  ? "เรื่องเล็ก ๆ ที่อยากชวนคุณอ่าน"
                  : `${visible.length} เรื่อง${currentHouse ? ` · ${currentHouse.name}` : ""}${selected ? ` · ${selected.name}` : ""}`}
              </p>
            </div>
            {(query || selected || currentHouse || currentCategory) && (
              <Link className={listReset} href="/contents?view=all">
                ล้างตัวกรอง
              </Link>
            )}
          </div>
          {magazine ? (
            <MagazineSpread featured={featured} />
          ) : visible.length ? (
            // Client component for the GSAP scroll reveal.
            <ContentsGrid posts={visible} />
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-card bg-cream px-6 py-14 text-center shadow-ledge">
              <p className="text-lead font-semibold">
                {query
                  ? `ไม่พบเรื่องที่ตรงกับ “${q!.trim()}”`
                  : "ยังไม่มีโพสต์ในหมวดนี้"}
              </p>
              <span className="mb-4 text-body-sm text-ink-muted">
                {query
                  ? "ลองค้นหาด้วยคำอื่น หรือกลับไปดูเรื่องแนะนำ"
                  : "รอติดตามเร็ว ๆ นี้ หรือกลับไปดูเรื่องแนะนำ"}
              </span>
              <Link className={signButton} href="/contents">
                ดูเรื่องแนะนำ
              </Link>
            </div>
          )}
        </div>
      </section>

      {magazine && (
        <MagazineBands
          posts={posts}
          categories={categories}
          featured={featured}
        />
      )}
    </div>
  );
}

/** Filter tab; the active one is a yellow sign chip. */
function tab(active: boolean, inSheet: boolean) {
  return cn(
    "inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-body-sm font-semibold whitespace-nowrap",
    !inSheet && "h-auto min-h-10",
    active
      ? "bg-sun text-gold-ink shadow-[0_2px_0_var(--color-gold)]"
      : "bg-field text-ink",
  );
}
