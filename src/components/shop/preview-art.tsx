import { CharacterImage } from "@/components/ui";
import { houseBackground } from "@/lib/data";
import type { ShopPreview } from "@/lib/shop/preview-catalog";

export function PreviewArt({
  preview,
  large = false,
}: {
  preview: ShopPreview;
  large?: boolean;
}) {
  return (
    <div
      className={`product-art${large ? " product-art-large" : ""}`}
      style={{ background: houseBackground(preview.character.house) }}
    >
      <div className={`product-paper ${preview.kind}`}>
        <CharacterImage character={preview.character} />
        {preview.kind === "postcard" && (
          <span>A little hello from {preview.character.name}.</span>
        )}
      </div>
    </div>
  );
}
