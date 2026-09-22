"use client";
import { houseBackground } from "@/lib/data";

import { useState } from "react";
import Link from "next/link";
import type { Character } from "@/lib/data";
import { CharacterImage } from "./ui";
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
    ctx.fillStyle = "#111111";
    ctx.textAlign = "center";
    ctx.font = '32px "LINE Seed EN"';
    ctx.fillText("A LITTLE PIECE OF ME", 540, 270);
    ctx.font = '600 90px "LINE Seed EN"';
    const title = `I feel like ${c.name}.`;
    if (ctx.measureText(title).width > 940)
      ctx.font = `600 ${Math.floor((90 * 940) / ctx.measureText(title).width)}px "LINE Seed EN"`;
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
    ctx.font = '600 66px "LINE Seed EN"';
    ctx.fillText(c.type, 540, 1450);
    ctx.font = '32px "LINE Seed EN"';
    ctx.fillText(`${c.house.name} House`, 540, 1510);
    ctx.fillStyle = "#111111";
    ctx.font = '36px "LINE Seed EN"';
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
    <div className="share-layout">
      <div
        className="story-preview"
        style={{ background: houseBackground(c.house) }}
      >
        <span>A LITTLE PIECE OF ME</span>
        <h2>I feel like {c.name}.</h2>
        <CharacterImage character={c} />
        <strong style={{ color: c.house.ink }}>{c.type}</strong>
        <p>{c.house.name} House</p>
        <div className="story-footer">
          pawsons<small>A little place to be you.</small>
        </div>
      </div>
      <div className="share-copy">
        <span className="eyebrow">KEEP A LITTLE FRIEND</span>
        <h1>
          ส่งต่อมุมเล็ก ๆ<br />
          ที่เป็นคุณ
        </h1>
        <p>เก็บการ์ดของ {c.name} ไว้ หรือส่งให้เพื่อนรู้จักคุณอีกนิด</p>
        <p className="muted">
          ภาพขนาด 1080 × 1920 พร้อมใช้ใน IG Story
          <br />
          บันทึกภาพแล้วอัปโหลดผ่านแอป Instagram
        </p>
        <div className="stack-actions">
          <button
            className="button"
            disabled={busy}
            onClick={() => save(false)}
          >
            {busy ? "กำลังสร้างการ์ด…" : "ดาวน์โหลด Story Card ↓"}
          </button>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => save(true)}
          >
            แชร์การ์ด ↗
          </button>
        </div>
        <p role="status" className="share-status">
          {message}
        </p>
        <Link
          className="text-link"
          href={`/characters/${c.type.toLowerCase()}`}
        >
          กลับไปหา {c.name} ↗
        </Link>
        <div className="coming-note">
          Stickers & GIFs <span>รอพบกันเร็ว ๆ นี้</span>
        </div>
      </div>
    </div>
  );
}
