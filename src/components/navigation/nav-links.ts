export interface NavItem {
  href: string;
  label: string;
  icon: string;
  badgeKey?: "letters";
}

export const NAV_LINKS: NavItem[] = [
  { href: "/characters", label: "Characters", icon: "pets" },
  { href: "/houses", label: "Houses", icon: "cottage" },
  { href: "/contents", label: "Contents", icon: "auto_stories" },
  { href: "/shop", label: "Shop", icon: "storefront" },
  { href: "/letters", label: "Letters", icon: "mail", badgeKey: "letters" },
];
