import { useState } from "react";

// Renders a product photo, falling back to a tasteful placeholder if the
// remote image fails to load (e.g. offline) so the layout never breaks.
export default function ProductImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#e4e4de] to-[#c9c9c1] ${className}`}
      >
        <span className="px-4 text-center font-display text-sm tracking-tight text-muted">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
