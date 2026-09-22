export default function Loading() {
  return (
    <div
      className="wrap page-space skeleton-page"
      role="status"
      aria-label="กำลังโหลด"
    >
      <div />
      <div />
      <div />
      <span className="sr-only">กำลังโหลดเรื่องราวของเพื่อน ๆ</span>
    </div>
  );
}
