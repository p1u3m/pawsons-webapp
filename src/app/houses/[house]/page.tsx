import HouseDetail from "./house-detail";
import { notFound } from "next/navigation";
import { houses } from "@/lib/data";

export function generateStaticParams() {
  return houses.map((h) => ({ house: h.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ house: string }>;
}) {
  const { house } = await params;
  const h = houses.find((h) => h.id === house);
  return { title: h ? `${h.name} House` : "Four houses" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ house: string }>;
}) {
  const { house } = await params;
  const h = houses.find((h) => h.id === house);
  if (!h) notFound();
  return <HouseDetail house={h} />;
}
