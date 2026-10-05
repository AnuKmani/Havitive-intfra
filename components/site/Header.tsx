import { getSectors, getServices } from "@/lib/data";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";
import { titleCase } from "@/lib/text";

export default async function Header() {
  const [sectors, services] = await Promise.all([getSectors(), getServices()]);
  const government = sectors.filter((s) => s.category === 0);
  const privateSectors = sectors.filter((s) => s.category === 1);

  return (
    <header className="th-header header-layout1">
      <div className="sticky-wrapper">
        <div className="menu-area">
          <div className="container">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto">
                <div className="header-logo" style={{ width: 84 }}>
                  <a href="/">
                    <img src="/frontend/assets/img/logo-white.png" alt="Havitive Infra Pvt Ltd logo" width={84} height={56} />
                  </a>
                </div>
              </div>
              <div className="col-auto">
                <nav className="main-menu d-none d-lg-inline-block" aria-label="Main">
                  <ul>
                    <li><a href="/">Home</a></li>
                    <li className="menu-item-has-children">
                      <a href="/about">About Us</a>
                      <ul className="sub-menu">
                        <li><a href="/about#mission">Mission and Vision</a></li>
                        <li><a href="/about#group-of-companies">Group Of Companies</a></li>
                        <li><a href="/about#leadership">Management Team</a></li>
                        <li><a href="/about#employee">Team Members</a></li>
                      </ul>
                    </li>
                    <li className="menu-item-has-children">
                      <a href="#">Sectors</a>
                      <ul className="sub-menu">
                        <li className="menu-item-has-children">
                          <a href="#">Government</a>
                          <ul className="sub-menu">
                            {government.map((s) => (
                              <li key={s.id}><a href={routes.sector(s)}>{s.sector_name}</a></li>
                            ))}
                          </ul>
                        </li>
                        <li className="menu-item-has-children">
                          <a href="#">Private</a>
                          <ul className="sub-menu">
                            {privateSectors.map((s) => (
                              <li key={s.id}><a href={routes.sector(s)}>{s.sector_name}</a></li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </li>
                    <li className="menu-item-has-children">
                      <a href="#">Service</a>
                      <ul className="sub-menu">
                        {services.map((s) => (
                          <li key={s.id}><a href={routes.service(s)}>{titleCase(s.name)}</a></li>
                        ))}
                      </ul>
                    </li>
                    <li className="menu-item-has-children">
                      <a href="#">Project</a>
                      <ul className="sub-menu">
                        {sectors.map((s) => (
                          <li key={s.id}><a href={routes.sectorProjects(s)}>{s.sector_name}</a></li>
                        ))}
                      </ul>
                    </li>
                    <li><a href="/blog">Blog</a></li>
                    <li><a href="/careers">Career</a></li>
                  </ul>
                </nav>
                <div className="header-button d-flex d-lg-none">
                  <button type="button" className="th-menu-toggle sidebar-btn" aria-label="Open menu">
                    <span className="line"></span>
                    <span className="line"></span>
                    <span className="line"></span>
                  </button>
                </div>
              </div>
              <div className="col-auto d-none d-xl-block">
                <div className="header-button">
                  <a href="/contact" className="th-btn btn-mask th-btn-icon">Contact Us</a>
                  <button type="button" className="simple-icon sideMenuInfo sidebar-btn" aria-label="Contact details">
                    <span className="line"></span>
                    <span className="line"></span>
                    <span className="line"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export async function MobileMenu() {
  const [sectors, services] = await Promise.all([getSectors(), getServices()]);
  return (
    <div className="th-menu-wrapper onepage-nav">
      <div className="th-menu-area text-center">
        <button className="th-menu-toggle" aria-label="Close menu"><i className="fal fa-times"></i></button>
        <div className="mobile-logo">
          <a href="/"><img src="/frontend/assets/img/logo-white.png" alt="Havitive" style={{ width: 123 }} /></a>
        </div>
        <div className="th-mobile-menu">
          <ul>
            <li><a href="/">Home</a></li>
            <li className="menu-item-has-children">
              <a href="#">About Us</a>
              <ul className="sub-menu">
                <li><a href="/about#mission">Mission and Vision</a></li>
                <li><a href="/about#group-of-companies">Group Of Companies</a></li>
                <li><a href="/about#leadership">Management Team</a></li>
                <li><a href="/about#employee">Team Members</a></li>
              </ul>
            </li>
            <li className="menu-item-has-children">
              <a href="#">Sectors</a>
              <ul className="sub-menu">
                <li className="menu-item-has-children">
                  <a href="#">Government</a>
                  <ul className="sub-menu">
                    {sectors.filter((s) => s.category === 0).map((s) => (
                      <li key={s.id}><a href={routes.sector(s)}>{s.sector_name}</a></li>
                    ))}
                  </ul>
                </li>
                <li className="menu-item-has-children">
                  <a href="#">Private</a>
                  <ul className="sub-menu">
                    {sectors.filter((s) => s.category === 1).map((s) => (
                      <li key={s.id}><a href={routes.sector(s)}>{s.sector_name}</a></li>
                    ))}
                  </ul>
                </li>
              </ul>
            </li>
            <li className="menu-item-has-children">
              <a href="#">Service</a>
              <ul className="sub-menu">
                {services.map((s) => (
                  <li key={s.id}><a href={routes.service(s)}>{titleCase(s.name)}</a></li>
                ))}
              </ul>
            </li>
            <li className="menu-item-has-children">
              <a href="#">Project</a>
              <ul className="sub-menu">
                {sectors.map((s) => (
                  <li key={s.id}><a href={routes.sectorProjects(s)}>{s.sector_name}</a></li>
                ))}
              </ul>
            </li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/careers">Career</a></li>
            <li><a href={SITE.whatsapp}>Contact Us</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
