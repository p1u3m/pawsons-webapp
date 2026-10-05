import { houseBackground } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { characters, getCharacter } from "@/lib/data";
import { CharacterImage } from "@/components/character-ui";
import { Eyebrow, IconDisc, pillButton, textLink } from "@/components/pill-button";
import SaveResultCard from "@/components/save-result-card";

export function generateStaticParams() {
  return characters.map((c) => ({ type: c.type.toLowerCase() }));
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams?: Promise<{ vibe?: string }>;
}) {
  const { type } = await params;
  const { vibe } = (await searchParams) || {};
  const c = getCharacter(type);
  if (!c) notFound();

  return (
    <div className="wrap max-w-[720px] pt-10 pb-20 text-center">
      <div className="rounded-[36px] border border-line bg-cream px-10 py-14 shadow-card max-md:rounded-[28px] max-md:px-5 max-md:py-7">
        <Eyebrow>A LITTLE PIECE OF YOU</Eyebrow>
        <h1 className="mt-4">You feel like {c.name}.</h1>
        <p>{c.tagline}</p>

        {vibe && (
          <div className="mx-auto mt-3 mb-5 inline-flex items-center gap-1.5 rounded-full border border-green/22 bg-clover px-[18px] py-1.5 text-[14px] font-medium text-[#2f5d3e]">
            <span>🌿 สิ่งที่ขาดไม่ได้ในที่พักใจ: <strong>{vibe}</strong></span>
          </div>
        )}

        <div
          className="relative mx-auto mt-6 mb-8 aspect-square w-[320px] max-w-full rounded-full p-8 shadow-[inset_0_1px_3px_rgb(255_255_255/0.8)]"
          style={{ background: houseBackground(c.house) }}
        >
          <CharacterImage
            character={c}
            priority
            className="size-full object-contain"
          />
          <span
            className="absolute right-2 bottom-4 rounded-full border border-line bg-cream px-[18px] py-1.5 text-[18px] font-semibold tracking-[1px] shadow-soft"
            style={{ color: c.house.ink }}
          >
            {c.type}
          </span>
        </div>

        <p className="mx-auto mb-6 max-w-[480px] text-[16.5px] leading-[1.8]">{c.description}</p>
        <Link
          href={`/houses/${c.house.id}`}
          className="mb-3 inline-block rounded-full bg-ink/5 px-3.5 py-1 text-[13.5px] font-medium"
        >
          {c.house.name} House ↗
        </Link>

        <SaveResultCard character={c} vibe={vibe} />

        <div className="mt-8 mb-4 flex flex-wrap justify-center gap-3">
          <Link className={pillButton()} href={`/share/${c.type.toLowerCase()}`}>
            <span>แชร์เพื่อนของคุณ</span>
            <IconDisc>↗</IconDisc>
          </Link>
          <Link
            className={pillButton({ variant: "secondary" })}
            href={`/characters/${c.type.toLowerCase()}`}
          >
            <span>รู้จัก {c.name} ให้มากขึ้น</span>
            <IconDisc>→</IconDisc>
          </Link>
        </div>

        <div className="mt-6">
          <Link href="/quiz" className={textLink}>
            <span>ลองทำอีกครั้ง</span>
            <span aria-hidden="true">↺</span>
          </Link>
        </div>

        <p className="mt-12 text-[12px] leading-[1.7] text-ink-faint">
          ผลจากแบบทดสอบตัวอย่างเพื่อความสนุก
          <br />
          คุณเป็นได้มากกว่าบุคลิกเพียงแบบเดียวเสมอ
        </p>
      </div>
    </div>
  );
}
