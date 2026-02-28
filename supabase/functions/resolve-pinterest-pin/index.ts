const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PIN_ID_REGEX = /\/pin\/(\d+)/i;
const OG_IMAGE_REGEX =
  /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i;

const extractPinId = (value: string | null | undefined): string | null => {
  if (!value) return null;

  const decoded = decodeURIComponent(value);

  const direct = decoded.match(PIN_ID_REGEX);
  if (direct) return direct[1];

  const shortNumeric = decoded.match(/pin\.it\/(\d+)(?:[/?#]|$)/i);
  if (shortNumeric) return shortNumeric[1];

  const query = decoded.match(/[?&](?:pin_id|pinId|id)=(\d+)/i);
  if (query) return query[1];

  return null;
};

const extractPreviewImage = (html: string): string | null => {
  const ogMatch = html.match(OG_IMAGE_REGEX);
  if (ogMatch?.[1]) return ogMatch[1];

  const secureMatch = html.match(
    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i
  );
  if (secureMatch?.[1]) return secureMatch[1];

  const escapedPinimgMatch = html.match(/https?:\\\/\\\/i\.pinimg\.com\\\/[^"\\]+/i);
  if (escapedPinimgMatch?.[0]) {
    return escapedPinimgMatch[0].replace(/\\\//g, "/").replace(/\\u002F/gi, "/");
  }

  const pinimgMatch = html.match(/https?:\/\/i\.pinimg\.com\/[^"']+/i);
  return pinimgMatch?.[0] ?? null;
};

const fetchOEmbedPreview = async (targetUrl: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://www.pinterest.com/oembed.json?url=${encodeURIComponent(targetUrl)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; pin-resolver/1.0)",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) return null;

    const payload = (await response.json()) as Record<string, unknown>;
    const thumbnailUrl =
      typeof payload.thumbnail_url === "string" ? payload.thumbnail_url : null;
    const imageUrl = typeof payload.image_url === "string" ? payload.image_url : null;

    return thumbnailUrl ?? imageUrl;
  } catch {
    return null;
  }
};

const fetchPreviewFromPage = async (targetUrl: string): Promise<string | null> => {
  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; pin-resolver/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const html = await response.text();
    return extractPreviewImage(html);
  } catch {
    return null;
  }
};

const normalizeUrl = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

type ResolveAttemptResult = {
  pinId: string | null;
  resolvedUrl: string;
  previewImageUrl: string | null;
};

const tryResolvePinId = async (
  url: string,
  method: "HEAD" | "GET"
): Promise<ResolveAttemptResult | null> => {
  const response = await fetch(url, {
    method,
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; pin-resolver/1.0)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  let previewImageUrl: string | null = null;
  const fromFinalUrl = extractPinId(response.url);
  const fromLocation = extractPinId(response.headers.get("location"));
  let fromHtml: string | null = null;
  let fromDeepLink: string | null = null;

  if (method === "GET") {
    const html = await response.text();
    previewImageUrl = extractPreviewImage(html);

    const htmlMatch = html.match(PIN_ID_REGEX);
    if (htmlMatch) fromHtml = htmlMatch[1];

    const deepLinkMatch = html.match(/pinterest:\/\/pin\/(\d+)/i);
    if (deepLinkMatch) fromDeepLink = deepLinkMatch[1];
  }

  const resolvedPinId = fromFinalUrl ?? fromLocation ?? fromHtml ?? fromDeepLink;

  if (resolvedPinId) {
    if (!previewImageUrl) {
      const pagePreview = await fetchPreviewFromPage(response.url);
      previewImageUrl = pagePreview ?? (await fetchOEmbedPreview(response.url));
    }

    return {
      pinId: resolvedPinId,
      resolvedUrl: response.url,
      previewImageUrl,
    };
  }

  if (previewImageUrl) {
    return { pinId: null, resolvedUrl: response.url, previewImageUrl };
  }

  const pagePreview = await fetchPreviewFromPage(response.url);
  if (pagePreview) {
    return { pinId: null, resolvedUrl: response.url, previewImageUrl: pagePreview };
  }

  const oEmbedPreview = await fetchOEmbedPreview(response.url);
  if (oEmbedPreview) {
    return { pinId: null, resolvedUrl: response.url, previewImageUrl: oEmbedPreview };
  }

  return null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalized = normalizeUrl(url);
    const directPinId = extractPinId(normalized);

    if (directPinId) {
      const pagePreview = await fetchPreviewFromPage(normalized);
      const directPreview = pagePreview ?? (await fetchOEmbedPreview(normalized));

      return new Response(
        JSON.stringify({
          pinId: directPinId,
          resolvedUrl: normalized,
          previewImageUrl: directPreview,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const attempts = Array.from(
      new Set([
        normalized,
        normalized.replace("https://pin.it/", "https://www.pin.it/"),
        normalized.replace("http://pin.it/", "https://www.pin.it/"),
      ])
    );

    let fallback: ResolveAttemptResult | null = null;

    for (const attempt of attempts) {
      for (const method of ["GET", "HEAD"] as const) {
        try {
          const resolved = await tryResolvePinId(attempt, method);
          if (!resolved) continue;

          if (resolved.pinId) {
            return new Response(JSON.stringify(resolved), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          if (!fallback && resolved.previewImageUrl) {
            fallback = resolved;
          }
        } catch {
          // Continue to next strategy
        }
      }
    }

    if (fallback) {
      return new Response(
        JSON.stringify({
          ...fallback,
          error:
            "Could not fully resolve this short link. Try using the full Pinterest pin URL.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        pinId: null,
        resolvedUrl: normalized,
        previewImageUrl: null,
        error: "Unable to resolve pin ID from this URL",
      }),
      {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unexpected error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
