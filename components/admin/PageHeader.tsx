import Icon from "./Icon";

export default function PageHeader({ icon, title, subtitle, back, action }: {
  icon: string;
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  action?: React.ReactNode;
}) {
  return (
    <header className="ad-page-head">
      <div className="ad-page-title">
        <span className="ad-page-icon"><Icon name={icon} size={24} /></span>
        <div>
          {back && <a href={back.href} className="ad-back">← {back.label}</a>}
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {action && <div className="ad-page-actions">{action}</div>}
    </header>
  );
}
