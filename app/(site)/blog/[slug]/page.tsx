import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/site/Breadcrumb";
import BlogSidebar from "@/components/site/BlogSidebar";
import JsonLd from "@/components/site/JsonLd";
import { SocialLinks } from "@/components/site/ContactInfo";
import { getBlogCategories, getPostBySlug, getPosts } from "@/lib/data";
import { media, splitList } from "@/lib/media";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";
import { formatDate, richText, truncate } from "@/lib/text";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPosts()).filter((p) => p.post_slug).map((p) => ({ slug: p.post_slug! }));
}

async function load(params: Props["params"]) {
  return getPostBySlug(decodeURIComponent((await params).slug));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await load(params);
  if (!p) return {};
  const description = truncate(p.short_descp, 158) || truncate(p.meta_descp, 158);
  return {
    title: p.post_title ?? "Article",
    description,
    keywords: splitList(p.post_tags),
    alternates: { canonical: routes.post(p) },
    openGraph: {
      type: "article",
      title: p.post_title ?? undefined,
      description,
      publishedTime: p.created_at ?? undefined,
      modifiedTime: p.updated_at ?? undefined,
      images: [{ url: media(p.post_image) }],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await load(params);
  if (!post) notFound();
  const categories = await getBlogCategories();
  const cat = categories.find((c) => c.id === post.blogcat_id);
  const image = media(post.post_image);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.post_title,
          description: truncate(post.short_descp, 300),
          image: image.startsWith("http") ? image : SITE.url + image,
          datePublished: post.created_at,
          dateModified: post.updated_at ?? post.created_at,
          author: { "@type": "Organization", name: SITE.name },
          publisher: { "@id": `${SITE.url}/#organization` },
          mainEntityOfPage: SITE.url + routes.post(post),
          keywords: post.post_tags,
        }}
      />
      <Breadcrumb title={post.post_title ?? "Article"} trail={[{ name: "Blog", href: "/blog" }, { name: post.post_title ?? "", href: routes.post(post) }]} />
      <section className="th-blog-wrapper blog-details overflow-hidden space-top space-extra-bottom">
        <div className="container">
          <div className="row gx-30">
            <div className="col-xxl-8 col-lg-7">
              <article className="th-blog blog-single mb-0">
                <div className="blog-img"><img src={image} alt={post.post_title ?? ""} /></div>
                <div className="blog-content">
                  <div className="blog-meta">
                    <span className="author"><i className="far fa-user"></i>Havitive</span>
                    <span><i className="far fa-clock"></i><time dateTime={post.created_at ?? undefined}>{formatDate(post.created_at)}</time></span>
                    {cat && <a href={routes.blogCategory(cat)}><i className="far fa-house-building"></i>{cat.category_name}</a>}
                  </div>
                  <h2 className="blog-title">{post.post_title}</h2>
                  <div className="blog-text rich-text" dangerouslySetInnerHTML={{ __html: richText(post.long_descp) }} />
                </div>
              </article>
              <div className="share-links clearfix">
                <div className="row justify-content-between">
                  <div className="col-md-auto">
                    <span className="share-links-title">Tags:</span>
                    <div className="tagcloud">{splitList(post.post_tags).map((t) => <span key={t} className="tag">{t}</span>)}</div>
                  </div>
                  <div className="col-md-auto text-xl-end">
                    <span className="share-links-title">Follow:</span>
                    <SocialLinks className="th-social style2 align-items-center" />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-lg-5"><BlogSidebar /></div>
          </div>
        </div>
      </section>
    </>
  );
}
