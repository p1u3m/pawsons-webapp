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
} from "@/lib/supabase/contents";
import type { ContentRow } from "@/lib/supabase/contents";
import {
  PencilSimpleIcon,
  ImageIcon,
  CheckIcon,
  XIcon,
  ArrowSquareOutIcon,
  MagnifyingGlassIcon,
  FilesIcon,
} from "@phosphor-icons/react";

type Props = {
  contents: ContentRow[];
};

type EditState = {
  situation_title: string;
  body_1: string;
  body_2: string;
  quote: string;
  cover_image_url: string;
};

export default function AdminEditorPanel({ contents }: Props) {
  const [selected, setSelected] = useState<ContentRow | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [edit, setEdit] = useState<EditState>({
    situation_title: "",
    body_1: "",
    body_2: "",
    quote: "",
    cover_image_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
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
      situation_title: row.situation_title,
      body_1: row.body_1 ?? "",
      body_2: row.body_2 ?? "",
      quote: row.quote ?? "",
      cover_image_url: row.cover_image_url ?? "",
    });
    setSaveError(null);
    setUploadStatus(null);
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
      setSaveError("กรุณาระบุชื่อสถานการณ์ก่อนบันทึก");
      return;
    }
    setSaveError(null);
    setSaving(true);
    startTransition(async () => {
      const res = await updateContent(selected.id, {
        situation_title: edit.situation_title.trim(),
        body_1: edit.body_1.trim(),
        body_2: edit.body_2.trim(),
        quote: edit.quote.trim(),
        cover_image_url: edit.cover_image_url.trim() || null,
      });
      setSaving(false);
      if (res.success) {
        // Optimistic update in list
        setLocalContents((prev) =>
          prev.map((c) =>
            c.id === selected.id
              ? { ...c, ...edit, cover_image_url: edit.cover_image_url || null }
              : c,
          ),
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
          <span>เรื่องราวทั้งหมด</span>
          <strong>
            {localContents.length.toString().padStart(2, "0")}
            <small>สถานการณ์</small>
          </strong>
        </div>
        <div>
          <span>มีภาพปกแล้ว</span>
          <strong>
            {coveredCount.toString().padStart(2, "0")}
            <small>เรื่อง</small>
          </strong>
        </div>
        <div>
          <span>ยังไม่มีภาพปก</span>
          <strong>
            {(localContents.length - coveredCount).toString().padStart(2, "0")}
            <small>เรื่อง</small>
          </strong>
        </div>
        <p>
          ทุกเรื่องราวมีความหมาย
          <span>เลือกเรื่องที่ต้องการ แล้วเริ่มปรับแต่งเนื้อหาได้เลย</span>
        </p>
      </section>
      <div className="aep-layout">
        {/* ── LEFT: Story list ── */}
        <div className="aep-list">
          <div className="aep-list-tools">
            <div className="aep-list-heading">
              <h2>สถานการณ์ทั้งหมด</h2>
              <span>{visibleContents.length}</span>
            </div>
            <label className="aep-search">
              <MagnifyingGlassIcon size={18} />
              <input
                aria-label="ค้นหาสถานการณ์"
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
                ยังไม่มีภาพปก
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
                    {row.character_type || "Pawsons story"}
                    <span>·</span>
                    {row.cover_image_url ? "มีภาพปกแล้ว" : "ยังไม่มีภาพปก"}
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
                    ? "ไม่พบเรื่องที่ตรงกับการค้นหา"
                    : "ยังไม่มีเนื้อหาในคลัง"}
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
                เลือกสถานการณ์จากรายการเพื่อแก้ไขข้อความ
                <br />
                เพิ่มภาพปก และเตรียมเรื่องราวสำหรับผู้อ่าน
              </p>
              {localContents[0] && (
                <button
                  className="aep-start-btn"
                  onClick={() => openEditor(localContents[0])}
                >
                  เริ่มแก้ไขเรื่องแรก <PencilSimpleIcon size={16} />
                </button>
              )}
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
                  <h2>รายละเอียดเรื่องราว</h2>
                  <p>ปรับข้อความและภาพประกอบที่แสดงบนเว็บไซต์</p>
                </div>
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="aep-label" htmlFor="aep-title">
                    ชื่อสถานการณ์
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
                    placeholder="ชื่อสถานการณ์..."
                  />
                </div>

                {/* Body 1 */}
                <div className="flex flex-col gap-1.5">
                  <label className="aep-label" htmlFor="aep-body1">
                    ย่อหน้าที่ 1
                  </label>
                  <Textarea
                    id="aep-body1"
                    className="aep-textarea"
                    rows={4}
                    value={edit.body_1}
                    onChange={(e) =>
                      setEdit((p) => ({ ...p, body_1: e.target.value }))
                    }
                    placeholder="เนื้อหาย่อหน้าแรก..."
                  />
                </div>

                {/* Body 2 */}
                <div className="flex flex-col gap-1.5">
                  <label className="aep-label" htmlFor="aep-body2">
                    ย่อหน้าที่ 2
                  </label>
                  <Textarea
                    id="aep-body2"
                    className="aep-textarea"
                    rows={4}
                    value={edit.body_2}
                    onChange={(e) =>
                      setEdit((p) => ({ ...p, body_2: e.target.value }))
                    }
                    placeholder="เนื้อหาย่อหน้าสอง..."
                  />
                </div>

                {/* Quote */}
                <div className="flex flex-col gap-1.5">
                  <label className="aep-label" htmlFor="aep-quote">
                    Quote
                  </label>
                  <Textarea
                    id="aep-quote"
                    className="aep-textarea aep-textarea-sm"
                    rows={2}
                    value={edit.quote}
                    onChange={(e) =>
                      setEdit((p) => ({ ...p, quote: e.target.value }))
                    }
                    placeholder='"คำพูดที่อยากฝากไว้..."'
                  />
                </div>

                {/* Cover image */}
                <div className="flex flex-col gap-1.5">
                  <label className="aep-label">รูปภาพปก</label>
                  <div className="aep-image-row">
                    {edit.cover_image_url ? (
                      <div className="aep-image-thumb">
                        <Image
                          src={edit.cover_image_url}
                          alt={`ภาพปก ${edit.situation_title}`}
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
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
