"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * Search field that updates `?q=` as the user types, keeping other filters.
 * It is a GET form, so it still works before hydration or without JavaScript.
 */
export function SearchField({
  placeholder,
  label,
  className,
}: {
  placeholder: string;
  label: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [pending, startTransition] = useTransition();
  const timer = useRef<number>(undefined);
  const input = useRef<HTMLInputElement>(null);
  const urlQuery = searchParams.get("q") ?? "";
  useEffect(() => () => window.clearTimeout(timer.current), []);
  // Follow URL changes made elsewhere (e.g. "show all"), but never while typing.
  useEffect(() => {
    if (document.activeElement !== input.current) setValue(urlQuery);
  }, [urlQuery]);

  const apply = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next.trim()) params.set("q", next.trim());
    else params.delete("q");
    startTransition(() =>
      router.replace(`${pathname}${params.size ? `?${params}` : ""}`, {
        scroll: false,
      }),
    );
  };

  return (
    <form
      className={cn(
        "flex h-[46px] flex-[1_1_200px] items-center gap-2.5 rounded-full bg-field px-4 text-ink-muted transition-shadow focus-within:shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-green)_35%,transparent)] [&_svg]:shrink-0 data-pending:[&_svg]:opacity-50",
        className,
      )}
      role="search"
      action={pathname}
      data-pending={pending || undefined}
      onSubmit={(event) => {
        event.preventDefault();
        window.clearTimeout(timer.current);
        apply(value);
      }}
    >
      {[...searchParams.entries()]
        .filter(([key]) => key !== "q")
        .map(([key, param]) => (
          <input key={key} type="hidden" name={key} value={param} />
        ))}
      <MagnifyingGlassIcon size={20} weight="bold" aria-hidden="true" />
      <input
        ref={input}
        type="search"
        name="q"
        value={value}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
        className="h-full w-0 min-w-0 flex-1 border-0 bg-transparent text-body text-ink caret-auto outline-none placeholder:text-ink-faint [&::-webkit-search-cancel-button]:cursor-pointer"
        enterKeyHint="search"
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => apply(next), 250);
        }}
      />
    </form>
  );
}
