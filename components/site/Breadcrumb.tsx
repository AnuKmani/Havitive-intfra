import JsonLd from "./JsonLd";
import { SITE } from "@/lib/site";

type Crumb = { name: string; href?: string };

export default function Breadcrumb({ title, trail, style }: { title: string; trail: Crumb[]; style?: React.CSSProperties }) {
  const items = [{ name: "Home", href: "/" }, ...trail];
  return (
    <div className="breadcumb-wrapper" style={style}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            ...(c.href ? { item: SITE.url + c.href } : {}),
          })),
        }}
      />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-9">
            <div className="breadcumb-content">
              <h1 className="breadcumb-title">{title}</h1>
              <ul className="breadcumb-menu">
                {items.map((c, i) => (
                  <li key={i}>{c.href && i < items.length - 1 ? <a href={c.href}>{c.name}</a> : c.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
