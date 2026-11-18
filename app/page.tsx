import { Converter } from "@/components/converter/converter";
import { ThemeToggle } from "@/components/theme-toggle";
import { FileTextIcon } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-4 sm:px-6">
      <header className="flex items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-2 font-semibold">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <FileTextIcon className="size-4" />
          </span>
          FeedMe
        </div>
        <ThemeToggle />
      </header>
      <Converter />
    </main>
  );
}
