import { characters, getCharacter, type Character } from "@/lib/data";

export type PreviewKind = "sticker" | "postcard";

export type ShopPreview = {
  slug: string;
  kind: PreviewKind;
  character: Character;
  title: string;
  description: string;
};

const kinds: PreviewKind[] = ["sticker", "postcard"];
const featuredTypes = [
  "INFP",
  "INTP",
  "ESFJ",
  "ISFJ",
  "INTJ",
  "INFJ",
  "ENFP",
  "ESTP",
];

function makePreview(character: Character, kind: PreviewKind): ShopPreview {
  return {
    slug: `${character.type.toLowerCase()}-${kind}`,
    kind,
    character,
    title: `${character.name} · ${kind === "sticker" ? "Sticker" : "Postcard"}`,
    description:
      kind === "sticker"
        ? "ไอเดียสติกเกอร์เพื่อนตัวโปรด"
        : "ไอเดียโปสการ์ดส่งความรู้สึกดี ๆ",
  };
}

export const shopPreviews = characters.flatMap((character) =>
  kinds.map((kind) => makePreview(character, kind)),
);

export const featuredShopPreviews = featuredTypes.map((type, index) =>
  makePreview(getCharacter(type)!, index % 2 === 0 ? "sticker" : "postcard"),
);

export function getShopPreview(slug: string) {
  return shopPreviews.find((preview) => preview.slug === slug);
}

export function getCharacterPreviews(type: string) {
  const character = getCharacter(type);
  return character ? kinds.map((kind) => makePreview(character, kind)) : [];
}
