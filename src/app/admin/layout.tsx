import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import AdminNav from "@/components/admin-nav";
import "./admin.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-label">ADMIN</span>
          <span className="admin-brand-name">Pawsons</span>
        </div>
        <AdminNav />
        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-back-site">
            <ArrowLeftIcon size={14} weight="bold" />
            Back to site
          </Link>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
