"use client";

import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import AuthButton from "../auth-button";
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
        activeLink.querySelector<HTMLElement>(".nav-link-icon");

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
    <div className="header-wrapper desktop-navbar-wrapper">
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Pawsons Home">
          <Image
            src="/logos/Logo_main.svg"
            width={130}
            height={30}
            alt="pawsons"
            priority
          />
        </Link>
        <nav className="desktop-nav" ref={navRef} aria-label="Main Navigation">
          <span
            ref={indicatorRef}
            className="nav-active-pill"
            aria-hidden="true"
          />
          {NAV_LINKS.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
              onClick={handleNavClick}
            >
              <span
                className="material-symbols-rounded nav-link-icon"
                aria-hidden="true"
              >
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="desktop-auth">
          <AuthButton />
        </div>
      </header>
    </div>
  );
}
