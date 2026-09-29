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

  return (
    <>
      {/* Desktop Navigation (>= 768px via CSS) */}
      <Navbar />

      {/* Mobile Top Floating Pill Bar (< 768px via CSS) */}
      <MobileTopBar onOpenAccount={() => setAccountOpen(true)} />

      {/* Mobile Bottom Floating Navigation Bar (< 768px via CSS) */}
      <BottomNav lettersBadge={lettersBadge} />

      {/* Mobile Account Bottom Sheet */}
      <AccountSheet
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
      />
    </>
  );
}

export { Navbar, MobileTopBar, BottomNav, AccountSheet };
