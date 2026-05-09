export interface OgMetadata {
  url: string;
  title?: string;
  description?: string;
  siteName?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
}

const cache = new Map<string, OgMetadata>();

function pickMeta(html: string, patterns: RegExp[]): string | undefined {
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return decodeEntities(m[1].trim());
  }
  return undefined;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function metaRe(prop: string, attr: 'property' | 'name'): RegExp {
  return new RegExp(`<meta\\s+[^>]*${attr}=["']${prop}["'][^>]*content=["']([^"']+)["']`, 'i');
}

export async function fetchOgMetadata(url: string, fallback: Partial<OgMetadata> = {}): Promise<OgMetadata> {
  if (cache.has(url)) return cache.get(url)!;

  const base: OgMetadata = { url, ...fallback };

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LosslessSiteBuild/1.0 (+https://lossless.group)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const title = pickMeta(html, [metaRe('og:title', 'property'), metaRe('twitter:title', 'name')])
      ?? html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
    const description = pickMeta(html, [
      metaRe('og:description', 'property'),
      metaRe('twitter:description', 'name'),
      metaRe('description', 'name'),
    ]);
    const siteName = pickMeta(html, [metaRe('og:site_name', 'property')]);
    const image = pickMeta(html, [metaRe('og:image', 'property'), metaRe('twitter:image', 'name')]);
    const imageAlt = pickMeta(html, [metaRe('og:image:alt', 'property'), metaRe('twitter:image:alt', 'name')]);
    const widthStr = pickMeta(html, [metaRe('og:image:width', 'property')]);
    const heightStr = pickMeta(html, [metaRe('og:image:height', 'property')]);

    const result: OgMetadata = {
      url,
      title: title ?? fallback.title,
      description: description ?? fallback.description,
      siteName: siteName ?? fallback.siteName,
      image: image ?? fallback.image,
      imageAlt: imageAlt ?? fallback.imageAlt,
      imageWidth: widthStr ? Number(widthStr) : fallback.imageWidth,
      imageHeight: heightStr ? Number(heightStr) : fallback.imageHeight,
    };
    cache.set(url, result);
    return result;
  } catch (err) {
    console.warn(`[fetchOgMetadata] ${url}: ${(err as Error).message} — using fallback`);
    cache.set(url, base);
    return base;
  }
}
