import { getAllContents } from "@/lib/supabase/contents";
import type { ContentRow } from "@/lib/supabase/contents";
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
            แก้ไขเนื้อหาของทั้ง 16 สถานการณ์ — การเปลี่ยนแปลงจะมีผลทันที
          </p>
        </div>
      </header>

      <AdminEditorPanel contents={contents} />
    </div>
  );
}
