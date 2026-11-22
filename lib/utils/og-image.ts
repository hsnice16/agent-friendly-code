import { OG_IMAGE_SIZE } from "@/lib/version";

/** Metadata for the card app/og serves for `path`. */
export function ogImage(path: string, alt: string) {
  return { url: `/og${path}`, ...OG_IMAGE_SIZE, alt };
}
