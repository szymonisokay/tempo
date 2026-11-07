"use client";

import dynamic from "next/dynamic";

/**
 * Trener działa tylko w przeglądarce: losuje tekst (Math.random), czyta
 * localStorage i mierzy czas. Renderowanie po stronie serwera dawałoby inny
 * tekst niż w przeglądarce, więc je wyłączamy.
 */
const Trainer = dynamic(() => import("./Trainer").then((m) => m.Trainer), {
  ssr: false,
  loading: () => <TrainerSkeleton />,
});

export function TrainerLoader() {
  return <Trainer />;
}

function TrainerSkeleton() {
  return (
    <div aria-busy="true" aria-label="Ładowanie trenera" className="flex flex-col gap-6">
      <div className="h-[148px] animate-pulse rounded-2xl bg-surface" />
      <div className="h-[220px] animate-pulse rounded-2xl bg-surface/60" />
      <div className="h-[330px] animate-pulse rounded-2xl bg-surface" />
    </div>
  );
}
