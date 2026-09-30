"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * A select whose options are links: picking one navigates. Used on mobile in
 * place of a long row of filter chips.
 */
export function AdminLinkSelect({
  label,
  value,
  items,
  className,
}: {
  label: string;
  value: string;
  items: { value: string; label: string; href: string }[];
  className?: string;
}) {
  const router = useRouter();
  return (
    <Select
      value={value}
      items={items}
      onValueChange={(next) => {
        const item = items.find((i) => i.value === next);
        if (item) router.push(item.href, { scroll: false });
      }}
    >
      <SelectTrigger className={className} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
