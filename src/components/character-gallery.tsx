"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsOutIcon,
} from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function CharacterGallery({
  type,
  name,
}: {
  type: string;
  name: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const imagePath = (index: number) =>
    `/characters/reference/extra/${type}-${index + 1}.webp`;
  return (
    <>
      <div className="profile-gallery">
        {[0, 1, 2, 3].map((index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`ขยายภาพ ${name} ภาพที่ ${index + 1}`}
          >
            <Image
              src={imagePath(index)}
              alt={`${name} ในอีกมุมหนึ่ง ภาพที่ ${index + 1}`}
              width={400}
              height={400}
              sizes="(max-width: 767px) 44vw, 240px"
            />
            <span>
              <ArrowsOutIcon size={18} aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>
      <Dialog
        open={active !== null}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      >
        <DialogContent
          className="profile-lightbox"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              setActive((value) => ((value ?? 0) + 3) % 4);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              setActive((value) => ((value ?? 0) + 1) % 4);
            }
          }}
        >
          <DialogTitle>
            {name} · {type}
          </DialogTitle>
          {active !== null && (
            <Image
              src={imagePath(active)}
              alt={`${name} ภาพที่ ${active + 1}`}
              width={700}
              height={700}
              sizes="(max-width: 767px) 85vw, 560px"
            />
          )}
          <div className="profile-lightbox-controls">
            <button
              type="button"
              title="ภาพก่อนหน้า"
              aria-label="ภาพก่อนหน้า"
              onClick={() => setActive((value) => ((value ?? 0) + 3) % 4)}
            >
              <ArrowLeftIcon size={20} />
            </button>
            <span aria-live="polite">{(active ?? 0) + 1} / 4</span>
            <button
              type="button"
              title="ภาพถัดไป"
              aria-label="ภาพถัดไป"
              onClick={() => setActive((value) => ((value ?? 0) + 1) % 4)}
            >
              <ArrowRightIcon size={20} />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
