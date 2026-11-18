export type UrlCheck = { ok: true; url: string } | { ok: false; message: string };

export function validateUrl(input: string): UrlCheck {
  const value = input.trim();
  if (!value) return { ok: false, message: "변환할 페이지 주소를 입력해 주세요." };
  let parsed: URL | null = null;
  try {
    parsed = new URL(value);
  } catch {}
  if (!parsed || !/^https?:$/.test(parsed.protocol)) {
    return { ok: false, message: "http:// 또는 https://로 시작하는 주소를 입력해 주세요." };
  }
  return { ok: true, url: value };
}

export function buildExportMarkdown(doc: { title: string; author?: string; body: string }): string {
  const head = [`# ${doc.title}`];
  if (doc.author) head.push(`저자: ${doc.author}`);
  return `${head.join("\n\n")}\n\n${doc.body}\n`;
}

export function buildPayload(prompt: string | null, markdown: string): string {
  const p = prompt?.trim();
  return p ? `${p}\n\n${markdown}` : markdown;
}

export function downloadFileName(title: string): string {
  return title.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "-").slice(0, 60) + ".md";
}
