"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ContentRow = {
  id: number;
  situation_title: string;
  body_1: string | null;
  body_2: string | null;
  quote: string | null;
  character_type: string | null;
  cover_image_url: string | null;
  category: string;
};

/** Fetch a single content row (1-16). Returns null if not found. */
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

/** Fetch all 16 content rows ordered by id. */
export async function getAllContents(): Promise<ContentRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .order("id");

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
    situation_title?: string;
    body_1?: string;
    body_2?: string;
    quote?: string;
    cover_image_url?: string | null;
  },
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  // Server-side admin check (defense-in-depth; RLS also guards this)
  const adminCheck = await isAdmin();
  if (!adminCheck) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("contents")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/contents/${id}`);
  revalidatePath("/contents");
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
  const path = `content-${id}-${Date.now()}.${ext}`;

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

