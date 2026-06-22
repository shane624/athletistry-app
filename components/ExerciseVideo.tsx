"use client";

const CLOUD_NAME = "dsbtk5hpq";

/** Plays an exercise video. Prefers Cloudinary (clean, ad-free native player);
 *  falls back to a YouTube embed if no Cloudinary id is present. */
export default function ExerciseVideo({
  cloudinaryId,
  youtubeId,
  title,
}: {
  cloudinaryId?: string | null;
  youtubeId?: string | null;
  title?: string;
}) {
  if (cloudinaryId) {
    const src = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto/${cloudinaryId}.mp4`;
    const poster = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_0/${cloudinaryId}.jpg`;
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <video
          className="w-full h-full"
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
        />
      </div>
    );
  }
  if (youtubeId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&playsinline=1`}
          title={title ?? "Exercise video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return <p className="text-grey text-sm">No video available.</p>;
}
