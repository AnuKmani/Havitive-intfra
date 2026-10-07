import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo-page";
import { defaults } from "@/lib/seo";
import Breadcrumb from "@/components/site/Breadcrumb";
import BlogSidebar from "@/components/site/BlogSidebar";
import PostList from "@/components/site/PostList";
import { getBlogCategories, getBlogCategoryBySlug, getPosts } from "@/lib/data";
import { routes } from "@/lib/routes";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getBlogCategories()).map((c) => ({ slug: c.category_slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getBlogCategoryBySlug(decodeURIComponent((await params).slug));
  if (!cat) return {};
  return pageMetadata(`blog-category:${cat.id}`, defaults.blogCategory(cat));
}

export default async function BlogCategoryPage({ params }: Props) {
  const cat = await getBlogCategoryBySlug(decodeURIComponent((await params).slug));
  if (!cat) notFound();
  const [posts, categories] = await Promise.all([getPosts(), getBlogCategories()]);
  return (
    <>
      <Breadcrumb title={cat.category_name} trail={[{ name: "Blog", href: "/blog" }, { name: cat.category_name, href: routes.blogCategory(cat) }]} />
      <section className="th-blog-wrapper space-top space-extra-bottom">
        <div className="container">
          <div className="row gx-30">
            <div className="col-xxl-8 col-lg-7"><PostList posts={posts.filter((p) => p.blogcat_id === cat.id)} categories={categories} /></div>
            <div className="col-xxl-4 col-lg-5"><BlogSidebar /></div>
          </div>
        </div>
      </section>
    </>
  );
}
