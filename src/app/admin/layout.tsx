import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-label">ADMIN</span>
          <span className="admin-brand-name">Pawsons</span>
        </div>
        <nav className="admin-nav">
          <Link href="/admin/contents" className="admin-nav-item active">
            <span className="admin-nav-dot" />
            Content
          </Link>
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-back-site">
            <ArrowLeftIcon size={14} weight="bold" />
            Back to site
          </Link>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
