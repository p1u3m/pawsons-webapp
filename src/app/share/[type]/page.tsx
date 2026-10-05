import { notFound } from "next/navigation";
import { characters, getCharacter } from "@/lib/data";
import ShareCard from "@/components/share-card";
import { BackButton } from "@/components/paper-ui";
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
    <div className="wrap min-h-[70vh] page-top pb-[90px]">
      <div className="mb-7">
        <BackButton href={`/results/${type}`} label="กลับไปดูผล" />
      </div>
      <ShareCard character={c} />
    </div>
  );
}
