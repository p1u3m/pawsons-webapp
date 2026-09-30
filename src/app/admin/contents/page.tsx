import { redirect } from "next/navigation";
import AdminContentsManager from "@/components/admin-contents-manager";
import {
  getAllContents,
  getCategories,
  isAdmin,
} from "@/lib/supabase/contents";

export const dynamic = "force-dynamic";
export const metadata = { title: "คลังเนื้อหา · Pawsons Admin" };

export default async function AdminContentsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; filter?: string }>;
}) {
  if (!(await isAdmin())) redirect("/");
  const [params, contents, categories] = await Promise.all([
    searchParams,
    getAllContents(),
    getCategories(),
  ]);
  return (
    <AdminContentsManager
      contents={contents}
      categories={categories}
      initialFilter={params.filter}
      startNew={params.new === "1"}
    />
  );
}
