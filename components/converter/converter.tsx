"use client";

import { useRef, useState } from "react";
import {
  AlertCircleIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
  LinkIcon,
  Loader2Icon,
  RefreshCwIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { MarkdownView } from "@/components/converter/markdown-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Converted } from "@/lib/convert";
import { buildExportMarkdown, buildPayload, downloadFileName, validateUrl } from "@/lib/export";

const PRESETS = ["요약해줘", "한국어로 번역해줘", "쉽게 설명해줘"];
const CUSTOM = "custom";
const SERVICES = {
  ChatGPT: "https://chatgpt.com/",
  Claude: "https://claude.ai/new",
} as const;

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; doc: Converted; sourceUrl: string }
  | { kind: "error" };

export function Converter() {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [prompt, setPrompt] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [lastUrl, setLastUrl] = useState("");

  const runId = useRef(0);
  const loading = status.kind === "loading";

  async function convert(raw: string) {
    if (loading) return;
    const check = validateUrl(raw);
    if (!check.ok) {
      setUrlError(check.message);
      return;
    }
    setUrlError("");
    setLastUrl(check.url);
    const run = ++runId.current;
    setStatus({ kind: "loading" });
    setPrompt(null);
    setCustomPrompt("");
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: check.url }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const doc = await res.json();
      if (run === runId.current) setStatus({ kind: "done", doc, sourceUrl: check.url });
    } catch {
      if (run === runId.current) setStatus({ kind: "error" });
    }
  }

  function clearAll() {
    runId.current++;
    setUrl("");
    setUrlError("");
    setStatus({ kind: "idle" });
    setPrompt(null);
    setCustomPrompt("");
  }

  const activePrompt = prompt === CUSTOM ? customPrompt : prompt;
  const markdown = status.kind === "done" ? buildExportMarkdown(status.doc) : "";

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      toast.error("클립보드에 복사하지 못했습니다");
      return false;
    }
  }

  async function copyMarkdown() {
    if (await copyText(markdown)) toast.success("Markdown을 복사했습니다");
  }

  function download() {
    if (status.kind !== "done") return;
    const name = downloadFileName(status.doc.title);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([markdown], { type: "text/markdown" }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("파일을 내려받았습니다", { description: name });
  }

  async function openIn(service: keyof typeof SERVICES) {
    window.open(SERVICES[service], "_blank", "noopener,noreferrer");
    const p = activePrompt?.trim();
    if (await copyText(buildPayload(activePrompt, markdown))) {
      toast.success(`${service} 새 채팅을 열었습니다`, {
        description: p
          ? `"${p}" 프롬프트와 본문을 복사했습니다. 채팅창에 붙여넣으세요.`
          : "본문을 복사했습니다. 채팅창에 붙여넣으세요.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-[28px] leading-tight font-semibold tracking-tight text-balance max-sm:text-2xl">
          URL을 Markdown으로
        </h1>
        <p className="text-muted-foreground">본문만 뽑아 ChatGPT·Claude에 바로 넘깁니다.</p>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void convert(url);
        }}
      >
        <Field data-invalid={!!urlError}>
          <FieldLabel htmlFor="url">페이지 주소</FieldLabel>
          <div className="flex gap-2 max-sm:flex-col">
            <InputGroup className="flex-1">
              <InputGroupAddon>
                <LinkIcon />
              </InputGroupAddon>
              <InputGroupInput
                id="url"
                type="url"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                placeholder="https://example.com/article"
                value={url}
                aria-invalid={!!urlError}
                aria-describedby={urlError ? "url-error" : undefined}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setUrlError("");
                }}
              />
              {(url || status.kind !== "idle") && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-xs" aria-label="지우기" title="지우기" onClick={clearAll}>
                    <XIcon />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2Icon className="animate-spin" data-icon="inline-start" />}
              {loading ? "변환 중…" : "변환하기"}
            </Button>
          </div>
          {urlError && <FieldError id="url-error">{urlError}</FieldError>}
        </Field>
      </form>

      {status.kind === "idle" && (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon />
            </EmptyMedia>
            <EmptyTitle>변환한 본문이 여기에 나타납니다</EmptyTitle>
            <EmptyDescription>
              블로그 글, 뉴스 기사, 문서 페이지처럼 본문이 있는 주소를 넣어 보세요.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {status.kind === "loading" && (
        <Card aria-busy="true" aria-label="본문을 가져오는 중" className="gap-3 p-6">
          <Skeleton className="h-6.5 w-[78%]" />
          <Skeleton className="h-4 w-[36%]" />
          <div className="h-2" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-[94%]" />
          <Skeleton className="h-3.5 w-[97%]" />
          <Skeleton className="h-3.5 w-[62%]" />
        </Card>
      )}

      {status.kind === "error" && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>페이지를 가져오지 못했습니다</AlertTitle>
          <AlertDescription>
            <p>
              사이트가 응답하지 않거나 외부 요청을 막고 있습니다. 본문을 찾지 못했거나 로그인이 필요한
              페이지도 변환할 수 없습니다. 주소를 확인한 뒤 다시 시도해 주세요.
            </p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => void convert(lastUrl)}>
              <RefreshCwIcon data-icon="inline-start" />
              다시 시도
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {status.kind === "done" && (
        <Card className="gap-0 p-0">
          <header className="flex flex-col gap-2 px-6 pt-6 pb-5 max-sm:px-4">
            <h2 className="font-heading text-[22px] leading-snug font-semibold tracking-tight text-pretty max-sm:text-xl">
              {status.doc.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              {status.doc.author && (
                <>
                  <span>{status.doc.author}</span>
                  <span aria-hidden className="size-[3px] rounded-full bg-current opacity-60" />
                </>
              )}
              <a
                href={status.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={status.sourceUrl}
                className="inline-flex min-w-0 max-w-full items-center gap-1 truncate hover:text-foreground hover:underline hover:underline-offset-4"
              >
                <LinkIcon className="size-3.5" />
                {status.doc.domain}
              </a>
            </div>
          </header>

          <div className="flex flex-col gap-3.5 border-y bg-muted/50 px-6 py-4 max-sm:px-4">
            <div className="flex flex-col gap-2">
              <span id="prompt-label" className="text-[13px] font-medium text-muted-foreground">
                앞에 붙일 프롬프트 (선택)
              </span>
              <ToggleGroup
                variant="outline"
                spacing={1.5}
                className="flex-wrap"
                aria-labelledby="prompt-label"
                value={prompt ? [prompt] : []}
                onValueChange={(v) => setPrompt(v[0] ?? null)}
              >
                {PRESETS.map((p) => (
                  <ToggleGroupItem key={p} value={p}>
                    {p}
                  </ToggleGroupItem>
                ))}
                <ToggleGroupItem value={CUSTOM}>직접 입력</ToggleGroupItem>
              </ToggleGroup>
              {prompt === CUSTOM && (
                <Input
                  autoFocus
                  aria-label="직접 입력한 프롬프트"
                  placeholder="예: 핵심 주장 세 가지와 반론을 정리해줘"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2 max-sm:grid max-sm:grid-cols-2">
                <Button variant="outline" onClick={() => void copyMarkdown()}>
                  <CopyIcon data-icon="inline-start" />
                  복사하기
                </Button>
                <Button variant="outline" onClick={download}>
                  <DownloadIcon data-icon="inline-start" />
                  .md 다운로드
                </Button>
                <Button onClick={() => void openIn("ChatGPT")}>
                  <ExternalLinkIcon data-icon="inline-start" />
                  ChatGPT로 열기
                </Button>
                <Button onClick={() => void openIn("Claude")}>
                  <ExternalLinkIcon data-icon="inline-start" />
                  Claude로 열기
                </Button>
              </div>
              <p className="text-[13px] leading-normal text-muted-foreground">
                열기를 누르면 내용이 클립보드에 복사되고 새 탭에서 새 채팅이 열립니다. 채팅창에 붙여넣기만
                하면 됩니다.
              </p>
            </div>
          </div>

          <MarkdownView>{status.doc.body}</MarkdownView>
        </Card>
      )}
    </div>
  );
}
