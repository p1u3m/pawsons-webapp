"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/supabase/contents";
import { createClient } from "@/lib/supabase/server";
import { getCharacter } from "@/lib/data";
import { isProductKind } from "@/lib/shop/kinds";
import {
  maxProductImageBytes,
  productImageTypes,
  shopImageBucket,
} from "@/lib/shop/images";
import {
  carriers,
  fulfillmentLabel,
  trackingPattern,
  type Carrier,
  type FulfillmentStatus,
} from "@/lib/shop/orders";

function textValue(data: FormData, key: string) {
  return String(data.get(key) ?? "").trim();
}
function integer(data: FormData, key: string) {
  const value = Number(data.get(key));
  return Number.isSafeInteger(value) ? value : NaN;
}

export async function saveProduct(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const slug = textValue(formData, "slug").toLowerCase();
  const title = textValue(formData, "title");
  const description = textValue(formData, "description");
  const kind = textValue(formData, "kind");
  const character_type = textValue(formData, "character_type").toUpperCase();
  const priceBaht = integer(formData, "price_baht");
  const stock_qty = integer(formData, "stock_qty");
  const sort_order = integer(formData, "sort_order");
  const active = formData.get("active") === "on";
  const isEdit = formData.get("mode") === "edit";
  const upload = formData.get("image");
  const image = upload instanceof File && upload.size > 0 ? upload : null;
  const removeImage = formData.get("remove_image") === "on";
  // Reopen the same sheet on failure so the admin keeps their context.
  const sheet =
    isEdit && /^[a-z0-9-]+$/.test(slug)
      ? `edit=${slug}`
      : "new=1";
  if (
    !/^[a-z0-9-]+$/.test(slug) ||
    title.length < 1 ||
    title.length > 120 ||
    description.length > 1000 ||
    !isProductKind(kind) ||
    !getCharacter(character_type) ||
    priceBaht < 1 ||
    priceBaht > 100000 ||
    stock_qty < 0 ||
    stock_qty > 100000 ||
    !Number.isSafeInteger(sort_order)
  ) {
    redirect(`/admin/shop?error=invalid&${sheet}`);
  }
  const extension = image
    ? productImageTypes[image.type as keyof typeof productImageTypes]
    : null;
  if (image && (!extension || image.size > maxProductImageBytes)) {
    redirect(`/admin/shop?error=image&${sheet}`);
  }
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase unavailable");
  const storage = supabase.storage.from(shopImageBucket);

  // Remember the current file so it can be deleted once the row points elsewhere.
  let previousPath: string | null = null;
  if (isEdit) {
    const { data } = await supabase
      .from("shop_products")
      .select("image_path")
      .eq("slug", slug)
      .maybeSingle();
    previousPath = data?.image_path ?? null;
  }

  // Upload before the row write so the saved row never points at a missing file.
  let uploadedPath: string | null = null;
  if (image && extension) {
    const path = `${slug}/${Date.now()}.${extension}`;
    const { error: uploadError } = await storage.upload(path, image, {
      contentType: image.type,
      cacheControl: "31536000",
    });
    if (uploadError) redirect(`/admin/shop?error=upload&${sheet}`);
    uploadedPath = path;
  }
  const imagePath = uploadedPath ?? (removeImage ? null : undefined);

  const payload = {
    slug,
    title,
    description,
    kind,
    character_type,
    price_satang: priceBaht * 100,
    stock_qty,
    sort_order,
    active,
    is_test: true,
    updated_at: new Date().toISOString(),
    ...(imagePath !== undefined && { image_path: imagePath }),
  };
  // New products insert so an existing slug is reported instead of overwritten.
  const { error } = isEdit
    ? await supabase.from("shop_products").update(payload).eq("slug", slug)
    : await supabase.from("shop_products").insert(payload);
  if (error) {
    if (uploadedPath) await storage.remove([uploadedPath]);
    redirect(
      `/admin/shop?error=${error.code === "23505" ? "duplicate" : "save"}&${sheet}`,
    );
  }
  // Best effort: a leftover file is harmless, a broken product image is not.
  if (previousPath && imagePath !== undefined && previousPath !== imagePath) {
    await storage.remove([previousPath]);
  }
  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);
  revalidatePath("/admin/shop");
  redirect(`/admin/shop?saved=${slug}`);
}

export async function updateFulfillment(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const id = textValue(formData, "order_id");
  const carrierValue = textValue(formData, "carrier");
  const tracking = textValue(formData, "tracking_number").replace(/\s+/g, "").toUpperCase();
  const selected = textValue(formData, "fulfillment_status") as FulfillmentStatus;
  // A tracking number means the parcel has left, so an unshipped order becomes shipped.
  const fulfillment =
    carrierValue && tracking && (selected === "unfulfilled" || selected === "preparing")
      ? "shipped"
      : selected;
  const back = textValue(formData, "back");
  // Only return to admin shop URLs, keeping the list filters the admin was on.
  const returnTo = /^\/admin\/shop(\?[\w=&%-]*)?$/.test(back) ? back : "/admin/shop?tab=orders";
  const withParam = (key: string, value: string) =>
    `${returnTo}${returnTo.includes("?") ? "&" : "?"}order=${id}&${key}=${value}`;
  if (!/^[0-9a-f-]{36}$/.test(id)) redirect(returnTo);
  const needsTracking = fulfillment === "shipped";
  if (
    !Object.hasOwn(fulfillmentLabel, fulfillment) ||
    (carrierValue && !Object.hasOwn(carriers, carrierValue)) ||
    (tracking && !trackingPattern.test(tracking)) ||
    (needsTracking && (!carrierValue || !tracking))
  ) {
    redirect(withParam("error", needsTracking ? "tracking" : "fulfillment"));
  }
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase unavailable");
  const { data, error } = await supabase
    .from("shop_orders")
    .update({
      fulfillment_status: fulfillment,
      carrier: (carrierValue || null) as Carrier | null,
      tracking_number: tracking || null,
    })
    .eq("id", id)
    .eq("status", "paid")
    .select("id")
    .maybeSingle();
  if (error || !data) redirect(withParam("error", "fulfillment"));
  revalidatePath("/admin/shop");
  revalidatePath("/admin");
  revalidatePath("/shop/orders");
  revalidatePath(`/shop/orders/${id}`);
  redirect(withParam("updated", "1"));
}
