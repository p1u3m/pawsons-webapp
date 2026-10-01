"use client";

import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import AuthButton from "../auth-button";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "./nav-links";

export default function Navbar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const isInitialRender = useRef(true);

  // GSAP animation for active nav indicator & button on route change
  useEffect(() => {
    if (!navRef.current || !indicatorRef.current) return;

    const nav = navRef.current;
    const indicator = indicatorRef.current;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const activeLink = nav.querySelector<HTMLAnchorElement>(
      'a[aria-current="page"]',
    );

    if (activeLink) {
      const targetX = activeLink.offsetLeft;
      const targetY = activeLink.offsetTop;
      const targetW = activeLink.offsetWidth;
      const targetH = activeLink.offsetHeight;
      const activeIcon =
        activeLink.querySelector<HTMLElement>("[data-nav-icon]");

      if (isInitialRender.current || reducedMotion) {
        // Immediate position on initial mount (no jarring jump)
        gsap.set(indicator, {
          x: targetX,
          y: targetY,
          width: targetW,
          height: targetH,
          opacity: 1,
          scale: 1,
        });
        isInitialRender.current = false;
      } else {
        // Fast, snappy glide across navigation
        gsap.to(indicator, {
          x: targetX,
          y: targetY,
          width: targetW,
          height: targetH,
          opacity: 1,
          scale: 1,
          duration: 0.22,
          ease: "power2.out",
          overwrite: "auto",
        });

        // Crisp, subtle tactile pop
        if (activeIcon) {
          gsap.fromTo(
            activeIcon,
            { scale: 0.9 },
            {
              scale: 1,
              duration: 0.2,
              ease: "power2.out",
              overwrite: "auto",
            },
          );
        }

        gsap.fromTo(
          activeLink,
          { scale: 0.97 },
          {
            scale: 1,
            duration: 0.18,
            ease: "power2.out",
            overwrite: "auto",
          },
        );
      }
    } else {
      // Home page or non-listed route: quickly fade out
      if (reducedMotion) {
        gsap.set(indicator, { opacity: 0, scale: 0.9 });
      } else {
        gsap.to(indicator, {
          opacity: 0,
          scale: 0.9,
          duration: 0.15,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
      isInitialRender.current = false;
    }
  }, [pathname]);

  // Window resize handler: keep indicator aligned to active tab
  useEffect(() => {
    function handleResize() {
      if (navRef.current && indicatorRef.current) {
        const activeLink = navRef.current.querySelector<HTMLAnchorElement>(
          'a[aria-current="page"]',
        );
        if (activeLink) {
          gsap.set(indicatorRef.current, {
            x: activeLink.offsetLeft,
            y: activeLink.offsetTop,
            width: activeLink.offsetWidth,
            height: activeLink.offsetHeight,
          });
        }
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleNavClick(event: MouseEvent<HTMLAnchorElement>) {
    const indicator = indicatorRef.current;
    if (!indicator) return;
    const link = event.currentTarget;
    const target = {
      x: link.offsetLeft,
      y: link.offsetTop,
      width: link.offsetWidth,
      height: link.offsetHeight,
      opacity: 1,
      scale: 1,
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(indicator, target);
    } else {
      gsap.to(indicator, {
        ...target,
        duration: 0.18,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }

  return (
    <div className="pointer-events-none sticky top-4 z-50 w-full px-4 max-md:hidden">
      <header className="pointer-events-auto relative z-49 mx-auto flex h-16 max-w-[1040px] items-center justify-between gap-6 rounded-full border border-ink/8 bg-cream py-2 pr-3 pl-6 shadow-[0_16px_36px_-10px_rgb(74_68_53/0.12),0_2px_6px_rgb(74_68_53/0.04)] transition-all duration-350 ease-spring max-[67.5rem]:h-[58px] max-[67.5rem]:gap-3 max-[67.5rem]:py-1.5 max-[67.5rem]:pr-2 max-[67.5rem]:pl-[18px]">
        <Link href="/" className="group flex shrink-0 items-center pr-2" aria-label="Pawsons Home">
          <Image
            src="/logos/Logo_main.svg"
            width={130}
            height={30}
            alt="pawsons"
            priority
            className="h-7 w-[125px] object-contain transition-opacity group-hover:opacity-80 max-[67.5rem]:h-[25px] max-[67.5rem]:w-28"
          />
        </Link>
        <nav
          className="relative ml-auto flex items-center gap-1.5 max-[67.5rem]:gap-0.5"
          ref={navRef}
          aria-label="Main Navigation"
        >
          {/* Yellow pill that GSAP slides under the active link. */}
          <span
            ref={indicatorRef}
            className="pointer-events-none absolute top-0 left-0 z-0 rounded-full bg-sun opacity-0 shadow-[0_2px_8px_-1px_rgb(184_134_11/0.28)] will-change-[transform,width,height]"
            aria-hidden="true"
          />
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={handleNavClick}
                className={cn(
                  "group relative z-1 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-150 max-[67.5rem]:gap-1 max-[67.5rem]:px-[9px] max-[67.5rem]:py-1.5 max-[67.5rem]:text-[13px]",
                  active
                    ? "font-semibold text-sun-ink hover:text-[#3d2703]"
                    : "text-ink-muted hover:bg-ink/4 hover:text-ink active:scale-[0.97] active:bg-ink/8",
                )}
              >
                <Icon
                  data-nav-icon
                  aria-hidden="true"
                  className="size-[18px] transition-transform duration-150 group-hover:scale-112 max-[67.5rem]:size-4"
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <AuthButton />
      </header>
    </div>
  );
}
