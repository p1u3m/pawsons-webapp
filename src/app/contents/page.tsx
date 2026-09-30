import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { characters, getCharacter, houses } from "@/lib/data";
import { getAllContents } from "@/lib/supabase/contents";
import {
  featuredPosts,
  isPostCategory,
  postCategories,
  toPost,
  type PostCategory,
} from "@/lib/posts";
import ContentsGrid from "@/components/contents-grid";
import { StoriesMagazine } from "@/components/stories-magazine";

export const metadata = { title: "Little Stories · Pawsons" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

// One friend from three different houses for the hero.
const heroFriends = [characters[1], characters[6], characters[13]];

type Filters = {
  character?: string;
  category?: string;
  house?: string;
  view?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Filters>;
}) {
  const { character, category, house, view } = await searchParams;
  const selected = character ? getCharacter(character) : undefined;
  const currentCategory = isPostCategory(category) ? category : undefined;
  const currentHouse = houses.find((item) => item.id === house);
  // The magazine is the default; any filter switches to the grid.
  const magazine =
    !selected && !currentCategory && !currentHouse && view !== "all";

  const posts = (await getAllContents()).map(toPost);
  const visible = posts.filter(
    (post) =>
      (!selected || post.character.type === selected.type) &&
      (!currentCategory || post.category === currentCategory) &&
      (!currentHouse || post.character.house.id === currentHouse.id),
  );
  const filterHref = (next: {
    category?: PostCategory | null;
    house?: string | null;
  }) => {
    const params = new URLSearchParams();
    const nextCategory =
      next.category === undefined ? currentCategory : next.category;
    const nextHouse = next.house === undefined ? currentHouse?.id : next.house;
    if (selected) params.set("character", selected.type);
    if (nextCategory) params.set("category", nextCategory);
    if (nextHouse) params.set("house", nextHouse);
    if (!params.size) params.set("view", "all");
    return `/contents?${params}`;
  };
  const artFriends = selected ? [selected] : heroFriends;

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
              width={320}
              height={320}
              priority
            />
          ))}
        </div>
      </section>

      <section className="stories-band" aria-label="เรื่องราว">
        <div className="wrap">
          <div className="stories-toolbar">
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
              {(Object.keys(postCategories) as PostCategory[]).map((value) => (
                <Link
                  key={value}
                  className="stories-tab"
                  href={filterHref({
                    category: currentCategory === value ? null : value,
                  })}
                  aria-current={currentCategory === value ? "page" : undefined}
                >
                  {postCategories[value].label}
                  <small>
                    {posts.filter((post) => post.category === value).length}
                  </small>
                </Link>
              ))}
              {!selected && (
                <>
                  <span className="stories-tabs-divider" aria-hidden="true" />
                  {houses.map((item) => {
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
                  })}
                </>
              )}
            </nav>
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
              </Link>
            </div>
          )}

          {magazine ? (
            <StoriesMagazine posts={posts} featured={featuredPosts(posts)} />
          ) : visible.length ? (
            // Client component for the GSAP scroll reveal.
            <ContentsGrid posts={visible} />
          ) : (
            <div className="stories-empty">
              <p>ยังไม่มีโพสต์ในหมวดนี้</p>
              <span>รอติดตามเร็ว ๆ นี้ หรือกลับไปดูเรื่องแนะนำ</span>
              <Link className="stories-cta" href="/contents">
                ดูเรื่องแนะนำ
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
