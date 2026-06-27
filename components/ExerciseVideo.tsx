"use client";

import { useState } from "react";

const CLOUD_NAME = "dsbtk5hpq";

/** Shows the exercise video as a real poster-frame thumbnail (a still pulled
 *  from the clip) with a play button. Tapping it loads and plays the video
 *  inline. Prefers Cloudinary; falls back to a YouTube thumbnail/embed. */
export default function ExerciseVideo({
  cloudinaryId,
  youtubeId,
  title,
}: {
  cloudinaryId?: string | null;
  youtubeId?: string | null;
  title?: string;
}) {
  const [playing, setPlaying] = useState(false);

  // ---------- Cloudinary ----------
  if (cloudinaryId) {
    const src = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto/${cloudinaryId}.mp4`;
    // a real frame from ~1s into the clip, cropped to fill the frame
    const poster = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_1,w_800,h_450,c_fill,g_auto/${cloudinaryId}.jpg`;

    if (playing) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <video className="w-full h-full" src={src} poster={poster} controls autoPlay loop playsInline preload="metadata" />
        </div>
      );
    }
    return <PosterButton poster={poster} title={title} onPlay={() => setPlaying(true)} />;
  }

  // ---------- YouTube fallback ----------
  if (youtubeId) {
    const poster = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    if (playing) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&playsinline=1&autoplay=1&loop=1&playlist=${youtubeId}`}
            title={title ?? "Exercise video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    return <PosterButton poster={poster} title={title} onPlay={() => setPlaying(true)} />;
  }

  return <p className="text-grey text-sm">No video available.</p>;
}

function PosterButton({ poster, title, onPlay }: { poster: string; title?: string; onPlay: () => void }) {
  return (
    <button
      onClick={onPlay}
      aria-label={`Play ${title ?? "exercise"} video`}
      className="group relative block aspect-video w-full overflow-hidden rounded-lg bg-black"
    >
      <img
        src={poster}
        alt={title ? `${title} demonstration` : "Exercise demonstration"}
        className="h-full w-full object-cover transition group-hover:scale-[1.03]"
        loading="lazy"
      />
      {/* subtle gradient so the play button reads on any frame */}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      {/* play button */}
      <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-teal/95 text-white shadow-lg transition group-hover:scale-110">
        <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      </span>
    </button>
  );
}
