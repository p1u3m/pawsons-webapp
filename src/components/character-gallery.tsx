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
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[0, 1, 2, 3].map((index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActive(index)}
            className="group relative grid aspect-square place-items-center overflow-hidden rounded-[22px] bg-cream p-2.5 shadow-ledge transition-transform duration-220 ease-spring hover:-translate-y-1 motion-reduce:transition-none"
            aria-label={`ขยายภาพ ${name} ภาพที่ ${index + 1}`}
          >
            <Image
              src={imagePath(index)}
              alt={`${name} ในอีกมุมหนึ่ง ภาพที่ ${index + 1}`}
              width={400}
              height={400}
              sizes="(max-width: 767px) 44vw, 240px"
              className="size-full object-contain transition-transform duration-200 group-hover:scale-104 motion-reduce:transition-none"
            />
            <span className="absolute right-2 bottom-2 grid size-[30px] place-items-center rounded-full bg-(--band) text-(--house-ink)">
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
          className="focus-ink w-[min(600px,calc(100%-32px))] max-w-[600px] bg-paper [--focus-offset:4px] **:tracking-normal sm:max-w-[600px]"
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
              className="h-auto max-h-[65dvh] w-full object-contain"
            />
          )}
          <div className="flex items-center justify-between">
            <button
              type="button"
              className={lightboxButton}
              title="ภาพก่อนหน้า"
              aria-label="ภาพก่อนหน้า"
              onClick={() => setActive((value) => ((value ?? 0) + 3) % 4)}
            >
              <ArrowLeftIcon size={20} />
            </button>
            <span aria-live="polite">{(active ?? 0) + 1} / 4</span>
            <button
              type="button"
              className={lightboxButton}
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

const lightboxButton = "grid size-11 place-items-center rounded-full border border-line bg-white";
