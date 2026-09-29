/** Empty state for products without an uploaded photo. */
export function NoProductImage({ label = true }: { label?: boolean }) {
  return (
    <span className="store-no-image">
      <span className="material-symbols-rounded" aria-hidden="true">
        image
      </span>
      {label && "ยังไม่มีรูปสินค้า"}
    </span>
  );
}
