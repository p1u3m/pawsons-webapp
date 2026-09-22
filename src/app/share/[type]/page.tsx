import { notFound } from "next/navigation";
import { characters, getCharacter } from "@/lib/data";
import ShareCard from "@/components/share-card";
import { BackLink } from "@/components/ui";
export function generateStaticParams() {
  return characters.map((c) => ({ type: c.type.toLowerCase() }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const c = getCharacter(type);
  if (!c) notFound();
  return (
    <div className="wrap page-space">
      <BackLink href={`/results/${type}`}>กลับไปดูผล</BackLink>
      <ShareCard character={c} />
    </div>
  );
}
