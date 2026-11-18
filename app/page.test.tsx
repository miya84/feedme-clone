import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("홈 화면은 URL 변환 화면의 제목과 입력칸을 보여준다", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { level: 1, name: "URL을 Markdown으로" })).toBeInTheDocument();
  expect(screen.getByLabelText("페이지 주소")).toBeInTheDocument();
});
