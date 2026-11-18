import Markdown from "react-markdown";

export function MarkdownView({ children }: { children: string }) {
  return (
    <div
      className="px-6 pt-2 pb-7 text-[15px] leading-7 wrap-anywhere max-sm:px-4
        [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-4 [&_blockquote]:border-l-3 [&_blockquote]:border-border [&_blockquote]:pl-3.5 [&_blockquote]:text-muted-foreground
        [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.88em]
        [&_h1]:mt-7 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mt-7 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-semibold
        [&_img]:h-auto [&_img]:max-w-full [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3
        [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0
        [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6"
    >
      <Markdown>{children}</Markdown>
    </div>
  );
}
