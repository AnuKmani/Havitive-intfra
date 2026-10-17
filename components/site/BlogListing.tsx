import type { BlogCategory, BlogPost } from "@/lib/types";
import { routes } from "@/lib/routes";
import PostList from "./PostList";
import "./blog-list.css";

export const POSTS_PER_PAGE = 10;

/** Reads ?page=N from the address; anything that isn't a positive whole number means page 1. */
export function pageNumber(raw: string | string[] | undefined) {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/** Page numbers to show: the first, the last, and the ones around the current page, with gaps marked as null. */
function pageWindow(current: number, total: number) {
  const keep = new Set([1, total, current - 1, current, current + 1]);
  const out: (number | null)[] = [];
  for (let n = 1; n <= total; n++) {
    if (keep.has(n)) out.push(n);
    else if (out[out.length - 1] !== null) out.push(null);
  }
  return out;
}

/**
 * The list on /blog and /blog/category/…: category tabs on top, the latest 10 posts of the chosen tab,
 * and page links underneath. `posts` is the full list for the tab, newest first.
 */
export default function BlogListing({ posts, categories, activeSlug, basePath, page }: {
  posts: BlogPost[];
  categories: BlogCategory[];
  activeSlug?: string;
  basePath: string;
  page: number;
}) {
  const pages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const current = Math.min(page, pages);
  const shown = posts.slice((current - 1) * POSTS_PER_PAGE, current * POSTS_PER_PAGE);
  const href = (n: number) => (n > 1 ? `${basePath}?page=${n}` : basePath);

  return (
    <>
      <nav aria-label="Blog categories">
        <ul className="bl-tabs">
          <li><a href="/blog" className={activeSlug ? "" : "active"} aria-current={activeSlug ? undefined : "page"}>All</a></li>
          {categories.map((c) => (
            <li key={c.id}>
              <a href={routes.blogCategory(c)} className={c.category_slug === activeSlug ? "active" : ""} aria-current={c.category_slug === activeSlug ? "page" : undefined}>
                {c.category_name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="bl-list">
        <PostList posts={shown} categories={categories} />
      </div>
      {pages > 1 && (
        <nav className="bl-pages text-center" aria-label="Pagination">
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
      )}
    </>
  );
}
