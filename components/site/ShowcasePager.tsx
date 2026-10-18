import { pageWindow } from "@/lib/pagination";
import "./blog-list.css";

export const SHOWCASE_PER_PAGE = 6;

/** Reads ?page=N; anything that is not a positive whole number means page 1. */
export function showcasePageNumber(raw: string | string[] | undefined) {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/** Page links under a showcase list. Renders nothing when everything fits on one page. */
export default function ShowcasePager({ current, pages, basePath }: { current: number; pages: number; basePath: string }) {
  if (pages <= 1) return null;
  const href = (n: number) => (n > 1 ? `${basePath}?page=${n}` : basePath);
  return (
    <nav className="bl-pages text-center" aria-label="Pagination" style={{ marginTop: 40 }}>
      <div className="th-pagination">
        <ul>
          {current > 1 && <li><a href={href(current - 1)} className="prev-page" rel="prev">Previous</a></li>}
          {pageWindow(current, pages).map((n, i) => (
            <li key={n ?? `gap-${i}`}>
              {n === null ? (
                <span className="gap" aria-hidden="true">…</span>
              ) : (
                <a href={href(n)} className={n === current ? "active" : ""} aria-current={n === current ? "page" : undefined}>{n}</a>
              )}
            </li>
          ))}
          {current < pages && <li><a href={href(current + 1)} className="next-page" rel="next">Next</a></li>}
        </ul>
      </div>
    </nav>
  );
}
