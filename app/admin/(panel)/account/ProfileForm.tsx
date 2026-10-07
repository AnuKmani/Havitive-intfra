"use client";

import { useActionState } from "react";
import { FieldInput } from "@/components/admin/Fields";
import Icon from "@/components/admin/Icon";
import { updateProfile, type ActionState } from "../../actions";

export default function ProfileForm({ email, name, phone, photo }: { email: string; name: string; phone: string; photo: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateProfile, null);
  return (
    <form action={action} className="ad-form">
      <div className="ad-field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" defaultValue={name} maxLength={100} />
      </div>
      <div className="ad-field">
        <label htmlFor="phone">Phone</label>
        <input id="phone" name="phone" type="text" defaultValue={phone} maxLength={30} />
      </div>
      <div className="ad-field ad-field-textarea">
        <label>Email</label>
        <input type="email" value={email} disabled />
        <small>This is your sign-in email. To change it, update the user in Supabase → Authentication.</small>
      </div>
      <div className="ad-field ad-field-image">
        <label>Photo</label>
        <FieldInput field={{ name: "photo", label: "Photo", type: "image", folder: "admin_images" }} value={photo} />
      </div>
      <div className="ad-form-foot">
        <button className="ad-btn" disabled={pending}><Icon name="check" /> {pending ? "Saving…" : "Save profile"}</button>
        {state && <span className={state.ok ? "ad-ok" : "ad-err"}>{state.message}</span>}
      </div>
    </form>
  );
}
