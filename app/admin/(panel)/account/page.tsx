import PasswordForm from "./PasswordForm";

export const metadata = { title: "Change password" };

export default function Account() {
  return (
    <>
      <h1>Change password</h1>
      <section className="ad-panel" style={{ maxWidth: 480 }}>
        <PasswordForm />
      </section>
    </>
  );
}
