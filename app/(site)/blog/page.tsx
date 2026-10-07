import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo-page";
import Breadcrumb from "@/components/site/Breadcrumb";
import BlogSidebar from "@/components/site/BlogSidebar";
import PostList from "@/components/site/PostList";
import { getBlogCategories, getPosts } from "@/lib/data";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata("page:blog");
}

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getPosts(), getBlogCategories()]);
  return (
    <>
      <Breadcrumb title="Blog" trail={[{ name: "Blog", href: "/blog" }]} />
      <section className="th-blog-wrapper space-top space-extra-bottom">
        <div className="container">
          <div className="row gx-30">
            <div className="col-xxl-8 col-lg-7"><PostList posts={posts} categories={categories} /></div>
            <div className="col-xxl-4 col-lg-5"><BlogSidebar /></div>
          </div>
        </div>
      </section>
    </>
  );
}
