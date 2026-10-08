"use client";

import { useRef, useState } from "react";
import { altName, type Field, type Option } from "@/lib/admin/resources";
import { media, splitList, STORAGE_PREFIX } from "@/lib/media";
import { browserClient } from "@/lib/supabase/browser";
import { describeRule, imageRule, type ImageKind } from "@/lib/admin/imageRules";

const MAX_ORIGINAL = 25 * 1024 * 1024;
const MAX_STORED = 2 * 1024 * 1024; // the storage bucket rejects anything bigger
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Checks an image against its size rule, scales it down to fit and compresses it (WebP when the
 * browser supports it), then uploads it. Returns the stored path and a short note for the admin.
 */
export async function uploadImageDetailed(original: File, folder = "misc", kind?: ImageKind): Promise<{ path: string; note: string }> {
  const rule = imageRule(folder, kind);
  if (!ACCEPTED.includes(original.type)) throw new Error("Please use a JPG, PNG or WebP image.");
  if (original.size > MAX_ORIGINAL) throw new Error("This file is too large (over 25 MB). Please export a smaller image.");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(original);
  } catch {
    throw new Error("This image can't be read. Please save it again as JPG or PNG.");
  }
  const { width, height } = bitmap;
  const long = Math.max(width, height), short = Math.min(width, height);
  const tooSmall = rule.landscape
    ? width < rule.minW || height < rule.minH
    : long < Math.max(rule.minW, rule.minH) || short < Math.min(rule.minW, rule.minH);
  if (tooSmall) {
    bitmap.close();
    throw new Error(`Image is too small (${width} × ${height} px). ${rule.label}s need at least ${rule.minW} × ${rule.minH} px – best ${rule.w} × ${rule.h} px.`);
  }

  const scale = rule.landscape
    ? Math.min(1, rule.w / width, rule.h / height)
    : Math.min(1, Math.max(rule.w, rule.h) / long, Math.min(rule.w, rule.h) / short);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // WebP keeps transparency and is much smaller; older browsers fall back to PNG (transparent) or JPEG.
  let blob: Blob | null = null;
  for (const q of [0.82, 0.7, 0.55]) {
    blob = await toBlob(canvas, "image/webp", q);
    if (blob?.type !== "image/webp") {
      blob = original.type === "image/png" ? await toBlob(canvas, "image/png", 1) : await toBlob(canvas, "image/jpeg", q + 0.03);
    }
    if (blob && blob.size <= MAX_STORED) break;
  }
  if (!blob || blob.size > MAX_STORED) throw new Error("This image is still over 2 MB after compression. Please use a simpler or smaller image.");

  const ext = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await browserClient().storage.from("upload").upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  const kb = Math.round(blob.size / 1024);
  const note = scale < 1
    ? `Resized from ${width} × ${height} to ${canvas.width} × ${canvas.height} px (${kb} KB).`
    : `Optimised (${canvas.width} × ${canvas.height} px, ${kb} KB).`;
  return { path: STORAGE_PREFIX + path, note };
}

export async function uploadImage(original: File, folder = "misc", kind?: ImageKind): Promise<string> {
  return (await uploadImageDetailed(original, folder, kind)).path;
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
            type="file" accept="image/jpeg,image/png,image/webp" hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setStatus("Checking and compressing…");
              try {
                const { path, note } = await uploadImageDetailed(file, field.folder, field.size);
                setCurrent(path);
                setStatus(`${note} Remember to save.`);
              } catch (err) {
                setStatus((err as Error).message);
              }
            }}
          />
        </label>
        {current && !field.required && (
          <button type="button" className="ad-btn ad-btn-light" onClick={() => setCurrent("")}>Remove</button>
        )}
        {status && <small className="ad-status">{status}</small>}
        <small className="ad-hint">{describeRule(imageRule(field.folder, field.size))}</small>
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
          type="file" accept="image/jpeg,image/png,image/webp" multiple hidden
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (!files.length) return;
            const added: string[] = [];
            const problems: string[] = [];
            for (const [i, f] of files.entries()) {
              setStatus(`Compressing and uploading ${i + 1} of ${files.length}…`);
              try {
                added.push(await uploadImage(f, field.folder, field.size));
              } catch (err) {
                problems.push(`${f.name}: ${(err as Error).message}`);
              }
            }
            setList((l) => [...l, ...added.map((src) => ({ src, alt: "" }))]);
            setStatus([added.length ? `${added.length} uploaded. Remember to save.` : "", ...problems].filter(Boolean).join(" "));
          }}
        />
      </label>
      {status && <small className="ad-status">{status}</small>}
      <small className="ad-hint">{describeRule(imageRule(field.folder, field.size))}</small>
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
