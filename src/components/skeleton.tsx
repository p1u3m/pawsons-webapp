import type { ReactNode } from "react";
import { pageHero } from "@/components/paper-ui";
import { cn } from "@/lib/utils";

// Loading skeletons (route loading.tsx files): flat, faint rectangles that all
// share one corner radius, laid out like the page so nothing jumps on arrival.

/** One placeholder shape. */
export function Bone({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block rounded-tile bg-ink/5", className)}
    />
  );
}

/** Wrapper that announces the loading state to screen readers. */
export function LoadingStatus({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div role="status" aria-label="กำลังโหลด" className={className}>
      {children}
      <span className="sr-only">กำลังโหลด…</span>
    </div>
  );
}

/** Hero of /contents and /shop: two title lines and a line of copy beside the art. */
export function HeroSkeleton() {
  return (
    <section className={pageHero}>
      <div className="grid gap-3 max-md:justify-items-center">
        <Bone className="h-11 w-[78%] max-md:h-9" />
        <Bone className="h-11 w-[62%] max-md:h-9" />
        <Bone className="mt-2 h-4 w-[70%] max-w-[460px]" />
      </div>
      <Bone className="aspect-[1.3] w-[min(80%,340px)] justify-self-center split:w-[min(100%,400px)]" />
    </section>
  );
}

/** Picture (4:5 posts, square products) and two text lines, no card surface. */
export function CardSkeleton({ shape }: { shape: "post" | "product" }) {
  return (
    <div className="flex flex-col gap-3">
      <Bone
        className={cn(
          "w-full",
          shape === "post" ? "aspect-[4/5]" : "aspect-square",
        )}
      />
      <div className="grid gap-2">
        <Bone className="h-3 w-1/2" />
        <Bone className="h-4 w-4/5" />
        <Bone className="mt-1 h-3 w-1/3" />
      </div>
    </div>
  );
}

/** Search field (+ filter button on phones). */
export function ToolbarSkeleton() {
  return (
    <div className="mb-7 flex items-center gap-2.5 md:mb-9">
      <Bone className="h-[52px] flex-1 md:h-[46px]" />
      <Bone className="size-[52px] shrink-0 md:hidden" />
    </div>
  );
}

/** Product or post page: back button row, the picture beside the details. */
export function DetailSkeleton({ shape }: { shape: "post" | "product" }) {
  return (
    <LoadingStatus className="wrap min-h-dvh pt-10 pb-[110px] max-md:pt-6">
      <div className="mb-7 flex items-center justify-between gap-4">
        <Bone className="size-[46px]" />
        <Bone className="h-10 w-28" />
      </div>
      <div className="grid grid-cols-2 items-start gap-14 max-split:grid-cols-1 max-split:gap-8">
        <div className="max-w-[540px] max-split:mx-auto max-split:w-full">
          <Bone
            className={cn(
              "w-full",
              shape === "post" ? "aspect-[4/5]" : "aspect-square",
            )}
          />
        </div>
        <div className="grid gap-3">
          <Bone className="h-3 w-40" />
          <Bone className="mt-2 h-10 w-4/5" />
          <Bone className="h-10 w-3/5" />
          <Bone className="mt-4 h-4 w-full" />
          <Bone className="h-4 w-11/12" />
          <Bone className="h-4 w-3/4" />
          <Bone className="mt-6 h-[52px] w-48" />
        </div>
      </div>
    </LoadingStatus>
  );
}

/** Plain loading page: keeps the footer below the fold until the page arrives. */
export function PageLoading() {
  return (
    <LoadingStatus className="wrap min-h-dvh pt-10 pb-[90px]">
      {null}
    </LoadingStatus>
  );
}
