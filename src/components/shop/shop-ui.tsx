import type { ReactNode } from "react";
import { signButton } from "@/components/paper-ui";
import { cn } from "@/lib/utils";

// Small shared pieces of the /shop pages (cream cards on ledges, see paper-ui).

/** Page column of every /shop page. */
export const shopPage = "focus-ink min-h-[70vh] pt-10 pb-[110px] max-md:pt-6";

/** The shop's yellow sign button (a little wider than the shared one). */
export const shopButton = cn(signButton, "px-7");

/** Cream pill on a ledge (cart, my orders). */
export const shopPillButton =
  "inline-flex min-h-[46px] items-center gap-2.5 rounded-3xl bg-cream pr-[7px] pl-[18px] text-[15px] font-bold text-navy shadow-[0_4px_0_#ccc9c2] transition-[translate,box-shadow] duration-200 ease-spring hover:-translate-y-0.5";
/** In the shop toolbar on phones: an icon-only square. */
export const toolbarPillButton =
  "max-md:relative max-md:size-[52px] max-md:justify-center max-md:p-0 max-md:shadow-[0_3px_0_#d7d3cc]";

/** Underlined inline link. */
export const shopTextLink =
  "text-[14px] font-medium text-ink underline decoration-line-strong underline-offset-4 transition-[text-decoration-color] duration-200 hover:decoration-current";

export const shopAlert =
  "mb-5 rounded-[14px] border border-[#b54744]/22 bg-[#fbefec] px-4 py-3 text-[14px] text-[#8e3431]";
export const shopNote =
  "rounded-[14px] bg-paper-soft px-3.5 py-3 text-[13px] leading-[1.6] text-ink-muted";
export const shopFineprint = "mt-2.5 text-center text-[12px] text-ink-faint";

/** Product grid: three per row, two on phones. */
export const productGrid = "grid grid-cols-3 gap-5 max-md:grid-cols-2 max-md:gap-3";

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
        "flex flex-col items-center gap-1.5 rounded-[30px] bg-cream px-6 pt-14 pb-16 text-center text-ink-muted shadow-ledge",
        className,
      )}
    >
      {icon}
      <p className="mt-2 text-[18px] font-semibold text-ink">{title}</p>
      <span className="text-[14px]">{children}</span>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

