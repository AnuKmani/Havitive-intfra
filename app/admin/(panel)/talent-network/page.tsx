import ApplicationsList from "@/components/admin/ApplicationsList";

export const metadata = { title: "Talent network" };

/** CVs sent through "Join our talent network" for future consideration, kept apart from job applications. */
export default function TalentNetwork({ searchParams }: { searchParams: Promise<{ status?: string; job?: string; q?: string }> }) {
  return <ApplicationsList searchParams={searchParams} scope="talent" />;
}
