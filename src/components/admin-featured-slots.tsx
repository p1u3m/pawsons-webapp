"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  ArrowsLeftRightIcon,
  DotsThreeIcon,
  ImageIcon,
  PencilSimpleIcon,
  PlusIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { featuredSlotCount, type ContentCategory } from "@/lib/posts";
import { setFeaturedRank, type ContentRow } from "@/lib/supabase/contents";
import { cn } from "@/lib/utils";

// Slots on the /contents magazine spread; must match the featured_rank check.
export const slotLabels = [
  "เรื่องเด่น (ใหญ่สุด)",
  "ขวาบน ซ้าย",
  "ขวาบน ขวา",
  "ขวาล่าง ซ้าย",
  "ขวาล่าง ขวา",
];

function Thumb({ src, className }: { src: string | null; className?: string }) {
  return (
    <span
      className={cn(
        "block overflow-hidden rounded-md border bg-muted",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- Supabase storage URLs
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center text-muted-foreground">
          <ImageIcon className="size-4" />
        </span>
      )}
    </span>
  );
}

/** The five magazine slots: pick, swap or clear the post in each one. */
export function AdminFeaturedSlots({
  rows,
  categories,
  onEdit,
  onRankChange,
}: {
  rows: ContentRow[];
  categories: ContentCategory[];
  onEdit: (row: ContentRow) => void;
  /** Mirrors a saved rank change in the parent's rows. */
  onRankChange: (id: number, rank: number | null) => void;
}) {
  const [picking, setPicking] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const slots = Array.from(
    { length: featuredSlotCount },
    (_, i) => rows.find((row) => row.featured_rank === i + 1) ?? null,
  );
  const tagLabel = (slug: string) =>
    categories.find((c) => c.slug === slug)?.label ?? slug;

  function assign(row: ContentRow, rank: number | null) {
    setPicking(null);
    startTransition(async () => {
      const res = await setFeaturedRank(row.id, rank);
      if (!res.success) {
        toast.error("ตั้งค่าหน้าแรกไม่สำเร็จ", { description: res.error });
        return;
      }
      onRankChange(row.id, rank);
      toast.success(
        rank
          ? `วาง “${row.situation_title}” ในช่อง ${rank} แล้ว`
          : "นำออกจากหน้าแรกแล้ว",
        rank
          ? undefined
          : { description: `ช่องนี้จะเติมโพสต์ล่าสุดที่มีรูปให้อัตโนมัติ` },
      );
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>หน้าแรก Contents</CardTitle>
        <CardDescription>
          5 ช่องบนหน้านิตยสาร · เลือกโพสต์ลงแต่ละช่อง
          ช่องที่ว่างจะเติมโพสต์ล่าสุดที่มีรูปให้อัตโนมัติ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {slots.map((row, i) => (
            <li
              key={slotLabels[i]}
              // Phones: the lead story takes the full width, then two rows of two.
              className={cn(
                "grid gap-2",
                i === 0 && "col-span-2 sm:col-span-1",
              )}
            >
              {row ? (
                <div className="group relative">
                  <button
                    type="button"
                    onClick={() => onEdit(row)}
                    className="block w-full"
                    aria-label={`แก้ไข ${row.situation_title}`}
                  >
                    <Thumb
                      src={row.cover_image_url}
                      className={cn(
                        "aspect-[4/5] rounded-lg",
                        i === 0 && "max-sm:aspect-[4/3]",
                      )}
                    />
                  </button>
                  <Badge
                    variant="secondary"
                    className="absolute top-2 left-2 bg-background/90"
                  >
                    {i + 1}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="secondary"
                          size="icon-sm"
                          className="absolute top-1.5 right-1.5 bg-background/90"
                          aria-label={`จัดการช่อง ${i + 1}`}
                          disabled={pending}
                        />
                      }
                    >
                      <DotsThreeIcon weight="bold" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-44">
                      <DropdownMenuItem onClick={() => setPicking(i + 1)}>
                        <ArrowsLeftRightIcon />
                        เปลี่ยนโพสต์
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(row)}>
                        <PencilSimpleIcon />
                        แก้ไขโพสต์
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => assign(row, null)}
                      >
                        <XIcon />
                        นำออกจากช่องนี้
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setPicking(i + 1)}
                  className={cn(
                    "relative flex aspect-[4/5] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    i === 0 && "max-sm:aspect-[4/3]",
                  )}
                >
                  <Badge variant="secondary" className="absolute top-2 left-2">
                    {i + 1}
                  </Badge>
                  <PlusIcon className="size-5" />
                  เลือกโพสต์
                </button>
              )}
              <span className="grid">
                <span className="text-xs text-muted-foreground">
                  {slotLabels[i]}
                </span>
                <span className="line-clamp-1 text-sm font-medium">
                  {row ? row.situation_title : "อัตโนมัติ"}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </CardContent>

      <CommandDialog
        open={picking !== null}
        onOpenChange={(open) => !open && setPicking(null)}
        title={`เลือกโพสต์สำหรับช่อง ${picking}`}
        description="ค้นหาโพสต์ที่จะแสดงบนหน้าแรก"
      >
        <Command>
          <CommandInput
            placeholder={`ค้นหาโพสต์สำหรับช่อง ${picking ?? ""}...`}
          />
          <CommandList className="max-h-96">
            <CommandEmpty>ไม่พบโพสต์</CommandEmpty>
            <CommandGroup
              heading={
                picking
                  ? `ช่อง ${picking} · ${slotLabels[picking - 1]}`
                  : undefined
              }
            >
              {rows.map((row) => (
                <CommandItem
                  key={row.id}
                  value={`${row.id} ${row.situation_title} ${row.character_type ?? ""} ${tagLabel(row.category)}`}
                  disabled={row.featured_rank === picking}
                  onSelect={() => picking && assign(row, picking)}
                >
                  <Thumb
                    src={row.cover_image_url}
                    className="h-10 w-8 shrink-0"
                  />
                  <span className="grid min-w-0 flex-1">
                    <span className="truncate">{row.situation_title}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {tagLabel(row.category)} · {row.character_type ?? "—"}
                      {!row.cover_image_url && " · รอรูป"}
                    </span>
                  </span>
                  {row.featured_rank && (
                    <Badge variant="outline" className="shrink-0">
                      {row.featured_rank === picking
                        ? "อยู่ช่องนี้"
                        : `ย้ายจากช่อง ${row.featured_rank}`}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </Card>
  );
}
