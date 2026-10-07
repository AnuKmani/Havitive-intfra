"use client";

import ErrorScreen from "@/components/errors/ErrorScreen";

export default function SiteError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorScreen {...props} variant="site" />;
}
