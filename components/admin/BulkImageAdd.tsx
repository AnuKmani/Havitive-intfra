"use client";

import { useState, useTransition } from "react";
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
      </span>
      <input
        type="file" accept="image/*" multiple hidden disabled={pending}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!files.length) return;
          start(async () => {
            try {
              const paths: string[] = [];
              for (const [i, f] of files.entries()) {
                setStatus(`Uploading ${i + 1} of ${files.length}…`);
                paths.push(await uploadImage(f, folder));
              }
              setStatus("Saving…");
              await onDone(paths);
              setStatus(`Added ${paths.length}. Open each one to add a name, description and alt text.`);
            } catch (err) {
              setStatus((err as Error).message);
            }
          });
        }}
      />
    </label>
  );
}
