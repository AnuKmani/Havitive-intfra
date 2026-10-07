import type { BlogPost } from "@/lib/types";
import { media } from "@/lib/media";
import { routes } from "@/lib/routes";
import { formatDate } from "@/lib/text";

export default function RecentPosts({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;
  return (
    <div className="widget">
      <h3 className="widget_title">Recent Posts</h3>
      <div className="recent-post-wrap">
        {posts.map((p) => (
          <div className="recent-post" key={p.id}>
            <div className="media-img">
              <a href={routes.post(p)}><img src={media(p.post_image)} alt={p.post_image_alt || p.post_title || ""} loading="lazy" /></a>
            </div>
            <div className="media-body">
              <h4 className="post-title"><a className="text-inherit" href={routes.post(p)}>{p.post_title}</a></h4>
              <div className="recent-post-meta">
                <span><i className="far fa-calendar"></i>{formatDate(p.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
