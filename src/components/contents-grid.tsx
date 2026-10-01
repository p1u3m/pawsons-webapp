"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PostCard, postGrid } from "@/components/post-card";
import type { Post } from "@/lib/posts";

gsap.registerPlugin(ScrollTrigger);

/** Filtered /contents view: every matching post, revealed on scroll. */
export default function ContentsGrid({ posts }: { posts: Post[] }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-post]", el);
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            delay: (i % 4) * 0.07,
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              once: true,
            },
            // Hand the transform back to CSS so the hover lift works.
            clearProps: "transform",
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, [posts]);

  return (
    <div className={postGrid} ref={gridRef}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
