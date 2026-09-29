"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartBarIcon, FileTextIcon, PackageIcon } from "@phosphor-icons/react";

const items = [
  { href: "/admin", label: "Dashboard", icon: ChartBarIcon },
  { href: "/admin/contents", label: "คลังเนื้อหา", icon: FileTextIcon },
  { href: "/admin/shop", label: "สินค้าและออเดอร์", icon: PackageIcon },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-nav" aria-label="เมนูผู้ดูแล">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`admin-nav-item${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              size={18}
              weight={active ? "fill" : "regular"}
              aria-hidden="true"
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
