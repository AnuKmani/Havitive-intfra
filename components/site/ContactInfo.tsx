import { SITE } from "@/lib/site";

export function ContactInfo() {
  return (
    <div className="th-widget-contact">
      <div className="info-box_text">
        <div className="icon"><img src="/frontend/assets/img/icon/location-dot.svg" alt="" /></div>
        <div className="details">
          <p>{SITE.name}, {SITE.address.street}</p>
          <p>{SITE.address.locality}, {SITE.address.region}</p>
        </div>
      </div>
      <div className="info-box_text">
        <div className="icon"><img src="/frontend/assets/img/icon/phone.svg" alt="" /></div>
        <div className="details">
          {SITE.phones.map((p) => (
            <p key={p.tel}><a href={`tel:${p.tel}`} className="info-box_link">{p.label}</a></p>
          ))}
        </div>
      </div>
      <div className="info-box_text">
        <div className="icon"><img src="/frontend/assets/img/icon/envelope.svg" alt="" /></div>
        <div className="details">
          <p><a href={`mailto:${SITE.email}`} className="info-box_link">{SITE.email}</a></p>
        </div>
      </div>
    </div>
  );
}

export function SocialLinks({ className }: { className: string }) {
  return (
    <div className={className}>
      <a href={SITE.social.facebook} aria-label="Facebook" rel="noopener" target="_blank"><i className="fab fa-facebook-f"></i></a>
      <a href={SITE.social.youtube} aria-label="YouTube" rel="noopener" target="_blank"><i className="fab fa-youtube"></i></a>
      <a href={SITE.social.instagram} aria-label="Instagram" rel="noopener" target="_blank"><i className="fab fa-instagram"></i></a>
    </div>
  );
}

export function SideMenu() {
  return (
    <div className="sidemenu-wrapper sidemenu-info d-none d-lg-block">
      <div className="sidemenu-content">
        <button className="closeButton sideMenuCls" aria-label="Close"><i className="far fa-times"></i></button>
        <div className="widget">
          <div className="th-widget-aboutt">
            <div className="about-logo">
              <a href="/"><img src="/upload/logos/hav.png" alt="Havitive" style={{ width: 123 }} /></a>
            </div>
            <p className="about-text">Reach out to us for reliable construction and engineering solutions. Together, let&rsquo;s build something extraordinary.</p>
          </div>
        </div>
        <div className="widget">
          <h3 className="widget_title">Get In Touch</h3>
          <ContactInfo />
        </div>
        <div className="widget newsletter-widget">
          <SocialLinks className="th-social style2" />
        </div>
      </div>
    </div>
  );
}
