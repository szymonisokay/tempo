import { TrainerLoader } from "@/components/trainer/TrainerLoader";

export default function Home() {
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-surface-2 px-6 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex min-h-11 items-center font-mono text-[22px] font-bold tracking-tight">
            tempo
            <span aria-hidden className="ml-1 inline-block h-6 w-2.5 rounded-xs bg-accent" />
          </span>
          <span className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs font-semibold tracking-wider text-ink-soft">
            MVP
          </span>
        </div>
        <p className="text-sm text-muted">Wyniki zapisują się tylko w tej przeglądarce</p>
      </header>
      <main className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col gap-6 px-4 pt-8 pb-16 sm:px-6">
        <h1 className="sr-only">Trening pisania na klawiaturze</h1>
        <TrainerLoader />
      </main>
    </>
  );
}
