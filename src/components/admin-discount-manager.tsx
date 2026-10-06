"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusIcon, TagIcon, TrashIcon } from "@phosphor-icons/react";
import {
  createDiscountCode,
  deleteDiscountCode,
  setDiscountActive,
} from "@/app/admin/discounts/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  discountLabel,
  discountState,
  discountStateLabel,
  type DiscountCode,
  type DiscountKind,
  type DiscountState,
} from "@/lib/shop/discounts";
import { formatPrice } from "@/lib/shop/price";
import { cn } from "@/lib/utils";

const number = new Intl.NumberFormat("th-TH");
const day = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeZone: "Asia/Bangkok",
});

const stateVariant: Record<DiscountState, "default" | "secondary" | "outline"> =
  {
    active: "default",
    off: "secondary",
    expired: "outline",
    used_up: "outline",
  };

export type DiscountRow = DiscountCode & {
  /** Baht-satang given away on paid orders with this code. */
  given_satang: number;
};

const emptyForm = {
  code: "",
  kind: "percent" as DiscountKind,
  amount: "",
  maxUses: "",
  expiresOn: "",
};

export function AdminDiscountManager({ codes }: { codes: DiscountRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pending, startTransition] = useTransition();
  const now = Date.now();

  function create(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const res = await createDiscountCode({
        code: form.code,
        kind: form.kind,
        amount: Number(form.amount),
        maxUses: form.maxUses.trim() === "" ? null : Number(form.maxUses),
        expiresOn: form.expiresOn || null,
      });
      if (!res.success) {
        toast.error("สร้างโค้ดไม่สำเร็จ", { description: res.error });
        return;
      }
      toast.success(`สร้างโค้ด ${form.code.trim().toUpperCase()} แล้ว`);
      setForm(emptyForm);
      setOpen(false);
      router.refresh();
    });
  }

  function toggle(code: DiscountRow, active: boolean) {
    startTransition(async () => {
      const res = await setDiscountActive(code.id, active);
      if (!res.success) {
        toast.error("บันทึกไม่สำเร็จ", { description: res.error });
        return;
      }
      router.refresh();
    });
  }

  function remove(code: DiscountRow) {
    startTransition(async () => {
      const res = await deleteDiscountCode(code.id);
      if (!res.success) {
        toast.error("ลบโค้ดไม่สำเร็จ", { description: res.error });
        return;
      }
      toast.success(`ลบโค้ด ${code.code} แล้ว`);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <PlusIcon />
          สร้างโค้ด
        </Button>
      </div>

      {codes.length ? (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>โค้ด</TableHead>
                <TableHead>ส่วนลด</TableHead>
                <TableHead>ใช้แล้ว</TableHead>
                <TableHead className="hidden sm:table-cell">หมดอายุ</TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  ลดไปแล้ว
                </TableHead>
                <TableHead>เปิดใช้</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((code) => {
                const state = discountState(code, now);
                return (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="grid gap-1">
                        <span className="font-mono font-medium">
                          {code.code}
                        </span>
                        <Badge variant={stateVariant[state]} className="w-fit">
                          {discountStateLabel[state]}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {discountLabel(code)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {number.format(code.used_count)}
                      {code.max_uses !== null
                        ? ` / ${number.format(code.max_uses)}`
                        : " ครั้ง"}
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                      {code.expires_at
                        ? day.format(new Date(code.expires_at))
                        : "ไม่หมดอายุ"}
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums md:table-cell">
                      {formatPrice(code.given_satang)}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={code.active}
                        disabled={pending}
                        onCheckedChange={(next) => toggle(code, next)}
                        aria-label={`เปิดใช้โค้ด ${code.code}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className={cn(
                          "text-destructive hover:text-destructive",
                          code.used_count > 0 && "invisible",
                        )}
                        disabled={pending}
                        onClick={() => remove(code)}
                        aria-label={`ลบโค้ด ${code.code}`}
                        title="ลบโค้ด (ลบได้เฉพาะโค้ดที่ยังไม่เคยถูกใช้)"
                      >
                        <TrashIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TagIcon />
            </EmptyMedia>
            <EmptyTitle>ยังไม่มีโค้ดส่วนลด</EmptyTitle>
            <EmptyDescription>
              กด “สร้างโค้ด” เพื่อทำโค้ดแรกให้ลูกค้าใช้ในตะกร้า
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>สร้างโค้ดส่วนลด</DialogTitle>
            <DialogDescription>
              ลูกค้าที่เข้าสู่ระบบกรอกโค้ดนี้ในตะกร้าเพื่อลดราคาสินค้าได้
              ส่วนลดคำนวณฝั่งเซิร์ฟเวอร์ ลูกค้าแก้เองไม่ได้
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={create} className="grid gap-4">
            <Field>
              <FieldLabel htmlFor="discount-code">โค้ด</FieldLabel>
              <Input
                id="discount-code"
                value={form.code}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    code: event.target.value.toUpperCase(),
                  }))
                }
                placeholder="เช่น WELCOME10"
                maxLength={32}
                required
                autoComplete="off"
                className="font-mono uppercase"
              />
            </Field>
            <div className="grid gap-2">
              <span className="text-sm font-medium">ประเภทส่วนลด</span>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["percent", "ลดเป็น %"],
                    ["fixed", "ลดเป็นบาท"],
                  ] as const
                ).map(([kind, label]) => (
                  <Button
                    key={kind}
                    type="button"
                    variant={form.kind === kind ? "default" : "outline"}
                    onClick={() => setForm((prev) => ({ ...prev, kind }))}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            <Field>
              <FieldLabel htmlFor="discount-amount">
                {form.kind === "percent"
                  ? "ลดกี่เปอร์เซ็นต์ (1-100)"
                  : "ลดกี่บาท"}
              </FieldLabel>
              <Input
                id="discount-amount"
                type="number"
                inputMode="numeric"
                min={1}
                max={form.kind === "percent" ? 100 : 100000}
                step={1}
                value={form.amount}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, amount: event.target.value }))
                }
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="discount-max">
                  ใช้ได้รวมกี่ครั้ง
                </FieldLabel>
                <Input
                  id="discount-max"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  value={form.maxUses}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      maxUses: event.target.value,
                    }))
                  }
                  placeholder="ไม่จำกัด"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="discount-expires">
                  ใช้ได้ถึงวันที่
                </FieldLabel>
                <Input
                  id="discount-expires"
                  type="date"
                  value={form.expiresOn}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      expiresOn: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
            <p className="text-xs text-muted-foreground">
              เว้นว่างไว้ถ้าไม่ต้องการจำกัดจำนวนครั้งหรือวันหมดอายุ ·
              ส่วนลดจะไม่ทำให้ยอดชำระต่ำกว่า ฿10 (ขั้นต่ำของ Stripe)
            </p>
            <Button type="submit" disabled={pending || !form.code.trim()}>
              <PlusIcon />
              สร้างโค้ด
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
