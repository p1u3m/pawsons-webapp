import { PageIntro } from "@/components/ui";
import { PreviewArt } from "@/components/shop/preview-art";
import {
  featuredShopPreviews,
  getCharacterPreviews,
  type PreviewKind,
} from "@/lib/shop/preview-catalog";
import Link from "next/link";

export const metadata = { title: "Little shop" };

type ShopSearchParams = {
  character?: string;
  kind?: string;
  demo?: string;
};

function filterHref(kind: PreviewKind | "all", character?: string) {
  const params = new URLSearchParams();
  if (character) params.set("character", character);
  if (kind !== "all") params.set("kind", kind);
  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const { character, kind, demo } = await searchParams;
  const sandboxReady =
    process.env.NODE_ENV === "development" &&
    process.env.STRIPE_MODE === "sandbox" &&
    Boolean(process.env.STRIPE_API_KEY);
  const selectedPreviews = character ? getCharacterPreviews(character) : [];
  const hasSelectedCharacter = selectedPreviews.length > 0;
  const currentKind: PreviewKind | "all" =
    kind === "sticker" || kind === "postcard" ? kind : "all";
  const previews = hasSelectedCharacter
    ? selectedPreviews
    : featuredShopPreviews;
  const visiblePreviews =
    currentKind === "all"
      ? previews
      : previews.filter((preview) => preview.kind === currentKind);
  const selectedCharacter = hasSelectedCharacter
    ? selectedPreviews[0].character
    : undefined;

  return (
    <div className="wrap page-space">
      <PageIntro
        label="THE LITTLE SHOP"
        title="พาเพื่อนตัวน้อย กลับไปอยู่ใกล้ ๆ"
      >
        ของเล็ก ๆ ที่อยากให้วันธรรมดาของคุณอบอุ่นขึ้น
      </PageIntro>

      <div className="shop-notice">
        <span>กำลังเตรียมร้านด้วยความตั้งใจ</span>
        <p>
          ภาพด้านล่างเป็นไอเดียตัวอย่าง ยังไม่มีสินค้า ราคา หรือสต็อกจริง
          และยังไม่เปิดรับคำสั่งซื้อ
        </p>
      </div>

      {sandboxReady && (
        <section
          className="shop-sandbox-panel"
          aria-labelledby="shop-sandbox-title"
        >
          <div>
            <span className="eyebrow">SANDBOX ONLY</span>
            <h2 id="shop-sandbox-title">ลองระบบชำระเงิน</h2>
            <p>
              รายการทดสอบ 100 บาท ไม่มีการตัดเงินจริง ไม่ใช่สินค้าด้านล่าง
              และไม่มีการสร้างออเดอร์หรือจัดส่ง
            </p>
          </div>
          <form action="/api/stripe/demo-checkout" method="post">
            <button className="button shop-sandbox-button" type="submit">
              ทดลองจ่าย 100 บาท <span aria-hidden="true">↗</span>
            </button>
          </form>
        </section>
      )}

      {demo === "error" && (
        <p className="shop-demo-error" role="alert">
          เปิดหน้าทดสอบไม่สำเร็จ กรุณาตรวจคีย์ sandbox ใน .env.local
          แล้วลองอีกครั้ง
        </p>
      )}

      {selectedCharacter && (
        <div className="shop-selected-heading">
          <p>ไอเดียสินค้า: {selectedCharacter.name}</p>
          <Link className="text-link" href="/shop">
            <span>ดูตัวอย่างทั้งหมด</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      )}

      <nav className="shop-filters" aria-label="ประเภทตัวอย่างสินค้า">
        {(
          [
            ["all", "ทั้งหมด"],
            ["sticker", "สติกเกอร์"],
            ["postcard", "โปสการ์ด"],
          ] as const
        ).map(([value, label]) => (
          <Link
            key={value}
            className={`shop-filter${currentKind === value ? " is-active" : ""}`}
            href={filterHref(value, selectedCharacter?.type)}
            aria-current={currentKind === value ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="shop-grid">
        {visiblePreviews.map((preview) => (
          <article key={preview.slug} className="product">
            <PreviewArt preview={preview} />
            <span className="product-state">ตัวอย่าง · ยังไม่จำหน่าย</span>
            <h2>{preview.title}</h2>
            <p>{preview.description}</p>
            <Link className="text-link" href={`/shop/${preview.slug}`}>
              <span>ดูไอเดียนี้</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
