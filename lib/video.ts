/** YouTube video id from a watch, short, embed or shorts link. */
export function youtubeId(url?: string | null): string | null {
  const u = (url ?? "").trim();
  const m = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/.exec(u);
  return m ? m[1] : null;
}

/** YouTube / Vimeo link → address that can be shown in an iframe; null for anything else. */
export function toEmbed(url?: string | null): string | null {
  const yt = youtubeId(url);
  if (yt) return `https://www.youtube.com/embed/${yt}?autoplay=1&rel=0`;
  const vm = /vimeo\.com\/(?:video\/)?(\d+)/.exec((url ?? "").trim());
  return vm ? `https://player.vimeo.com/video/${vm[1]}?autoplay=1` : null;
}

/** Still picture of a YouTube video, used when no thumbnail was uploaded. */
export function youtubeThumb(url?: string | null): string | null {
  const id = youtubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
