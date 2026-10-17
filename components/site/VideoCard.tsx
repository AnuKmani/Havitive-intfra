"use client";

import { useState } from "react";

/** A video box: a still picture with a play button; pressing it plays the YouTube / Vimeo video in the same box. */
export default function VideoCard({ embed, poster, title, text, meta }: { embed: string; poster: string | null; title: string; text?: string | null; meta?: string | null }) {
  const [playing, setPlaying] = useState(false);
  return (
    <article className="sc-card sc-video">
      <div className="sc-media">
        {playing ? (
          <iframe
            src={embed}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button type="button" className="sc-play" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}>
            {poster && <img src={poster} alt="" loading="lazy" />}
            <span className="sc-play-icon" aria-hidden="true"><i className="fa-sharp fa-solid fa-play"></i></span>
          </button>
        )}
      </div>
      <div className="sc-body">
        {meta && <span className="sc-meta">{meta}</span>}
        <h3 className="sc-title">{title}</h3>
        {text && <p className="sc-text">{text}</p>}
      </div>
    </article>
  );
}
