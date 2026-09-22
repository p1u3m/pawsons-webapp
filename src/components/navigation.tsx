"use client";
import { useState, useEffect } from "react";
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

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="header-wrapper">
      <header className="site-header">
        <Link
          href="/"
          className="brand"
          aria-label="Pawsons หน้าแรก"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/logos/Logo_main.svg"
            width={130}
            height={30}
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
          <span>Find your Pawson</span>
          <span className="icon-disc" aria-hidden="true">
            <ArrowUpRightIcon size={14} weight="bold" />
          </span>
        </Link>
        <button
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
        >
          {open ? <XIcon size={20} weight="bold" /> : <ListIcon size={20} weight="bold" />}
        </button>

      </header>
        {open && (
          <>
            <div
              className="mobile-nav-backdrop"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <nav
              id="mobile-menu"
              className="mobile-nav"
              aria-label="เมนูมือถือ"
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
              }}
            >
              <Link href="/" onClick={() => setOpen(false)}>
                <span>หน้าแรก</span>
                <span className="eyebrow">Home</span>
              </Link>
              {links.map(([href, label]) => (
                <Link
                  href={href}
                  key={href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname.startsWith(href) ? "page" : undefined}
                >
                  <span>{label}</span>
                  <ArrowUpRightIcon size={16} />
                </Link>
              ))}
              <Link href="/quiz" className="button" onClick={() => setOpen(false)}>
                <span>Find your Pawson</span>
                <span className="icon-disc" aria-hidden="true">
                  <ArrowUpRightIcon size={14} weight="bold" />
                </span>
              </Link>
            </nav>
          </>
        )}
    </div>
  );
}
