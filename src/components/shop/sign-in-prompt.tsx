"use client";

import { ReceiptIcon, SignInIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";

/** Shown to signed-out visitors of /shop/orders; the page refreshes itself after sign-in. */
export function OrdersSignInPrompt() {
  const { signInWithGoogle } = useAuth();
  return (
    <div className="store-empty">
      <ReceiptIcon size={32} aria-hidden="true" />
      <p>เข้าสู่ระบบเพื่อดูคำสั่งซื้อ</p>
      <span>ประวัติการสั่งซื้อและเลขพัสดุจะอยู่ในบัญชีที่ใช้สั่งซื้อ</span>
      <Button
        type="button"
        variant="unstyled"
        size="auto"
        className="store-cta"
        onClick={signInWithGoogle}
      >
        <SignInIcon size={18} weight="bold" aria-hidden="true" />
        เข้าสู่ระบบด้วย Google
      </Button>
    </div>
  );
}
