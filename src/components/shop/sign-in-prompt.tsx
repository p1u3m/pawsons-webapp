"use client";

import { ReceiptIcon, SignInIcon } from "@phosphor-icons/react";
import { ShopEmpty, shopButton } from "@/components/shop/shop-ui";
import { useAuth } from "@/lib/use-auth";

/** Shown to signed-out visitors of /shop/orders; the page refreshes itself after sign-in. */
export function OrdersSignInPrompt() {
  const { signInWithGoogle } = useAuth();
  return (
    <ShopEmpty
      icon={<ReceiptIcon size={32} aria-hidden="true" />}
      title="เข้าสู่ระบบเพื่อดูคำสั่งซื้อ"
      action={
        <button type="button" className={shopButton} onClick={signInWithGoogle}>
          <SignInIcon size={16} weight="bold" aria-hidden="true" />
          เข้าสู่ระบบด้วย Google
        </button>
      }
    >
      ประวัติการสั่งซื้อและเลขพัสดุจะอยู่ในบัญชีที่ใช้สั่งซื้อ
    </ShopEmpty>
  );
}
