import { houseBackground } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { houses } from "@/lib/data";
import { PageIntro } from "@/components/ui";
export const metadata = { title: "Four houses" };
export default function Page() {
  return (
    <div className="wrap page-space">
      <PageIntro label="FOUR HOUSES, ONE LITTLE WORLD" title="มีที่ให้คุณเสมอ">
        บ้านทั้งสี่มีเสน่ห์ต่างกัน แต่ทุกบ้านอบอุ่นในแบบของตัวเอง
      </PageIntro>
      <div className="houses-grid">
        {houses.map((h) => (
          <Link
            className="house-card"
            key={h.id}
            href={`/houses/${h.id}`}
            style={{ background: houseBackground(h), color: h.ink }}
          >
            <Image
              src={`/houses/${h.sigil}`}
              width={200}
              height={200}
              alt={`ตราบ้าน ${h.name}`}
            />
            <span>{h.thai}</span>
            <h2>{h.name}</h2>
            <p>{h.description}</p>
            <span className="text-link">แวะเข้าบ้าน ↗</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
