import type { BlogPost } from "@/lib/types";
import { media } from "@/lib/media";
import { routes } from "@/lib/routes";
import { formatDate, truncateWords } from "@/lib/text";

export default function BlogSlider({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;
  return (
    <section className="overflow-hidden space bg-title-dark">
      <div className="sec-bg-shape2-3 jump shape-mockup d-xl-block d-none text-white" data-bottom="40%" data-right="0%">
        <img src="/frontend/assets/img/shape/section_shape_2_3.jpg" alt="" />
      </div>
      <div className="container">
        <div className="row justify-content-lg-between justify-content-center align-items-end">
          <div className="col-xl-5 col-lg-6">
            <div className="title-area text-lg-start text-center">
              <h2 className="sec-title text-white">News &amp; Articles</h2>
              <p className="text-white">Stay informed with the latest trends, industry updates, and valuable insights. Explore our articles for expert advice and innovative solutions in design and consultancy.</p>
            </div>
          </div>
          <div className="col-lg-auto">
            <div className="sec-btn"><a href="/blog" className="th-btn style-border3 th-btn-icon">Browse All Blog</a></div>
          </div>
        </div>
        <div className="slider-area blog-slider2">
          <div className="swiper th-slider" id="blogSlider2" data-slider-options='{"breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"1"},"768":{"slidesPerView":"2"},"992":{"slidesPerView":"2"},"1200":{"slidesPerView":"2"}}}'>
            <div className="swiper-wrapper">
              {posts.map((p) => (
                <div className="swiper-slide" key={p.id}>
                  <div className="blog-card style2">
                    <div className="blog-img">
                      <a href={routes.post(p)}><img src={media(p.post_image)} alt={p.post_title ?? "Blog post"} loading="lazy" /></a>
                    </div>
                    <div className="blog-content">
                      <div className="blog-meta">
                        <a href={routes.post(p)}><time dateTime={p.created_at ?? undefined}>{formatDate(p.created_at)}</time></a>
                        <a href={routes.post(p)}>{p.post_title}</a>
                      </div>
                      <h3 className="box-title"><a href={routes.post(p)}>{truncateWords(p.short_descp, 10)}</a></h3>
                      <a href={routes.post(p)} className="th-btn style-border th-btn-icon">Read More</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
