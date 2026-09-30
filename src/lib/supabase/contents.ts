"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCharacter } from "@/lib/data";

/** One post on /contents. Categories and slots: see lib/posts.ts. */
export type ContentRow = {
  id: number;
  category: "situation" | "quote";
  character_type: string | null;
  /** Groups the same scenario across characters (situation posts). */
  situation_no: number | null;
  /** Situation title, or the quote itself. */
  situation_title: string;
  body_1: string | null;
  body_2: string | null;
  quote_author: string | null;
  /** Legacy pull quote from the old 16-situation stories; unused. */
  quote: string | null;
  /** null = the post is still waiting for its picture. */
  cover_image_url: string | null;
  /** Slot on the /contents magazine page (1 = lead story), null = list only. */
  featured_rank: number | null;
};

/** Number of admin-pickable slots on the /contents magazine page. */
const featuredSlots = 5;
const categories = ["situation", "quote"];

function revalidateContents(id?: number) {
  revalidatePath("/contents");
  revalidatePath("/admin/contents");
  if (id) revalidatePath(`/contents/${id}`);
}

/** Fetch a single content row. Returns null if not found. */
export async function getContent(id: number): Promise<ContentRow | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as ContentRow;
}

/** Fetch every post, newest first. */
export async function getAllContents(): Promise<ContentRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .order("id", { ascending: false });

  if (error || !data) return [];
  return data as ContentRow[];
}

/** Check if the current user is an admin. */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return data?.role === "admin";
}

/** Update a content row. Only admins can do this (enforced by RLS + server check). */
export async function updateContent(
  id: number,
  fields: {
    category?: string;
    character_type?: string;
    situation_no?: number | null;
    situation_title?: string;
    body_1?: string;
    body_2?: string;
    quote_author?: string | null;
    cover_image_url?: string | null;
  },
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  // Server-side admin check (defense-in-depth; RLS also guards this)
  const adminCheck = await isAdmin();
  if (!adminCheck) return { success: false, error: "Unauthorized" };

  if (fields.category !== undefined && !categories.includes(fields.category)) {
    return { success: false, error: "หมวดไม่ถูกต้อง" };
  }
  if (
    fields.character_type !== undefined &&
    !getCharacter(fields.character_type)
  ) {
    return { success: false, error: "ไม่พบตัวละครนี้" };
  }
  if (
    fields.situation_no != null &&
    (!Number.isInteger(fields.situation_no) || fields.situation_no < 1)
  ) {
    return { success: false, error: "เลขสถานการณ์ไม่ถูกต้อง" };
  }

  const { error } = await supabase
    .from("contents")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidateContents(id);
  return { success: true };
}

/** Add an empty post; the admin fills it in and adds the picture after. */
export async function createContent(): Promise<{
  row: ContentRow | null;
  error?: string;
}> {
  const supabase = await createClient();
  if (!supabase) return { row: null, error: "Not configured" };
  if (!(await isAdmin())) return { row: null, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("contents")
    .insert({
      category: "situation",
      character_type: "INTJ",
      situation_title: "โพสต์ใหม่",
    })
    .select("*")
    .single();
  if (error || !data) return { row: null, error: error?.message };

  revalidateContents();
  return { row: data as ContentRow };
}

/** Delete a post and its picture. */
export async function deleteContent(
  id: number,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };
  if (!(await isAdmin())) return { success: false, error: "Unauthorized" };

  const existing = await getContent(id);
  if (existing?.cover_image_url) {
    const path = extractStoragePath(existing.cover_image_url);
    if (path) await supabase.storage.from("content-images").remove([path]);
  }

  const { error } = await supabase.from("contents").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidateContents(id);
  return { success: true };
}

/**
 * Put a story in a featured slot (1-5) or take it out (null). The story that
 * held the slot before drops back to the full list.
 */
export async function setFeaturedRank(
  id: number,
  rank: number | null,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };
  if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
  if (
    rank !== null &&
    (!Number.isInteger(rank) || rank < 1 || rank > featuredSlots)
  ) {
    return { success: false, error: "Invalid slot" };
  }

  if (rank !== null) {
    const { error } = await supabase
      .from("contents")
      .update({ featured_rank: null })
      .eq("featured_rank", rank)
      .neq("id", id);
    if (error) return { success: false, error: error.message };
  }

  const { error } = await supabase
    .from("contents")
    .update({ featured_rank: rank, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidateContents();
  return { success: true };
}

/** Helper to extract filename/path inside content-images bucket from a full public URL */
function extractStoragePath(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const parts = url.pathname.split("/content-images/");
    if (parts.length > 1) {
      return decodeURIComponent(parts[1]);
    }
    return decodeURIComponent(url.pathname.split("/").pop() || "");
  } catch {
    const parts = imageUrl.split("/content-images/");
    if (parts.length > 1) {
      return decodeURIComponent(parts[1].split("?")[0]);
    }
    return decodeURIComponent(imageUrl.split("/").pop()?.split("?")[0] || "");
  }
}

/** Delete a cover image from storage and clear the DB row */
export async function deleteContentImage(
  id: number,
  imageUrl?: string | null,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const adminCheck = await isAdmin();
  if (!adminCheck) return { success: false, error: "Unauthorized" };

  // If imageUrl not passed, fetch existing URL from DB
  let urlToDelete = imageUrl;
  if (!urlToDelete) {
    const content = await getContent(id);
    urlToDelete = content?.cover_image_url;
  }

  if (urlToDelete) {
    const storagePath = extractStoragePath(urlToDelete);
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from("content-images")
        .remove([storagePath]);
      if (storageError) {
        console.error("Storage delete error:", storageError);
      }
    }
  }

  // Update DB row to set cover_image_url to null
  await updateContent(id, { cover_image_url: null });

  revalidatePath(`/contents/${id}`);
  revalidatePath("/contents");
  return { success: true };
}

/** Upload a cover image for a content item. Cleans up any prior image from storage. */
export async function uploadContentImage(
  id: number,
  formData: FormData,
): Promise<{ url: string | null; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { url: null, error: "Not configured" };

  const adminCheck = await isAdmin();
  if (!adminCheck) return { url: null, error: "Unauthorized" };

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { url: null, error: "No file provided" };
  }

  // Clean up any existing image before uploading a new one
  const existing = await getContent(id);
  if (existing?.cover_image_url) {
    const oldPath = extractStoragePath(existing.cover_image_url);
    if (oldPath) {
      await supabase.storage.from("content-images").remove([oldPath]);
    }
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `posts/content-${id}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("content-images")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { url: null, error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("content-images").getPublicUrl(path);

  // Also save URL to the row immediately
  await updateContent(id, { cover_image_url: publicUrl });

  return { url: publicUrl };
}

