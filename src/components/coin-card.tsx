import { CoinsIcon } from "@phosphor-icons/react/dist/ssr";
import {
  coinKindLabel,
  formatCoinChange,
  formatCoins,
  type CoinTransaction,
} from "@/lib/coins";
import { cn } from "@/lib/utils";

const day = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Bangkok",
});

/** A member's Coin balance and latest activity (shown in My Room). */
export function CoinCard({
  balance,
  history,
  className,
}: {
  balance: number;
  history: CoinTransaction[];
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-card-sm border border-line bg-paper px-5 py-4 text-left",
        className,
      )}
      aria-labelledby="coin-title"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="coin-title"
          className="flex items-center gap-2 text-body font-semibold"
        >
          <span className="grid size-8 place-items-center rounded-full bg-sun text-sun-ink">
            <CoinsIcon size={18} weight="fill" aria-hidden="true" />
          </span>
          Coin ของคุณ
        </h2>
        <strong
          data-testid="coin-balance"
          className="text-title-sm tabular-nums"
        >
          {formatCoins(balance)}
        </strong>
      </div>
      {history.length > 0 ? (
        <ul className="mt-3 divide-y divide-line text-body-sm">
          {history.map((tx) => (
            <li
              key={tx.id}
              className="flex items-center justify-between gap-3 py-2"
            >
              <span className="grid min-w-0">
                <span className="truncate">
                  {tx.reason || coinKindLabel[tx.kind]}
                </span>
                <span className="text-caption text-ink-muted">
                  {day.format(new Date(tx.created_at))} ·{" "}
                  {coinKindLabel[tx.kind]}
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 font-semibold tabular-nums",
                  tx.amount > 0 ? "text-green-ink" : "text-danger-ink",
                )}
              >
                {formatCoinChange(tx.amount)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-body-sm text-ink-muted">
          ยังไม่มีความเคลื่อนไหว
        </p>
      )}
      <p className="mt-3 text-caption text-ink-faint">
        1 Coin = 1 บาท · เก็บไว้แลกของแต่งห้องและสกินเร็ว ๆ นี้
      </p>
    </section>
  );
}
