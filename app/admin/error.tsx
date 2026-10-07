"use client";

import ErrorScreen from "@/components/errors/ErrorScreen";

export default function AdminError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorScreen {...props} variant="admin" />;
}
