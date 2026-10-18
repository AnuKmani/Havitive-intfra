import PopupGallery, { type GalleryVariant } from "./PopupGallery";
import VideoGallery from "./VideoGallery";

export type ShowItem = {
  id: number; title: string; description: string | null; image: string | null; alt: string;
  date: string | null; link: string | null; embed: string | null; poster: string | null;
};

/** CSR, handing over events, awards and media: picture cards that open a popup slider. Media shows no dates (its dates hold source names). */
export function PictureList({ items, variant }: { items: ShowItem[]; variant: GalleryVariant }) {
  return (
    <PopupGallery
      variant={variant}
      items={items.filter((i) => i.image).map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        image: i.image!,
        alt: i.alt,
        date: variant === "media" ? null : i.date,
      }))}
    />
  );
}

/** Project videos: a dark cinema band; each video plays in a popup you can slide through. */
export function ProjectVideos({ items }: { items: ShowItem[] }) {
  const vids = items.filter((i) => i.embed).map((i) => ({ id: i.id, embed: i.embed!, poster: i.poster, title: i.title, text: i.description }));
  return (
    <div className="pv-band">
      <VideoGallery items={vids} />
    </div>
  );
}
