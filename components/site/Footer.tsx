import { getSectors } from "@/lib/data";
import { routes } from "@/lib/routes";
import { ContactInfo, SocialLinks } from "./ContactInfo";

export default async function Footer() {
  const sectors = await getSectors();
  return (
    <footer className="footer-wrapper footer-layout2" style={{ backgroundColor: "#dedeeb" }}>
      <div className="container">
        <div className="footer-wrap">
          <div className="widget-area">
            <div className="row justify-content-between">
              <div className="col-md-6 col-xl-4">
                <div className="widget footer-widget">
                  <div className="th-widget-about">
                    <div className="about-logo">
                      <a href="/"><img src="/upload/logos/hav.png" alt="Havitive" style={{ width: 123 }} /></a>
                    </div>
                    <p className="about-text">Connect with us for innovative design consultancy solutions. Together, let&rsquo;s create something extraordinary.</p>
                    <SocialLinks className="th-social style3" />
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-xl-auto">
                <div className="widget footer-widget">
                  <h3 className="widget_title">Get In Touch</h3>
                  <ContactInfo />
                </div>
              </div>
              <div className="col-md-6 col-xl-auto">
                <div className="widget widget_nav_menu footer-widget">
                  <h3 className="widget_title">Useful Links</h3>
                  <div className="menu-all-pages-container">
                    <ul className="menu">
                      <li><a href="/">Home</a></li>
                      <li><a href="/about">About us</a></li>
                      <li><a href="/blog">Blog</a></li>
                      <li><a href="/careers">Career</a></li>
                      <li><a href="/contact">Contact</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-xl-auto">
                <div className="widget widget_nav_menu footer-widget">
                  <h3 className="widget_title">Sectors</h3>
                  <div className="menu-all-pages-container">
                    <ul className="menu">
                      {sectors.map((s) => (
                        <li key={s.id}><a href={routes.sector(s)}>{s.sector_name}</a></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="copyright-wrap bg-title-dark">
        <div className="container">
          <div className="row gy-2 align-items-center">
            <div className="col-lg-6">
              <p className="copyright-text">
                Copyright <i className="fal fa-copyright"></i> {new Date().getFullYear()} <a href="/">Havitive</a>, All rights reserved.
              </p>
            </div>
            <div className="col-lg-6 text-center text-lg-end">
              <div className="footer-links">
                <ul>
                  <li><a href="https://www.linkedin.com/in/anumolkmani/">Designed and Developed By Anumol K Mani</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
