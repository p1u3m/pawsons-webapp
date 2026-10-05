"use client";
import { houseBackground } from "@/lib/data";
import { useState } from "react";
import Link from "next/link";
import type { Character } from "@/lib/data";
import { cn } from "@/lib/utils";
import { CharacterImage } from "./character-ui";
import { Eyebrow, IconDisc, pillButton, textLink } from "./pill-button";

async function loadImage(src: string) {
  const img = new window.Image();
  img.src = src;
  await img.decode();
  return img;
}

export default function ShareCard({ character: c }: { character: Character }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function makeCard() {
    const englishFont = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-fredoka")
      .trim() || '"LINE Seed EN"';
    await Promise.all([
      document.fonts.load(`400 32px ${englishFont}`),
      document.fonts.load(`600 90px ${englishFont}`),
    ]);
    await document.fonts.ready;
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");

    const wash = ctx.createLinearGradient(0, 0, 1080, 1920);
    wash.addColorStop(0, c.house.gradientStart);
    wash.addColorStop(0.55, c.house.color);
    wash.addColorStop(1, c.house.gradientEnd);
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.fillStyle = "#181818";
    ctx.textAlign = "center";
    ctx.font = `32px ${englishFont}`;
    ctx.fillText("A LITTLE PIECE OF ME", 540, 270);
    ctx.font = `600 90px ${englishFont}`;
    const title = `I feel like ${c.name}.`;
    if (ctx.measureText(title).width > 940)
      ctx.font = `600 ${Math.floor((90 * 940) / ctx.measureText(title).width)}px ${englishFont}`;
    ctx.fillText(`I feel like ${c.name}.`, 540, 415);

    const img = await loadImage(c.image);
    const scale = Math.min(740 / img.width, 760 / img.height);
    ctx.drawImage(
      img,
      (1080 - img.width * scale) / 2,
      580 + (760 - img.height * scale) / 2,
      img.width * scale,
      img.height * scale,
    );

    ctx.fillStyle = c.house.ink;
    ctx.font = `600 66px ${englishFont}`;
    ctx.fillText(c.type, 540, 1450);
    ctx.font = `32px ${englishFont}`;
    ctx.fillText(`${c.house.name} House`, 540, 1510);
    ctx.fillStyle = "#181818";
    ctx.font = `36px ${englishFont}`;
    ctx.fillText("A little place to be you.", 540, 1670);

    const logo = await loadImage("/logos/Logo_main.svg");
    ctx.drawImage(logo, 390, 1760, 300, (300 * 215.37) / 1036.38);

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Cannot export"))),
        "image/png",
      ),
    );
  }

  async function save(share: boolean) {
    setBusy(true);
    setMessage("");
    try {
      const blob = await makeCard();
      const file = new File(
        [blob],
        `pawsons-${c.name.toLowerCase()}-story.png`,
        { type: "image/png" },
      );
      if (share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `My Pawson is ${c.name}`,
        });
        setMessage("แชร์การ์ดแล้ว");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        setMessage("บันทึกการ์ดแล้ว นำภาพไปเลือกใน Instagram Story ได้เลย");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setMessage("ยกเลิกการแชร์แล้ว");
      } else setMessage("สร้างการ์ดไม่สำเร็จ ลองอีกครั้งนะ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto my-[30px] grid max-w-[920px] grid-cols-2 items-center gap-[70px] max-[67.5rem]:grid-cols-1 max-[67.5rem]:gap-10 max-md:w-full max-md:gap-8 max-md:overflow-hidden">
      {/* 9:16 preview of the story card */}
      <div
        className="flex aspect-[9/16] w-[min(320px,100%)] max-w-full flex-col items-center justify-self-center rounded-card border border-white/60 px-5 pt-10 pb-6 text-center shadow-[0_20px_60px_-15px_rgb(24_24_24/0.15)] max-md:w-full max-md:max-w-[270px] max-md:px-4 max-md:pt-7 max-md:pb-5 tiny:max-w-[240px] tiny:px-3 tiny:pt-5 tiny:pb-4"
        style={{ background: houseBackground(c.house) }}
      >
        <span className="text-[10px] font-semibold tracking-[2px]">A LITTLE PIECE OF ME</span>
        <h2 className="mt-3.5 text-[24px] tracking-[-0.5px]">I feel like {c.name}.</h2>
        <CharacterImage
          character={c}
          className="mt-6 mb-4 h-[230px] min-h-0 w-full object-contain max-md:mt-3.5 max-md:mb-2.5 max-md:h-[175px] tiny:h-[150px]"
        />
        <strong className="text-[28px] tracking-[1.5px]" style={{ color: c.house.ink }}>
          {c.type}
        </strong>
        <p className="mt-1.5 text-[13px]">{c.house.name} House</p>
        <div className="mt-auto text-[26px] leading-[1.2] font-semibold tracking-[-1.2px]">
          pawsons
          <small className="mt-2 block text-[11px] font-normal tracking-[0.3px]">
            A little place to be you.
          </small>
        </div>
      </div>
      <div>
        <Eyebrow>KEEP A LITTLE FRIEND</Eyebrow>
        <h1 className="my-4 text-[clamp(34px,4vw,44px)]">
          ส่งต่อมุมเล็ก ๆ<br />
          ที่เป็นคุณ
        </h1>
        <p className="text-[16px] leading-[1.75]">
          เก็บการ์ดของ {c.name} ไว้ หรือส่งให้เพื่อนรู้จักคุณอีกนิด
        </p>
        <p className="mt-3.5 text-[13px] leading-[1.75]">
          ภาพขนาด 1080 × 1920 พร้อมใช้ใน IG Story
          <br />
          บันทึกภาพแล้วอัปโหลดผ่านแอป Instagram
        </p>
        <div className="mt-7 grid gap-3 max-md:w-full">
          <button className={cn(pillButton(), stackButton)} disabled={busy} onClick={() => save(false)}>
            <span>{busy ? "กำลังสร้างการ์ด…" : "ดาวน์โหลด Story Card"}</span>
            <IconDisc className="max-md:mr-0">↓</IconDisc>
          </button>
          <button
            className={cn(pillButton({ variant: "secondary" }), stackButton)}
            disabled={busy}
            onClick={() => save(true)}
          >
            <span>แชร์การ์ด</span>
            <IconDisc className="max-md:mr-0">↗</IconDisc>
          </button>
        </div>
        <p role="status" className="mt-3 min-h-7 text-[13px]">
          {message}
        </p>
        <Link className={textLink} href={`/characters/${c.type.toLowerCase()}`}>
          <span>กลับไปหา {c.name}</span>
          <span aria-hidden="true">↗</span>
        </Link>
        <div className="mt-7 border-t border-line pt-5 text-[14px]">
          Stickers & GIFs{" "}
          <span className="mt-1 block text-[12.5px] text-ink-muted">รอพบกันเร็ว ๆ นี้</span>
        </div>
      </div>
    </div>
  );
}

// Full-width buttons on phones, text allowed to wrap.
const stackButton = "max-md:w-full max-md:px-3 max-md:text-[14px] max-md:whitespace-normal";
