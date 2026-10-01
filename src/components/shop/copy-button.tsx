"use client";

import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);
  return (
    <button
      type="button"
      className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full border border-line-strong bg-white px-3 text-[13px] text-ink-soft hover:border-ink-soft"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => setCopied(true), () => {});
      }}
      aria-label={copied ? "คัดลอกแล้ว" : label}
    >
      {copied ? (
        <CheckIcon size={16} weight="bold" aria-hidden="true" />
      ) : (
        <CopyIcon size={16} aria-hidden="true" />
      )}
      <span aria-live="polite">{copied ? "คัดลอกแล้ว" : "คัดลอก"}</span>
    </button>
  );
}
