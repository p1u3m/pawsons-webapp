import {
  BookOpenTextIcon,
  HouseLineIcon,
  PawPrintIcon,
  StorefrontIcon,
  type Icon,
} from "@phosphor-icons/react";

export interface NavItem {
  href: string;
  label: string;
  icon: Icon;
  badgeKey?: "letters";
}

export const NAV_LINKS: NavItem[] = [
  { href: "/characters", label: "Characters", icon: PawPrintIcon },
  { href: "/houses", label: "Houses", icon: HouseLineIcon },
  { href: "/contents", label: "Contents", icon: BookOpenTextIcon },
  { href: "/shop", label: "Shop", icon: StorefrontIcon },
];

export function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
