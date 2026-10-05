"use client";

import Link from "next/link";
import { useEffect, useRef, type ComponentProps } from "react";
import { gsap } from "gsap";

/** Shared lift/press feedback for paper buttons, including keyboard and touch. */
export default function MotionLink(props: ComponentProps<typeof Link>) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const button = ref.current;
    if (!button) return;
    const media = gsap.matchMedia();
    media.add(
      {
        reduced: "(prefers-reduced-motion: reduce)",
        full: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const reduced = Boolean(context.conditions?.reduced);
        const icon = button.querySelector<HTMLElement | SVGElement>(
          "[data-slot=disc], svg",
        );
        const originalButton = button.getAttribute("style");
        const originalIcon = icon?.getAttribute("style");
        // GSAP owns transforms; keep CSS color and shadow feedback intact.
        button.style.setProperty("translate", "none");
        button.style.setProperty("scale", "none");
        button.style.setProperty(
          "transition-property",
          "background-color, color, box-shadow, filter",
        );
        if (icon) {
          icon.style.setProperty("translate", "none");
          icon.style.setProperty(
            "transition-property",
            "color, background-color",
          );
        }
        let hovered = false;
        let focused = false;
        const animate = (pressed = false) => {
          const raised = hovered || focused;
          gsap.to(button, {
            y: pressed ? 1 : raised ? (reduced ? -2 : -5) : 0,
            scale: pressed
              ? reduced
                ? 0.99
                : 0.96
              : raised
                ? reduced
                  ? 1.01
                  : 1.04
                : 1,
            duration: pressed ? 0.12 : reduced ? 0.18 : 0.3,
            ease: "power3.out",
            overwrite: true,
          });
          if (icon)
            gsap.to(icon, {
              x: raised && !pressed ? (reduced ? 2 : 5) : 0,
              y: raised && !pressed ? (reduced ? -2 : -5) : 0,
              duration: 0.25,
              ease: "power3.out",
              overwrite: true,
            });
        };
        const enter = (event: PointerEvent) => {
          if (event.pointerType === "mouse") {
            hovered = true;
            animate();
          }
        };
        const leave = () => {
          hovered = false;
          animate();
        };
        const focus = () => {
          focused = button.matches(":focus-visible");
          animate();
        };
        const blur = () => {
          focused = false;
          animate();
        };
        let pressed = false;
        const down = () => {
          pressed = true;
          animate(true);
        };
        const up = () => {
          if (!pressed) return;
          pressed = false;
          animate();
        };
        const keyDown = (event: KeyboardEvent) => {
          if (event.key === "Enter") down();
        };
        const listeners = [
          [button, "pointerenter", enter],
          [button, "pointerleave", leave],
          [button, "focus", focus],
          [button, "blur", blur],
          [button, "pointerdown", down],
          [button, "keydown", keyDown],
          [window, "pointerup", up],
          [window, "pointercancel", up],
          [button, "keyup", up],
        ] as const;
        listeners.forEach(([target, event, listener]) =>
          target.addEventListener(event, listener as EventListener),
        );
        return () => {
          listeners.forEach(([target, event, listener]) =>
            target.removeEventListener(event, listener as EventListener),
          );
          gsap.killTweensOf(icon ? [button, icon] : [button]);
          if (originalButton === null) button.removeAttribute("style");
          else button.setAttribute("style", originalButton);
          if (icon) {
            if (originalIcon == null) icon.removeAttribute("style");
            else icon.setAttribute("style", originalIcon);
          }
        };
      },
    );
    return () => media.revert();
  }, []);
  return <Link {...props} ref={ref} />;
}
