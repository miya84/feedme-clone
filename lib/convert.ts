import { Defuddle } from "defuddle/node";
import { parseHTML } from "linkedom";

export type Converted = { title: string; author: string; domain: string; body: string };

export class ConvertError extends Error {}

export async function convertUrl(
  url: string,
  fetchImpl: typeof fetch = fetch
): Promise<Converted> {
  let html: string;
  try {
    const res = await fetchImpl(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; FeedMe/1.0)", accept: "text/html" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new ConvertError(`HTTP ${res.status}`);
    html = await res.text();
  } catch (e) {
    if (e instanceof ConvertError) throw e;
    throw new ConvertError("fetch failed");
  }

  const { document } = parseHTML(html);
  const result = await Defuddle(document, url, { markdown: true });
  const body = (result.content ?? "").trim();
  if (!body) throw new ConvertError("empty body");

  const host = new URL(url).hostname;
  return {
    title: result.title?.trim() || host,
    author: result.author?.trim() ?? "",
    domain: host,
    body,
  };
}
