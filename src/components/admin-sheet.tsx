"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/** URL-driven side sheet: open while rendered; closing navigates to `closeHref` after the animation. */
export function AdminSheet({
  title,
  description,
  closeHref,
  children,
}: {
  title: string;
  description?: string;
  closeHref: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(next) => {
        if (!next) router.replace(closeHref, { scroll: false });
      }}
    >
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
        <SheetHeader className="border-b">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}

/** Shows a success toast once, then drops the flag from the URL so a refresh does not repeat it. */
export function AdminFlash({
  message,
  description,
  cleanHref,
}: {
  message: string;
  description?: string;
  cleanHref: string;
}) {
  const router = useRouter();
  const shown = useRef(false);
  useEffect(() => {
    // Strict Mode runs effects twice in development.
    if (shown.current) return;
    shown.current = true;
    toast.success(message, { description });
    router.replace(cleanHref, { scroll: false });
  }, [message, description, cleanHref, router]);
  return null;
}
