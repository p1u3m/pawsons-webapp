"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  LockSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  builtInCategories,
  postLayouts,
  type ContentCategory,
  type PostLayout,
} from "@/lib/posts";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/supabase/contents";

const layoutItems = (Object.keys(postLayouts) as PostLayout[]).map((value) => ({
  value,
  label: postLayouts[value],
}));

function LayoutSelect({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: PostLayout;
  onChange: (value: PostLayout) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as PostLayout)}
      items={layoutItems}
    >
      <SelectTrigger id={id} className="w-full" aria-label="รูปแบบโพสต์">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {layoutItems.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Add, rename, reorder and remove post tags. A tag's layout decides whether its
 * posts are written as a situation or a quote.
 */
export function AdminTagManager({
  open,
  onOpenChange,
  categories,
  usage,
  onChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ContentCategory[];
  /** Posts per tag slug; a tag in use cannot be deleted. */
  usage: Record<string, number>;
  onChange: (categories: ContentCategory[]) => void;
  /** Called with a newly created tag, e.g. to select it in the post editor. */
  onCreated?: (category: ContentCategory) => void;
}) {
  const [drafts, setDrafts] = useState(categories);
  const [newTag, setNewTag] = useState({
    label: "",
    english: "",
    layout: "situation" as PostLayout,
  });
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) setDrafts(categories);
  }, [open, categories]);

  const changed = (tag: ContentCategory) => {
    const saved = categories.find((c) => c.slug === tag.slug);
    return (
      saved &&
      (saved.label !== tag.label ||
        saved.english !== tag.english ||
        saved.layout !== tag.layout)
    );
  };
  const patch = (slug: string, next: Partial<ContentCategory>) =>
    setDrafts((prev) =>
      prev.map((tag) => (tag.slug === slug ? { ...tag, ...next } : tag)),
    );

  function save(tag: ContentCategory) {
    startTransition(async () => {
      const res = await updateCategory(tag.slug, tag);
      if (!res.success) {
        toast.error("บันทึกแท็กไม่สำเร็จ", { description: res.error });
        return;
      }
      onChange(categories.map((c) => (c.slug === tag.slug ? tag : c)));
      toast.success(`บันทึกแท็ก “${tag.label}” แล้ว`);
    });
  }

  function remove(tag: ContentCategory) {
    startTransition(async () => {
      const res = await deleteCategory(tag.slug);
      if (!res.success) {
        toast.error("ลบแท็กไม่สำเร็จ", { description: res.error });
        return;
      }
      onChange(categories.filter((c) => c.slug !== tag.slug));
      toast.success(`ลบแท็ก “${tag.label}” แล้ว`);
    });
  }

  /** Swaps a tag with its neighbour and renumbers sort_order in steps of 10. */
  function move(index: number, step: -1 | 1) {
    const next = [...categories];
    const target = index + step;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const renumbered = next.map((tag, i) => ({
      ...tag,
      sort_order: (i + 1) * 10,
    }));
    startTransition(async () => {
      const updates = renumbered.filter(
        (tag) =>
          categories.find((c) => c.slug === tag.slug)?.sort_order !==
          tag.sort_order,
      );
      const results = await Promise.all(
        updates.map((tag) => updateCategory(tag.slug, tag)),
      );
      const failed = results.find((res) => !res.success);
      if (failed) {
        toast.error("เรียงลำดับไม่สำเร็จ", { description: failed.error });
        return;
      }
      onChange(renumbered);
    });
  }

  function create(event: React.FormEvent) {
    event.preventDefault();
    const sortOrder =
      Math.max(0, ...categories.map((tag) => tag.sort_order)) + 10;
    startTransition(async () => {
      const res = await createCategory({ ...newTag, sort_order: sortOrder });
      if (!res.category) {
        toast.error("สร้างแท็กไม่สำเร็จ", { description: res.error });
        return;
      }
      onChange([...categories, res.category]);
      setNewTag({ label: "", english: "", layout: "situation" });
      toast.success(`สร้างแท็ก “${res.category.label}” แล้ว`);
      onCreated?.(res.category);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>จัดการแท็ก</DialogTitle>
          <DialogDescription>
            แท็กคือกลุ่มของโพสต์ แสดงเป็นแท็บและชั้นหนังสือบนหน้า Contents ·
            รูปแบบโพสต์กำหนดว่าจะกรอกแบบสถานการณ์หรือคำคม
          </DialogDescription>
        </DialogHeader>

        <ul className="grid gap-2">
          {drafts.map((tag, index) => {
            const count = usage[tag.slug] ?? 0;
            const locked = builtInCategories.includes(tag.slug);
            return (
              <li
                key={tag.slug}
                className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[auto_1fr_1fr_1.2fr_auto] sm:items-center"
              >
                <div className="flex gap-1 sm:flex-col">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={pending || index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`เลื่อน ${tag.label} ขึ้น`}
                  >
                    <ArrowUpIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={pending || index === drafts.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`เลื่อน ${tag.label} ลง`}
                  >
                    <ArrowDownIcon />
                  </Button>
                </div>
                <Input
                  value={tag.label}
                  onChange={(event) =>
                    patch(tag.slug, { label: event.target.value })
                  }
                  aria-label="ชื่อแท็ก"
                  maxLength={40}
                />
                <Input
                  value={tag.english}
                  onChange={(event) =>
                    patch(tag.slug, { english: event.target.value })
                  }
                  aria-label="ชื่อภาษาอังกฤษ"
                  placeholder="English"
                  maxLength={40}
                />
                <LayoutSelect
                  value={tag.layout}
                  onChange={(layout) => patch(tag.slug, { layout })}
                />
                <div className="flex items-center justify-end gap-1.5">
                  <Badge variant="secondary" className="tabular-nums">
                    {count} โพสต์
                  </Badge>
                  {changed(tag) ? (
                    <Button
                      size="sm"
                      disabled={pending}
                      onClick={() => save(tag)}
                    >
                      บันทึก
                    </Button>
                  ) : locked ? (
                    <span
                      className="flex size-7 items-center justify-center text-muted-foreground"
                      title="แท็กเริ่มต้นลบไม่ได้"
                    >
                      <LockSimpleIcon className="size-4" />
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      disabled={pending || count > 0}
                      title={count > 0 ? "ย้ายโพสต์ไปแท็กอื่นก่อนลบ" : "ลบแท็ก"}
                      aria-label={`ลบแท็ก ${tag.label}`}
                      onClick={() => remove(tag)}
                    >
                      <TrashIcon />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <form
          onSubmit={create}
          className="grid gap-3 rounded-lg bg-muted/60 p-3"
        >
          <span className="text-sm font-medium">สร้างแท็กใหม่</span>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1.2fr]">
            <Field>
              <FieldLabel htmlFor="new-tag-label">ชื่อแท็ก</FieldLabel>
              <Input
                id="new-tag-label"
                value={newTag.label}
                onChange={(event) =>
                  setNewTag((prev) => ({ ...prev, label: event.target.value }))
                }
                placeholder="เช่น เรื่องเล่าก่อนนอน"
                maxLength={40}
                required
                className="bg-background"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="new-tag-english">ภาษาอังกฤษ</FieldLabel>
              <Input
                id="new-tag-english"
                value={newTag.english}
                onChange={(event) =>
                  setNewTag((prev) => ({
                    ...prev,
                    english: event.target.value,
                  }))
                }
                placeholder="Bedtime Stories"
                maxLength={40}
                className="bg-background"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="new-tag-layout">รูปแบบโพสต์</FieldLabel>
              <LayoutSelect
                id="new-tag-layout"
                value={newTag.layout}
                onChange={(layout) =>
                  setNewTag((prev) => ({ ...prev, layout }))
                }
              />
            </Field>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              ชื่อภาษาอังกฤษใช้เป็นลิงก์ของแท็ก (เช่น
              /contents?category=bedtime-stories)
            </span>
            <Button type="submit" disabled={pending || !newTag.label.trim()}>
              <PlusIcon />
              สร้างแท็ก
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
