"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { LESSON_LEVELS, LESSON_META } from "@/data/lesson-data";
import {
  Sparkles,
  Lock,
  Play,
  CheckCircle2,
  Star,
  Award,
  BookOpen,
  ArrowLeft,
  Flame,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { StudentProgress } from "@/lib/supabase/types";

export default function PlayMapPage() {
  const { profile } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, StudentProgress>>({});
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project");

  useEffect(() => {
    async function fetchProgress() {
      if (!profile) {
        setLoading(false);
        return;
      }

      if (isSupabaseConfigured) {
        const { data } = await supabase
          .from("student_progress")
          .select("*")
          .eq("user_id", profile.id);

        if (data) {
          const map: Record<string, StudentProgress> = {};
          data.forEach((p) => {
            map[p.level_id] = p as StudentProgress;
          });
          setProgressMap(map);
        }
      } else {
        // Local storage progress fallback
        const saved = localStorage.getItem(`progress_${profile.id}`);
        if (saved) {
          try {
            setProgressMap(JSON.parse(saved));
          } catch {
            // ignore
          }
        }
      }
      setLoading(false);
    }

    fetchProgress();
  }, [profile, isSupabaseConfigured, supabase]);

  const currentUnlockedLevel = profile?.current_level || 1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Hero Mission Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-4 border-amber-300 relative overflow-hidden mb-10">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-amber-950/70 text-amber-200 text-xs px-3 py-1 rounded-full font-bold">
              {LESSON_META.grade}
            </span>
            <span className="bg-amber-900/60 text-white text-xs px-3 py-1 rounded-full font-bold">
              {LESSON_META.subject}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black mb-2">
            خريطة الفاتحين: مسار فتح مصر 🗺️
          </h1>
          <p className="text-amber-100 font-semibold text-sm sm:text-base max-w-2xl leading-relaxed">
            سر في خطى جيش الفتح الإسلامي بقيادة الصحابي الجليل عمرو بن العاص من العريش حتى تأسيس
            الفسطاط، وتغلّب على التحديات لتحصد الأوسمة الذهبية!
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              <span className="font-black text-sm">مجموع نقاطك: {profile?.total_score || 0}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-200" />
              <span className="font-black text-sm">
                المرحلة المتاحة: {currentUnlockedLevel} من {LESSON_LEVELS.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Levels Timeline Map */}
      <div className="relative">
        {/* Connecting Line behind nodes */}
        <div className="absolute right-7 sm:right-9 top-8 bottom-8 w-2 bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600 rounded-full z-0 hidden sm:block" />

        <div className="space-y-6 relative z-10">
          {LESSON_LEVELS.map((level, idx) => {
            const isUnlocked = level.levelNumber <= currentUnlockedLevel;
            const progress = progressMap[level.id];
            const isCompleted = progress?.completed || false;
            const stars = progress?.stars || 0;
            const isCurrent = level.levelNumber === currentUnlockedLevel;

            return (
              <div
                key={level.id}
                className={`relative flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-3xl border-4 transition-all ${
                  isCurrent
                    ? "bg-amber-50 border-amber-500 shadow-xl scale-[1.01] ring-4 ring-amber-300/40"
                    : isUnlocked
                    ? "bg-white border-amber-300 hover:border-amber-400 shadow-md"
                    : "bg-stone-100 border-stone-300 opacity-65"
                }`}
              >
                {/* Level Number Node */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-3xl flex items-center justify-center font-black text-xl sm:text-2xl border-4 shrink-0 shadow-lg ${
                    isCompleted
                      ? "bg-green-500 text-white border-green-600"
                      : isCurrent
                      ? "bg-amber-500 text-white border-amber-600 animate-pulse"
                      : isUnlocked
                      ? "bg-amber-100 text-amber-900 border-amber-400"
                      : "bg-stone-300 text-stone-500 border-stone-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : isUnlocked ? (
                    level.levelNumber
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>

                {/* Level Information */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                      المحطة {level.levelNumber}
                    </span>
                    <span className="text-xs font-bold text-stone-500">
                      {level.questions.length} أنشطة تفاعلية
                    </span>
                    {isCurrent && (
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-red-500 text-white animate-bounce">
                        أنت هنا! 🎯
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-amber-950">
                    {level.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-stone-600 mt-0.5">
                    {level.subtitle}
                  </p>

                  {/* Objective & Badge preview */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className="text-[11px] font-bold bg-stone-100 text-stone-700 px-3 py-1 rounded-xl border border-stone-200">
                      🎯 الهدف: {level.targetObjective}
                    </div>
                    <div className="text-[11px] font-bold bg-amber-100/70 text-amber-900 px-2.5 py-1 rounded-xl border border-amber-300 flex items-center gap-1">
                      <span>وسام:</span>
                      <span>{level.badgeName}</span>
                    </div>
                  </div>

                  {/* Stars for completed levels */}
                  {isCompleted && (
                    <div className="flex items-center gap-1 mt-2.5">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-4 h-4 ${
                            starIdx <= stars
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-stone-300"
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-stone-600 mr-1.5">
                        النتيجة: {progress?.score || 0} نقطة
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="shrink-0 flex sm:flex-col justify-end">
                  {isUnlocked ? (
                    <Link
                      href={`/play/${level.id}`}
                      className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all transform active:scale-95 ${
                        isCurrent
                          ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white ring-2 ring-amber-400"
                          : "bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-400"
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{isCompleted ? "العب ثانية" : "ابدأ التحدي"}</span>
                    </Link>
                  ) : (
                    <div className="px-4 py-2.5 rounded-2xl bg-stone-200 text-stone-500 font-bold text-xs flex items-center justify-center gap-1.5 border border-stone-300">
                      <Lock className="w-3.5 h-3.5" />
                      <span>أكمل المحطة السابقة</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
