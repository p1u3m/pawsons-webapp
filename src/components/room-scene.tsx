"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { CharacterImage } from "./ui";
import type { Profile } from "@/lib/supabase/profile";
import type { Character } from "@/lib/data";

export default function RoomScene({
  profile,
  character,
}: {
  profile: Profile;
  character: Character | null;
}) {
  const mascotRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);

  // GSAP idle animation for the mascot
  useEffect(() => {
    if (!mascotRef.current || !character) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      // Entrance animation
      gsap.from(roomRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power2.out",
        clearProps: "all",
      });

      // Gentle floating idle
      gsap.to(mascotRef.current, {
        y: -8,
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Subtle head tilt
      gsap.to(mascotRef.current, {
        rotation: 2,
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.5,
      });
    });

    return () => media.revert();
  }, [character]);

  // No character assigned — show a warm prompt to take the quiz
  if (!character) {
    return (
      <div className="room-card" ref={roomRef}>
        <div className="room-empty">
          <div className="room-window">
            <div className="window-sky" />
          </div>
          <span className="eyebrow">YOUR ROOM</span>
          <h1>ห้องนี้กำลังรอเพื่อนตัวน้อยของคุณ</h1>
          <p>
            ลองทำแบบทดสอบเพื่อพบเพื่อนที่คล้ายคุณ
            <br />
            แล้วกลับมาที่นี่ เพื่อนจะรออยู่ในห้องนี้
          </p>
          <Link href="/quiz" className="button pawson-gradient">
            <span>Find your Pawson</span>
            <span className="icon-disc" aria-hidden="true">
              ↗
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile.display_name ?? "Friend";
  const greeting = getGreeting();

  return (
    <div className="room-card" ref={roomRef}>
      {/* Room window with time-based sky */}
      <div className="room-window">
        <div className={`window-sky ${getSkyClass()}`} />
      </div>

      {/* Room interior */}
      <div className="room-interior">
        <span className="eyebrow">{character.house.name.toUpperCase()} HOUSE</span>
        <h1>
          {greeting}, {displayName}
        </h1>
        <p className="room-subtitle">
          {character.name} กำลังพักผ่อนอยู่ในห้องของคุณ
        </p>

        {/* Mascot with idle animation */}
        <div
          className="room-mascot"
          ref={mascotRef}
          style={{ background: `linear-gradient(145deg, ${character.house.gradientStart}, ${character.house.color})` }}
        >
          <CharacterImage character={character} priority />
        </div>

        {/* Character info */}
        <div className="room-character-info">
          <span className="room-type-badge" style={{ color: character.house.ink, background: character.house.color }}>
            {character.type}
          </span>
          <h2>{character.name}</h2>
          <p>{character.tagline}</p>
        </div>

        {profile.vibe && (
          <div className="room-vibe">
            <span>🌿 สิ่งที่ขาดไม่ได้ในที่พักใจ:</span>
            <strong>{profile.vibe}</strong>
          </div>
        )}

        {/* Quick actions */}
        <div className="room-actions">
          <Link
            className="button secondary"
            href={`/characters/${character.type.toLowerCase()}`}
          >
            <span>รู้จัก {character.name} ให้มากขึ้น</span>
            <span className="icon-disc" aria-hidden="true">→</span>
          </Link>
          <Link className="button secondary" href="/quiz">
            <span>ทำแบบทดสอบอีกครั้ง</span>
            <span className="icon-disc" aria-hidden="true">↺</span>
          </Link>
        </div>
      </div>
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

function getSkyClass(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 8) return "sky-dawn";
  if (hour >= 8 && hour < 17) return "sky-day";
  if (hour >= 17 && hour < 20) return "sky-sunset";
  return "sky-night";
}
