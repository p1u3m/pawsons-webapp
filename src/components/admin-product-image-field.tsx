"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
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
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const shown = preview ?? (remove ? null : currentSrc);
  const clearFile = () => {
    if (input.current) input.current.value = "";
    setPreview(null);
  };

  return (
    <div className="flex items-start gap-4">
      <div className="size-28 shrink-0 overflow-hidden rounded-lg border bg-muted">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob: previews bypass next/image
          <img src={shown} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-6" />
          </span>
        )}
      </div>
      <div className="grid gap-2">
        <input
          ref={input}
          type="file"
          name="image"
          accept={Object.keys(productImageTypes).join(",")}
          className="sr-only"
          tabIndex={-1}
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
        {/* Checked only when the admin removes the saved photo. */}
        <input
          type="checkbox"
          name="remove_image"
          checked={remove}
          readOnly
          hidden
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => input.current?.click()}
          >
            <UploadSimpleIcon />
            {shown ? "เปลี่ยนรูป" : "อัปโหลดรูป"}
          </Button>
          {preview ? (
            <Button type="button" variant="ghost" size="sm" onClick={clearFile}>
              ยกเลิกรูปใหม่
            </Button>
          ) : (
            currentSrc &&
            !remove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRemove(true)}
              >
                <TrashIcon />
                ลบรูป
              </Button>
            )
          )}
          {remove && !preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRemove(false)}
            >
              เก็บรูปเดิม
            </Button>
          )}
        </div>
        <FieldDescription>
          {remove
            ? "รูปจะถูกลบเมื่อกดบันทึก"
            : "JPG, PNG หรือ WebP ไม่เกิน 5MB · แนะนำภาพสี่เหลี่ยมจัตุรัส · บันทึกพร้อมข้อมูลสินค้า"}
        </FieldDescription>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
