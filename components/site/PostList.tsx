import type { BlogPost, BlogCategory } from "@/lib/types";
import { media } from "@/lib/media";
import { routes } from "@/lib/routes";
import { formatDate, truncateWords } from "@/lib/text";

export default function PostList({ posts, categories }: { posts: BlogPost[]; categories: BlogCategory[] }) {
  if (!posts.length) return <p>No articles yet. Check back soon.</p>;
  return (
    <>
      {posts.map((p) => {
        const cat = categories.find((c) => c.id === p.blogcat_id);
        return (
          <article className="th-blog blog-single has-post-thumbnail" key={p.id}>
            <div className="blog-img">
              <a href={routes.post(p)}><img src={media(p.post_image)} alt={p.post_image_alt || p.post_title || ""} loading="lazy" /></a>
            </div>
            <div className="blog-content">
              <div className="blog-meta">
                <span className="author"><i className="far fa-user"></i>Havitive</span>
                <span><i className="far fa-clock"></i><time dateTime={p.created_at ?? undefined}>{formatDate(p.created_at)}</time></span>
                {cat && <a href={routes.blogCategory(cat)}><i className="far fa-house-building"></i>{cat.category_name}</a>}
              </div>
              <h2 className="blog-title"><a href={routes.post(p)}>{p.post_title}</a></h2>
              <p className="blog-text">{truncateWords(p.short_descp, 40)}</p>
              <a href={routes.post(p)} className="th-btn style-border th-btn-icon">Read More</a>
            </div>
          </article>
        );
      })}
    </>
  );
}
