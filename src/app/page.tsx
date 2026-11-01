"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { LESSON_META, LESSON_LEVELS } from "@/data/lesson-data";
import {
  Sparkles,
  Play,
  Trophy,
  Shield,
  GraduationCap,
  BookOpen,
  Compass,
  CheckCircle2,
  Heart,
  Timer,
  Award,
} from "lucide-react";

export default function HomePage() {
  const { user, profile } = useAuth();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/20 via-amber-100/40 to-transparent py-12 sm:py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-200">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Metadata pill */}
          <div className="inline-flex items-center gap-2 bg-amber-200/80 border-2 border-amber-400/60 px-4 py-1.5 rounded-full text-amber-950 font-black text-xs sm:text-sm mb-6 shadow-xs">
            <span>{LESSON_META.grade}</span>
            <span>•</span>
            <span>{LESSON_META.subject}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-amber-950 tracking-tight leading-tight">
            موقع التلعيب التعليمي التفاعلي <br />
            <span className="text-amber-700 bg-amber-200/50 px-4 py-1 rounded-3xl inline-block mt-2">
              «رحلة الفاتحين: فتح مصر» 🏰
            </span>
          </h1>

          <p className="max-w-2xl mx-auto mt-6 text-base sm:text-lg font-semibold text-stone-700 leading-relaxed">
            انطلق في مغامرة تاريخية تفاعلية مشوقة مستوحاة من سير جيش المسلمين بقيادة الصحابي الجليل
            عمرو بن العاص، وتغلّب على الأنشطة والأسئلة لتحصد الأوسمة والصدارة!
          </p>

          {/* Call to Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={user ? "/play" : "/login"}
              className="px-8 py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-2xl font-black text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all transform active:scale-95 flex items-center gap-3 border-2 border-amber-400"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>ابدأ رحلة الفتح الآن 🚀</span>
            </Link>

            <Link
              href="/leaderboard"
              className="px-6 py-4 bg-white hover:bg-stone-50 text-amber-950 rounded-2xl font-black text-base shadow-md border-2 border-amber-400 transition-all flex items-center gap-2"
            >
              <Trophy className="w-5 h-5 text-amber-600" />
              <span>لوحة المتصدرين 🏆</span>
            </Link>
          </div>

          {/* Quick Stats Highlights */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border-2 border-amber-300 shadow-xs">
              <div className="text-2xl font-black text-amber-900">4 محطات</div>
              <div className="text-xs font-bold text-stone-600 mt-1">تغطي أجزاء الدرس</div>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border-2 border-amber-300 shadow-xs">
              <div className="text-2xl font-black text-amber-900">3 قلوب ❤️</div>
              <div className="text-xs font-bold text-stone-600 mt-1">محاولات وتحديات</div>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border-2 border-amber-300 shadow-xs">
              <div className="text-2xl font-black text-amber-900">أوسمة 🎖️</div>
              <div className="text-xs font-bold text-stone-600 mt-1">شارات إنجاز لكل محطة</div>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border-2 border-amber-300 shadow-xs">
              <div className="text-2xl font-black text-amber-900">لوحة للمعلم 👨‍🏫</div>
              <div className="text-xs font-bold text-stone-600 mt-1">رصد الأسئلة الصعبة</div>
            </div>
          </div>
        </div>
      </section>

      {/* Lesson Curriculum Breakdown (أجزاء الدرس المعتمدة من المستند) */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-black bg-amber-100 text-amber-900 px-3.5 py-1 rounded-full border border-amber-300">
            محتوى تعليمي دقيق وموثوق
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-amber-950 mt-2">
            محطات رحلة الفتح الإسلامي لمصر
          </h2>
          <p className="text-stone-600 text-sm font-semibold mt-1">
            محتوى علمي منضبط 100% وفق المقرر الدراسي المعتمد للصف السادس الابتدائي
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LESSON_LEVELS.slice(0, 4).map((lvl) => (
            <div
              key={lvl.id}
              className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-0.5 rounded-full">
                    المحطة {lvl.levelNumber}
                  </span>
                  <span className="text-xs font-bold text-stone-500">
                    وسام: {lvl.badgeName}
                  </span>
                </div>
                <h3 className="text-xl font-black text-amber-950">{lvl.title}</h3>
                <p className="text-xs font-bold text-amber-700 mt-0.5">{lvl.subtitle}</p>

                <div className="mt-4 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700 leading-relaxed">
                  <span className="font-bold text-stone-900">الهدف التعليمي: </span>
                  {lvl.targetObjective}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500">
                  {lvl.questions.length} أنشطة متنوعة
                </span>
                <Link
                  href={`/play/${lvl.id}`}
                  className="text-xs font-black text-amber-800 hover:text-amber-950 flex items-center gap-1"
                >
                  <span>استكشف المحطة</span>
                  <span>←</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Author & Academic Info */}
      <section className="bg-amber-100/60 border-t-2 border-amber-300 py-8 px-4 text-center">
        <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border-2 border-amber-300 shadow-sm">
          <BookOpen className="w-8 h-8 text-amber-700 mx-auto mb-2" />
          <h3 className="text-base font-black text-amber-950">{LESSON_META.author}</h3>
          <p className="text-xs font-bold text-stone-600 mt-1">
            مشروع التلعيب التعليمي لمادة الدراسات الاجتماعية • الفصل الدراسي الثاني
          </p>
        </div>
      </section>
    </div>
  );
}
