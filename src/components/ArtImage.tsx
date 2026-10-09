import { useState } from "react";
import { bannerUrl, posterUrl } from "../lib/api";

export function ArtImage({
  titleId,
  palette,
  name,
  variant = "poster",
  className,
}: {
  titleId: string;
  palette: string;
  name: string;
  variant?: "poster" | "banner";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = variant === "poster" ? posterUrl(titleId) : bannerUrl(titleId);

  if (failed) {
    return (
      <div
        aria-label={`${name} artwork`}
        className={`art-fallback ${className ?? ""}`}
        style={{ background: `linear-gradient(160deg, #262626 0%, ${palette} 55%, #050505 100%)` }}
        role="img"
      >
        <span>{name.charAt(0).toUpperCase()}</span>
      </div>
    );
  }

  return (
    <img
      alt={`${name} artwork`}
      className={className}
      draggable={false}
      loading="lazy"
      onError={() => setFailed(true)}
      src={src}
    />
  );
}