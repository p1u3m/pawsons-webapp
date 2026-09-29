"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { maxProductImageBytes, productImageTypes } from "@/lib/shop/images";

/**
 * Picks a product photo for the product form. The file is submitted with the form,
 * so the image and the other fields save together in one action.
 */
export function ProductImageField({
  currentSrc,
}: {
  /** The product's uploaded photo, if any. */
  currentSrc: string | null;
}) {
  const hasUpload = Boolean(currentSrc);
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const shown = preview ?? (remove ? null : currentSrc);
  const clearFile = () => {
    if (input.current) input.current.value = "";
    setPreview(null);
  };

  return (
    <div className="ashop-image-field">
      <div className="ashop-image-preview">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob: previews bypass next/image
          <img src={shown} alt="" />
        ) : (
          <span>
            <ImageIcon size={28} aria-hidden="true" />
            ยังไม่มีรูปสินค้า
          </span>
        )}
      </div>
      <div className="ashop-image-actions">
        <label className="ashop-button ashop-button--ghost">
          <UploadSimpleIcon size={16} aria-hidden="true" />
          {preview || hasUpload ? "เปลี่ยนรูป" : "อัปโหลดรูป"}
          <input
            ref={input}
            type="file"
            name="image"
            accept={Object.keys(productImageTypes).join(",")}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setError("");
              if (!file) return clearFile();
              if (!(file.type in productImageTypes)) {
                setError("รองรับเฉพาะ JPG, PNG หรือ WebP");
                return clearFile();
              }
              if (file.size > maxProductImageBytes) {
                setError("ไฟล์ต้องไม่เกิน 5MB");
                return clearFile();
              }
              setRemove(false);
              setPreview(URL.createObjectURL(file));
            }}
          />
        </label>
        {preview && (
          <button type="button" className="ashop-text-button" onClick={clearFile}>
            ยกเลิกรูปใหม่
          </button>
        )}
        {!preview && hasUpload && (
          <label className="ashop-text-button">
            <input
              type="checkbox"
              name="remove_image"
              checked={remove}
              onChange={(event) => setRemove(event.target.checked)}
            />
            <TrashIcon size={14} aria-hidden="true" />
            {remove ? "จะลบรูปเมื่อบันทึก" : "ลบรูปนี้"}
          </label>
        )}
        <small>
          JPG, PNG หรือ WebP ไม่เกิน 5MB · แนะนำภาพสี่เหลี่ยมจัตุรัส
          รูปจะบันทึกพร้อมข้อมูลสินค้าเมื่อกดบันทึก
        </small>
        {error && (
          <small className="ashop-image-error" role="alert">
            {error}
          </small>
        )}
      </div>
    </div>
  );
}
