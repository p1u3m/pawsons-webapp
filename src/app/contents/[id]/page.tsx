import { houseBackground } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { characters, getCharacter } from "@/lib/data";
import { BackLink } from "@/components/ui";
import { getContent } from "@/lib/supabase/contents";
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = await getContent(Number(id));
  return {
    title: content
      ? `${content.situation_title} · Pawsons`
      : "Little Stories · Pawsons",
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ character?: string }>;
}) {
  const { id } = await params;
  const { character } = await searchParams;
  const index = Number(id) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= 16) notFound();

  const c = (character && getCharacter(character)) || characters[index];
  const content = await getContent(Number(id));

  const title = content?.situation_title ?? `สถานการณ์ที่ ${id}`;
  const body1 =
    content?.body_1 ??
    `สำหรับ ${c.name} บางวันก็ไม่จำเป็นต้องมีอะไรพิเศษ แค่ได้หยุดฟังความรู้สึกของตัวเองสักนิด ก็เป็นการเริ่มต้นที่ดีแล้ว`;
  const body2 =
    content?.body_2 ??
    `${c.description} วันนี้เลยอยากชวนคุณวางเรื่องที่ยังไม่ต้องรีบไว้ก่อน แล้วให้เวลากับสิ่งเล็ก ๆ ที่ทำให้สบายใจ`;
  const quote =
    content?.quote ?? `"ค่อย ๆ ไปก็ได้ เราอยู่ตรงนี้ด้วยกันนะ"`;

  return (
    <article className="wrap page-space story-open">
      {/* Back nav */}
      <BackLink
        href={character ? `/contents?character=${c.type}` : "/contents"}
      >
        กลับไปอ่านเรื่องอื่น
      </BackLink>

      {/* Header: eyebrow + large situaton number */}
      <div className="story-header">
        <span className="eyebrow">16 SITUATIONS · {c.name}</span>
        <span className="story-num" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h1 className="story-title">{title}</h1>

      {/* Art banner */}
      <div
        className="story-banner"
        style={{ background: houseBackground(c.house) }}
      >
        {content?.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.cover_image_url}
            alt={title}
            className="story-banner-cover"
          />
        ) : (
          <Image
            src={c.image}
            alt={`${c.name} · ${c.type}`}
            width={480}
            height={480}
            className="story-banner-char"
            priority
          />
        )}
      </div>

      {/* Body */}
      <div className="story-body">
        <p>{body1}</p>
        <p>{body2}</p>
        <blockquote className="story-quote">{quote}</blockquote>
      </div>

      {/* Actions */}
      <div className="story-actions">
        <Link className="button" href={`/characters/${c.type.toLowerCase()}`}>
          <span>รู้จัก {c.name}</span>
          <span className="icon-disc" aria-hidden="true">
            <ArrowUpRightIcon size={14} weight="bold" />
          </span>
        </Link>
        <Link
          className="text-link"
          href={`/contents/${((index + 1) % 16) + 1}${character ? `?character=${c.type}` : ""}`}
        >
          <span>เรื่องถัดไป</span>
          <ArrowRightIcon size={15} weight="bold" />
        </Link>
      </div>
    </article>
  );
}
