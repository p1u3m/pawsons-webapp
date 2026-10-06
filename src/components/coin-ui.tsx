import type { ComponentType } from "react";
import {
  CoinsIcon,
  GiftIcon,
  MinusIcon,
  PlusIcon,
  ReceiptIcon,
  SparkleIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  coinKindLabel,
  formatCoinChange,
  formatCoins,
  type CoinKind,
  type CoinTransaction,
} from "@/lib/coins";
import { cn } from "@/lib/utils";

const kindIcon: Record<
  CoinKind,
  ComponentType<{ size?: number; "aria-hidden"?: boolean | "true" | "false" }>
> = {
  signup: GiftIcon,
  quiz: SparkleIcon,
  admin_grant: PlusIcon,
  admin_deduct: MinusIcon,
  purchase: ReceiptIcon,
  spend: ReceiptIcon,
  refund: CoinsIcon,
};

const day = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Bangkok",
});
const month = new Intl.DateTimeFormat("th-TH", {
  month: "long",
  year: "numeric",
  timeZone: "Asia/Bangkok",
});

/** The big balance card at the top of /coins. */
export function CoinBalance({ balance }: { balance: number }) {
  return (
    <section
      aria-labelledby="coin-balance-label"
      className="flex items-center gap-5 rounded-card border border-line bg-cream p-6 shadow-ledge max-xs:flex-col max-xs:text-center md:p-8"
    >
      <span className="grid size-[72px] shrink-0 place-items-center rounded-full bg-sun text-sun-ink md:size-20">
        <CoinsIcon size={38} weight="fill" aria-hidden="true" />
      </span>
      <div className="grid min-w-0 gap-1">
        <h2
          id="coin-balance-label"
          className="text-body-sm font-semibold text-ink-muted"
        >
          Coin คงเหลือ
        </h2>
        <p className="flex items-baseline gap-2 max-xs:justify-center">
          <strong
            data-testid="coin-balance"
            className="text-[clamp(40px,8vw,56px)] leading-none tracking-[-0.02em] tabular-nums"
          >
            {formatCoins(balance)}
          </strong>
          <span className="text-body-lg font-semibold text-ink-soft">Coin</span>
        </p>
        <p className="text-small text-ink-muted">
          1 Coin = 1 บาท · เก็บไว้แลกของแต่งห้องและสกินเร็ว ๆ นี้
        </p>
      </div>
    </section>
  );
}

/** Ledger rows, newest first, grouped by month. */
export function CoinHistory({ history }: { history: CoinTransaction[] }) {
  const groups: { label: string; rows: CoinTransaction[] }[] = [];
  for (const tx of history) {
    const label = month.format(new Date(tx.created_at));
    const last = groups[groups.length - 1];
    if (last?.label === label) last.rows.push(tx);
    else groups.push({ label, rows: [tx] });
  }

  return (
    <section aria-labelledby="coin-history-title" className="mt-9">
      <h2 id="coin-history-title" className="mb-4 text-title-sm">
        ความเคลื่อนไหว
      </h2>
      {groups.length === 0 ? (
        <p className="rounded-card-sm border border-line bg-cream px-5 py-10 text-center text-body-sm text-ink-muted">
          ยังไม่มีความเคลื่อนไหว
          <br />
          ทำแบบทดสอบหรือรอรับ Coin จากทีมงาน แล้วรายการจะมาอยู่ที่นี่
        </p>
      ) : (
        <div className="grid gap-6">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-2.5 text-small font-semibold text-ink-muted">
                {group.label}
              </h3>
              <ul className="divide-y divide-line overflow-hidden rounded-card-sm border border-line bg-cream">
                {group.rows.map((tx) => (
                  <CoinRow key={tx.id} tx={tx} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CoinRow({ tx }: { tx: CoinTransaction }) {
  const gain = tx.amount > 0;
  const KindIcon = kindIcon[tx.kind];
  return (
    <li className="flex items-center gap-3.5 px-4 py-3.5">
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full",
          gain ? "bg-clover text-green-ink" : "bg-danger-tint text-danger-ink",
        )}
      >
        <KindIcon size={20} aria-hidden="true" />
      </span>
      <span className="grid min-w-0 flex-1">
        <span className="truncate text-body font-semibold">
          {tx.reason || coinKindLabel[tx.kind]}
        </span>
        <span className="text-caption text-ink-muted">
          {day.format(new Date(tx.created_at))} · {coinKindLabel[tx.kind]}
        </span>
      </span>
      <span
        className={cn(
          "shrink-0 text-body-lg font-bold tabular-nums",
          gain ? "text-green-ink" : "text-danger-ink",
        )}
      >
        {formatCoinChange(tx.amount)}
      </span>
    </li>
  );
}
