import { houseBackground } from "@/lib/data";
import Link from "next/link";
import { PageIntro, CharacterImage } from "@/components/ui";
import { characters, getCharacter, situations } from "@/lib/data";
export const metadata = { title: "Little stories" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ character?: string }>;
}) {
  const { character } = await searchParams;
  const selected = character ? getCharacter(character) : undefined;
  return (
    <div className="wrap page-space">
      <PageIntro
        label="LITTLE STORIES"
        title={
          selected
            ? `วันเล็ก ๆ ของ ${selected.name}`
            : "เรื่องธรรมดา ที่ไม่ธรรมดาสำหรับเรา"
        }
      >
        บางเรื่องทำให้ยิ้ม บางเรื่องทำให้รู้ว่าเราไม่ได้รู้สึกแบบนี้คนเดียว
      </PageIntro>
      <div className="content-tabs">
        <span className="filter active">16 Situations</span>
        {["Dukdik", "Franchise Rosters", "Pair Conflicts"].map((t) => (
          <span key={t} className="pending-tab">
            {t}
            <small>เร็ว ๆ นี้</small>
          </span>
        ))}
      </div>
      {selected && (
        <Link className="text-link" href="/contents">
          ดูเรื่องราวของเพื่อนทุกคน ↗
        </Link>
      )}
      <p className="prototype-note align-left">
        เรื่องราวตัวอย่างสำหรับจัดวางโครงเว็บ
      </p>
      <div className="situations-grid">
        {situations.map((title, i) => {
          const c = selected || characters[i];
          return (
            <Link
              className="situation-card"
              key={title}
              href={`/contents/${i + 1}${selected ? `?character=${selected.type}` : ""}`}
            >
              <div
                className="situation-art"
                style={{ background: houseBackground(c.house) }}
              >
                <CharacterImage character={c} />
              </div>
              <span>
                {c.name} · {c.type}
              </span>
              <h2>{title}</h2>
              <span className="text-link">อ่านเรื่องนี้ ↗</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
