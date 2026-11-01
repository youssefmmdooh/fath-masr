import { LESSON_LEVELS } from "@/data/lesson-data";
import { LevelGameClient } from "./game-client";
import { Suspense } from "react";

export function generateStaticParams() {
  return LESSON_LEVELS.map((level) => ({
    levelId: level.id,
  }));
}

export default async function LevelPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = await params;

  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto py-20 text-center font-bold text-amber-900">
          جاري تحميل المحطة... 🏰
        </div>
      }
    >
      <LevelGameClient levelId={levelId} />
    </Suspense>
  );
}
