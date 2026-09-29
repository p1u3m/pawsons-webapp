"use client";

import { useEffect, useState } from "react";
import { announceAuthTabComplete } from "@/lib/supabase/oauth-tab";

export default function AuthCompletePage() {
  const [success, setSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const signedIn =
      new URLSearchParams(window.location.search).get("status") === "success";
    setSuccess(signedIn);
    if (!signedIn) return;

    announceAuthTabComplete();
    const timeout = window.setTimeout(() => window.close(), 300);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center" }} role="status">
        {success === null ? null : success ? (
          <p>Signed in successfully. You can close this window.</p>
        ) : (
          <p>
            Google sign in was not completed. Please close this window and try
            again.
          </p>
        )}
      </div>
    </main>
  );
}
