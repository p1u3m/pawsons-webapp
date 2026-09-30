"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircleIcon,
  CircleIcon,
  DotsThreeIcon,
  IdentificationCardIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ShieldPlusIcon,
  UserGearIcon,
} from "@phosphor-icons/react";
import {
  searchMembers,
  setMemberRole,
  type MemberMatch,
} from "@/app/admin/members/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  memberRoles,
  roleDescription,
  roleLabel,
  type MemberRole,
} from "@/lib/member-roles";
import { cn } from "@/lib/utils";

type MemberRef = { id: string; name: string; role: MemberRole };

/** Saves a role change, then refreshes the server-rendered page. */
function useRoleChange() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const change = (
    member: { id: string; name: string },
    role: MemberRole,
    onDone?: () => void,
  ) =>
    startTransition(async () => {
      const res = await setMemberRole(member.id, role);
      if (!res.success) {
        toast.error("เปลี่ยนสิทธิ์ไม่สำเร็จ", { description: res.error });
        return;
      }
      toast.success(
        role === "admin"
          ? `ตั้ง ${member.name} เป็นแอดมินแล้ว`
          : `${member.name} เป็นสมาชิกทั่วไปแล้ว`,
      );
      onDone?.();
      router.refresh();
    });
  return { pending, change };
}

/** Pick a role for one member and save it. */
export function EditRoleDialog({
  member,
  open,
  onOpenChange,
}: {
  member: MemberRef;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [role, setRole] = useState<MemberRole>(member.role);
  const { pending, change } = useRoleChange();
  const demoting = member.role === "admin" && role === "user";

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(isOpen) => isOpen && setRole(member.role)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ไขสิทธิ์</DialogTitle>
          <DialogDescription>
            เลือกสิทธิ์ของ {member.name} การเปลี่ยนแปลงจะถูกบันทึกในประวัติ
          </DialogDescription>
        </DialogHeader>

        <div role="radiogroup" aria-label="สิทธิ์" className="grid gap-2">
          {memberRoles.map((value) => {
            const selected = role === value;
            const Icon = selected ? CheckCircleIcon : CircleIcon;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setRole(value)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/60",
                  selected && "border-primary bg-muted/60",
                )}
              >
                <Icon
                  weight={selected ? "fill" : "regular"}
                  className={cn(
                    "mt-0.5 size-5 shrink-0",
                    selected ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span className="grid gap-0.5">
                  <span className="flex items-center gap-2 font-medium">
                    {roleLabel[value]}
                    {member.role === value && (
                      <Badge variant="outline">ปัจจุบัน</Badge>
                    )}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {roleDescription[value]}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {demoting && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {member.name} จะเข้าหลังบ้านไม่ได้อีก และหลุดจากหน้า admin
            ทันทีที่โหลดหน้าใหม่
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            variant={demoting ? "destructive" : "default"}
            disabled={pending || role === member.role}
            onClick={() => change(member, role, () => onOpenChange(false))}
          >
            {demoting ? "ถอดสิทธิ์แอดมิน" : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** The "⋯" menu at the end of a member row: details or edit role. */
export function MemberActions({
  member,
  detailHref,
  lockedReason,
}: {
  member: MemberRef;
  detailHref: string;
  /** Set to disable editing (e.g. on the admin's own row). */
  lockedReason?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`จัดการ ${member.name}`}
            />
          }
        >
          <DotsThreeIcon weight="bold" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem
            onClick={() => router.push(detailHref, { scroll: false })}
          >
            <IdentificationCardIcon />
            ดูรายละเอียด
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={Boolean(lockedReason)}
            onClick={() => setEditing(true)}
          >
            <UserGearIcon />
            <span className="grid">
              แก้ไขสิทธิ์
              {lockedReason && (
                <span className="text-xs text-muted-foreground">
                  {lockedReason}
                </span>
              )}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditRoleDialog
        member={member}
        open={editing}
        onOpenChange={setEditing}
      />
    </>
  );
}

/** "Edit role" button for the member detail sheet. */
export function EditRoleButton({
  member,
  lockedReason,
}: {
  member: MemberRef;
  lockedReason?: string;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={Boolean(lockedReason)}
        title={lockedReason}
        onClick={() => setEditing(true)}
      >
        <UserGearIcon />
        แก้ไขสิทธิ์
      </Button>
      <EditRoleDialog
        member={member}
        open={editing}
        onOpenChange={setEditing}
      />
    </>
  );
}

/** Finds a member by name or email and promotes them to admin. */
export function AddAdminDialog() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<MemberMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const { pending, change } = useRoleChange();
  const request = useRef(0);

  useEffect(() => {
    const query = term.trim();
    const id = ++request.current;
    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = window.setTimeout(async () => {
      const res = await searchMembers(query);
      if (id !== request.current) return; // a newer search is on its way
      setSearching(false);
      if (res.error) toast.error(res.error);
      setResults(res.members);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [term]);

  const reset = () => {
    setTerm("");
    setResults([]);
    setConfirming(null);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <ShieldPlusIcon />
        เพิ่มแอดมิน
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        onOpenChangeComplete={(isOpen) => !isOpen && reset()}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>เพิ่มแอดมิน</DialogTitle>
            <DialogDescription>
              ค้นหาสมาชิกด้วยชื่อหรืออีเมล
              ผู้ที่จะเป็นแอดมินต้องเข้าสู่ระบบบนเว็บอย่างน้อยหนึ่งครั้งก่อน
            </DialogDescription>
          </DialogHeader>

          <InputGroup>
            <InputGroupAddon>
              <MagnifyingGlassIcon />
            </InputGroupAddon>
            <InputGroupInput
              value={term}
              onChange={(event) => {
                setTerm(event.target.value);
                setConfirming(null);
              }}
              placeholder="ชื่อ หรือ name@example.com"
              aria-label="ค้นหาสมาชิก"
              autoFocus
            />
          </InputGroup>

          <div className="min-h-32">
            {term.trim().length < 2 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                พิมพ์อย่างน้อย 2 ตัวอักษร
              </p>
            ) : searching && !results.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                กำลังค้นหา...
              </p>
            ) : !results.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                ไม่พบสมาชิกที่ตรงกับ “{term.trim()}”
              </p>
            ) : (
              <ul className="grid gap-1">
                {results.map((member) => {
                  const name = member.display_name || "ไม่ระบุชื่อ";
                  return (
                    <li
                      key={member.id}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/60"
                    >
                      <Avatar>
                        {member.avatar_url && (
                          <AvatarImage src={member.avatar_url} alt="" />
                        )}
                        <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="grid min-w-0 flex-1">
                        <span className="truncate font-medium">{name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {member.email ?? "—"}
                        </span>
                      </span>
                      {member.role === "admin" ? (
                        <Badge variant="secondary">
                          <ShieldCheckIcon />
                          แอดมินอยู่แล้ว
                        </Badge>
                      ) : confirming === member.id ? (
                        <span className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirming(null)}
                          >
                            ยกเลิก
                          </Button>
                          <Button
                            size="sm"
                            disabled={pending}
                            onClick={() =>
                              change({ id: member.id, name }, "admin", () => {
                                setConfirming(null);
                                setResults((prev) =>
                                  prev.map((row) =>
                                    row.id === member.id
                                      ? { ...row, role: "admin" }
                                      : row,
                                  ),
                                );
                              })
                            }
                          >
                            ยืนยัน
                          </Button>
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirming(member.id)}
                        >
                          ตั้งเป็นแอดมิน
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
