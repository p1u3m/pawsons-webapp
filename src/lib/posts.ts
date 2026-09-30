import { characters, getCharacter, type Character } from "@/lib/data";
import type { ContentRow } from "@/lib/supabase/contents";

/** Slots on the /contents magazine spread, in featured_rank order. */
export const featuredSlotCount = 5;

export const postCategories = {
  situation: { label: "สถานการณ์", english: "Situations" },
  quote: { label: "คำคม", english: "Quotes" },
} as const;

export type PostCategory = keyof typeof postCategories;

export function isPostCategory(value: unknown): value is PostCategory {
  return typeof value === "string" && Object.hasOwn(postCategories, value);
}

export type Post = {
  id: number;
  category: PostCategory;
  title: string;
  lines: string[];
  author: string | null;
  situationNo: number | null;
  /** null = the post is still waiting for its picture. */
  image: string | null;
  character: Character;
  featuredRank: number | null;
};

export function toPost(row: ContentRow): Post {
  return {
    id: row.id,
    category: isPostCategory(row.category) ? row.category : "situation",
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
