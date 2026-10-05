import Image from "next/image";
import type { CSSProperties } from "react";
import characterArt from "@/lib/character-art.json";
import type { Character } from "@/lib/data";
import { cn } from "@/lib/utils";

const groupPlacement = [
  "z-1 -rotate-7",
  "z-3 h-[50cqw] w-[calc(50cqw*var(--hero-ratio))]",
  "z-2 h-[47cqw] w-[calc(47cqw*var(--hero-ratio))]",
  "z-0 rotate-7",
];

/** Page-hero art: the given friends standing together (one friend stands alone, larger). */
export function HeroFriends({ friends }: { friends: Character[] }) {
  const single = friends.length === 1;

  return (
    <div
      data-hero-friends
      className="@container relative isolate flex aspect-[1.3] w-[min(80%,340px)] items-end justify-center justify-self-center pb-[9%] before:absolute before:bottom-[10%] before:left-1/2 before:-z-2 before:aspect-square before:w-[66%] before:-translate-x-1/2 before:rounded-full before:bg-[radial-gradient(circle_at_50%_45%,var(--color-cream)_0_58%,rgb(255_253_249/0)_71%)] before:content-[''] after:absolute after:bottom-[6%] after:left-1/2 after:-z-1 after:h-[9%] after:w-[86%] after:-translate-x-1/2 after:rounded-full after:bg-[radial-gradient(closest-side,rgb(24_24_24/0.12),rgb(24_24_24/0))] after:content-[''] split:w-[min(100%,480px)]"
      aria-hidden="true"
    >
      {friends.map((friend, i) => (
        <span
          key={friend.type}
          data-hero-character={friend.type}
          style={
            {
              "--hero-ratio":
                characterArt[friend.type].width /
                characterArt[friend.type].height,
            } as CSSProperties
          }
          className={cn(
            "relative h-[38cqw] w-[calc(38cqw*var(--hero-ratio))] flex-none origin-bottom drop-shadow-[0_6px_10px_rgb(24_24_24/0.08)]",
            single
              ? "h-[58cqw] w-[calc(58cqw*var(--hero-ratio))]"
              : cn("-mx-[7cqw]", groupPlacement[i]),
          )}
        >
          <Image
            src={friend.image}
            alt=""
            width={480}
            height={480}
            sizes="(max-width: 860px) 45vw, 240px"
            priority
            className="absolute inset-0 size-full object-contain object-bottom"
          />
        </span>
      ))}
    </div>
  );
}
