import { PageIntro } from "@/components/ui";
import CharacterDirectory from "@/components/character-directory";
export const metadata = { title: "Characters" };
export default function Page() {
  return (
    <div className="wrap page-space">
      <PageIntro
        label="OUR LITTLE FRIENDS"
        title="ทุกตัวตน มีเรื่องราวของตัวเอง"
      >
        16 บุคลิก 4 บ้าน และอีกหลายมุมเล็ก ๆ ที่อยากให้คุณรู้จัก
      </PageIntro>
      <CharacterDirectory />
      <p className="prototype-note">
        คำบรรยายตัวละครในเว็บฉบับนี้เป็นเนื้อหาตัวอย่าง
        สามารถปรับให้ตรงกับเรื่องราวจริงได้
      </p>
    </div>
  );
}
