import ApplicationsList from "@/components/admin/ApplicationsList";

export const metadata = { title: "Job applications" };

/** Applications for a job opening. CVs dropped for future consideration live in Talent network. */
export default function Applications({ searchParams }: { searchParams: Promise<{ status?: string; job?: string; q?: string }> }) {
  return <ApplicationsList searchParams={searchParams} scope="jobs" />;
}
