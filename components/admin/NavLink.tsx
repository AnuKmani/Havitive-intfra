"use client";

import { usePathname } from "next/navigation";
import Icon from "./Icon";

export default function NavLink({ href, icon, label, external }: { href: string; icon: string; label: string; external?: boolean }) {
  const path = usePathname();
  const active = !external && (href === "/admin" ? path === "/admin" : path === href || path.startsWith(href + "/"));
  return (
    <a href={href} className={active ? "ad-nav-link active" : "ad-nav-link"} target={external ? "_blank" : undefined} aria-current={active ? "page" : undefined}>
      <Icon name={icon} />
      <span>{label}</span>
    </a>
  );
}
