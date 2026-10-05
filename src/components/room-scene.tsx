"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CharacterImage } from "./character-ui";
import { Eyebrow, IconDisc, pillButton } from "./pill-button";
import type { Profile } from "@/lib/supabase/profile";
import type { Character } from "@/lib/data";

export default function RoomScene({
  profile,
  character,
}: {
  profile: Profile;
  character: Character | null;
}) {
  // No character assigned — show a warm prompt to take the quiz
  if (!character) {
    return (
      <div className={roomCard}>
        <div className="px-6 pt-10 pb-12">
          <RoomWindow />
          <Eyebrow>YOUR ROOM</Eyebrow>
          <h1 className="mt-4 mb-2.5 text-[24px]">ห้องนี้กำลังรอเพื่อนตัวน้อยของคุณ</h1>
          <p className="mx-auto mb-6 max-w-[360px] leading-[1.7]">
            ลองทำแบบทดสอบเพื่อพบเพื่อนที่คล้ายคุณ
            <br />
            แล้วกลับมาที่นี่ เพื่อนจะรออยู่ในห้องนี้
          </p>
          <Link href="/quiz" className={pillButton({ variant: "gradient" })}>
            <span>Find your Pawson</span>
            <IconDisc>↗</IconDisc>
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile.display_name ?? "Friend";
  const greeting = getGreeting();

  return (
    <div className={roomCard}>
      <RoomWindow sky={getSky()} />

      <div className="px-7 pt-4 pb-10">
        <Eyebrow>{character.house.name.toUpperCase()} HOUSE</Eyebrow>
        <h1 className="mt-2 mb-1 text-[26px]">
          {greeting}, {displayName}
        </h1>
        <p className="mb-6 text-[14.5px]">
          {character.name} กำลังพักผ่อนอยู่ในห้องของคุณ
        </p>

        {/* Mascot */}
        <div
          className="mx-auto mb-5 flex aspect-square w-60 max-w-[85%] items-center justify-center rounded-full p-6 shadow-[0_12px_30px_-8px_rgb(24_24_24/0.08),inset_0_1px_3px_rgb(255_255_255/0.8)]"
          style={{ background: `linear-gradient(145deg, ${character.house.gradientStart}, ${character.house.color})` }}
        >
          <CharacterImage character={character} priority className="size-full object-contain" />
        </div>

        <div className="mb-5">
          <span
            className="mb-1.5 inline-block rounded-full px-3.5 py-1 text-[13px] font-bold tracking-[1px]"
            style={{ color: character.house.ink, background: character.house.color }}
          >
            {character.type}
          </span>
          <h2 className="mt-1 mb-1.5 text-[22px]">{character.name}</h2>
          <p className="mx-auto max-w-[380px] text-[15px]">{character.tagline}</p>
        </div>

        {profile.vibe && (
          <div className="mb-7 inline-flex items-center gap-1.5 rounded-full border border-green/20 bg-clover px-4 py-1.5 text-[13.5px] text-green-ink">
            <span>🌿 สิ่งที่ขาดไม่ได้ในที่พักใจ:</span>
            <strong>{profile.vibe}</strong>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2.5">
          <Link
            className={pillButton({ variant: "secondary" })}
            href={`/characters/${character.type.toLowerCase()}`}
          >
            <span>รู้จัก {character.name} ให้มากขึ้น</span>
            <IconDisc>→</IconDisc>
          </Link>
          <Link className={pillButton({ variant: "secondary" })} href="/quiz">
            <span>ทำแบบทดสอบอีกครั้ง</span>
            <IconDisc>↺</IconDisc>
          </Link>
        </div>
      </div>
    </div>
  );
}

const roomCard =
  "relative overflow-hidden rounded-panel border border-line bg-cream text-center shadow-card";

/** Small arched window; the sky follows the time of day. */
function RoomWindow({ sky }: { sky?: string }) {
  return (
    <div className="relative mx-auto mt-6 h-[70px] w-[120px] overflow-hidden rounded-t-[60px] border-[3px] border-b-4 border-[#e8e3d5] border-b-[#d5cebc] shadow-[inset_0_3px_8px_rgb(0_0_0/0.08)]">
      <div className={cn("size-full", sky)} />
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "ดึกแล้วนะ";
  if (hour < 12) return "อรุณสวัสดิ์";
  if (hour < 17) return "สวัสดีตอนบ่าย";
  if (hour < 21) return "สวัสดีตอนเย็น";
  return "ราตรีสวัสดิ์";
}

function getSky(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 8)
    return "bg-[linear-gradient(180deg,#ffc3a0_0%,#ffafbd_50%,#e0c3fc_100%)]";
  if (hour >= 8 && hour < 17) return "bg-[linear-gradient(180deg,#a1c4fd_0%,#c2e9fb_100%)]";
  if (hour >= 17 && hour < 20)
    return "bg-[linear-gradient(180deg,#f093fb_0%,#f5576c_60%,#4facfe_100%)]";
  return "bg-[linear-gradient(180deg,#0f2027_0%,#203a43_60%,#2c5364_100%)]";
}
