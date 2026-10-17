"use client";

import { useState, useTransition } from "react";
import { setRecordStatus } from "@/app/admin/actions";
import { STATUS_TONE, type Option } from "@/lib/admin/resources";

/** A dropdown in a list row that saves the new status as soon as it is chosen. */
export default function StatusSelect({ resourceKey, id, value, options }: {
  resourceKey: string;
  id: number;
  value: string;
  options: Option[];
}) {
  const [current, setCurrent] = useState(value);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="ad-status">
      <select
        className={`ad-status-select ${STATUS_TONE[current] ?? "pill-grey"}`}
        value={current}
        disabled={pending}
        aria-label="Status"
        onChange={(e) => {
          const next = e.target.value;
          const before = current;
          setCurrent(next);
          setNote(null);
          start(async () => {
            const r = await setRecordStatus(resourceKey, id, next);
            if (!r?.ok) setCurrent(before);
            setNote({ ok: !!r?.ok, text: r?.message ?? "Could not save" });
          });
        }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span role="status" aria-live="polite">
        {(pending || note) && (
          <small className={!pending && note?.ok === false ? "ad-err" : "ad-status-note"}>{pending ? "Saving…" : note?.text}</small>
        )}
      </span>
    </div>
  );
}
