import { characters, getCharacter, type Character } from "@/lib/data";
import type { ContentRow } from "@/lib/supabase/contents";

/** Slots on the /contents magazine spread, in featured_rank order. */
export const featuredSlotCount = 5;

export const postLayouts = {
  situation: "สถานการณ์ (ชื่อเรื่อง + ข้อความ)",
  quote: "คำคม (ข้อความ + ผู้กล่าว)",
} as const;
export type PostLayout = keyof typeof postLayouts;

/** A post tag from content_categories; layout decides how its posts are written and shown. */
export type ContentCategory = {
  slug: string;
  label: string;
  english: string;
  layout: PostLayout;
  sort_order: number;
};

/** The built-in tags, used when the table cannot be read. */
export const defaultCategories: ContentCategory[] = [
  {
    slug: "situation",
    label: "สถานการณ์",
    english: "Situations",
    layout: "situation",
    sort_order: 10,
  },
  {
    slug: "quote",
    label: "คำคม",
    english: "Quotes",
    layout: "quote",
    sort_order: 20,
  },
];
export const builtInCategories = defaultCategories.map(
  (category) => category.slug,
);

export function isPostLayout(value: unknown): value is PostLayout {
  return typeof value === "string" && Object.hasOwn(postLayouts, value);
}

export type Post = {
  id: number;
  category: ContentCategory;
  title: string;
  lines: string[];
  author: string | null;
  situationNo: number | null;
  /** null = the post is still waiting for its picture. */
  image: string | null;
  character: Character;
  featuredRank: number | null;
};

export function toPost(row: ContentRow, categories: ContentCategory[]): Post {
  return {
    id: row.id,
    category: categories.find((category) => category.slug === row.category) ?? {
      ...defaultCategories[0],
      slug: row.category,
      label: row.category,
    },
    title: row.situation_title,
    lines: [row.body_1, row.body_2].filter((line): line is string =>
      Boolean(line?.trim()),
    ),
    author: row.quote_author?.trim() || null,
    situationNo: row.situation_no,
    image: row.cover_image_url,
    character:
      (row.character_type && getCharacter(row.character_type)) || characters[0],
    featuredRank: row.featured_rank,
  };
}

/**
 * The admin's picks in slot order. Empty slots take the newest posts with a
 * picture that are not already picked; with too few posts a slot stays empty
 * (null) and shows as a frame waiting for its picture.
 */
export function featuredPosts(posts: Post[]): (Post | null)[] {
  const slots = Array.from(
    { length: featuredSlotCount },
    (_, i) => posts.find((post) => post.featuredRank === i + 1) ?? null,
  );
  const rest = posts.filter((post) => post.image && !slots.includes(post));
  return slots.map((post) => post ?? rest.shift() ?? null);
}
