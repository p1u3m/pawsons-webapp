"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { XIcon } from "@phosphor-icons/react";
import { useAuth } from "@/lib/use-auth";

interface AccountSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountSheet({ isOpen, onClose }: AccountSheetProps) {
  const { user, isAdmin, displayName, avatarUrl, signInWithGoogle, signOut } =
    useAuth();
  const [dragOffset, setDragOffset] = useState(0);
  const [mounted, setMounted] = useState(isOpen);
  const dragOffsetRef = useRef(0);
  const dragFrame = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      return;
    }
    if (!mounted) return;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : 240;
    const timeout = window.setTimeout(() => setMounted(false), duration);
    return () => window.clearTimeout(timeout);
  }, [isOpen, mounted]);

  // Lock body scroll until the closing animation finishes.
  useEffect(() => {
    if (isOpen || mounted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, mounted]);

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

  if (!isOpen && !mounted) return null;

  return (
    <div
      className={`account-sheet-portal ${isOpen ? "" : "is-closing"}`}
      role="region"
      aria-label="Account Menu Portal"
    >
      {/* Backdrop */}
      <div
        className="account-sheet-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div
        ref={sheetRef}
        className="account-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="เมนูบัญชีผู้ใช้"
        style={{
          transform:
            isOpen && dragOffset > 0
              ? `translateY(${dragOffset}px)`
              : undefined,
          transition: isOpen && dragOffset > 0 ? "none" : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle for swipe down affordance */}
        <div className="account-sheet-drag-handle-wrap" aria-hidden="true">
          <div className="account-sheet-drag-handle" />
        </div>

        {/* Sheet Header */}
        <div className="account-sheet-header">
          <h2 className="account-sheet-title">บัญชีของคุณ</h2>
          <button
            type="button"
            className="account-sheet-close-btn"
            onClick={onClose}
            aria-label="ปิดเมนูบัญชี"
          >
            <XIcon size={20} weight="bold" />
          </button>
        </div>

        {/* Sheet Content */}
        <div className="account-sheet-body">
          {user ? (
            <>
              {/* User Profile Info Card */}
              <div className="account-sheet-user-card">
                <div className="account-sheet-avatar-wrap">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt=""
                      width={52}
                      height={52}
                      className="account-sheet-avatar-img"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span
                      className="account-sheet-avatar-fallback"
                      aria-hidden="true"
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="account-sheet-user-meta">
                  <span className="account-sheet-user-name">{displayName}</span>
                  <span className="account-sheet-user-email">{user.email}</span>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="account-sheet-actions">
                <Link
                  href="/room"
                  className="account-sheet-link-btn"
                  onClick={onClose}
                >
                  <span className="account-sheet-link-icon-wrap">
                    <span className="material-symbols-rounded">cottage</span>
                  </span>
                  <span className="account-sheet-link-text">My Room</span>
                  <span
                    className="material-symbols-rounded account-sheet-link-chevron"
                    aria-hidden="true"
                  >
                    chevron_right
                  </span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin/contents"
                    className="account-sheet-link-btn account-sheet-admin-btn"
                    onClick={onClose}
                  >
                    <span className="account-sheet-link-icon-wrap admin-badge">
                      <span className="material-symbols-rounded">
                        dashboard_customize
                      </span>
                    </span>
                    <span className="account-sheet-link-text">
                      Manage Content (Admin)
                    </span>
                    <span
                      className="material-symbols-rounded account-sheet-link-chevron"
                      aria-hidden="true"
                    >
                      chevron_right
                    </span>
                  </Link>
                )}

                <button
                  type="button"
                  className="account-sheet-link-btn account-sheet-signout-btn"
                  onClick={() => {
                    onClose();
                    signOut();
                  }}
                >
                  <span className="account-sheet-link-icon-wrap signout-badge">
                    <span className="material-symbols-rounded">logout</span>
                  </span>
                  <span className="account-sheet-link-text">Sign out</span>
                </button>
              </div>
            </>
          ) : (
            /* Signed Out State */
            <div className="account-sheet-guest">
              <div className="account-sheet-guest-icon-wrap">
                <span className="material-symbols-rounded account-sheet-guest-icon">
                  pets
                </span>
              </div>
              <h3 className="account-sheet-guest-heading">
                ยินดีต้อนรับสู่ Pawsons
              </h3>
              <p className="account-sheet-guest-desc">
                เข้าสู่ระบบเพื่อบันทึกผลการค้นหา Pawson
                และตกแต่งห้องส่วนตัวของคุณ
              </p>
              <button
                type="button"
                className="button account-sheet-login-btn"
                onClick={signInWithGoogle}
              >
                <svg
                  className="auth-google-icon"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  aria-hidden="true"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
