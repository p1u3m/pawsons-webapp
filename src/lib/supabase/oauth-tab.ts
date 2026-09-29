import type { SupabaseClient } from "@supabase/supabase-js";

const AUTH_TAB_CHANNEL = "pawsons-auth-tab";
const AUTH_TAB_STORAGE_KEY = "pawsons-auth-tab-complete";

export async function openGoogleSignInWindow(supabase: SupabaseClient) {
  const width = 520;
  const height = 720;
  const left = Math.max(
    0,
    Math.round(window.screenX + (window.outerWidth - width) / 2),
  );
  const top = Math.max(
    0,
    Math.round(window.screenY + (window.outerHeight - height) / 2),
  );
  // Open synchronously from the click so the browser allows a separate window.
  const popup = window.open(
    "about:blank",
    "_blank",
    `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
  );
  if (!popup) return;

  // The OAuth provider should never be able to navigate the original window.
  popup.opener = null;
  const origin = window.location.origin.replace("0.0.0.0", "localhost");
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });
    if (error || !data.url)
      throw error ?? new Error("Missing Google sign in URL");
    if (!popup.closed) popup.location.replace(data.url);
  } catch {
    if (!popup.closed) {
      popup.document.body.textContent =
        "Could not start Google sign in. Please close this window and try again.";
    }
  }
}

export function announceAuthTabComplete() {
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(AUTH_TAB_CHANNEL);
    channel.postMessage("signed-in");
    channel.close();
  }
  try {
    window.localStorage.setItem(AUTH_TAB_STORAGE_KEY, String(Date.now()));
  } catch {
    // BroadcastChannel still delivers the update when storage is unavailable.
  }
}

export function subscribeToAuthTab(onComplete: () => void) {
  const channel =
    typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel(AUTH_TAB_CHANNEL)
      : null;
  let lastNotification = 0;
  const notify = () => {
    const now = Date.now();
    if (now - lastNotification < 1000) return;
    lastNotification = now;
    onComplete();
  };
  const onMessage = (event: MessageEvent) => {
    if (event.data === "signed-in") notify();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === AUTH_TAB_STORAGE_KEY && event.newValue) notify();
  };
  channel?.addEventListener("message", onMessage);
  window.addEventListener("storage", onStorage);
  return () => {
    channel?.removeEventListener("message", onMessage);
    channel?.close();
    window.removeEventListener("storage", onStorage);
  };
}
