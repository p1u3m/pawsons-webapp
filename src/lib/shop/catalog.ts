import { createClient } from "@/lib/supabase/server";
import { shopImageBucket } from "@/lib/shop/images";

export type ShopProduct = {
  slug: string;
  title: string;
  description: string;
  kind: "sticker" | "postcard";
  character_type: string;
  price_satang: number;
  stock_qty: number;
  active: boolean;
  is_test: boolean;
  sort_order: number;
  image_path: string | null;
  /** Public URL of the uploaded photo, derived from image_path. */
  image_url: string | null;
};

const productColumns =
  "slug,title,description,kind,character_type,price_satang,stock_qty,active,is_test,sort_order,image_path";

type SupabaseClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;
type ProductRow = Omit<ShopProduct, "image_url">;

function withImageUrl(supabase: SupabaseClient, row: ProductRow): ShopProduct {
  return {
    ...row,
    image_url: row.image_path
      ? supabase.storage.from(shopImageBucket).getPublicUrl(row.image_path).data
          .publicUrl
      : null,
  };
}

export async function getProducts(
  includeInactive = false,
): Promise<ShopProduct[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  let query = supabase
    .from("shop_products")
    .select(productColumns)
    .order("sort_order")
    .order("slug");
  if (!includeInactive) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw new Error(`Unable to load shop products: ${error.message}`);
  return ((data ?? []) as ProductRow[]).map((row) =>
    withImageUrl(supabase, row),
  );
}

/** Sandbox checkout is enabled only when every server secret it needs exists. */
export function isCheckoutReady() {
  return (
    process.env.STRIPE_MODE === "sandbox" &&
    Boolean(process.env.STRIPE_API_KEY) &&
    Boolean(process.env.SUPABASE_SECRET_KEY)
  );
}
