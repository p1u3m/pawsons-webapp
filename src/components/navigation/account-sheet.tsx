"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CaretRightIcon,
  EnvelopeSimpleIcon,
  HouseIcon,
  PawPrintIcon,
  ReceiptIcon,
  SignOutIcon,
  SquaresFourIcon,
  XIcon,
  type Icon,
} from "@phosphor-icons/react";
import { GoogleIcon } from "@/components/auth-button";
import { pillButton } from "@/components/pill-button";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

interface AccountSheetProps {
  isOpen: boolean;
  lettersBadge?: number | boolean | string;
  onClose: () => void;
}

export default function AccountSheet({
  isOpen,
  onClose,
  lettersBadge,
}: AccountSheetProps) {
  const { user, isAdmin, displayName, avatarUrl, signInWithGoogle, signOut } =
    useAuth();
  const [dragOffset, setDragOffset] = useState(0);
  const dragOffsetRef = useRef(0);
  const dragFrame = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Keep keyboard focus in the menu and return it to the bottom-nav trigger.
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusable = () =>
      Array.from(
        sheetRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], [tabindex="0"]',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0);
    const frame = requestAnimationFrame(() => focusable()[0]?.focus());
    function trapFocus(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const controls = focusable();
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!sheetRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", trapFocus);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", trapFocus);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while the sheet is open.
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset drag offset when opening
  useEffect(() => {
    if (isOpen) {
      dragOffsetRef.current = 0;
      setDragOffset(0);
    }
  }, [isOpen]);

  useEffect(
    () => () => {
      if (dragFrame.current !== null)
        window.cancelAnimationFrame(dragFrame.current);
    },
    [],
  );

  // Touch gesture handlers for swipe down
  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) {
      dragOffsetRef.current = diff;
      if (dragFrame.current === null) {
        dragFrame.current = window.requestAnimationFrame(() => {
          setDragOffset(dragOffsetRef.current);
          dragFrame.current = null;
        });
      }
    }
  }

  function handleTouchEnd() {
    if (dragFrame.current !== null) {
      window.cancelAnimationFrame(dragFrame.current);
      dragFrame.current = null;
    }
    if (dragOffsetRef.current > 75) {
      onClose();
    } else {
      dragOffsetRef.current = 0;
      setDragOffset(0);
    }
    touchStartY.current = null;
  }

  const lettersEntry = (
    <SheetLink href="/letters" icon={EnvelopeSimpleIcon} onClick={onClose}>
      <span className="flex items-center justify-between gap-3">
        Letters
        {Boolean(lettersBadge) && (
          <span className="rounded-full bg-sun px-2 py-0.5 text-[12px] text-sun-ink">
            {typeof lettersBadge === "boolean"
              ? "New"
              : typeof lettersBadge === "number" && lettersBadge > 99
                ? "99+"
                : lettersBadge}
          </span>
        )}
      </span>
    </SheetLink>
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 md:hidden"
      role="region"
      aria-label="Account Menu Portal"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity duration-200 starting:opacity-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div
        ref={sheetRef}
        className="fixed inset-x-0 bottom-0 z-101 mx-auto flex max-h-[85vh] max-w-[480px] flex-col overflow-y-auto rounded-t-card bg-cream px-5 pt-3 pb-[max(24px,env(safe-area-inset-bottom,24px))] shadow-[0_-10px_40px_rgb(24_24_24/0.16)] transition-[translate] duration-200 starting:translate-y-full"
        id="mobile-account-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Account menu"
        style={{
          transform:
            isOpen && dragOffset > 0
              ? `translateY(${dragOffset}px)`
              : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle for swipe down affordance */}
        <div
          className="flex w-full cursor-grab justify-center pt-1 pb-2.5"
          aria-hidden="true"
        >
          <div className="h-1 w-[38px] rounded-xs bg-ink/18" />
        </div>

        <div className="flex items-center justify-between border-b border-ink/6 pb-3.5">
          <h2 className="text-[17px] font-semibold">Your account</h2>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full bg-ink/5 text-ink hover:bg-ink/10 focus-visible:outline-offset-2"
            onClick={onClose}
            aria-label="Close account menu"
          >
            <XIcon size={20} weight="bold" />
          </button>
        </div>

        <div className="flex flex-col gap-4 pt-[18px]">
          {user ? (
            <>
              <div className="flex items-center gap-3.5 rounded-card-sm border border-ink/6 bg-ink/3 px-4 py-3.5">
                <div className="shrink-0">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt=""
                      width={52}
                      height={52}
                      className="size-12 rounded-full object-cover shadow-[0_2px_8px_rgb(24_24_24/0.12)]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span
                      className="flex size-12 items-center justify-center rounded-full bg-sun text-[20px] font-bold text-sun-ink shadow-[0_2px_8px_rgb(184_134_11/0.25)]"
                      aria-hidden="true"
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-[16px] font-semibold text-ink">
                    {displayName}
                  </span>
                  <span className="truncate text-[13px] text-ink-muted">
                    {user.email}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <SheetLink href="/room" icon={HouseIcon} onClick={onClose}>
                  My Room
                </SheetLink>
                <SheetLink
                  href="/shop/orders"
                  icon={ReceiptIcon}
                  onClick={onClose}
                >
                  My orders
                </SheetLink>
                {lettersEntry}
                {isAdmin && (
                  <SheetLink
                    href="/admin/contents"
                    target="_blank"
                    icon={SquaresFourIcon}
                    tone="admin"
                    onClick={onClose}
                  >
                    Admin
                  </SheetLink>
                )}
                <button
                  type="button"
                  className={cn(sheetRow, "border-danger/15 text-danger")}
                  onClick={() => {
                    onClose();
                    signOut();
                  }}
                >
                  <span
                    className={cn(sheetIcon, "bg-danger/10 text-danger")}
                  >
                    <SignOutIcon size={20} aria-hidden="true" />
                  </span>
                  <span className="flex-1">Sign out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 px-2 pt-3 pb-2 text-center">
              <div className="flex size-[54px] items-center justify-center rounded-full bg-sun text-sun-ink shadow-[0_4px_12px_rgb(184_134_11/0.25)]">
                <PawPrintIcon size={28} weight="fill" aria-hidden="true" />
              </div>
              <h3 className="text-[18px] font-semibold">Welcome to Pawsons</h3>
              <p className="max-w-[280px] text-[14px] leading-[1.4]">
                Sign in to save your Pawson result and make your room your own.
              </p>
              <button
                type="button"
                className={cn(pillButton(), "mt-2 w-full")}
                onClick={signInWithGoogle}
              >
                <GoogleIcon size={18} />
                <span>Sign in with Google</span>
              </button>
            </div>
          )}
          {!user && lettersEntry}
        </div>
      </div>
    </div>
  );
}

const sheetRow =
  "flex min-h-12 items-center gap-3 rounded-2xl border border-ink/8 bg-cream px-3.5 py-2.5 text-left text-[15px] font-medium text-ink hover:bg-ink/4 focus-visible:outline-offset-2 active:scale-[0.98]";
const sheetIcon =
  "flex size-[34px] shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink";

function SheetLink({
  href,
  target,
  icon: Icon,
  tone,
  onClick,
  children,
}: {
  href: string;
  target?: "_blank";
  icon: Icon;
  tone?: "admin";
  onClick: () => void;
  children: ReactNode;
}) {
  const admin = tone === "admin";
  return (
    <Link
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      onClick={onClick}
      className={cn(
        sheetRow,
        admin && "border-green/20 bg-green/5 text-green-ink",
      )}
    >
      <span className={cn(sheetIcon, admin && "bg-green/12 text-green-ink")}>
        <Icon size={20} aria-hidden="true" />
      </span>
      <span className="flex-1">{children}</span>
      <CaretRightIcon size={20} className="text-ink-muted" aria-hidden="true" />
    </Link>
  );
}
