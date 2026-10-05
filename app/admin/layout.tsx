import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Havitive Admin", template: "%s · Havitive Admin" },
  robots: { index: false, follow: false },
  icons: { icon: "/upload/logos/hav.png" },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="ad-body">{children}</body>
    </html>
  );
}
