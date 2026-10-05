"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProfile, saveQuizResult } from "@/lib/supabase/profile";
import type { Character } from "@/lib/data";
import { IconDisc, pillButton } from "./pill-button";

export default function SaveResultCard({
  character,
  vibe,
}: {
  character: Character;
  vibe?: string;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCurrentCompanion, setIsCurrentCompanion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsCurrentCompanion(false);
    setChecking(true);
    getProfile()
      .then((profile) => {
        if (profile) {
          setIsLoggedIn(true);
          const isMatch =
            profile.assigned_character?.trim().toUpperCase() ===
            character.type.trim().toUpperCase();
          setIsCurrentCompanion(isMatch);
        }
      })
      .finally(() => {
        setChecking(false);
      });
  }, [character.type]);

  async function handleSave() {
    setLoading(true);
    const res = await saveQuizResult(
      character.type,
      character.house.id,
      vibe ?? null,
    );
    if (res.success) {
      setIsCurrentCompanion(true);
      router.refresh();
    } else {
      console.error("Save error:", res.error);
    }
    setLoading(false);
  }

  if (checking) return null;

  return (
    <div className="mx-auto mt-5 mb-7 max-w-[440px] rounded-card-sm border border-dashed border-line-strong bg-paper-soft px-5 py-4 text-center">
      {isCurrentCompanion ? (
        <div className="flex flex-col items-center gap-2">
          <p className="mb-1.5 text-[14.5px] font-medium text-green-ink">
            🌿 <strong>{character.name}</strong> กำลังรอคุณอยู่ในห้องส่วนตัวแล้ว
          </p>
          <Link href="/room" className={pillButton({ variant: "gradient" })}>
            <span>ไปยังห้องของคุณ</span>
            <IconDisc>→</IconDisc>
          </Link>
        </div>
      ) : isLoggedIn ? (
        <div>
          <p className="mb-3 text-[14.5px] text-ink">
            พาน้อง <strong>{character.name}</strong> ไปเป็นเพื่อนร่วมห้องพักใจของคุณไหม?
          </p>
          <button
            type="button"
            className={pillButton({ size: "sm" })}
            onClick={handleSave}
            disabled={loading}
          >
            <span>
              {loading
                ? "กำลังบันทึก..."
                : `🏡 เลือก ${character.name} เป็นเพื่อนในห้อง`}
            </span>
            <IconDisc className="mr-0">✓</IconDisc>
          </button>
        </div>
      ) : (
        <p className="text-[13.5px]">
          เข้าสู่ระบบเพื่อเลือก <strong>{character.name}</strong> เป็นเพื่อนร่วมห้องของคุณ
        </p>
      )}
    </div>
  );
}
