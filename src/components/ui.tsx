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

export function CharacterCard({ character }: { character: Character }) {
  return (
    <Link
      className="character-card"
      href={`/characters/${character.type.toLowerCase()}`}
    >
      <div
        className="portrait"
        style={{ background: houseBackground(character.house) }}
      >
        <CharacterImage character={character} />
        <span className="portrait-arrow" aria-hidden="true">
          ↗
        </span>
      </div>
      <div className="character-label">
        <h3>{character.name}</h3>
        <span className="type-pill">{character.type}</span>
      </div>
      <p>{character.tagline}</p>
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
    <header className="page-intro">
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
