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
  return ogMatch?.[1] ?? null;
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

  const fromFinalUrl = extractPinId(response.url);
  if (fromFinalUrl) {
    return { pinId: fromFinalUrl, resolvedUrl: response.url, previewImageUrl: null };
  }

  const fromLocation = extractPinId(response.headers.get("location"));
  if (fromLocation) {
    return { pinId: fromLocation, resolvedUrl: response.url, previewImageUrl: null };
  }

  if (method === "GET") {
    const html = await response.text();
    const previewImageUrl = extractPreviewImage(html);

    const htmlMatch = html.match(PIN_ID_REGEX);
    if (htmlMatch) {
      return { pinId: htmlMatch[1], resolvedUrl: response.url, previewImageUrl };
    }

    const deepLinkMatch = html.match(/pinterest:\/\/pin\/(\d+)/i);
    if (deepLinkMatch) {
      return { pinId: deepLinkMatch[1], resolvedUrl: response.url, previewImageUrl };
    }

    if (previewImageUrl) {
      return { pinId: null, resolvedUrl: response.url, previewImageUrl };
    }
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
      return new Response(
        JSON.stringify({
          pinId: directPinId,
          resolvedUrl: normalized,
          previewImageUrl: null,
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
      for (const method of ["HEAD", "GET"] as const) {
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
