"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { LESSON_LEVELS, type Question } from "@/data/lesson-data";
import { sound } from "@/lib/sound";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/lib/supabase/client";
import {
  Heart,
  Timer,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  Star,
  MapPin,
  BookOpen,
} from "lucide-react";

export function LevelGameClient({ levelId }: { levelId: string }) {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  const supabase = createClient();

  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project");

  const level = LESSON_LEVELS.find((l) => l.id === levelId);

  // Game Phases: 'narrative' | 'playing' | 'game_over' | 'victory'
  const [phase, setPhase] = useState<"narrative" | "playing" | "game_over" | "victory">("narrative");

  // Game Play States
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Question Interaction States
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [reorderedItems, setReorderedItems] = useState<string[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  if (!level) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center px-4">
        <h2 className="text-2xl font-black text-amber-950">المرحلة غير موجودة!</h2>
        <Link
          href="/play"
          className="mt-4 inline-block px-5 py-2.5 bg-amber-600 text-white rounded-xl font-bold"
        >
          العودة لخريطة المراحل
        </Link>
      </div>
    );
  }

  const currentQ: Question = level.questions[currentQIndex];

  // Start Playing
  const handleStartGame = () => {
    setPhase("playing");
    setHearts(3);
    setScore(0);
    setCurrentQIndex(0);
    setElapsedSeconds(0);
    setTimerActive(true);
    resetQuestionState();
  };

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setReorderedItems([]);
    setIsAnswerChecked(false);
    setIsCurrentCorrect(false);
  };

  // Reorder click handler
  const handleReorderClick = (item: string) => {
    if (isAnswerChecked) return;
    if (reorderedItems.includes(item)) {
      setReorderedItems(reorderedItems.filter((i) => i !== item));
    } else {
      setReorderedItems([...reorderedItems, item]);
    }
  };

  // Submit Answer
  const handleCheckAnswer = async () => {
    if (isAnswerChecked) return;

    let isCorrect = false;

    if (currentQ.type === "reorder") {
      const targetArray = currentQ.correctAnswer as string[];
      isCorrect =
        reorderedItems.length === targetArray.length &&
        reorderedItems.every((val, idx) => val === targetArray[idx]);
    } else {
      isCorrect = selectedAnswer === currentQ.correctAnswer;
    }

    setIsAnswerChecked(true);
    setIsCurrentCorrect(isCorrect);

    // Record question analytics
    recordQuestionResult(currentQ.id, level.id, currentQ.prompt, !isCorrect);

    if (isCorrect) {
      sound.playCorrect();
      setScore((prev) => prev + currentQ.points);
    } else {
      sound.playWrong();
      const newHearts = hearts - 1;
      setHearts(newHearts);
      if (newHearts <= 0) {
        setTimerActive(false);
        setTimeout(() => {
          setPhase("game_over");
        }, 1200);
      }
    }
  };

  // Move to next question or trigger Victory
  const handleNextQuestion = () => {
    if (currentQIndex + 1 < level.questions.length) {
      setCurrentQIndex((prev) => prev + 1);
      resetQuestionState();
    } else {
      setTimerActive(false);
      handleVictory();
    }
  };

  // Handle Level Victory
  const handleVictory = async () => {
    setPhase("victory");
    sound.playFanfare();

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    const starsEarned = Math.max(1, hearts);
    const speedBonus = Math.max(0, 100 - Math.floor(elapsedSeconds / 2));
    const finalLevelScore = score + speedBonus;
    setScore(finalLevelScore);

    if (profile) {
      await saveProgressToDatabase(starsEarned, finalLevelScore);
    }
  };

  // Save Progress & Badges
  const saveProgressToDatabase = async (starsEarned: number, finalLevelScore: number) => {
    if (!profile) return;

    const nextLevelNumber = Math.max(
      profile.current_level || 1,
      level.levelNumber + 1 <= LESSON_LEVELS.length ? level.levelNumber + 1 : level.levelNumber
    );

    const updatedBadges = Array.from(new Set([...(profile.badges || []), level.badgeName]));
    const newTotalScore = (profile.total_score || 0) + finalLevelScore;

    if (isSupabaseConfigured) {
      try {
        await supabase.from("student_progress").upsert(
          {
            user_id: profile.id,
            level_id: level.id,
            score: finalLevelScore,
            stars: starsEarned,
            completed: true,
            time_seconds: elapsedSeconds,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,level_id" }
        );

        await supabase
          .from("profiles")
          .update({
            total_score: newTotalScore,
            current_level: nextLevelNumber,
            badges: updatedBadges,
            last_played_at: new Date().toISOString(),
          })
          .eq("id", profile.id);

        await refreshProfile();
      } catch (err) {
        console.error("Failed to save progress to Supabase:", err);
      }
    } else {
      // Fallback local storage
      const existing = localStorage.getItem(`progress_${profile.id}`);
      const map = existing ? JSON.parse(existing) : {};
      map[level.id] = {
        id: "loc-" + Date.now(),
        user_id: profile.id,
        level_id: level.id,
        score: finalLevelScore,
        stars: starsEarned,
        completed: true,
        time_seconds: elapsedSeconds,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(`progress_${profile.id}`, JSON.stringify(map));

      const localProfile = {
        ...profile,
        total_score: newTotalScore,
        current_level: nextLevelNumber,
        badges: updatedBadges,
      };
      localStorage.setItem("egypt_conquest_demo_user", JSON.stringify(localProfile));
      await refreshProfile();
    }
  };

  const recordQuestionResult = async (
    qId: string,
    lvlId: string,
    title: string,
    isWrong: boolean
  ) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.rpc("record_question_attempt", {
          p_question_id: qId,
          p_level_id: lvlId,
          p_question_title: title,
          p_is_wrong: isWrong,
        });
      } catch {
        // fallback
      }
    } else {
      const key = "analytics_questions";
      const stored = localStorage.getItem(key);
      const list = stored ? JSON.parse(stored) : {};
      if (!list[qId]) {
        list[qId] = {
          question_id: qId,
          level_id: lvlId,
          question_title: title,
          wrong_count: 0,
          total_attempts: 0,
        };
      }
      list[qId].total_attempts += 1;
      if (isWrong) list[qId].wrong_count += 1;
      localStorage.setItem(key, JSON.stringify(list));
    }
  };

  // PHASE 1: NARRATIVE
  if (phase === "narrative") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-amber-400 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-stone-100">
            <div>
              <span className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
                المحطة {level.levelNumber} من {LESSON_LEVELS.length}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-amber-950 mt-1">
                {level.title}
              </h1>
              <p className="text-xs sm:text-sm font-bold text-stone-500 mt-0.5">
                {level.subtitle}
              </p>
            </div>
            <Link
              href="/play"
              className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              title="خريطة المراحل"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>

          <div className="space-y-4 bg-amber-50/70 p-5 sm:p-6 rounded-2xl border-2 border-amber-200 mb-6">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <BookOpen className="w-5 h-5 text-amber-700" />
              <span>اقرأ وتأمّل حقائق الدرس قبل بدء التحدي:</span>
            </div>
            <div className="space-y-3">
              {level.narrativeText.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-stone-800 text-sm sm:text-base leading-relaxed font-semibold bg-white p-3.5 rounded-xl border border-amber-100 shadow-xs"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-indigo-950 text-xs sm:text-sm font-bold flex items-center gap-3 mb-6">
            <span className="text-xl">🎯</span>
            <div>
              <div className="font-black text-indigo-900">الهدف التعليمي:</div>
              <div className="text-indigo-800/90">{level.targetObjective}</div>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3"
          >
            <Sparkles className="w-6 h-6 fill-current text-yellow-200" />
            <span>أنا مستعد، ابدأ التحدي الآن! 🚀</span>
          </button>
        </div>
      </div>
    );
  }

  // PHASE 3: GAME OVER
  if (phase === "game_over") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border-4 border-red-400 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-100 border-2 border-red-300 flex items-center justify-center text-4xl mb-4">
            💔
          </div>
          <h2 className="text-2xl font-black text-stone-900">نفدت المحاولات!</h2>
          <p className="text-sm font-semibold text-stone-600 mt-2 leading-relaxed">
            لا بأس يا بطل! التعلم خطوة بخطوة هو سر الفاتحين. اقرأ محتوى المحطة بعناية وحاول مرة
            أخرى لتتجاوز التحدي.
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleStartGame}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة المحاولة من جديد 🔄</span>
            </button>
            <Link
              href="/play"
              className="block w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-bold text-sm transition-colors"
            >
              العودة لخريطة المراحل
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 4: VICTORY
  if (phase === "victory") {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-amber-400 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-green-500" />

          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-amber-100 to-yellow-200 border-4 border-amber-400 flex items-center justify-center shadow-lg mb-4">
            <Trophy className="w-12 h-12 text-amber-600" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-amber-950">
            أحسنت يا بطل الفتح! 🎉
          </h2>
          <p className="text-xs sm:text-sm font-bold text-stone-600 mt-1">
            لقد اجتزت محطة «{level.title}» بنجاح باهر!
          </p>

          <div className="flex items-center justify-center gap-2 my-5">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-8 h-8 ${
                  starIdx <= Math.max(1, hearts)
                    ? "text-yellow-400 fill-yellow-400 animate-bounce"
                    : "text-stone-300"
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 bg-amber-50/80 p-4 rounded-2xl border-2 border-amber-200 mb-6">
            <div className="text-center">
              <span className="text-xs font-bold text-stone-600">النقاط المكتسبة</span>
              <div className="text-2xl font-black text-amber-900 mt-0.5">+{score}</div>
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-stone-600">الوقت المستغرق</span>
              <div className="text-2xl font-black text-amber-900 mt-0.5">{elapsedSeconds} ثانية</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-amber-400 flex items-center gap-3.5 text-right mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-sm">
              🎖️
            </div>
            <div>
              <div className="text-[11px] font-black text-amber-800">وسام جديد فُتح لك!</div>
              <div className="text-base font-black text-amber-950">{level.badgeName}</div>
              <div className="text-xs font-bold text-stone-600 mt-0.5">{level.badgeDescription}</div>
            </div>
          </div>

          <div className="space-y-2.5">
            {level.levelNumber < LESSON_LEVELS.length && (
              <Link
                href={`/play/level-${level.levelNumber + 1}`}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
              >
                <span>المحطة التالية: {LESSON_LEVELS[level.levelNumber]?.title}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleStartGame}
                className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>العب ثانية</span>
              </button>
              <Link
                href="/play"
                className="py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>خريطة المراحل</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 2: PLAYING
  const progressPercent = ((currentQIndex + 1) / level.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 w-full">
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-4 border-amber-400 shadow-md mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((heartIndex) => (
              <Heart
                key={heartIndex}
                className={`w-6 h-6 transition-transform ${
                  heartIndex <= hearts
                    ? "text-red-500 fill-red-500 animate-pulse"
                    : "text-stone-300"
                }`}
              />
            ))}
          </div>

          <div className="text-center">
            <span className="text-xs font-black text-amber-950">
              السؤال {currentQIndex + 1} من {level.questions.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-stone-600 font-black text-xs sm:text-sm bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
              <Timer className="w-4 h-4 text-amber-600" />
              <span>{elapsedSeconds} ث</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs sm:text-sm bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>{score} نقطة</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden mt-3">
          <div
            className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-amber-400 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            {currentQ.type === "true_false" && "⚖️ صح أم خطأ"}
            {currentQ.type === "multiple_choice" && "🎯 اختيار من متعدد"}
            {currentQ.type === "fill_blank" && "✏️ أكمل الفراغ"}
            {currentQ.type === "reorder" && "🔢 رتّب المحطات زمنياً"}
          </span>
          <span className="text-xs font-bold text-stone-500">
            +{currentQ.points} نقطة
          </span>
        </div>

        <h2 className="text-lg sm:text-2xl font-black text-amber-950 mb-6 leading-relaxed">
          {currentQ.prompt}
        </h2>

        {/* 1. True / False */}
        {currentQ.type === "true_false" && (
          <div className="grid grid-cols-2 gap-4">
            {["صح", "خطأ"].map((choice) => {
              const isSelected = selectedAnswer === choice;
              let btnClass = "border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800";

              if (isAnswerChecked) {
                if (choice === currentQ.correctAnswer) {
                  btnClass = "border-green-500 bg-green-50 text-green-900 ring-2 ring-green-400";
                } else if (isSelected) {
                  btnClass = "border-red-500 bg-red-50 text-red-900";
                }
              } else if (isSelected) {
                btnClass = "border-amber-600 bg-amber-100 text-amber-950 shadow-md scale-102";
              }

              return (
                <button
                  key={choice}
                  type="button"
                  disabled={isAnswerChecked}
                  onClick={() => setSelectedAnswer(choice)}
                  className={`py-5 px-6 rounded-2xl border-4 font-black text-lg sm:text-xl transition-all flex items-center justify-center gap-3 ${btnClass}`}
                >
                  <span>{choice === "صح" ? "✅" : "❌"}</span>
                  <span>{choice}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. Multiple Choice & Fill Blank */}
        {(currentQ.type === "multiple_choice" || currentQ.type === "fill_blank") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentQ.options?.map((option) => {
              const isSelected = selectedAnswer === option;
              let btnClass = "border-stone-200 bg-stone-50 hover:bg-amber-50/50 text-stone-800";

              if (isAnswerChecked) {
                if (option === currentQ.correctAnswer) {
                  btnClass = "border-green-500 bg-green-50 text-green-900 ring-2 ring-green-400";
                } else if (isSelected) {
                  btnClass = "border-red-500 bg-red-50 text-red-900";
                }
              } else if (isSelected) {
                btnClass = "border-amber-600 bg-amber-100 text-amber-950 shadow-md scale-101";
              }

              return (
                <button
                  key={option}
                  type="button"
                  disabled={isAnswerChecked}
                  onClick={() => setSelectedAnswer(option)}
                  className={`p-4 rounded-2xl border-3 font-black text-base text-right transition-all flex items-center justify-between ${btnClass}`}
                >
                  <span>{option}</span>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs shrink-0 ${
                      isSelected
                        ? "border-amber-600 bg-amber-600 text-white"
                        : "border-stone-300"
                    }`}
                  >
                    {isSelected ? "✓" : ""}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 3. Reorder */}
        {currentQ.type === "reorder" && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-stone-600">
              انقر على الكلمات بالترتيب الصحيح لتكوين التسلسل المطلوب:
            </p>

            <div className="min-h-16 p-4 rounded-2xl bg-amber-50 border-2 border-dashed border-amber-300 flex flex-wrap items-center gap-2">
              {reorderedItems.length === 0 ? (
                <span className="text-xs font-bold text-amber-800/60">
                  (اختر العناصر بالترتيب من الأسفل لتظهر هنا...)
                </span>
              ) : (
                reorderedItems.map((item, idx) => (
                  <span
                    key={item}
                    onClick={() => handleReorderClick(item)}
                    className="cursor-pointer bg-amber-900 text-amber-100 px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm hover:bg-amber-950 transition-colors"
                  >
                    <span className="w-4 h-4 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </span>
                ))
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {currentQ.options?.map((item) => {
                const isSelected = reorderedItems.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    disabled={isAnswerChecked || isSelected}
                    onClick={() => handleReorderClick(item)}
                    className={`px-4 py-2.5 rounded-xl border-2 font-black text-xs sm:text-sm transition-all ${
                      isSelected
                        ? "bg-stone-200 border-stone-300 text-stone-400 opacity-40"
                        : "bg-white border-amber-300 hover:border-amber-500 text-stone-900 shadow-sm"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isAnswerChecked && (
          <div
            className={`mt-6 p-4 sm:p-5 rounded-2xl border-2 flex items-start gap-3.5 animate-fadeIn ${
              isCurrentCorrect
                ? "bg-green-50 border-green-300 text-green-950"
                : "bg-red-50 border-red-300 text-red-950"
            }`}
          >
            {isCurrentCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-black text-sm sm:text-base">
                {isCurrentCorrect ? "إجابة ممتازة وصحيحة! 🎉" : "إجابة غير دقيقة! ❌"}
              </div>
              <p className="text-xs sm:text-sm font-semibold mt-1 opacity-90 leading-relaxed">
                <span className="font-bold underline ml-1">توضيح من نص الدرس:</span>
                {currentQ.explanation}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t-2 border-stone-100 flex items-center justify-between">
          <Link
            href="/play"
            className="text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors"
          >
            خروج للخريطة
          </Link>

          {!isAnswerChecked ? (
            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={
                currentQ.type === "reorder"
                  ? reorderedItems.length === 0
                  : !selectedAnswer
              }
              className="py-3 px-8 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-2xl font-black text-sm shadow-md transition-all transform active:scale-95 disabled:opacity-50"
            >
              تحقق من الإجابة ✨
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="py-3 px-8 bg-amber-950 hover:bg-stone-900 text-white rounded-2xl font-black text-sm shadow-md transition-all transform active:scale-95 flex items-center gap-2"
            >
              <span>{currentQIndex + 1 < level.questions.length ? "السؤال التالي" : "عرض النتيجة"}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
