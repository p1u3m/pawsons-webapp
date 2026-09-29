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
          <h1 className="admin-page-title">16 Situations</h1>
          <p className="admin-page-sub">
            ดูแลทุกเรื่องราวของ Pawsons ให้พร้อมสำหรับผู้อ่าน
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
