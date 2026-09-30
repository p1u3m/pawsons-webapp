import {
  NewspaperIcon,
  PackageIcon,
  ReceiptIcon,
  SquaresFourIcon,
  UsersIcon,
  type Icon,
} from "@phosphor-icons/react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: Icon;
  /** Extra search params that must match for the item to be active. */
  tab?: string;
};

export const adminNav: { label: string; items: AdminNavItem[] }[] = [
  {
    label: "ภาพรวม",
    items: [{ href: "/admin", label: "Dashboard", icon: SquaresFourIcon }],
  },
  {
    label: "จัดการ",
    items: [
      { href: "/admin/contents", label: "คลังเนื้อหา", icon: NewspaperIcon },
      { href: "/admin/shop", label: "สินค้า", icon: PackageIcon },
      {
        href: "/admin/shop?tab=orders",
        label: "ออเดอร์",
        icon: ReceiptIcon,
        tab: "orders",
      },
      { href: "/admin/members", label: "สมาชิก", icon: UsersIcon },
    ],
  },
];

/** Page title for the header breadcrumb. */
export function adminPageTitle(pathname: string, tab: string | null) {
  const match = adminNav
    .flatMap((group) => group.items)
    .find(
      (item) =>
        item.href.split("?")[0] === pathname && (item.tab ?? null) === tab,
    );
  return match?.label ?? adminNav[0].items[0].label;
}

export function isActiveNav(
  item: AdminNavItem,
  pathname: string,
  tab: string | null,
) {
  return item.href.split("?")[0] === pathname && (item.tab ?? null) === tab;
}
