"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveQuizResult } from "@/lib/supabase/profile";
import type { Character } from "@/lib/data";

export default function SaveResultCard({
  character,
  vibe,
}: {
  character: Character;
  vibe?: string;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setChecking(false);
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true);
        const metaChar = user.user_metadata?.assigned_character;
        if (metaChar?.toUpperCase() === character.type.toUpperCase()) {
          setIsSaved(true);
        }
      }
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
      setIsSaved(true);
      router.refresh();
    }
    setLoading(false);
  }

  if (checking) return null;

  return (
    <div className="save-result-box">
      {isSaved ? (
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
          <p>พาน้อง <strong>{character.name}</strong> ไปเป็นเพื่อนร่วมห้องพักใจของคุณไหม?</p>
          <button
            className="button"
            onClick={handleSave}
            disabled={loading}
          >
            <span>{loading ? "กำลังบันทึก..." : `🏡 บันทึก ${character.name} เข้าห้องของคุณ`}</span>
            <span className="icon-disc" aria-hidden="true">
              ✓
            </span>
          </button>
        </div>
      ) : (
        <div className="save-result-guest">
          <p>เข้าสู่ระบบเพื่อบันทึก <strong>{character.name}</strong> เข้าห้องส่วนตัวของคุณ</p>
        </div>
      )}
    </div>
  );
}
