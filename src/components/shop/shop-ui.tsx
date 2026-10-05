import type { ReactNode } from "react";
import { signButton } from "@/components/paper-ui";
import { cn } from "@/lib/utils";

// Small shared pieces of the /shop pages (cream cards on ledges, see paper-ui).

/** Page column of every /shop page. */
export const shopPage = "focus-ink min-h-[70vh] page-top pb-[110px]";

/** The shop's yellow sign button (a little wider than the shared one). */
export const shopButton = cn(signButton, "px-7");

/** Cream pill on a ledge (cart, my orders). */
export const shopPillButton =
  "press inline-flex min-h-[46px] items-center gap-2.5 rounded-card-sm bg-cream pr-[7px] pl-[18px] text-body font-bold text-navy ";
/** In the shop toolbar on phones: an icon-only square. */
export const toolbarPillButton =
  "max-md:relative max-md:h-[46px] max-md:w-auto max-md:justify-center max-md:gap-2 max-md:px-4 max-md:[--depth:3px]";

/** Underlined inline link. */
export const shopTextLink =
  "text-body-sm font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-current";

export const shopAlert =
  "mb-5 rounded-tile border border-danger/22 bg-danger-tint px-4 py-3 text-body-sm text-danger-ink";
export const shopNote =
  "rounded-tile bg-paper-soft px-3.5 py-3 text-small leading-[1.6] text-ink-muted";
export const shopFineprint = "mt-2.5 text-center text-caption text-ink-faint";

/** Product grid: four per row, two on phones, matching /characters. */
export const productGrid =
  "grid grid-cols-4 gap-5 max-md:grid-cols-2 max-md:gap-3";

/** Empty state card: icon, title, hint and an action. */
export function ShopEmpty({
  icon,
  title,
  children,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-card bg-cream px-6 pt-14 pb-16 text-center text-ink-muted shadow-ledge",
        className,
      )}
    >
      {icon}
      <p className="mt-2 text-lead font-semibold text-ink">{title}</p>
      <span className="text-body-sm">{children}</span>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
