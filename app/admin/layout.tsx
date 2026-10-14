import type { Metadata } from "next";
import ImageFallback from "@/components/admin/ImageFallback";
import ErrorReporter from "@/components/errors/ErrorReporter";
import { EARLY_MONITOR } from "@/components/errors/earlyMonitor";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Havitive Admin", template: "%s · Havitive Admin" },
  robots: { index: false, follow: false },
  icons: { icon: "/upload/logos/hav.png" },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: EARLY_MONITOR }} />
      </head>
      <body className="ad-body">
        {children}
        <ImageFallback />
        <ErrorReporter />
      </body>
    </html>
  );
}
