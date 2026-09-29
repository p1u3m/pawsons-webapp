"use client";

import { useRef, type ReactNode } from "react";
import { XIcon } from "@phosphor-icons/react";

/** Mobile filter button that opens the type/house filters in a bottom sheet. */
export function FilterSheet({
  activeCount,
  children,
}: {
  activeCount: number;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();
  return (
    <>
      <button
        type="button"
        className="store-filter-button"
        onClick={() => dialog.current?.showModal()}
        aria-label={
          activeCount ? `ตัวกรอง (ใช้อยู่ ${activeCount} รายการ)` : "ตัวกรอง"
        }
      >
        <span className="material-symbols-rounded" aria-hidden="true">
          tune
        </span>
        {activeCount > 0 && (
          <span className="store-filter-badge" aria-hidden="true">
            {activeCount}
          </span>
        )}
      </button>
      <dialog
        ref={dialog}
        className="store-sheet"
        aria-labelledby="store-sheet-title"
        onClick={(event) => {
          const target = event.target as HTMLElement;
          // Backdrop tap, or picking a filter link, closes the sheet.
          if (target === event.currentTarget || target.closest("a")) close();
        }}
      >
        <div className="store-sheet-panel">
          <header className="store-sheet-head">
            <h2 id="store-sheet-title">ตัวกรอง</h2>
            <button type="button" onClick={close} aria-label="ปิดตัวกรอง">
              <XIcon size={18} weight="bold" aria-hidden="true" />
            </button>
          </header>
          {children}
        </div>
      </dialog>
    </>
  );
}
