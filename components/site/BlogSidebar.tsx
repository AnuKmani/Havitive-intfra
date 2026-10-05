import { getBlogCategories, getPosts } from "@/lib/data";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";
import RecentPosts from "./RecentPosts";

export default async function BlogSidebar() {
  const [categories, posts] = await Promise.all([getBlogCategories(), getPosts()]);
  return (
    <aside className="sidebar-area">
      <div className="widget widget_categories">
        <h3 className="widget_title">Post Categories</h3>
        <ul>
          {categories.map((c) => (
            <li key={c.id}>
              <a href={routes.blogCategory(c)}>{c.category_name}<span>({posts.filter((p) => p.blogcat_id === c.id).length})</span></a>
            </li>
          ))}
        </ul>
      </div>
      <RecentPosts posts={posts.slice(0, 3)} />
      <div className="widget widget_banner" data-bg-src="/frontend/assets/img/hero/2.png">
        <div className="widget-banner text-center">
          <h3 className="title">Need Help? We Are Here To Help You</h3>
          <div className="logo"><img src="/upload/logos/hav.png" alt="Havitive" style={{ height: 107, width: 116, objectFit: "contain" }} /></div>
          <h4 className="subtitle">You Get Online support</h4>
          <h5 className="link"><a href={`tel:${SITE.phones[0].tel}`}>{SITE.phones[0].label}</a></h5>
          <a href={SITE.whatsapp} className="th-btn style-border th-btn-icon">Contact</a>
        </div>
      </div>
    </aside>
  );
}
