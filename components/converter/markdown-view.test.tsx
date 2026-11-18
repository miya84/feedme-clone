import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { MarkdownView } from "@/components/converter/markdown-view";

test("Markdown 표가 table 요소로 렌더링된다", () => {
  render(
    <MarkdownView>{"| 용량 | 1개 가격 |\n| --- | --- |\n| 2.5mg | 3,200엔 |"}</MarkdownView>
  );
  expect(screen.getByRole("table")).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "용량" })).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: "3,200엔" })).toBeInTheDocument();
});
