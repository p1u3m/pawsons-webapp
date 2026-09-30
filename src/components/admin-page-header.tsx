import type { ReactNode } from "react";

/** Title row at the top of every admin page. */
export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        // Mobile: the actions share one full-width row.
        <div className="flex flex-wrap items-center gap-2 *:flex-1 sm:*:flex-none">
          {actions}
        </div>
      )}
    </div>
  );
}
