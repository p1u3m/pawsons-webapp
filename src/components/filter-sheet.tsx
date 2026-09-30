"use client";

import { useId, useRef, type ReactNode } from "react";
import { SlidersHorizontalIcon, XIcon } from "@phosphor-icons/react";

/**
 * Round filter button that opens filters in a bottom sheet. Hidden by default;
 * each page shows `.filter-button` on mobile (styles in globals.css).
 */
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
        className="filter-button"
        onClick={() => dialog.current?.showModal()}
        aria-label={
          activeCount ? `${title} (ใช้อยู่ ${activeCount} รายการ)` : title
        }
      >
        <SlidersHorizontalIcon size={22} weight="bold" aria-hidden="true" />
        {activeCount > 0 && (
          <span className="filter-badge" aria-hidden="true">
            {activeCount}
          </span>
        )}
      </button>
      <dialog
        ref={dialog}
        className="filter-sheet"
        aria-labelledby={titleId}
        onClick={(event) => {
          const target = event.target as HTMLElement;
          // Backdrop tap, or picking a filter link, closes the sheet.
          if (target === event.currentTarget || target.closest("a")) close();
        }}
      >
        <div className="filter-sheet-panel">
          <header className="filter-sheet-head">
            <h2 id={titleId}>{title}</h2>
            <button type="button" onClick={close} aria-label={`ปิด${title}`}>
              <XIcon size={18} weight="bold" aria-hidden="true" />
            </button>
          </header>
          {children}
        </div>
      </dialog>
    </>
  );
}
