"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  updateContent,
  uploadContentImage,
  deleteContentImage,
  setFeaturedRank,
  createContent,
  deleteContent,
} from "@/lib/supabase/contents";
import type { ContentRow } from "@/lib/supabase/contents";
import { characters } from "@/lib/data";
import { postCategories, type PostCategory } from "@/lib/posts";
import {
  PencilSimpleIcon,
  ImageIcon,
  CheckIcon,
  XIcon,
  ArrowSquareOutIcon,
  MagnifyingGlassIcon,
  FilesIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";

type Props = {
  contents: ContentRow[];
};

// Slots on the /contents magazine spread; must match the featured_rank check.
const featuredSlotLabels = [
  "1 · เรื่องเด่น (ใหญ่สุด)",
  "2 · ขวาบน ซ้าย",
  "3 · ขวาบน ขวา",
  "4 · ขวาล่าง ซ้าย",
  "5 · ขวาล่าง ขวา",
];

type EditState = {
  category: PostCategory;
  character_type: string;
  situation_no: string;
  situation_title: string;
  body_1: string;
  body_2: string;
  quote_author: string;
  cover_image_url: string;
};

const emptyEdit: EditState = {
  category: "situation",
  character_type: characters[0].type,
  situation_no: "",
  situation_title: "",
  body_1: "",
  body_2: "",
  quote_author: "",
  cover_image_url: "",
};

export default function AdminEditorPanel({ contents }: Props) {
  const [selected, setSelected] = useState<ContentRow | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [edit, setEdit] = useState<EditState>(emptyEdit);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [featureStatus, setFeatureStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  // Local copy of contents for optimistic title update in list
  const [localContents, setLocalContents] = useState<ContentRow[]>(contents);
  const coveredCount = localContents.filter(
    (row) => row.cover_image_url,
  ).length;
  const visibleContents = localContents.filter(
    (row) =>
      (filter === "all" || !row.cover_image_url) &&
      `${row.id} ${row.situation_title} ${row.character_type ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );

  function openEditor(row: ContentRow) {
    setSelected(row);
    setEdit({
      category: row.category,
      character_type: row.character_type ?? characters[0].type,
      situation_no: row.situation_no?.toString() ?? "",
      situation_title: row.situation_title,
      body_1: row.body_1 ?? "",
      body_2: row.body_2 ?? "",
      quote_author: row.quote_author ?? "",
      cover_image_url: row.cover_image_url ?? "",
    });
    setSaveError(null);
    setUploadStatus(null);
    setFeatureStatus(null);
  }

  function handleCreate() {
    startTransition(async () => {
      const res = await createContent();
      if (!res.row) {
        setSaveError(res.error ?? "เพิ่มโพสต์ไม่สำเร็จ");
        return;
      }
      setLocalContents((prev) => [res.row!, ...prev]);
      openEditor(res.row);
    });
  }

  function handleDelete() {
    if (!selected) return;
    if (!window.confirm(`ลบโพสต์ “${selected.situation_title}” และรูปของโพสต์นี้?`)) return;
    const id = selected.id;
    startTransition(async () => {
      const res = await deleteContent(id);
      if (!res.success) {
        setSaveError(res.error ?? "ลบไม่สำเร็จ");
        return;
      }
      setLocalContents((prev) => prev.filter((c) => c.id !== id));
      closeEditor();
    });
  }

  // Applies right away, like the cover image; the slot's previous story drops out.
  async function handleFeaturedChange(value: string) {
    if (!selected) return;
    const rank = value ? Number(value) : null;
    setFeatureStatus("กำลังบันทึก...");
    const res = await setFeaturedRank(selected.id, rank);
    if (!res.success) {
      setFeatureStatus(`บันทึกไม่สำเร็จ: ${res.error}`);
      return;
    }
    setFeatureStatus(rank ? "แสดงบนหน้า Contents แล้ว" : "นำออกจากหน้าแรกแล้ว");
    setLocalContents((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? { ...c, featured_rank: rank }
          : rank !== null && c.featured_rank === rank
            ? { ...c, featured_rank: null }
            : c,
      ),
    );
  }

  function closeEditor() {
    setSelected(null);
    setSaveError(null);
    setUploadStatus(null);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    setUploadStatus("กำลังอัปโหลด...");
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadContentImage(selected.id, fd);
    if (res.url) {
      setEdit((prev) => ({ ...prev, cover_image_url: res.url! }));
      setUploadStatus("อัปโหลดสำเร็จ");
      // Update local contents list thumbnail optimistically
      setLocalContents((prev) =>
        prev.map((c) =>
          c.id === selected.id ? { ...c, cover_image_url: res.url } : c,
        ),
      );
    } else {
      setUploadStatus(`อัปโหลดไม่สำเร็จ: ${res.error}`);
    }
  }

  async function handleRemoveImage() {
    if (!selected) return;
    const urlToRemove = edit.cover_image_url;
    setEdit((p) => ({ ...p, cover_image_url: "" }));
    if (urlToRemove) {
      setUploadStatus("กำลังลบรูปจาก Storage...");
      const res = await deleteContentImage(selected.id, urlToRemove);
      if (res.success) {
        setUploadStatus("ลบรูปออกจากระบบแล้ว");
        setLocalContents((prev) =>
          prev.map((c) =>
            c.id === selected.id ? { ...c, cover_image_url: null } : c,
          ),
        );
        setTimeout(() => setUploadStatus(null), 2500);
      } else {
        setUploadStatus(`ลบไม่สำเร็จ: ${res.error}`);
      }
    }
  }

  function handleSave() {
    if (!selected) return;
    if (!edit.situation_title.trim()) {
      setSaveError(
        edit.category === "quote"
          ? "กรุณาใส่ข้อความคำคมก่อนบันทึก"
          : "กรุณาระบุชื่อเรื่องก่อนบันทึก",
      );
      return;
    }
    const isSituation = edit.category === "situation";
    const fields = {
      category: edit.category,
      character_type: edit.character_type,
      situation_no:
        isSituation && edit.situation_no ? Number(edit.situation_no) : null,
      situation_title: edit.situation_title.trim(),
      body_1: isSituation ? edit.body_1.trim() : "",
      body_2: isSituation ? edit.body_2.trim() : "",
      quote_author: isSituation ? null : edit.quote_author.trim() || null,
      cover_image_url: edit.cover_image_url.trim() || null,
    };
    setSaveError(null);
    setSaving(true);
    startTransition(async () => {
      const res = await updateContent(selected.id, fields);
      setSaving(false);
      if (res.success) {
        // Optimistic update in list
        setLocalContents((prev) =>
          prev.map((c) => (c.id === selected.id ? { ...c, ...fields } : c)),
        );
        setSavedId(selected.id);
        setTimeout(() => setSavedId(null), 2000);
      } else {
        setSaveError(res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <>
      <section className="admin-overview" aria-label="ภาพรวมเนื้อหา">
        <div>
          <span>โพสต์ทั้งหมด</span>
          <strong>
            {localContents.length.toString().padStart(2, "0")}
            <small>โพสต์</small>
          </strong>
        </div>
        <div>
          <span>มีรูปแล้ว</span>
          <strong>
            {coveredCount.toString().padStart(2, "0")}
            <small>โพสต์</small>
          </strong>
        </div>
        <div>
          <span>รอรูป</span>
          <strong>
            {(localContents.length - coveredCount).toString().padStart(2, "0")}
            <small>โพสต์</small>
          </strong>
        </div>
        <p>
          ทุกเรื่องราวมีความหมาย
          <span>
            <button type="button" className="aep-start-btn" onClick={handleCreate} disabled={isPending}>
              <PlusIcon size={16} weight="bold" /> เพิ่มโพสต์ใหม่
            </button>
          </span>
        </p>
      </section>
      <div className="aep-layout">
        {/* ── LEFT: Story list ── */}
        <div className="aep-list">
          <div className="aep-list-tools">
            <div className="aep-list-heading">
              <h2>โพสต์ทั้งหมด</h2>
              <span>{visibleContents.length}</span>
            </div>
            <label className="aep-search">
              <MagnifyingGlassIcon size={18} />
              <input
                aria-label="ค้นหาโพสต์"
                placeholder="ค้นหาชื่อเรื่อง หรือบุคลิกภาพ..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="aep-filters" aria-label="กรองเนื้อหา">
              <button
                aria-pressed={filter === "all"}
                onClick={() => setFilter("all")}
              >
                ทั้งหมด
              </button>
              <button
                aria-pressed={filter === "missing"}
                onClick={() => setFilter("missing")}
              >
                รอรูป
              </button>
            </div>
          </div>
          <div className="aep-list-rows">
            {visibleContents.map((row) => (
              <button
                key={row.id}
                className={`aep-row ${selected?.id === row.id ? "aep-row-active" : ""}`}
                onClick={() => openEditor(row)}
                aria-pressed={selected?.id === row.id}
              >
                <span className="aep-row-num">
                  {String(row.id).padStart(2, "0")}
                </span>
                <span className="aep-row-copy">
                  <span className="aep-row-title">{row.situation_title}</span>
                  <span className="aep-row-caption">
                    {postCategories[row.category]?.label ?? row.category}
                    <span>·</span>
                    {row.character_type || "—"}
                    <span>·</span>
                    {row.cover_image_url ? "มีรูปแล้ว" : "รอรูป"}
                    {row.featured_rank && (
                      <>
                        <span>·</span>
                        แนะนำ #{row.featured_rank}
                      </>
                    )}
                  </span>
                </span>
                <span className="aep-row-right">
                  {savedId === row.id ? (
                    <CheckIcon
                      size={14}
                      weight="bold"
                      className="aep-saved-icon"
                    />
                  ) : (
                    <PencilSimpleIcon
                      size={14}
                      weight="regular"
                      className="aep-edit-icon"
                    />
                  )}
                </span>
              </button>
            ))}
            {visibleContents.length === 0 && (
              <div className="aep-no-results">
                <FilesIcon size={28} />
                <p>
                  {localContents.length
                    ? "ไม่พบโพสต์ที่ตรงกับการค้นหา"
                    : "ยังไม่มีโพสต์ในคลัง"}
                </p>
                {localContents.length > 0 && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                    }}
                  >
                    ล้างตัวกรอง
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Edit panel ── */}
        <div className={`aep-panel ${selected ? "aep-panel-open" : ""}`}>
          {!selected ? (
            <div className="aep-empty">
              <span className="aep-empty-icon">
                <FilesIcon size={36} weight="duotone" />
              </span>
              <span className="admin-eyebrow">Your next story starts here</span>
              <h2>พื้นที่สำหรับเรื่องราวดี ๆ</h2>
              <p>
                เลือกโพสต์จากรายการเพื่อแก้ไข
                <br />
                หรือเพิ่มโพสต์ใหม่ แล้วอัปโหลดรูปภายหลังก็ได้
              </p>
              <button
                className="aep-start-btn"
                onClick={handleCreate}
                disabled={isPending}
              >
                <PlusIcon size={16} weight="bold" /> เพิ่มโพสต์ใหม่
              </button>
            </div>
          ) : (
            <>
              <div className="aep-panel-header">
                <div className="aep-panel-meta">
                  <span className="aep-panel-num">
                    {String(selected.id).padStart(2, "0")}
                  </span>
                  <span className="aep-panel-badge">กำลังแก้ไข</span>
                </div>
                <div className="aep-panel-actions-top">
                  <a
                    href={`/contents/${selected.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="aep-preview-link"
                  >
                    <ArrowSquareOutIcon size={14} weight="bold" />
                    ดูหน้าเว็บ
                  </a>
                  <button
                    className="aep-close-btn"
                    onClick={closeEditor}
                    aria-label="ปิดตัวแก้ไข"
                  >
                    <XIcon size={16} weight="bold" />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-5">
                <div className="aep-section-heading">
                  <h2>รายละเอียดโพสต์</h2>
                  <p>ข้อความบนรูปใช้เป็นคำอธิบายและสำหรับค้นหา</p>
                </div>

                {/* Category + character */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="aep-label" htmlFor="aep-category">
                      หมวด
                    </label>
                    <select
                      id="aep-category"
                      className="aep-input h-auto"
                      value={edit.category}
                      onChange={(e) =>
                        setEdit((p) => ({
                          ...p,
                          category: e.target.value as PostCategory,
                        }))
                      }
                    >
                      {(Object.keys(postCategories) as PostCategory[]).map(
                        (value) => (
                          <option key={value} value={value}>
                            {postCategories[value].label}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="aep-label" htmlFor="aep-character">
                      ตัวละคร
                    </label>
                    <select
                      id="aep-character"
                      className="aep-input h-auto"
                      value={edit.character_type}
                      onChange={(e) =>
                        setEdit((p) => ({ ...p, character_type: e.target.value }))
                      }
                    >
                      {characters.map((c) => (
                        <option key={c.type} value={c.type}>
                          {c.type} · {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Featured slot on /contents */}
                <div className="flex flex-col gap-1.5">
                  <label className="aep-label" htmlFor="aep-featured">
                    แสดงบนหน้า Contents
                  </label>
                  <select
                    id="aep-featured"
                    className="aep-input h-auto"
                    value={
                      localContents.find((c) => c.id === selected.id)
                        ?.featured_rank ?? ""
                    }
                    onChange={(e) => handleFeaturedChange(e.target.value)}
                  >
                    <option value="">ไม่แสดง (อยู่ในรายการทั้งหมดเท่านั้น)</option>
                    {featuredSlotLabels.map((label, i) => {
                      const holder = localContents.find(
                        (c) => c.featured_rank === i + 1 && c.id !== selected.id,
                      );
                      return (
                        <option key={label} value={i + 1}>
                          {label}
                          {holder ? ` — แทนที่ “${holder.situation_title}”` : ""}
                        </option>
                      );
                    })}
                  </select>
                  <span className="aep-upload-status">
                    {featureStatus ?? "เลือกแล้วมีผลทันที · ช่องที่ว่างจะเติมเรื่องอื่นให้อัตโนมัติ"}
                  </span>
                </div>

                {edit.category === "situation" ? (
                  <>
                    <div className="grid grid-cols-[1fr_110px] gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="aep-label" htmlFor="aep-title">
                          ชื่อเรื่อง
                        </label>
                        <Input
                          id="aep-title"
                          className="aep-input h-auto"
                          value={edit.situation_title}
                          onChange={(e) =>
                            setEdit((p) => ({
                              ...p,
                              situation_title: e.target.value,
                            }))
                          }
                          placeholder="เมื่อ INTJ เจอคนโกหกต่อหน้า"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="aep-label" htmlFor="aep-sit-no">
                          สถานการณ์ที่
                        </label>
                        <Input
                          id="aep-sit-no"
                          className="aep-input h-auto"
                          type="number"
                          min={1}
                          value={edit.situation_no}
                          onChange={(e) =>
                            setEdit((p) => ({ ...p, situation_no: e.target.value }))
                          }
                          placeholder="1"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="aep-label" htmlFor="aep-body1">
                        ข้อความหลัก
                      </label>
                      <Textarea
                        id="aep-body1"
                        className="aep-textarea aep-textarea-sm"
                        rows={2}
                        value={edit.body_1}
                        onChange={(e) =>
                          setEdit((p) => ({ ...p, body_1: e.target.value }))
                        }
                        placeholder="ข้อความตัวใหญ่ใต้ภาพ"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="aep-label" htmlFor="aep-body2">
                        ข้อความรอง
                      </label>
                      <Textarea
                        id="aep-body2"
                        className="aep-textarea aep-textarea-sm"
                        rows={2}
                        value={edit.body_2}
                        onChange={(e) =>
                          setEdit((p) => ({ ...p, body_2: e.target.value }))
                        }
                        placeholder="บรรทัดสีด้านล่าง"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="aep-label" htmlFor="aep-title">
                        คำคม
                      </label>
                      <Textarea
                        id="aep-title"
                        className="aep-textarea aep-textarea-sm"
                        rows={3}
                        value={edit.situation_title}
                        onChange={(e) =>
                          setEdit((p) => ({
                            ...p,
                            situation_title: e.target.value,
                          }))
                        }
                        placeholder="ข้อความคำคม (ไม่ต้องใส่เครื่องหมายคำพูด)"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="aep-label" htmlFor="aep-author">
                        ผู้กล่าว
                      </label>
                      <Input
                        id="aep-author"
                        className="aep-input h-auto"
                        value={edit.quote_author}
                        onChange={(e) =>
                          setEdit((p) => ({ ...p, quote_author: e.target.value }))
                        }
                        placeholder="Mark Twain"
                      />
                    </div>
                  </>
                )}

                {/* Cover image */}
                <div className="flex flex-col gap-1.5">
                  <label className="aep-label">รูปโพสต์ (4:5 · ว่างไว้ได้ จะขึ้นเป็นกรอบรอรูป)</label>
                  <div className="aep-image-row">
                    {edit.cover_image_url ? (
                      <div className="aep-image-thumb">
                        <Image
                          src={edit.cover_image_url}
                          alt={`รูปโพสต์ ${edit.situation_title}`}
                          width={64}
                          height={64}
                          style={{ objectFit: "cover", borderRadius: 8 }}
                          unoptimized
                        />
                        <button
                          className="aep-image-remove"
                          onClick={handleRemoveImage}
                          title="ลบรูปภาพและนำออกจาก Storage"
                          type="button"
                        >
                          <XIcon size={10} weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <div className="aep-image-placeholder">
                        <ImageIcon size={20} weight="thin" />
                      </div>
                    )}
                    <div className="aep-image-btns">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                      <button
                        className="aep-upload-btn"
                        onClick={() => fileRef.current?.click()}
                      >
                        <ImageIcon size={13} weight="regular" />
                        อัปโหลดรูป
                      </button>
                      <span className="aep-upload-status">
                        JPG, PNG, WebP หรือ GIF · เปลี่ยนภาพมีผลทันที
                      </span>
                      {uploadStatus && (
                        <span className="aep-upload-status">
                          {uploadStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {saveError && (
                <p className="aep-error" role="alert">
                  {saveError}
                </p>
              )}

              <div className="aep-footer">
                <span className="aep-save-note" role="status">
                  {savedId === selected.id
                    ? "บันทึกการเปลี่ยนแปลงแล้ว"
                    : "ข้อความจะเผยแพร่เมื่อกดบันทึก"}
                </span>
                <Button
                  variant="unstyled"
                  size="auto"
                  className="aep-save-btn"
                  onClick={handleSave}
                  disabled={saving || isPending}
                >
                  {saving || isPending ? (
                    "กำลังบันทึก..."
                  ) : (
                    <>
                      <CheckIcon size={14} weight="bold" />
                      บันทึกการเปลี่ยนแปลง
                    </>
                  )}
                </Button>
                <Button
                  variant="unstyled"
                  size="auto"
                  className="aep-discard-btn"
                  onClick={closeEditor}
                >
                  ยกเลิก
                </Button>
                <Button
                  variant="unstyled"
                  size="auto"
                  className="aep-discard-btn"
                  onClick={handleDelete}
                  disabled={isPending}
                  aria-label="ลบโพสต์นี้"
                  title="ลบโพสต์นี้"
                >
                  <TrashIcon size={14} weight="bold" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
