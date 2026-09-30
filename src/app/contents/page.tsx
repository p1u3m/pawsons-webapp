import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { characters, getCharacter, houses } from "@/lib/data";
import { getAllContents, getCategories } from "@/lib/supabase/contents";
import { featuredPosts, toPost } from "@/lib/posts";
import ContentsGrid from "@/components/contents-grid";
import { FilterSheet } from "@/components/filter-sheet";
import { SearchField } from "@/components/search-field";
import { MagazineBands, MagazineSpread } from "@/components/stories-magazine";

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
  const houseLinks = houses.map((item) => {
    const active = currentHouse?.id === item.id;
    return (
      <Link
        key={item.id}
        className="stories-tab stories-tab--house"
        href={filterHref({ house: active ? null : item.id })}
        aria-current={active ? "page" : undefined}
        style={
          {
            "--house": item.badgeColor,
            "--house-bg": item.color,
          } as React.CSSProperties
        }
      >
        <span className="stories-dot" aria-hidden="true" />
        {item.name}
      </Link>
    );
  });
  const activeFilters =
    Number(Boolean(currentCategory)) + Number(Boolean(currentHouse));
  // Rendered inline on desktop and inside the filter sheet on mobile.
  const filters = (
    <>
      <nav className="stories-tabs" aria-label="เลือกดูเรื่องราว">
        {!selected && (
          <Link
            className="stories-tab"
            href="/contents"
            aria-current={magazine ? "page" : undefined}
          >
            เรื่องแนะนำ
          </Link>
        )}
        <Link
          className="stories-tab"
          href={filterHref({ category: null })}
          aria-current={!magazine && !currentCategory ? "page" : undefined}
        >
          ทั้งหมด
        </Link>
        {categories.map(({ slug, label }) => (
          <Link
            key={slug}
            className="stories-tab"
            href={filterHref({
              category: currentCategory === slug ? null : slug,
            })}
            aria-current={currentCategory === slug ? "page" : undefined}
          >
            {label}
            <small>
              {posts.filter((post) => post.category.slug === slug).length}
            </small>
          </Link>
        ))}
      </nav>
      {!selected && (
        <nav className="stories-houses" aria-label="บ้าน">
          {houseLinks}
        </nav>
      )}
    </>
  );

  return (
    <div className="stories stories--landing">
      <section className="wrap stories-hero">
        <div className="stories-hero-copy">
          {selected && (
            <Link
              href="/contents"
              className="stories-round-button"
              aria-label="ดูเรื่องราวของทุกคน"
            >
              <ArrowLeftIcon size={20} weight="bold" aria-hidden="true" />
            </Link>
          )}
          <h1>
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
          <p>
            {selected
              ? `${selected.type} · ${selected.tagline}`
              : "บางเรื่องทำให้ยิ้ม บางเรื่องทำให้รู้ว่าเราไม่ได้รู้สึกแบบนี้คนเดียว"}
          </p>
        </div>
        <div
          className={`stories-hero-art${selected ? " is-single" : ""}`}
          aria-hidden="true"
        >
          {artFriends.map((friend) => (
            <Image
              key={friend.type}
              src={friend.image}
              alt=""
              width={480}
              height={480}
              sizes="(max-width: 860px) 45vw, 240px"
              priority
            />
          ))}
        </div>
      </section>

      <section className="stories-band stories-band--plain" aria-label="เรื่องราว">
        <div className="wrap">
          <div className="stories-toolbar">
            <Suspense>
              <SearchField
                className="stories-search"
                placeholder="ค้นหาเรื่องหรือตัวละคร"
                label="ค้นหาเรื่องราว"
              />
            </Suspense>
            <FilterSheet activeCount={activeFilters}>{filters}</FilterSheet>
            <div className="stories-toolbar-filters">{filters}</div>
          </div>

          {selected && (
            <div className="stories-filter-banner">
              <p>
                <span
                  className="stories-dot"
                  style={{ background: selected.house.badgeColor }}
                  aria-hidden="true"
                />
                โพสต์ของ <strong>{selected.name}</strong> · {selected.type}
              </p>
              <Link className="stories-text-link" href="/contents">
                ดูของทุกคน
                <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
              </Link>
            </div>
          )}

          {magazine ? (
            <MagazineSpread featured={featured} />
          ) : visible.length ? (
            // Client component for the GSAP scroll reveal.
            <ContentsGrid posts={visible} />
          ) : (
            <div className="stories-empty">
              <p>
                {query
                  ? `ไม่พบเรื่องที่ตรงกับ “${q!.trim()}”`
                  : "ยังไม่มีโพสต์ในหมวดนี้"}
              </p>
              <span>
                {query
                  ? "ลองค้นหาด้วยคำอื่น หรือกลับไปดูเรื่องแนะนำ"
                  : "รอติดตามเร็ว ๆ นี้ หรือกลับไปดูเรื่องแนะนำ"}
              </span>
              <Link className="stories-cta" href="/contents">
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
