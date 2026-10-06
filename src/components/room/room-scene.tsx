"use client";

import { CoinsIcon, LockSimpleIcon } from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition, type CSSProperties } from "react";
import { unlockRoom } from "@/app/room/actions";
import { formatCoins } from "@/lib/coins";
import type { Character } from "@/lib/data";
import { roomPrice } from "@/lib/rooms";
import { announceCoinBalance } from "@/lib/use-coins";
import { cn } from "@/lib/utils";
import { signButton } from "../paper-ui";
import { IconDisc, pillButton } from "../pill-button";
import { getRoomTheme, roomThemes } from "./room-themes";

const RoomCanvas = dynamic(() => import("./room-canvas"), { ssr: false });

const STORAGE_KEY = "pawsons-room";

export default function RoomScene({
  character,
  unlocked,
  balance: initialBalance,
}: {
  character: Character | null;
  unlocked: string[];
  balance: number;
}) {
  const [owned, setOwned] = useState(unlocked);
  const [balance, setBalance] = useState(initialBalance);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Start in the member's own house room (or any room they own).
  const home = character?.house.id;
  const [roomId, setRoomId] = useState<string>(
    home && owned.includes(home)
      ? home
      : (owned[0] ?? home ?? roomThemes[0].id),
  );

  // Go back to the room the member picked last, if they still own it.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && unlocked.includes(saved)) setRoomId(saved);
    } catch {}
  }, [unlocked]);

  function choose(id: string) {
    setRoomId(id);
    setError(null);
    if (owned.includes(id)) {
      try {
        localStorage.setItem(STORAGE_KEY, id);
      } catch {}
    }
  }

  function unlock() {
    setError(null);
    startTransition(async () => {
      const result = await unlockRoom(theme.id);
      if (!result.success) {
        setError(result.error ?? "ปลดล็อคไม่สำเร็จ");
        return;
      }
      setOwned((rooms) => [...rooms, theme.id]);
      if (result.balance !== undefined) {
        setBalance(result.balance);
        announceCoinBalance(result.balance);
      }
      try {
        localStorage.setItem(STORAGE_KEY, theme.id);
      } catch {}
    });
  }

  const theme = getRoomTheme(roomId);
  const locked = !owned.includes(theme.id);
  const canAfford = balance >= roomPrice;

  return (
    <>
      <section className="relative aspect-square md:aspect-[3/2]">
        <RoomCanvas
          theme={theme}
          characterSrc={character?.image ?? null}
          alt={
            character
              ? `ห้องของคุณ มี ${character.name} อยู่ข้างใน`
              : "ห้องว่างที่รอเพื่อนตัวน้อย"
          }
        />
      </section>
      {!character ? (
        <div className="mt-5 flex flex-col items-center gap-3 text-center">
          <p className="text-body-sm leading-[1.7]">
            ทำแบบทดสอบเพื่อพบเพื่อนตัวน้อย แล้วจะได้ห้องของบ้านตัวเองไปเลย
          </p>
          <Link href="/quiz" className={pillButton({ variant: "gradient" })}>
            <span>Find your Pawson</span>
            <IconDisc>↗</IconDisc>
          </Link>
        </div>
      ) : locked ? (
        <div className="mt-5 flex flex-col items-center gap-2.5 text-center">
          <p className="flex items-center gap-2 text-body font-semibold">
            <LockSimpleIcon size={18} weight="bold" aria-hidden="true" />
            <span>
              ห้อง <span lang="en">{theme.name}</span> ยังล็อคอยู่
            </span>
          </p>
          <button
            type="button"
            onClick={unlock}
            disabled={pending || !canAfford}
            className={cn(
              signButton,
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            <CoinsIcon size={18} weight="fill" aria-hidden="true" />
            {pending
              ? "กำลังปลดล็อค..."
              : `ปลดล็อค · ${formatCoins(roomPrice)} Coin`}
          </button>
          <p
            className="text-caption text-ink-muted"
            role={error ? "alert" : undefined}
          >
            {error ??
              (canAfford ? (
                <>
                  คุณมี {formatCoins(balance)} Coin ·{" "}
                  <Link href="/coins" className="underline">
                    ดูประวัติ
                  </Link>
                </>
              ) : (
                <>
                  Coin ไม่พอ (มี {formatCoins(balance)}) ·{" "}
                  <Link href="/coins" className="underline">
                    ดู Coin ของคุณ
                  </Link>
                </>
              ))}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-center text-caption text-ink-muted">
          ลากเพื่อนไปวางตรงไหนก็ได้ · แตะพื้นให้เดินไป · แตะที่ตัวให้เด้ง
        </p>
      )}

      <div
        role="radiogroup"
        aria-label="เลือกห้อง"
        className="focus-ink mt-7 grid grid-cols-2 gap-3 md:grid-cols-4"
      >
        {roomThemes.map((t) => {
          const active = t.id === theme.id;
          const isLocked = !owned.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => choose(t.id)}
              className="press-card flex items-center gap-2.5 rounded-card-sm border p-2.5 text-left [--depth:3px]"
              style={
                {
                  background: active ? t.house.color : "var(--color-cream)",
                  borderColor: active
                    ? t.house.badgeColor
                    : "var(--color-line)",
                  "--ledge": active ? t.house.badgeColor : undefined,
                } as CSSProperties
              }
            >
              <span
                className="grid size-10 shrink-0 place-items-center rounded-full"
                style={{ background: t.house.color }}
              >
                <Image
                  src={t.sigil}
                  alt=""
                  width={28}
                  height={28}
                  className={cn("size-7", isLocked && "opacity-50 grayscale")}
                />
              </span>
              <span className="grid min-w-0">
                <span
                  className="text-body-sm leading-tight font-bold"
                  lang="en"
                >
                  {t.name}
                </span>
                <span className="flex items-center gap-1 text-caption text-ink-muted">
                  {isLocked ? (
                    <>
                      <LockSimpleIcon
                        size={12}
                        weight="bold"
                        aria-hidden="true"
                      />
                      <span>ยังล็อคอยู่</span>
                    </>
                  ) : t.id === character?.house.id ? (
                    "ห้องของคุณ"
                  ) : (
                    "ปลดล็อคแล้ว"
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
