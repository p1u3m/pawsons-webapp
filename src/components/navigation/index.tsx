"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import MobileTopBar from "./mobile-top-bar";
import BottomNav from "./bottom-nav";
import AccountSheet from "./account-sheet";

interface NavigationProps {
  /** Optional badge for Letters tab in bottom nav (can be count or boolean dot) */
  lettersBadge?: number | boolean | string;
}

export default function Navigation({ lettersBadge }: NavigationProps) {
  const [accountOpen, setAccountOpen] = useState(false);
  const pathname = usePathname();

  // Close account sheet when route changes
  useEffect(() => {
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setAccountOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  // Admin has its own sidebar and header.
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Desktop Navigation (>= 768px via CSS) */}
      <Navbar />

      {/* Mobile scrolling brand header (< 768px via CSS) */}
      <MobileTopBar />

      {/* Mobile Bottom Floating Navigation Bar (< 768px via CSS) */}
      <BottomNav
        lettersBadge={lettersBadge}
        accountOpen={accountOpen}
        onOpenAccount={() => setAccountOpen(true)}
      />

      {/* Mobile Account Bottom Sheet */}
      <AccountSheet
        lettersBadge={lettersBadge}
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
      />
    </>
  );
}

export { Navbar, MobileTopBar, BottomNav, AccountSheet };
