"use client";

import { useId, useRef, type ReactNode } from "react";
import { SlidersHorizontalIcon, XIcon } from "@phosphor-icons/react";

/** Round filter button (phones only) that opens the filters in a bottom sheet. */
export function FilterSheet({
  activeCount,
  title = "ตัวกรอง",
  children,
}: {
  activeCount: number;
  title?: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const close = () => dialog.current?.close();
  return (
    <>
      <button
        type="button"
        className="press relative hidden size-[52px] shrink-0 place-items-center rounded-full bg-navy text-cream [--ledge:var(--color-ledge-navy)] max-md:grid"
        onClick={() => dialog.current?.showModal()}
        aria-label={
          activeCount ? `${title} (ใช้อยู่ ${activeCount} รายการ)` : title
        }
      >
        <SlidersHorizontalIcon size={22} weight="bold" aria-hidden="true" />
        {activeCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-amber-soft px-[5px] text-micro font-bold text-ink shadow-[0_0_0_2px_var(--color-paper)]"
            aria-hidden="true"
          >
            {activeCount}
          </span>
        )}
      </button>
      <dialog
        ref={dialog}
        className="focus-ink fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85dvh] w-full max-w-full translate-y-full border-0 bg-transparent p-0 text-ink transition-[translate,overlay,display] transition-discrete duration-200 backdrop:transition-[background-color,overlay,display] backdrop:transition-discrete backdrop:duration-200 backdrop:bg-ink/28 open:translate-y-0 starting:open:translate-y-full"
        aria-labelledby={titleId}
        onClick={(event) => {
          const target = event.target as HTMLElement;
          // Backdrop tap, or picking a filter link, closes the sheet.
          if (target === event.currentTarget || target.closest("a")) close();
        }}
      >
        <div className="flex flex-col gap-[18px] rounded-t-3xl bg-paper px-5 pt-[18px] pb-[calc(24px+env(safe-area-inset-bottom))]">
          <header className="flex items-center justify-between">
            <h2 id={titleId} className="text-lead">
              {title}
            </h2>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full bg-ink/5 text-ink"
              onClick={close}
              aria-label={`ปิด${title}`}
            >
              <XIcon size={18} weight="bold" aria-hidden="true" />
            </button>
          </header>
          {children}
        </div>
      </dialog>
    </>
  );
}
