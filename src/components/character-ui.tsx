import { houseBackground } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/lib/data";
import type { ReactNode } from "react";

export function CharacterImage({
  character,
  priority = false,
  className = "",
}: {
  character: Character;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      className={`character-image ${className}`}
      src={character.image}
      alt={`${character.name} · ${character.type}`}
      width={480}
      height={480}
      sizes="(max-width: 640px) 45vw, 360px"
      priority={priority}
    />
  );
}

/** Card for the /characters pages (styles: app/characters/characters.css). */
export function CharacterTile({ character: c }: { character: Character }) {
  return (
    <Link
      className="chars-card"
      href={`/characters/${c.type.toLowerCase()}`}
      style={{ "--house": c.house.badgeColor } as React.CSSProperties}
    >
      <span
        className="chars-card-art"
        style={{ background: houseBackground(c.house) }}
      >
        <Image
          src={c.image}
          alt=""
          width={480}
          height={480}
          sizes="(max-width: 767px) 45vw, 260px"
        />
      </span>
      <span className="chars-card-body">
        <span className="chars-card-name">
          {c.name}
          <span className="chars-type">{c.type}</span>
        </span>
        <span className="chars-card-tagline">{c.tagline}</span>
      </span>
    </Link>
  );
}

export function PageIntro({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-intro mb-11 max-w-[780px]">
      <span className="eyebrow">{label}</span>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </header>
  );
}

export function BackLink({
  href = "/characters",
  children = "กลับไปหาเพื่อน ๆ",
}: {
  href?: string;
  children?: ReactNode;
}) {
  return (
    <Link className="back-link" href={href}>
      <span aria-hidden="true">←</span>
      <span>{children}</span>
    </Link>
  );
}
