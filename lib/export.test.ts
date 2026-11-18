import { expect, test } from "vitest";

import {
  buildExportMarkdown,
  buildPayload,
  downloadFileName,
  validateUrl,
} from "@/lib/export";

test("내보내는 Markdown은 # 제목 줄, 저자 줄, 본문 순서다", () => {
  expect(
    buildExportMarkdown({ title: "글 제목", author: "김도윤", body: "본문입니다." })
  ).toBe("# 글 제목\n\n저자: 김도윤\n\n본문입니다.\n");
});

test("저자를 모르면 저자 줄이 없다", () => {
  expect(buildExportMarkdown({ title: "글 제목", body: "본문입니다." })).toBe(
    "# 글 제목\n\n본문입니다.\n"
  );
});

test("프롬프트를 고르면 프롬프트, 빈 줄, Markdown 순서로 붙는다", () => {
  expect(buildPayload("요약해줘", "# T\n")).toBe("요약해줘\n\n# T\n");
});

test("프롬프트가 없거나 공백이면 Markdown만 나간다", () => {
  expect(buildPayload(null, "# T\n")).toBe("# T\n");
  expect(buildPayload("   ", "# T\n")).toBe("# T\n");
});

test("다운로드 파일 이름은 제목에서 만든 .md다", () => {
  expect(downloadFileName('React: 서버/컴포넌트 "메모"')).toBe("React-서버컴포넌트-메모.md");
});

test("다운로드 파일 이름은 60자로 자른다", () => {
  expect(downloadFileName("가".repeat(100))).toBe("가".repeat(60) + ".md");
});

test("빈 입력은 이유와 함께 거절한다", () => {
  expect(validateUrl("  ")).toEqual({
    ok: false,
    message: "변환할 페이지 주소를 입력해 주세요.",
  });
});

test("http/https가 아닌 주소는 거절한다", () => {
  for (const bad of ["ftp://a.com/x", "javascript:alert(1)", "not a url", "example.com"]) {
    expect(validateUrl(bad)).toEqual({
      ok: false,
      message: "http:// 또는 https://로 시작하는 주소를 입력해 주세요.",
    });
  }
});

test("올바른 주소는 앞뒤 공백을 지우고 통과한다", () => {
  expect(validateUrl(" https://a.com/x ")).toEqual({ ok: true, url: "https://a.com/x" });
});
