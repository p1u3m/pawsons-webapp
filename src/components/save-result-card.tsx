"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProfile, saveQuizResult } from "@/lib/supabase/profile";
import type { Character } from "@/lib/data";

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
    <div className="save-result-box">
      {isCurrentCompanion ? (
        <div className="save-result-saved">
          <p>
            🌿 <strong>{character.name}</strong> กำลังรอคุณอยู่ในห้องส่วนตัวแล้ว
          </p>
          <Link href="/room" className="button pawson-gradient">
            <span>ไปยังห้องของคุณ</span>
            <span className="icon-disc" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      ) : isLoggedIn ? (
        <div className="save-result-action">
          <p>
            พาน้อง <strong>{character.name}</strong> ไปเป็นเพื่อนร่วมห้องพักใจของคุณไหม?
          </p>
          <button
            type="button"
            className="button"
            onClick={handleSave}
            disabled={loading}
          >
            <span>
              {loading
                ? "กำลังบันทึก..."
                : `🏡 เลือก ${character.name} เป็นเพื่อนในห้อง`}
            </span>
            <span className="icon-disc" aria-hidden="true">
              ✓
            </span>
          </button>
        </div>
      ) : (
        <div className="save-result-guest">
          <p>
            เข้าสู่ระบบเพื่อเลือก <strong>{character.name}</strong> เป็นเพื่อนร่วมห้องของคุณ
          </p>
        </div>
      )}
    </div>
  );
}
