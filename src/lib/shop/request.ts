import "server-only";

/** True when the request comes from this site (blocks cross-site POSTs). */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  let originUrl: URL | null = null;
  try {
    if (origin) originUrl = new URL(origin);
  } catch {
    /* Invalid origin. */
  }
  return Boolean(
    originUrl &&
    host &&
    originUrl.host === host &&
    (originUrl.protocol === "https:" ||
      (originUrl.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(originUrl.hostname))),
  );
}

/** Validates the cart lines sent by the browser. */
export function parseCartItems(raw: unknown) {
  const items = (raw as { items?: unknown })?.items;
  if (
    !Array.isArray(items) ||
    items.length < 1 ||
    items.length > 20 ||
    items.some(
      (item) =>
        !item ||
        typeof item.slug !== "string" ||
        !/^[a-z0-9-]+$/.test(item.slug) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 10,
    ) ||
    new Set(items.map((item) => item.slug)).size !== items.length
  )
    return null;
  return items.map(({ slug, quantity }) => ({
    slug: slug as string,
    quantity: quantity as number,
  }));
}
