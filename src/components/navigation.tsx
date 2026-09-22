"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ListIcon, XIcon, ArrowUpRightIcon } from "@phosphor-icons/react";

const links = [
  ["/characters", "Characters"],
  ["/houses", "Houses"],
  ["/contents", "Contents"],
  ["/shop", "Shop"],
  ["/letters", "Letters"],
];
export default function Navigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="site-header">
      <Link
        href="/"
        className="brand"
        aria-label="Pawsons หน้าแรก"
        onClick={() => setOpen(false)}
      >
        <Image
          src="/logos/Logo_main.svg"
          width={150}
          height={32}
          alt="pawsons"
          priority
        />
      </Link>
      <nav className="desktop-nav" aria-label="เมนูหลัก">
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname.startsWith(href) ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <Link href="/quiz" className="button nav-quiz">
        Find your Pawson <ArrowUpRightIcon size={16} />
      </Link>
      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
      >
        {open ? <XIcon size={24} /> : <ListIcon size={24} />}
      </button>
      {open && (
        <nav
          id="mobile-menu"
          className="mobile-nav"
          aria-label="เมนูมือถือ"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <Link href="/" onClick={() => setOpen(false)}>
            หน้าแรก
          </Link>
          {links.map(([href, label]) => (
            <Link
              href={href}
              key={href}
              onClick={() => setOpen(false)}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          <Link href="/quiz" className="button" onClick={() => setOpen(false)}>
            Find your Pawson ↗
          </Link>
        </nav>
      )}
    </header>
  );
}
