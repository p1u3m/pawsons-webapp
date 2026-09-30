"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

/**
 * Search field that updates `?q=` as the user types, keeping other filters.
 * It is a GET form, so it still works before hydration or without JavaScript.
 */
export function ShopSearch() {
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
      className="store-search"
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
        placeholder="ค้นหาสินค้าหรือตัวละคร"
        aria-label="ค้นหาสินค้า"
        autoComplete="off"
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
