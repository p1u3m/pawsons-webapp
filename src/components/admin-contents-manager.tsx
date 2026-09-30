"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowSquareOutIcon,
  DotsThreeIcon,
  ImageIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  PencilSimpleIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { AdminFeaturedSlots } from "@/components/admin-featured-slots";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPostEditor, type Editing } from "@/components/admin-post-editor";
import { StatusBadge } from "@/components/admin-status";
import { AdminTagManager } from "@/components/admin-tag-manager";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { characters } from "@/lib/data";
import type { ContentCategory } from "@/lib/posts";
import { deleteContent, type ContentRow } from "@/lib/supabase/contents";

const pageSize = 20;

/** List filters: every post, one tag ("tag:<slug>"), posts without a picture, or homepage picks. */
type Filter = "all" | "missing" | "featured" | `tag:${string}`;

export default function AdminContentsManager({
  contents,
  categories,
  initialFilter,
  startNew,
}: {
  contents: ContentRow[];
  categories: ContentCategory[];
  initialFilter?: string;
  startNew: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [rows, setRows] = useState(contents);
  const [tags, setTags] = useState(categories);
  const [filter, setFilter] = useState<Filter>(
    initialFilter === "missing" || initialFilter === "featured"
      ? initialFilter
      : "all",
  );
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(0);
  // The target stays set while the sheet animates closed; the key remounts it per open.
  const [editing, setEditing] = useState<Editing>("new");
  const [editorOpen, setEditorOpen] = useState(startNew);
  const [editorKey, setEditorKey] = useState(0);
  const [deleting, setDeleting] = useState<ContentRow | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const [tagManagerOpen, setTagManagerOpen] = useState(false);
  // Set while the tag manager was opened from the editor to create a tag.
  const [selectNewTag, setSelectNewTag] = useState<
    ((slug: string) => void) | null
  >(null);

  useEffect(() => setRows(contents), [contents]);
  useEffect(() => setTags(categories), [categories]);
  // ?new=1 (from the command menu) opens a draft once; drop it so a refresh does not reopen.
  useEffect(() => {
    if (startNew) router.replace(pathname, { scroll: false });
  }, [startNew, pathname, router]);

  const usage = Object.fromEntries(
    tags.map((tag) => [
      tag.slug,
      rows.filter((row) => row.category === tag.slug).length,
    ]),
  );
  const tabs: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "ทั้งหมด", count: rows.length },
    ...tags.map((tag) => ({
      value: `tag:${tag.slug}` as Filter,
      label: tag.label,
      count: usage[tag.slug],
    })),
    {
      value: "missing",
      label: "รอรูป",
      count: rows.filter((row) => !row.cover_image_url).length,
    },
    {
      value: "featured",
      label: "หน้าแรก",
      count: rows.filter((row) => row.featured_rank).length,
    },
  ];
  const tagOf = (slug: string) => tags.find((tag) => tag.slug === slug);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "missing"
          ? !row.cover_image_url
          : filter === "featured"
            ? row.featured_rank
            : `tag:${row.category}` === filter);
      const matchesType = type === "all" || row.character_type === type;
      const matchesQuery =
        !q ||
        [
          row.id,
          row.situation_title,
          row.body_1,
          row.quote_author,
          row.character_type,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesFilter && matchesType && matchesQuery;
    });
  }, [rows, filter, type, query]);
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const pageRows = visible.slice(current * pageSize, (current + 1) * pageSize);

  function openEditor(target: Editing) {
    setEditing(target);
    setEditorKey((key) => key + 1);
    setEditorOpen(true);
  }

  function resetFilters() {
    setFilter("all");
    setType("all");
    setQuery("");
    setPage(0);
  }

  function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    startDelete(async () => {
      const res = await deleteContent(target.id);
      if (!res.success) {
        toast.error("ลบโพสต์ไม่สำเร็จ", { description: res.error });
        return;
      }
      setRows((prev) => prev.filter((row) => row.id !== target.id));
      setDeleting(null);
      if (editing !== "new" && editing.id === target.id) setEditorOpen(false);
      toast.success("ลบโพสต์แล้ว", { description: target.situation_title });
      router.refresh();
    });
  }

  return (
    <>
      <AdminPageHeader
        title="คลังเนื้อหา"
        description="โพสต์ แท็ก และ 5 ช่องแนะนำบนหน้า Contents"
        actions={
          <>
            <Button
              variant="outline"
              render={<a href="/contents" target="_blank" />}
              nativeButton={false}
            >
              <ArrowSquareOutIcon />
              ดูหน้า Contents
            </Button>
            <Button variant="outline" onClick={() => setTagManagerOpen(true)}>
              <TagIcon />
              จัดการแท็ก
            </Button>
            <Button onClick={() => openEditor("new")}>
              <PlusIcon />
              เพิ่มโพสต์
            </Button>
          </>
        }
      />

      <AdminFeaturedSlots
        rows={rows}
        categories={tags}
        onEdit={openEditor}
        onRankChange={(id, rank) =>
          setRows((prev) =>
            prev.map((row) =>
              row.id === id
                ? { ...row, featured_rank: rank }
                : rank !== null && row.featured_rank === rank
                  ? { ...row, featured_rank: null }
                  : row,
            ),
          )
        }
      />

      <Card>
        <CardContent className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Phones: one select instead of a row of tabs that would scroll. */}
            <Select
              value={filter}
              onValueChange={(value) => {
                setFilter(value as Filter);
                setPage(0);
              }}
              items={tabs.map((tab) => ({
                value: tab.value,
                label: `${tab.label} (${tab.count})`,
              }))}
            >
              <SelectTrigger
                className="w-full sm:hidden"
                aria-label="กรองโพสต์"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value}>
                    {tab.label} ({tab.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs
              value={filter}
              onValueChange={(value) => {
                setFilter(value as Filter);
                setPage(0);
              }}
              className="hidden max-w-full overflow-x-auto sm:flex"
            >
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {tab.count}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex gap-2">
              <InputGroup className="min-w-0 flex-1 lg:w-64 lg:flex-none">
                <InputGroupAddon>
                  <MagnifyingGlassIcon />
                </InputGroupAddon>
                <InputGroupInput
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(0);
                  }}
                  placeholder="ค้นหาชื่อเรื่อง ข้อความ..."
                  aria-label="ค้นหาโพสต์"
                />
              </InputGroup>
              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value as string);
                  setPage(0);
                }}
                items={[
                  { value: "all", label: "ทุก TYPE" },
                  ...characters.map((c) => ({ value: c.type, label: c.type })),
                ]}
              >
                <SelectTrigger className="w-32" aria-label="กรองตาม TYPE">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุก TYPE</SelectItem>
                  {characters.map((c) => (
                    <SelectItem key={c.type} value={c.type}>
                      {c.type} · {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {pageRows.length ? (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-14">
                      <span className="sr-only">รูป</span>
                    </TableHead>
                    <TableHead>โพสต์</TableHead>
                    <TableHead className="hidden md:table-cell">แท็ก</TableHead>
                    <TableHead className="hidden sm:table-cell">TYPE</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      สถานะ
                    </TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">จัดการ</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      onClick={() => openEditor(row)}
                    >
                      <TableCell>
                        <span className="block h-12 w-10 overflow-hidden rounded-md border bg-muted">
                          {row.cover_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element -- Supabase storage URLs
                            <img
                              src={row.cover_image_url}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="flex size-full items-center justify-center text-muted-foreground">
                              <ImageIcon className="size-4" />
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-0 w-full">
                        <button
                          type="button"
                          className="grid w-full text-left"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditor(row);
                          }}
                        >
                          <span className="truncate font-medium">
                            {row.situation_title}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            #{row.id}
                            {tagOf(row.category)?.layout === "quote"
                              ? ` · ${row.quote_author || "ไม่ระบุผู้กล่าว"}`
                              : row.body_1
                                ? ` · ${row.body_1}`
                                : ""}
                          </span>
                        </button>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">
                          {tagOf(row.category)?.label ?? row.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {row.character_type || "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {row.cover_image_url ? (
                            <StatusBadge tone="green">มีรูป</StatusBadge>
                          ) : (
                            <StatusBadge tone="amber">รอรูป</StatusBadge>
                          )}
                          {row.featured_rank && (
                            <Badge variant="outline">
                              หน้าแรก #{row.featured_rank}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`จัดการ ${row.situation_title}`}
                              />
                            }
                          >
                            <DotsThreeIcon weight="bold" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-40">
                            <DropdownMenuItem onClick={() => openEditor(row)}>
                              <PencilSimpleIcon />
                              แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              render={
                                <a
                                  href={`/contents/${row.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                />
                              }
                            >
                              <ArrowSquareOutIcon />
                              ดูหน้าเว็บ
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleting(row)}
                            >
                              <TrashIcon />
                              ลบโพสต์
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <NewspaperIcon />
                </EmptyMedia>
                <EmptyTitle>
                  {rows.length ? "ไม่พบโพสต์" : "ยังไม่มีโพสต์"}
                </EmptyTitle>
                <EmptyDescription>
                  {rows.length
                    ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง"
                    : "เริ่มเพิ่มโพสต์แรก แล้วอัปโหลดรูปภายหลังก็ได้"}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                {rows.length ? (
                  <Button variant="outline" onClick={resetFilters}>
                    ล้างตัวกรอง
                  </Button>
                ) : (
                  <Button onClick={() => openEditor("new")}>
                    <PlusIcon />
                    เพิ่มโพสต์
                  </Button>
                )}
              </EmptyContent>
            </Empty>
          )}

          {visible.length > pageSize && (
            <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>
                {current * pageSize + 1}–
                {Math.min((current + 1) * pageSize, visible.length)} จาก{" "}
                {visible.length} โพสต์
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={current === 0}
                  onClick={() => setPage(current - 1)}
                >
                  ก่อนหน้า
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={current >= pageCount - 1}
                  onClick={() => setPage(current + 1)}
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AdminPostEditor
        key={editorKey}
        open={editorOpen}
        editing={editing}
        rows={rows}
        categories={tags}
        onNewTag={(select) => {
          setSelectNewTag(() => select);
          setTagManagerOpen(true);
        }}
        onClose={() => setEditorOpen(false)}
        onDelete={(row) => setDeleting(row)}
        onSaved={(row) => {
          setRows((prev) => {
            // A new featured pick bumps whichever post held that slot.
            const bumped = prev.map((other) =>
              other.id !== row.id &&
              row.featured_rank &&
              other.featured_rank === row.featured_rank
                ? { ...other, featured_rank: null }
                : other,
            );
            return bumped.some((other) => other.id === row.id)
              ? bumped.map((other) => (other.id === row.id ? row : other))
              : [row, ...bumped];
          });
          setEditing(row);
          router.refresh();
        }}
      />

      <AdminTagManager
        open={tagManagerOpen}
        onOpenChange={(open) => {
          setTagManagerOpen(open);
          if (!open) setSelectNewTag(null);
        }}
        categories={tags}
        usage={usage}
        onChange={(next) => {
          setTags(next);
          router.refresh();
        }}
        onCreated={(tag) => {
          // Opened from the editor: pick the new tag there and go back to the post.
          if (selectNewTag) {
            selectNewTag(tag.slug);
            setSelectNewTag(null);
            setTagManagerOpen(false);
          }
        }}
      />

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบโพสต์นี้?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.situation_title}” และรูปของโพสต์จะถูกลบถาวร
              ย้อนกลับไม่ได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "กำลังลบ..." : "ลบโพสต์"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
