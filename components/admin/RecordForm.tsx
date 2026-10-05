"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/admin/actions";
import type { Field, Option } from "@/lib/admin/resources";
import { FieldInput } from "./Fields";

type Props = {
  fields: Field[];
  values: Record<string, unknown>;
  options: Record<string, Option[]>;
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  submitLabel?: string;
  compact?: boolean;
  initialMessage?: string;
};

export default function RecordForm({ fields, values, options, action, submitLabel = "Save", compact, initialMessage }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    initialMessage ? { ok: true, message: initialMessage } : null,
  );
  return (
    <form action={formAction} className={compact ? "ad-form ad-form-compact" : "ad-form"}>
      {fields.map((f) => (
        <div className="ad-field" key={f.name}>
          <label htmlFor={f.name}>
            {f.label}
            {f.required && <span className="ad-req"> *</span>}
          </label>
          <FieldInput
            field={f}
            value={values[f.name] === null || values[f.name] === undefined ? "" : String(values[f.name])}
            options={typeof f.options === "string" ? options[f.options] : f.options}
          />
          {f.help && <small>{f.help}</small>}
        </div>
      ))}
      <div className="ad-form-foot">
        <button type="submit" className="ad-btn" disabled={pending}>{pending ? "Saving…" : submitLabel}</button>
        {state && <span className={state.ok ? "ad-ok" : "ad-err"} role="status">{state.message}</span>}
      </div>
    </form>
  );
}
