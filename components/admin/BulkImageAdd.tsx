"use client";

import { useState, useTransition } from "react";
import { describeRule, imageRule } from "@/lib/admin/imageRules";
import { uploadImage } from "./Fields";
import Icon from "./Icon";

/** Pick several images at once; each one becomes a new gallery image or floor plan. */
export default function BulkImageAdd({ label, folder, onDone }: {
  label: string;
  folder: string;
  onDone: (paths: string[]) => Promise<void>;
}) {
  const [status, setStatus] = useState("");
  const [pending, start] = useTransition();
  return (
    <label className={`ad-bulk${pending ? " busy" : ""}`}>
      <Icon name="image" size={26} />
      <span>
        <strong>{label}</strong>
        <small>{status || "Select several images – one item is added for each image."}</small>
        <small className="ad-hint">{describeRule(imageRule(folder))}</small>
      </span>
      <input
        type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={pending}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!files.length) return;
          start(async () => {
            const paths: string[] = [];
            const problems: string[] = [];
            for (const [i, f] of files.entries()) {
              setStatus(`Compressing and uploading ${i + 1} of ${files.length}…`);
              try {
                paths.push(await uploadImage(f, folder));
              } catch (err) {
                problems.push(`${f.name}: ${(err as Error).message}`);
              }
            }
            try {
              if (paths.length) {
                setStatus("Saving…");
                await onDone(paths);
              }
              setStatus([paths.length ? `Added ${paths.length}. Open each one to add a name, description and alt text.` : "", ...problems].filter(Boolean).join(" "));
            } catch (err) {
              setStatus((err as Error).message);
            }
          });
        }}
      />
    </label>
  );
}
