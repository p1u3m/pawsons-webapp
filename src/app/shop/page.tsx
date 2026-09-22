import { houseBackground } from "@/lib/data";
import { PageIntro, CharacterImage } from "@/components/ui";
import { characters, getCharacter } from "@/lib/data";
import Link from "next/link";
export const metadata = { title: "Little shop" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ character?: string }>;
}) {
  const { character } = await searchParams;
  const selected = character ? getCharacter(character) : undefined;
  const items = selected
    ? [selected]
    : [characters[5], characters[4], characters[9], characters[15]];
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
        <p>สินค้าและภาพด้านล่างเป็นตัวอย่าง ยังไม่เปิดรับคำสั่งซื้อ</p>
      </div>
      {selected && (
        <Link className="text-link" href="/shop">
          ดูตัวอย่างสินค้าทั้งหมด ↗
        </Link>
      )}
      <div className="shop-grid">
        {items.map((c, i) => (
          <article key={c.type} className="product">
            <div
              className="product-art"
              style={{ background: houseBackground(c.house) }}
            >
              <div
                className={`product-paper ${i % 2 ? "postcard" : "sticker"}`}
              >
                <CharacterImage character={c} />
                {i % 2 === 1 && <span>A little hello from {c.name}.</span>}
              </div>
            </div>
            <span className="product-state">COMING SOON</span>
            <h2>
              {c.name} · {i % 2 ? "Postcard" : "Sticker"}
            </h2>
            <p>
              {i % 2 ? "โปสการ์ดส่งความรู้สึกดี ๆ" : "สติกเกอร์เพื่อนตัวโปรด"}
            </p>
            <Link
              className="text-link"
              href={`/characters/${c.type.toLowerCase()}`}
            >
              รู้จัก {c.name} ↗
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
