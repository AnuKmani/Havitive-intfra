import PageHeader from "@/components/admin/PageHeader";
import PasswordForm from "./PasswordForm";

export const metadata = { title: "Change password" };

export default function Account() {
  return (
    <>
      <PageHeader icon="key" title="Change password" subtitle="Use at least 10 characters. You stay signed in on this device." />
      <section className="ad-panel" style={{ maxWidth: 480 }}>
        <PasswordForm />
      </section>
    </>
  );
}
