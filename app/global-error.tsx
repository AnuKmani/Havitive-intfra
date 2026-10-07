"use client";

import ErrorScreen from "@/components/errors/ErrorScreen";

// Last resort when a whole layout fails: replaces the page, so it brings its own <html>.
export default function GlobalError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ErrorScreen {...props} variant="site" />
      </body>
    </html>
  );
}
