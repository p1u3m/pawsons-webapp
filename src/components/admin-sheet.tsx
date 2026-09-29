"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { XIcon } from "@phosphor-icons/react";

/** URL-driven side sheet: opens on mount, and closing navigates to `closeHref`. */
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
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="admin-sheet"
      aria-labelledby="admin-sheet-title"
      onClose={() => {
        // A save redirect unmounts the sheet; only navigate when the user closed it.
        if (dialog.current?.isConnected) router.replace(closeHref, { scroll: false });
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
    >
      <div className="admin-sheet-panel">
        <header className="admin-sheet-head">
          <div>
            <h2 id="admin-sheet-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="ปิด">
            <XIcon size={18} weight="bold" aria-hidden="true" />
          </button>
        </header>
        <div className="admin-sheet-body">{children}</div>
      </div>
    </dialog>
  );
}
