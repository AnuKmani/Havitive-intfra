import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo-page";
import Breadcrumb from "@/components/site/Breadcrumb";
import BlogSidebar from "@/components/site/BlogSidebar";
import BlogListing, { pageNumber } from "@/components/site/BlogListing";
import { getBlogCategories, getPosts } from "@/lib/data";

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata("page:blog");
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const [posts, categories, { page }] = await Promise.all([getPosts(), getBlogCategories(), searchParams]);
  return (
    <>
      <Breadcrumb title="Blog" trail={[{ name: "Blog", href: "/blog" }]} />
      <section className="th-blog-wrapper space-top space-extra-bottom">
        <div className="container">
          <div className="row gx-30">
            <div className="col-xxl-8 col-lg-7"><BlogListing posts={posts} categories={categories} basePath="/blog" page={pageNumber(page)} /></div>
            <div className="col-xxl-4 col-lg-5"><BlogSidebar /></div>
          </div>
        </div>
      </section>
    </>
  );
}
