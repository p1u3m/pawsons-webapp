import type { ReactNode } from "react";
// House bands and member tiles share the /characters styles.
import "../characters/characters.css";
import "./houses.css";

export default function HousesLayout({ children }: { children: ReactNode }) {
  return children;
}
