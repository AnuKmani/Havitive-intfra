"use client";

import { useRef, useState } from "react";
import { altName, type Field, type Option } from "@/lib/admin/resources";
import { media, splitList, STORAGE_PREFIX } from "@/lib/media";
import { browserClient } from "@/lib/supabase/browser";

const MAX_IMAGE = 8 * 1024 * 1024;

export async function uploadImage(file: File, folder = "misc"): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > MAX_IMAGE) throw new Error("Images must be under 8 MB.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await browserClient().storage.from("upload").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return STORAGE_PREFIX + path;
}

function ImageField({ field, value, alt }: { field: Field; value: string; alt: string }) {
  const [current, setCurrent] = useState(value);
  const [status, setStatus] = useState("");
  return (
    <div className="ad-image">
      <input type="hidden" name={field.name} value={current} />
      {current ? (
        <img src={media(current, field.legacyFolder)} alt="" />
      ) : (
        <div className="ad-noimg">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
          No image yet
        </div>
      )}
      <div className="ad-image-actions">
        <label className="ad-btn ad-btn-light">
          {current ? "Replace" : "Upload"}
          <input
            type="file" accept="image/*" hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setStatus("Uploading…");
              try {
                setCurrent(await uploadImage(file, field.folder));
                setStatus("Uploaded. Remember to save.");
              } catch (err) {
                setStatus((err as Error).message);
              }
            }}
          />
        </label>
        {current && !field.required && (
          <button type="button" className="ad-btn ad-btn-light" onClick={() => setCurrent("")}>Remove</button>
        )}
        {status && <small>{status}</small>}
        <label className="ad-alt">
          <span>Alt text (describes the image for Google and screen readers)</span>
          <input type="text" name={altName(field)} defaultValue={alt} placeholder="e.g. Front view of the Kottarakkara municipality office" maxLength={200} />
        </label>
      </div>
    </div>
  );
}

function ImagesField({ field, value, alt }: { field: Field; value: string; alt: string }) {
  const [list, setList] = useState(() => {
    const alts = alt.split("\n");
    return splitList(value).map((src, i) => ({ src, alt: alts[i] ?? "" }));
  });
  const [status, setStatus] = useState("");
  const move = (i: number, d: number) => {
    const next = [...list];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
  };
  return (
    <div>
      <input type="hidden" name={field.name} value={list.map((x) => x.src).join(",")} />
      <input type="hidden" name={altName(field)} value={list.map((x) => x.alt.replace(/\s+/g, " ")).join("\n")} />
      <div className="ad-gallery">
        {list.map((img, i) => (
          <div key={img.src + i} className="ad-gallery-item">
            <img src={media(img.src, field.legacyFolder)} alt="" />
            <input
              className="ad-gallery-alt"
              value={img.alt}
              placeholder="Alt text"
              aria-label={`Alt text for image ${i + 1}`}
              onChange={(e) => setList(list.map((x, k) => (k === i ? { ...x, alt: e.target.value } : x)))}
            />
            <div>
              <button type="button" onClick={() => move(i, -1)} aria-label="Move left">←</button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Move right">→</button>
              <button type="button" onClick={() => setList(list.filter((_, k) => k !== i))} aria-label="Remove">✕</button>
            </div>
          </div>
        ))}
      </div>
      <label className="ad-btn ad-btn-light">
        Add images
        <input
          type="file" accept="image/*" multiple hidden
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            if (!files.length) return;
            setStatus(`Uploading ${files.length}…`);
            try {
              const added: string[] = [];
              for (const f of files) added.push(await uploadImage(f, field.folder));
              setList((l) => [...l, ...added.map((src) => ({ src, alt: "" }))]);
              setStatus("Uploaded. Remember to save.");
            } catch (err) {
              setStatus((err as Error).message);
            }
          }}
        />
      </label>
      {status && <small className="ad-status">{status}</small>}
    </div>
  );
}

function RichTextField({ field, value }: { field: Field; value: string }) {
  const [html, setHtml] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const cmd = (name: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(name, false, arg);
    setHtml(ref.current?.innerHTML ?? "");
  };
  return (
    <div className="ad-rich">
      <input type="hidden" name={field.name} value={html} />
      <div className="ad-rich-bar">
        <button type="button" onClick={() => cmd("bold")}><b>B</b></button>
        <button type="button" onClick={() => cmd("italic")}><i>I</i></button>
        <button type="button" onClick={() => cmd("formatBlock", "<h3>")}>Heading</button>
        <button type="button" onClick={() => cmd("formatBlock", "<p>")}>Paragraph</button>
        <button type="button" onClick={() => cmd("insertUnorderedList")}>• List</button>
        <button type="button" onClick={() => cmd("insertOrderedList")}>1. List</button>
        <button
          type="button"
          onClick={() => {
            const url = prompt("Link address (https://…)");
            if (url && /^https?:\/\//.test(url)) cmd("createLink", url);
          }}
        >
          Link
        </button>
        <button type="button" onClick={() => cmd("removeFormat")}>Clear</button>
      </div>
      <div
        ref={ref}
        className="ad-rich-body"
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => setHtml((e.target as HTMLDivElement).innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}

export function FieldInput({ field, value, alt = "", options }: { field: Field; value: string; alt?: string; options?: Option[] }) {
  const common = { id: field.name, name: field.name, required: field.required, defaultValue: value };
  switch (field.type) {
    case "textarea":
      return <textarea {...common} rows={5} />;
    case "html":
      return <RichTextField field={field} value={value} />;
    case "image":
      return <ImageField field={field} value={value} alt={alt} />;
    case "images":
      return <ImagesField field={field} value={value} alt={alt} />;
    case "select":
      return (
        <select {...common}>
          <option value="">— Select —</option>
          {options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case "multiselect": {
      const selected = new Set(splitList(value));
      return (
        <div className="ad-checks">
          {options?.length ? options.map((o) => (
            <label key={o.value}>
              <input type="checkbox" name={field.name} value={o.value} defaultChecked={selected.has(o.value)} /> {o.label}
            </label>
          )) : <small>Nothing to choose yet.</small>}
        </div>
      );
    }
    case "number":
      return <input {...common} type="number" />;
    case "url":
      return <input {...common} type="url" placeholder="https://" />;
    case "email":
      return <input {...common} type="email" />;
    default:
      return <input {...common} type="text" />;
  }
}
