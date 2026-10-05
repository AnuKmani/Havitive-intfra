"use client";

export default function ConfirmButton({ action, label = "Delete", message = "Delete this item? This cannot be undone." }: {
  action: () => Promise<void>;
  label?: string;
  message?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      style={{ display: "inline" }}
    >
      <button type="submit" className="ad-btn ad-btn-danger">{label}</button>
    </form>
  );
}
