import { getAllContents } from "@/lib/supabase/contents";
import Link from "next/link";
import AdminEditorPanel from "@/components/admin-editor-panel";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = { title: "Content Admin · Pawsons" };

export default async function AdminContentsPage() {
  const contents = await getAllContents();

  return (
    <div className="admin-contents-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Little Stories</h1>
          <p className="admin-page-sub">
            โพสต์สถานการณ์และคำคมบนหน้า Contents
          </p>
        </div>
        <Link className="admin-site-link" href="/contents" target="_blank">
          ดูหน้าเว็บไซต์ ↗
        </Link>
      </header>

      <AdminEditorPanel contents={contents} />
    </div>
  );
}
