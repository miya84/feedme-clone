import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { Converter } from "@/components/converter/converter";

const DOC = { title: "글 제목", author: "김도윤", domain: "blog.example.com", body: "첫 문단입니다.\n\n## 소제목" };
const MD = "# 글 제목\n\n저자: 김도윤\n\n첫 문단입니다.\n\n## 소제목\n";

let fetchMock: ReturnType<typeof vi.fn>;
let writeText: ReturnType<typeof vi.fn>;
let openMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(async () => Response.json(DOC));
  writeText = vi.fn(async () => {});
  openMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("open", openMock);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function convertTo(url = "https://blog.example.com/p/1") {
  render(<Converter />);
  fireEvent.change(screen.getByLabelText("페이지 주소"), { target: { value: url } });
  fireEvent.click(screen.getByRole("button", { name: "변환하기" }));
  await screen.findByRole("heading", { level: 2, name: "글 제목" });
}

test("변환하면 제목, 저자, 도메인과 렌더링된 Markdown이 보인다", async () => {
  await convertTo();
  expect(screen.getByText("김도윤")).toBeInTheDocument();
  expect(screen.getByText("blog.example.com")).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 2, name: "소제목" })).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/convert",
    expect.objectContaining({ body: JSON.stringify({ url: "https://blog.example.com/p/1" }) })
  );
});

test("비어 있거나 http가 아닌 주소는 변환을 시작하지 않고 이유를 보여 준다", () => {
  render(<Converter />);
  fireEvent.click(screen.getByRole("button", { name: "변환하기" }));
  expect(screen.getByText("변환할 페이지 주소를 입력해 주세요.")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("페이지 주소"), { target: { value: "ftp://a.com" } });
  fireEvent.click(screen.getByRole("button", { name: "변환하기" }));
  expect(screen.getByText("http:// 또는 https://로 시작하는 주소를 입력해 주세요.")).toBeInTheDocument();
  expect(fetchMock).not.toHaveBeenCalled();
});

test("지우기는 입력, 결과, 프롬프트, 직접 입력을 모두 초기 상태로 되돌린다", async () => {
  await convertTo();
  fireEvent.click(screen.getByRole("button", { name: "직접 입력" }));
  fireEvent.change(screen.getByLabelText("직접 입력한 프롬프트"), { target: { value: "한 줄로" } });
  fireEvent.click(screen.getByRole("button", { name: "지우기" }));
  expect(screen.getByLabelText("페이지 주소")).toHaveValue("");
  expect(screen.queryByRole("heading", { level: 2, name: "글 제목" })).not.toBeInTheDocument();
  expect(screen.getByText("변환한 본문이 여기에 나타납니다")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("페이지 주소"), { target: { value: "https://blog.example.com/p/1" } });
  fireEvent.click(screen.getByRole("button", { name: "변환하기" }));
  await screen.findByRole("heading", { level: 2, name: "글 제목" });
  expect(screen.queryByLabelText("직접 입력한 프롬프트")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "직접 입력" })).toHaveAttribute("aria-pressed", "false");
});

test("복사하기는 # 제목이 붙은 Markdown을 클립보드에 넣는다", async () => {
  await convertTo();
  fireEvent.click(screen.getByRole("button", { name: /복사하기/ }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith(MD));
});

test("프롬프트를 고르고 Claude로 열면 프롬프트, 빈 줄, Markdown이 복사되고 새 탭이 열린다", async () => {
  await convertTo();
  fireEvent.click(screen.getByRole("button", { name: "요약해줘" }));
  fireEvent.click(screen.getByRole("button", { name: /Claude로 열기/ }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith(`요약해줘\n\n${MD}`));
  expect(openMock).toHaveBeenCalledWith("https://claude.ai/new", "_blank", expect.any(String));
});

test("프롬프트를 고르지 않고 ChatGPT로 열면 Markdown만 복사된다", async () => {
  await convertTo();
  fireEvent.click(screen.getByRole("button", { name: /ChatGPT로 열기/ }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith(MD));
  expect(openMock).toHaveBeenCalledWith("https://chatgpt.com/", "_blank", expect.any(String));
});

test("직접 입력 문장이 프롬프트로 쓰이고, 다른 프리셋으로 바꾸면 입력칸이 사라진다", async () => {
  await convertTo();
  fireEvent.click(screen.getByRole("button", { name: "직접 입력" }));
  fireEvent.change(screen.getByLabelText("직접 입력한 프롬프트"), { target: { value: "핵심만" } });
  fireEvent.click(screen.getByRole("button", { name: /Claude로 열기/ }));
  await waitFor(() => expect(writeText).toHaveBeenLastCalledWith(`핵심만\n\n${MD}`));
  fireEvent.click(screen.getByRole("button", { name: "쉽게 설명해줘" }));
  expect(screen.queryByLabelText("직접 입력한 프롬프트")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Claude로 열기/ }));
  await waitFor(() => expect(writeText).toHaveBeenLastCalledWith(`쉽게 설명해줘\n\n${MD}`));
});

test("프리셋을 다시 누르면 선택이 해제된다", async () => {
  await convertTo();
  const preset = screen.getByRole("button", { name: "요약해줘" });
  fireEvent.click(preset);
  expect(preset).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(preset);
  expect(preset).toHaveAttribute("aria-pressed", "false");
});

test("변환 실패는 이전 결과를 지우고 오류를 보여 주며, 다시 시도는 같은 주소로 재실행한다", async () => {
  await convertTo();
  fetchMock.mockResolvedValueOnce(Response.json({ error: "x" }, { status: 422 }));
  fireEvent.click(screen.getByRole("button", { name: "변환하기" }));
  await screen.findByText("페이지를 가져오지 못했습니다");
  expect(screen.queryByRole("heading", { level: 2, name: "글 제목" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /다시 시도/ }));
  await screen.findByRole("heading", { level: 2, name: "글 제목" });
  expect(fetchMock).toHaveBeenCalledTimes(3);
  expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({ url: "https://blog.example.com/p/1" });
});

test("변환 중에는 변환 버튼이 비활성화되어 중복 실행을 막는다", async () => {
  fetchMock.mockImplementation(() => new Promise(() => {}));
  render(<Converter />);
  fireEvent.change(screen.getByLabelText("페이지 주소"), { target: { value: "https://a.com" } });
  fireEvent.click(screen.getByRole("button", { name: "변환하기" }));
  expect(await screen.findByRole("button", { name: /변환 중/ })).toBeDisabled();
  fireEvent.submit(screen.getByLabelText("페이지 주소").closest("form")!);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("변환 중 지우기를 누르면 늦게 도착한 응답이 결과를 되살리지 않는다", async () => {
  let resolve!: (r: Response) => void;
  fetchMock.mockImplementation(() => new Promise<Response>((r) => (resolve = r)));
  render(<Converter />);
  fireEvent.change(screen.getByLabelText("페이지 주소"), { target: { value: "https://a.com" } });
  fireEvent.click(screen.getByRole("button", { name: "변환하기" }));
  fireEvent.click(await screen.findByRole("button", { name: "지우기" }));
  resolve(Response.json(DOC));
  await new Promise((r) => setTimeout(r, 50));
  expect(screen.queryByRole("heading", { level: 2, name: "글 제목" })).not.toBeInTheDocument();
  expect(screen.getByText("변환한 본문이 여기에 나타납니다")).toBeInTheDocument();
});
