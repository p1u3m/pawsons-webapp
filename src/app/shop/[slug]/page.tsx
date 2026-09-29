import { PreviewArt } from "@/components/shop/preview-art";
import { BackLink } from "@/components/ui";
import { getShopPreview, shopPreviews } from "@/lib/shop/preview-catalog";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return shopPreviews.map(({ slug }) => ({ slug }));
}

export default async function ShopPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const preview = getShopPreview(slug);
  if (!preview) notFound();

  return (
    <main className="wrap page-space shop-detail">
      <BackLink href="/shop">กลับไปดูไอเดียทั้งหมด</BackLink>
      <div className="shop-detail-grid">
        <PreviewArt preview={preview} large />
        <div className="shop-detail-copy">
          <span className="eyebrow">THE LITTLE SHOP · PREVIEW</span>
          <h1>{preview.title}</h1>
          <p>{preview.description}</p>
          <div className="shop-detail-notice">
            <strong>ไอเดียสินค้า ยังไม่เปิดขาย</strong>
            <p>
              ภาพนี้เป็นภาพประกอบตัวอย่างจากตัวละคร ยังไม่ใช่รูปสินค้าจริง ราคา
              ขนาด วัสดุ และจำนวนคงเหลือจะเพิ่มเมื่อเตรียมสินค้าพร้อม
            </p>
          </div>
          <Link
            className="text-link"
            href={`/characters/${preview.character.type.toLowerCase()}`}
          >
            <span>รู้จัก {preview.character.name}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
