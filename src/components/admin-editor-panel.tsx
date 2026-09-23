"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { updateContent, uploadContentImage, deleteContentImage } from "@/lib/supabase/contents";
import type { ContentRow } from "@/lib/supabase/contents";
import {
  PencilSimpleIcon,
  ImageIcon,
  CheckIcon,
  XIcon,
  ArrowSquareOutIcon,
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
    <div className="aep-layout">
      {/* ── LEFT: Story list ── */}
      <div className="aep-list">
        {localContents.map((row) => (
          <button
            key={row.id}
            className={`aep-row ${selected?.id === row.id ? "aep-row-active" : ""}`}
            onClick={() => openEditor(row)}
          >
            <span className="aep-row-num">{String(row.id).padStart(2, "0")}</span>
            <span className="aep-row-title">{row.situation_title}</span>
            <span className="aep-row-right">
              {savedId === row.id ? (
                <CheckIcon size={14} weight="bold" className="aep-saved-icon" />
              ) : (
                <PencilSimpleIcon size={14} weight="regular" className="aep-edit-icon" />
              )}
            </span>
          </button>
        ))}
      </div>

      {/* ── RIGHT: Edit panel ── */}
      <div className={`aep-panel ${selected ? "aep-panel-open" : ""}`}>
        {!selected ? (
          <div className="aep-empty">
            <PencilSimpleIcon size={32} weight="thin" />
            <p>เลือกเรื่องที่ต้องการแก้ไข</p>
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
                  Preview
                </a>
                <button className="aep-close-btn" onClick={closeEditor}>
                  <XIcon size={16} weight="bold" />
                </button>
              </div>
            </div>

            <div className="aep-fields">
              {/* Title */}
              <div className="aep-field">
                <label className="aep-label" htmlFor="aep-title">
                  ชื่อสถานการณ์
                </label>
                <input
                  id="aep-title"
                  className="aep-input"
                  value={edit.situation_title}
                  onChange={(e) =>
                    setEdit((p) => ({ ...p, situation_title: e.target.value }))
                  }
                  placeholder="ชื่อสถานการณ์..."
                />
              </div>

              {/* Body 1 */}
              <div className="aep-field">
                <label className="aep-label" htmlFor="aep-body1">
                  ย่อหน้าที่ 1
                </label>
                <textarea
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
              <div className="aep-field">
                <label className="aep-label" htmlFor="aep-body2">
                  ย่อหน้าที่ 2
                </label>
                <textarea
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
              <div className="aep-field">
                <label className="aep-label" htmlFor="aep-quote">
                  Quote
                </label>
                <textarea
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
              <div className="aep-field">
                <label className="aep-label">รูปภาพปก</label>
                <div className="aep-image-row">
                  {edit.cover_image_url ? (
                    <div className="aep-image-thumb">
                      <Image
                        src={edit.cover_image_url}
                        alt="cover"
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
                    {uploadStatus && (
                      <span className="aep-upload-status">{uploadStatus}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {saveError && <p className="aep-error">{saveError}</p>}

            <div className="aep-footer">
              <button
                className="aep-save-btn"
                onClick={handleSave}
                disabled={saving || isPending}
              >
                {saving || isPending ? (
                  "กำลังบันทึก..."
                ) : (
                  <>
                    <CheckIcon size={14} weight="bold" />
                    บันทึก
                  </>
                )}
              </button>
              <button className="aep-discard-btn" onClick={closeEditor}>
                ยกเลิก
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
