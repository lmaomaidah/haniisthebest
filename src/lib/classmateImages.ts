import { supabase } from "@/integrations/supabase/client";

/**
 * Our app stores `images.image_url` as a URL returned by the storage client.
 * When the bucket is private, `<img>` tags can't access it unless we generate a signed URL.
 */

export function extractClassmateImagePath(imageUrl: string): string | null {
  const trimmed = imageUrl.trim();
  if (!trimmed) return null;

  // If it's already a data url, keep as-is (no signing).
  if (trimmed.startsWith("data:")) return null;

  // If it's an http(s) URL, try to extract the object path after `/classmate-images/`.
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const u = new URL(trimmed);
      const marker = "/classmate-images/";
      const idx = u.pathname.indexOf(marker);
      if (idx === -1) return null;
      const path = u.pathname.slice(idx + marker.length);
      return path || null;
    } catch {
      return null;
    }
  }

  // Otherwise treat it like a stored path/filename.
  return trimmed.split("?")[0] || null;
}

export async function withSignedClassmateImageUrls<T extends { image_url: string | null }>(
  images: T[],
  expiresInSeconds = 3600
): Promise<T[]> {
  // Only sign URLs that are from our classmate bucket (or are plain filenames/paths).
  const paths: Array<string | null> = images.map((img) => {
    if (!img.image_url) return null;
    if (img.image_url.startsWith("data:")) return null;

    // External URLs should not be signed.
    const isHttp = img.image_url.startsWith("http://") || img.image_url.startsWith("https://");
    if (isHttp && !img.image_url.includes("classmate-images")) return null;

    return extractClassmateImagePath(img.image_url);
  });

  const uniquePaths = Array.from(new Set(paths.filter((p): p is string => !!p)));
  if (uniquePaths.length === 0) return images;

  const bucket = supabase.storage.from("classmate-images") as any;

  // Prefer the bulk API if present.
  if (typeof bucket.createSignedUrls === "function") {
    const { data, error } = await bucket.createSignedUrls(uniquePaths, expiresInSeconds);
    if (error || !data) return images;

    const signedByPath = new Map<string, string>();
    for (const row of data as Array<{ path: string; signedUrl: string }>) {
      if (row?.path && row?.signedUrl) signedByPath.set(row.path, row.signedUrl);
    }

    return images.map((img, i) => {
      const path = paths[i];
      if (!path) return img;
      const signedUrl = signedByPath.get(path);
      if (!signedUrl) return img;
      return { ...img, image_url: signedUrl };
    });
  }

  // Fallback: sign one-by-one.
  const signedByPath = new Map<string, string>();
  await Promise.all(
    uniquePaths.map(async (path) => {
      const { data } = await supabase.storage
        .from("classmate-images")
        .createSignedUrl(path, expiresInSeconds);
      if (data?.signedUrl) signedByPath.set(path, data.signedUrl);
    })
  );

  return images.map((img, i) => {
    const path = paths[i];
    if (!path) return img;
    const signedUrl = signedByPath.get(path);
    if (!signedUrl) return img;
    return { ...img, image_url: signedUrl };
  });
}
