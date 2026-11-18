// @vitest-environment node
import { expect, test } from "vitest";

import { ConvertError, convertUrl } from "@/lib/convert";

const html = (body: string, head = "") =>
  `<!doctype html><html><head><title>글 제목 - 사이트</title>${head}</head><body>${body}</body></html>`;

const okFetch = (text: string, status = 200) =>
  (async () => new Response(text, { status, headers: { "content-type": "text/html" } })) as typeof fetch;

const ARTICLE = html(
  `<nav><a href="/">홈메뉴</a></nav>
   <article><h1>글 제목</h1><p>첫 문단입니다. ${"본문 ".repeat(60)}</p><h2>소제목</h2><ul><li>하나</li><li>둘</li></ul><p>둘째 문단입니다. ${"내용 ".repeat(60)}</p></article>
   <footer>푸터저작권</footer>`,
  `<meta name="author" content="김도윤">`
);

test("HTML에서 제목, 저자, 도메인, 본문 Markdown을 뽑고 메뉴와 푸터는 뺀다", async () => {
  const r = await convertUrl("https://blog.example.com/p/1", okFetch(ARTICLE));
  expect(r.title).toContain("글 제목");
  expect(r.author).toBe("김도윤");
  expect(r.domain).toBe("blog.example.com");
  expect(r.body).toContain("## 소제목");
  expect(r.body).toContain("- 하나");
  expect(r.body).not.toContain("홈메뉴");
  expect(r.body).not.toContain("푸터저작권");
});

test("제목을 알 수 없으면 호스트 이름을 제목으로 쓴다", async () => {
  const page = `<!doctype html><html><body><article><p>${"본문 ".repeat(80)}</p></article></body></html>`;
  const r = await convertUrl("https://noname.example.org/a", okFetch(page));
  expect(r.title).toBe("noname.example.org");
});

test("본문이 비어 있으면 추출 실패다", async () => {
  await expect(
    convertUrl("https://a.com/", okFetch(html("")))
  ).rejects.toBeInstanceOf(ConvertError);
});

test("HTTP 오류 응답은 가져오기 실패다", async () => {
  await expect(
    convertUrl("https://a.com/", okFetch("nope", 403))
  ).rejects.toBeInstanceOf(ConvertError);
});

test("네트워크 오류는 가져오기 실패다", async () => {
  const boom = (async () => {
    throw new TypeError("fetch failed");
  }) as typeof fetch;
  await expect(convertUrl("https://a.com/", boom)).rejects.toBeInstanceOf(ConvertError);
});
