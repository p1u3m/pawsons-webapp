"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  ArrowSquareOutIcon,
  ImageIcon,
  PlusIcon,
  TrashIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { slotLabels } from "@/components/admin-featured-slots";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { characters } from "@/lib/data";
import type { ContentCategory } from "@/lib/posts";
import {
  createContent,
  deleteContentImage,
  setFeaturedRank,
  updateContent,
  uploadContentImage,
  type ContentRow,
} from "@/lib/supabase/contents";

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
/** Select value that opens the tag manager instead of picking a tag. */
const newTagValue = "__new_tag";

/** Editor target: an existing post, or "new" for an unsaved draft. */
export type Editing = ContentRow | "new";

type Draft = {
  category: string;
  character_type: string;
  situation_no: string;
  situation_title: string;
  body_1: string;
  body_2: string;
  quote_author: string;
  featured: string;
};

function toDraft(row: ContentRow | null, defaultCategory: string): Draft {
  return {
    category: row?.category ?? defaultCategory,
    character_type: row?.character_type ?? characters[0].type,
    situation_no: row?.situation_no?.toString() ?? "",
    situation_title: row?.situation_title ?? "",
    body_1: row?.body_1 ?? "",
    body_2: row?.body_2 ?? "",
    quote_author: row?.quote_author ?? "",
    featured: row?.featured_rank?.toString() ?? "none",
  };
}

export function AdminPostEditor({
  open,
  editing,
  rows,
  categories,
  onNewTag,
  onClose,
  onDelete,
  onSaved,
}: {
  open: boolean;
  editing: Editing;
  rows: ContentRow[];
  categories: ContentCategory[];
  /** Opens the tag manager; the callback receives the created tag. */
  onNewTag: (select: (slug: string) => void) => void;
  onClose: () => void;
  onDelete: (row: ContentRow) => void;
  onSaved: (row: ContentRow) => void;
}) {
  const row = editing === "new" ? null : editing;
  const defaultCategory = categories[0]?.slug ?? "situation";
  const initial = useMemo(
    () => toDraft(row, defaultCategory),
    [row, defaultCategory],
  );
  const [draft, setDraft] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [saving, startSave] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const dirty =
    file !== null ||
    removeImage ||
    (Object.keys(draft) as (keyof Draft)[]).some(
      (key) => draft[key] !== initial[key],
    );
  const image =
    preview ?? (removeImage ? null : (row?.cover_image_url ?? null));
  const isQuote =
    categories.find((category) => category.slug === draft.category)?.layout ===
    "quote";
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  function requestClose() {
    if (dirty && !saving) setConfirmDiscard(true);
    else onClose();
  }

  function pickFile(next: File | undefined) {
    if (fileInput.current) fileInput.current.value = "";
    if (!next) return;
    if (!imageTypes.includes(next.type)) {
      toast.error("รองรับเฉพาะ JPG, PNG, WebP หรือ GIF");
      return;
    }
    setFile(next);
    setRemoveImage(false);
    setPreview(URL.createObjectURL(next));
  }

  function save() {
    if (!draft.situation_title.trim()) {
      setError(isQuote ? "กรุณาใส่ข้อความคำคม" : "กรุณาใส่ชื่อเรื่อง");
      return;
    }
    setError(null);
    const fields = {
      category: draft.category,
      character_type: draft.character_type,
      situation_no:
        !isQuote && draft.situation_no ? Number(draft.situation_no) : null,
      situation_title: draft.situation_title.trim(),
      body_1: isQuote ? "" : draft.body_1.trim(),
      body_2: isQuote ? "" : draft.body_2.trim(),
      quote_author: isQuote ? draft.quote_author.trim() || null : null,
    };
    const rank = draft.featured === "none" ? null : Number(draft.featured);

    startSave(async () => {
      let saved: ContentRow;
      if (row) {
        const res = await updateContent(row.id, fields);
        if (!res.success) return setError(res.error ?? "บันทึกไม่สำเร็จ");
        saved = { ...row, ...fields };
      } else {
        const res = await createContent(fields);
        if (!res.row) return setError(res.error ?? "เพิ่มโพสต์ไม่สำเร็จ");
        saved = res.row;
      }

      // Picture and slot save after the post exists, so a new draft can use them too.
      if (file) {
        const data = new FormData();
        data.append("file", file);
        const res = await uploadContentImage(saved.id, data);
        if (res.url) saved.cover_image_url = res.url;
        else toast.error("อัปโหลดรูปไม่สำเร็จ", { description: res.error });
      } else if (removeImage && saved.cover_image_url) {
        const res = await deleteContentImage(saved.id, saved.cover_image_url);
        if (res.success) saved.cover_image_url = null;
        else toast.error("ลบรูปไม่สำเร็จ", { description: res.error });
      }
      if (rank !== (row?.featured_rank ?? null)) {
        const res = await setFeaturedRank(saved.id, rank);
        if (res.success) saved.featured_rank = rank;
        else toast.error("ตั้งค่าหน้าแรกไม่สำเร็จ", { description: res.error });
      }

      toast.success(row ? "บันทึกการเปลี่ยนแปลงแล้ว" : "เพิ่มโพสต์แล้ว", {
        description: saved.situation_title,
      });
      setFile(null);
      setPreview(null);
      setRemoveImage(false);
      onSaved({ ...saved });
    });
  }

  const slotItems = [
    { value: "none", label: "ไม่แสดง (อยู่ในรายการทั้งหมด)" },
    ...slotLabels.map((label, i) => {
      const holder = rows.find(
        (other) => other.featured_rank === i + 1 && other.id !== row?.id,
      );
      return {
        value: String(i + 1),
        label: `${i + 1} · ${label}${holder ? ` — แทนที่ “${holder.situation_title}”` : ""}`,
      };
    }),
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={(open) => !open && requestClose()}>
        <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
          <SheetHeader className="border-b">
            <SheetTitle>
              {row ? `แก้ไขโพสต์ #${row.id}` : "โพสต์ใหม่"}
            </SheetTitle>
            <SheetDescription>
              {row
                ? "การเปลี่ยนแปลงทั้งหมดจะเผยแพร่เมื่อกดบันทึก"
                : "กรอกข้อมูลแล้วกดบันทึก รูปจะอัปโหลดพร้อมกัน"}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <FieldGroup>
              <Field>
                <FieldLabel>รูปโพสต์</FieldLabel>
                <div className="flex items-start gap-4">
                  <div className="aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- blob: previews and storage URLs
                      <img
                        src={image}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="size-6" />
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <input
                      ref={fileInput}
                      type="file"
                      accept={imageTypes.join(",")}
                      className="sr-only"
                      tabIndex={-1}
                      onChange={(event) => pickFile(event.target.files?.[0])}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInput.current?.click()}
                      >
                        <UploadSimpleIcon />
                        {image ? "เปลี่ยนรูป" : "อัปโหลดรูป"}
                      </Button>
                      {file ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFile(null);
                            setPreview(null);
                          }}
                        >
                          ยกเลิกรูปใหม่
                        </Button>
                      ) : (
                        row?.cover_image_url &&
                        !removeImage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRemoveImage(true)}
                          >
                            <TrashIcon />
                            ลบรูป
                          </Button>
                        )
                      )}
                    </div>
                    <FieldDescription>
                      {removeImage
                        ? "รูปจะถูกลบเมื่อกดบันทึก"
                        : "สัดส่วน 4:5 · JPG, PNG, WebP หรือ GIF · ว่างไว้ได้ จะขึ้นเป็นกรอบรอรูป"}
                    </FieldDescription>
                  </div>
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="post-category">แท็ก</FieldLabel>
                  <Select
                    value={draft.category}
                    onValueChange={(value) => {
                      if (value === newTagValue) {
                        onNewTag((slug) => set("category", slug));
                      } else set("category", value as string);
                    }}
                    items={[
                      ...categories.map((category) => ({
                        value: category.slug,
                        label: category.label,
                      })),
                      { value: newTagValue, label: "สร้างแท็กใหม่..." },
                    ]}
                  >
                    <SelectTrigger id="post-category" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {category.label}
                        </SelectItem>
                      ))}
                      <SelectSeparator />
                      <SelectItem value={newTagValue}>
                        <PlusIcon />
                        สร้างแท็กใหม่...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="post-character">ตัวละคร</FieldLabel>
                  <Select
                    value={draft.character_type}
                    onValueChange={(value) =>
                      set("character_type", value as string)
                    }
                    items={characters.map((c) => ({
                      value: c.type,
                      label: `${c.type} · ${c.name}`,
                    }))}
                  >
                    <SelectTrigger id="post-character" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {characters.map((c) => (
                        <SelectItem key={c.type} value={c.type}>
                          {c.type} · {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {isQuote ? (
                <>
                  <Field data-invalid={Boolean(error) || undefined}>
                    <FieldLabel htmlFor="post-title">คำคม</FieldLabel>
                    <Textarea
                      id="post-title"
                      rows={3}
                      value={draft.situation_title}
                      onChange={(event) =>
                        set("situation_title", event.target.value)
                      }
                      placeholder="ข้อความคำคม (ไม่ต้องใส่เครื่องหมายคำพูด)"
                      aria-invalid={Boolean(error) || undefined}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="post-author">ผู้กล่าว</FieldLabel>
                    <Input
                      id="post-author"
                      value={draft.quote_author}
                      onChange={(event) =>
                        set("quote_author", event.target.value)
                      }
                      placeholder="Mark Twain"
                    />
                  </Field>
                </>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
                    <Field data-invalid={Boolean(error) || undefined}>
                      <FieldLabel htmlFor="post-title">ชื่อเรื่อง</FieldLabel>
                      <Input
                        id="post-title"
                        value={draft.situation_title}
                        onChange={(event) =>
                          set("situation_title", event.target.value)
                        }
                        placeholder="เมื่อ INTJ เจอคนโกหกต่อหน้า"
                        aria-invalid={Boolean(error) || undefined}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="post-no">สถานการณ์ที่</FieldLabel>
                      <Input
                        id="post-no"
                        type="number"
                        min={1}
                        value={draft.situation_no}
                        onChange={(event) =>
                          set("situation_no", event.target.value)
                        }
                        placeholder="1"
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="post-body1">ข้อความหลัก</FieldLabel>
                    <Textarea
                      id="post-body1"
                      rows={2}
                      value={draft.body_1}
                      onChange={(event) => set("body_1", event.target.value)}
                      placeholder="ข้อความตัวใหญ่ใต้ภาพ"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="post-body2">ข้อความรอง</FieldLabel>
                    <Textarea
                      id="post-body2"
                      rows={2}
                      value={draft.body_2}
                      onChange={(event) => set("body_2", event.target.value)}
                      placeholder="บรรทัดสีด้านล่าง"
                    />
                  </Field>
                </>
              )}

              <Field>
                <FieldLabel htmlFor="post-featured">
                  แสดงบนหน้าแรก Contents
                </FieldLabel>
                <Select
                  value={draft.featured}
                  onValueChange={(value) => set("featured", value as string)}
                  items={slotItems}
                >
                  <SelectTrigger id="post-featured" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {slotItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  โพสต์เดิมในช่องที่เลือกจะกลับไปอยู่ในรายการทั้งหมด
                </FieldDescription>
              </Field>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </FieldGroup>
          </div>

          <SheetFooter className="flex-row items-center border-t">
            {row && (
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(row)}
              >
                <TrashIcon />
                ลบ
              </Button>
            )}
            {row && (
              <Button
                variant="ghost"
                render={
                  <a
                    href={`/contents/${row.id}`}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
                nativeButton={false}
              >
                <ArrowSquareOutIcon />
                ดูหน้าเว็บ
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={requestClose}>
                ยกเลิก
              </Button>
              <Button
                onClick={save}
                disabled={saving || (row !== null && !dirty)}
              >
                {saving ? "กำลังบันทึก..." : row ? "บันทึก" : "เพิ่มโพสต์"}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>ทิ้งการเปลี่ยนแปลง?</AlertDialogTitle>
            <AlertDialogDescription>
              สิ่งที่แก้ไขไว้ยังไม่ได้บันทึก
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>แก้ไขต่อ</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setConfirmDiscard(false);
                onClose();
              }}
            >
              ทิ้งการเปลี่ยนแปลง
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
