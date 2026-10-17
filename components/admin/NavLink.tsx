"use client";

import { usePathname } from "next/navigation";
import Icon from "./Icon";

export default function NavLink({ href, icon, label, external, plain }: { href: string; icon: string; label: string; external?: boolean; plain?: boolean }) {
  const path = usePathname();
  // `plain` links (like "Archived", which is a query on a page that already has its own link) are never highlighted.
  const active = !external && !plain && (href === "/admin" ? path === "/admin" : path === href || path.startsWith(href + "/"));
  return (
    <a href={href} className={active ? "ad-nav-link active" : "ad-nav-link"} target={external ? "_blank" : undefined} aria-current={active ? "page" : undefined}>
      <Icon name={icon} />
      <span>{label}</span>
    </a>
  );
}
