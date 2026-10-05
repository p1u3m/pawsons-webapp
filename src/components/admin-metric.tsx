import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** KPI card; with `href` the whole card links to the matching list. */
export function AdminMetric({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: string;
  detail: string;
  href?: string;
}) {
  return (
    <Card
      size="sm"
      className={cn("relative", href && "hover:bg-muted/40")}
    >
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="truncate text-xl font-semibold tabular-nums sm:text-2xl">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{detail}</span>
        {href && (
          <Link
            href={href}
            className="after:absolute after:inset-0"
            aria-label={`ดู${label}`}
          >
            <ArrowRightIcon className="size-3.5" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
