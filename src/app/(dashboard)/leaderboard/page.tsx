"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import { Trophy, Medal, Sparkles, Award, User, Flame, ArrowUp } from "lucide-react";
import Link from "next/link";

interface LeaderboardEntry {
  id: string;
  display_name: string;
  username: string;
  total_score: number;
  current_level: number;
  badges: string[];
  rank?: number;
}

const DEFAULT_DEMO_LEADERS: LeaderboardEntry[] = [
  {
    id: "lead-1",
    display_name: "عمر الفاروق",
    username: "omar_f",
    total_score: 980,
    current_level: 5,
    badges: ["مستكشف التاريخ 🛡️", "فارس الفتح 🐎", "قاهر الحصون 🏰", "باني الفسطاط 🕊️"],
  },
  {
    id: "lead-2",
    display_name: "مريم خالد",
    username: "mariam_kh",
    total_score: 920,
    current_level: 5,
    badges: ["مستكشف التاريخ 🛡️", "فارس الفتح 🐎", "قاهر الحصون 🏰"],
  },
  {
    id: "lead-3",
    display_name: "يوسف ممدوح",
    username: "youssef_m",
    total_score: 870,
    current_level: 4,
    badges: ["مستكشف التاريخ 🛡️", "فارس الفتح 🐎"],
  },
  {
    id: "lead-4",
    display_name: "فاطمة الزهراء",
    username: "fatima_z",
    total_score: 810,
    current_level: 4,
    badges: ["مستكشف التاريخ 🛡️", "فارس الفتح 🐎"],
  },
  {
    id: "lead-5",
    display_name: "عبد الرحمن حسن",
    username: "abdo_h",
    total_score: 750,
    current_level: 3,
    badges: ["مستكشف التاريخ 🛡️"],
  },
  {
    id: "lead-6",
    display_name: "سارة إبراهيم",
    username: "sara_ib",
    total_score: 690,
    current_level: 3,
    badges: ["مستكشف التاريخ 🛡️"],
  },
  {
    id: "lead-7",
    display_name: "علي طارق",
    username: "ali_t",
    total_score: 640,
    current_level: 3,
    badges: ["مستكشف التاريخ 🛡️"],
  },
  {
    id: "lead-8",
    display_name: "نور الدين سامي",
    username: "nour_s",
    total_score: 580,
    current_level: 2,
    badges: ["مستكشف التاريخ 🛡️"],
  },
  {
    id: "lead-9",
    display_name: "خديجة أحمد",
    username: "khadija_a",
    total_score: 520,
    current_level: 2,
    badges: ["مستكشف التاريخ 🛡️"],
  },
  {
    id: "lead-10",
    display_name: "حمزة محمود",
    username: "hamza_m",
    total_score: 460,
    current_level: 2,
    badges: ["مستكشف التاريخ 🛡️"],
  },
];

export default function LeaderboardPage() {
  const { profile } = useAuth();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project");

  useEffect(() => {
    async function fetchLeaderboard() {
      if (isSupabaseConfigured) {
        try {
          // Fetch top students
          const { data, error } = await supabase
            .from("profiles")
            .select("id, display_name, username, total_score, current_level, badges")
            .eq("role", "student")
            .order("total_score", { ascending: false })
            .limit(10);

          if (data && data.length > 0) {
            setLeaders(data as LeaderboardEntry[]);
          } else {
            setLeaders(DEFAULT_DEMO_LEADERS);
          }

          // Compute user rank if logged in as student
          if (profile && profile.role === "student") {
            const { count } = await supabase
              .from("profiles")
              .select("id", { count: "exact", head: true })
              .eq("role", "student")
              .gt("total_score", profile.total_score || 0);

            setCurrentUserRank((count ?? 0) + 1);
          }
        } catch {
          setLeaders(DEFAULT_DEMO_LEADERS);
        }
      } else {
        // Local mode
        let list = [...DEFAULT_DEMO_LEADERS];
        if (profile && profile.role === "student") {
          const existingIdx = list.findIndex((x) => x.id === profile.id || x.username === profile.username);
          if (existingIdx !== -1) {
            list[existingIdx] = {
              ...list[existingIdx],
              display_name: profile.display_name,
              total_score: profile.total_score,
              badges: profile.badges,
              current_level: profile.current_level,
            };
          } else {
            list.push({
              id: profile.id,
              display_name: profile.display_name,
              username: profile.username,
              total_score: profile.total_score,
              current_level: profile.current_level,
              badges: profile.badges,
            });
          }
        }
        list.sort((a, b) => b.total_score - a.total_score);

        if (profile) {
          const userIdx = list.findIndex((x) => x.id === profile.id || x.username === profile.username);
          setCurrentUserRank(userIdx !== -1 ? userIdx + 1 : 1);
        }
        setLeaders(list.slice(0, 10));
      }
      setLoading(false);
    }

    fetchLeaderboard();
  }, [profile, isSupabaseConfigured, supabase]);

  const isUserInTop10 = profile && leaders.some((l) => l.id === profile.id || l.username === profile.username);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-4 border-yellow-300 relative overflow-hidden mb-8 text-center sm:text-right">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-950/60 text-yellow-300 px-3.5 py-1 rounded-full text-xs font-black mb-2">
              <Trophy className="w-4 h-4" />
              <span>لوحة الشرف والتفوق لفرسان الفتح</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black">
              أفضل 10 طلاب في درس فتح مصر 🏆
            </h1>
            <p className="text-amber-100 font-semibold text-xs sm:text-sm mt-1">
              يتم تصنيف الطلاب حسب مجموع النقاط وسرعة ودقة إنجاز محطات الدرس.
            </p>
          </div>

          <Link
            href="/play"
            className="px-6 py-3 bg-amber-950 hover:bg-stone-900 text-amber-100 rounded-2xl font-black text-sm shadow-md transition-transform active:scale-95 shrink-0"
          >
            العب الآن واجمع النقاط ⚔️
          </Link>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border-4 border-amber-300 shadow-xl overflow-hidden mb-8">
        <div className="space-y-3">
          {leaders.map((student, index) => {
            const rank = index + 1;
            const isMe = profile && (student.id === profile.id || student.username === profile.username);

            let rankBadge = (
              <span className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 font-black text-sm flex items-center justify-center">
                #{rank}
              </span>
            );

            if (rank === 1) {
              rankBadge = (
                <span className="w-10 h-10 rounded-2xl bg-yellow-400 text-yellow-950 font-black text-lg flex items-center justify-center shadow-md">
                  🥇
                </span>
              );
            } else if (rank === 2) {
              rankBadge = (
                <span className="w-10 h-10 rounded-2xl bg-stone-300 text-stone-800 font-black text-lg flex items-center justify-center shadow-md">
                  🥈
                </span>
              );
            } else if (rank === 3) {
              rankBadge = (
                <span className="w-10 h-10 rounded-2xl bg-amber-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  🥉
                </span>
              );
            }

            return (
              <div
                key={student.id || student.username}
                className={`flex items-center justify-between gap-3 p-4 rounded-2xl border-2 transition-all ${
                  isMe
                    ? "bg-amber-100 border-amber-500 shadow-md ring-2 ring-amber-400"
                    : rank <= 3
                    ? "bg-amber-50/70 border-amber-200"
                    : "bg-stone-50 border-stone-200"
                }`}
              >
                {/* Rank & Student Info */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="shrink-0">{rankBadge}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm sm:text-base text-stone-900 truncate">
                        {student.display_name}
                      </h3>
                      {isMe && (
                        <span className="text-[10px] bg-amber-600 text-white font-black px-2 py-0.5 rounded-full shrink-0">
                          أنت 🌟
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-500 font-semibold mt-0.5">
                      <span>@{student.username}</span>
                      <span>•</span>
                      <span>المحطة {student.current_level}</span>
                      <span>•</span>
                      <span>{student.badges?.length || 0} أوسمة</span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-left shrink-0">
                  <div className="flex items-center gap-1.5 font-black text-base sm:text-lg text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
                    <span>{student.total_score}</span>
                  </div>
                  <span className="text-[11px] font-bold text-stone-500">نقطة</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pinned Current User Card if NOT in Top 10 */}
      {profile && profile.role === "student" && !isUserInTop10 && (
        <div className="bg-gradient-to-r from-amber-900 to-stone-900 text-white rounded-3xl p-5 border-4 border-amber-500 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center font-black text-lg">
              #{currentUserRank || "—"}
            </div>
            <div>
              <div className="text-xs text-amber-300 font-bold">ترتيبك الحالي بين المتنافسين:</div>
              <div className="text-lg font-black">{profile.display_name} (أنت)</div>
              <div className="text-xs text-stone-400 font-semibold">
                لديك {profile.total_score} نقطة • استمر في خوض التحديات للوصول إلى العشرة الأوائل!
              </div>
            </div>
          </div>

          <Link
            href="/play"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs rounded-xl shadow-md transition-colors shrink-0"
          >
            تقدّم للمرحلة التالية ⏩
          </Link>
        </div>
      )}
    </div>
  );
}
