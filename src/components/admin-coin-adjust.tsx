"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CoinsIcon } from "@phosphor-icons/react";
import { adjustMemberCoins } from "@/app/admin/members/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatCoins, maxCoinAdjustment } from "@/lib/coins";

/** Button + dialog for an admin to add or remove a member's Coin. */
export function AdminCoinAdjust({
  member,
}: {
  member: { id: string; name: string; balance: number };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = Number(amount);
    startTransition(async () => {
      const res = await adjustMemberCoins(
        member.id,
        mode === "add" ? value : -value,
        reason,
      );
      if (!res.success) {
        toast.error("ปรับ Coin ไม่สำเร็จ", { description: res.error });
        return;
      }
      toast.success(
        `${mode === "add" ? "เพิ่ม" : "หัก"} ${formatCoins(value)} Coin ให้ ${member.name} แล้ว`,
        {
          description:
            res.balance !== undefined
              ? `ยอดคงเหลือ ${formatCoins(res.balance)} Coin`
              : undefined,
        },
      );
      setAmount("");
      setReason("");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <CoinsIcon />
        ปรับ Coin
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>ปรับ Coin ของ {member.name}</DialogTitle>
            <DialogDescription>
              ยอดตอนนี้ {formatCoins(member.balance)} Coin (1 Coin = 1 บาท)
              ทุกการปรับถูกบันทึกในสมุดบัญชี Coin พร้อมเหตุผล
              และลบย้อนหลังไม่ได้
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["add", "เพิ่ม Coin"],
                  ["remove", "หัก Coin"],
                ] as const
              ).map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  variant={mode === value ? "default" : "outline"}
                  onClick={() => setMode(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <Field>
              <FieldLabel htmlFor="coin-amount">จำนวน Coin</FieldLabel>
              <Input
                id="coin-amount"
                type="number"
                inputMode="numeric"
                min={1}
                max={maxCoinAdjustment}
                step={1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="coin-reason">เหตุผล</FieldLabel>
              <Input
                id="coin-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="เช่น ของขวัญกิจกรรมเปิดตัว"
                maxLength={200}
                required
              />
            </Field>
            <Button
              type="submit"
              disabled={pending || !amount || !reason.trim()}
            >
              {mode === "add" ? "เพิ่ม Coin" : "หัก Coin"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
