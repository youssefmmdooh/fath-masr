"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/lib/supabase/client";
import { LESSON_LEVELS } from "@/data/lesson-data";
import type { Profile, QuestionAnalytics } from "@/lib/supabase/types";
import {
  GraduationCap,
  Users,
  AlertTriangle,
  Award,
  Sparkles,
  Search,
  BookOpen,
  CheckCircle2,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

interface TeacherAnalyticsData {
  students: Profile[];
  analytics: QuestionAnalytics[];
}

export default function TeacherDashboardPage() {
  const { profile } = useAuth();
  const [data, setData] = useState<TeacherAnalyticsData>({
    students: [],
    analytics: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project");

  useEffect(() => {
    async function fetchTeacherData() {
      if (isSupabaseConfigured) {
        try {
          // Fetch all students
          const { data: studentsData } = await supabase
            .from("profiles")
            .select("*")
            .eq("role", "student")
            .order("total_score", { ascending: false });

          // Fetch question analytics
          const { data: analyticsData } = await supabase
            .from("question_analytics")
            .select("*")
            .order("wrong_count", { ascending: false });

          setData({
            students: (studentsData as Profile[]) || [],
            analytics: (analyticsData as QuestionAnalytics[]) || [],
          });
        } catch {
          // fallback
        }
      } else {
        // Local mode sample data
        const localAnalytics = localStorage.getItem("analytics_questions");
        let parsedAnalytics: QuestionAnalytics[] = [];
        if (localAnalytics) {
          try {
            parsedAnalytics = Object.values(JSON.parse(localAnalytics));
          } catch {
            // ignore
          }
        }

        if (parsedAnalytics.length === 0) {
          // Mock some realistic class questions analytics
          parsedAnalytics = [
            {
              id: "1",
              question_id: "q3_2",
              level_id: "level-3",
              question_title: "المعركة الفاصلة التي انتصر فيها المسلمون قبل حصن بابليون",
              wrong_count: 8,
              total_attempts: 25,
            },
            {
              id: "2",
              question_id: "q2_4",
              level_id: "level-2",
              question_title: "ترتيب خط سير الجيش (العريش ← الفرما ← بلبيس ← بابليون)",
              wrong_count: 6,
              total_attempts: 24,
            },
            {
              id: "3",
              question_id: "q1_3",
              level_id: "level-1",
              question_title: "كان الرومان يضطهدون الأقباط في دينهم بسبب اختلاف المذهب",
              wrong_count: 4,
              total_attempts: 27,
            },
          ];
        }

        const sampleStudents: Profile[] = [
          {
            id: "s1",
            display_name: "عمر الفاروق",
            username: "omar_f",
            role: "student",
            total_score: 980,
            current_level: 5,
            badges: ["مستكشف التاريخ 🛡️", "فارس الفتح 🐎", "قاهر الحصون 🏰", "باني الفسطاط 🕊️"],
            last_played_at: new Date(Date.now() - 3600000).toISOString(),
            created_at: new Date().toISOString(),
          },
          {
            id: "s2",
            display_name: "مريم خالد",
            username: "mariam_kh",
            role: "student",
            total_score: 920,
            current_level: 5,
            badges: ["مستكشف التاريخ 🛡️", "فارس الفتح 🐎", "قاهر الحصون 🏰"],
            last_played_at: new Date(Date.now() - 7200000).toISOString(),
            created_at: new Date().toISOString(),
          },
          {
            id: "s3",
            display_name: "يوسف ممدوح",
            username: "youssef_m",
            role: "student",
            total_score: 870,
            current_level: 4,
            badges: ["مستكشف التاريخ 🛡️", "فارس الفتح 🐎"],
            last_played_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
          {
            id: "s4",
            display_name: "فاطمة الزهراء",
            username: "fatima_z",
            role: "student",
            total_score: 810,
            current_level: 4,
            badges: ["مستكشف التاريخ 🛡️", "فارس الفتح 🐎"],
            last_played_at: new Date(Date.now() - 14400000).toISOString(),
            created_at: new Date().toISOString(),
          },
          {
            id: "s5",
            display_name: "عبد الرحمن حسن",
            username: "abdo_h",
            role: "student",
            total_score: 750,
            current_level: 3,
            badges: ["مستكشف التاريخ 🛡️"],
            last_played_at: new Date(Date.now() - 28800000).toISOString(),
            created_at: new Date().toISOString(),
          },
        ];

        setData({
          students: sampleStudents,
          analytics: parsedAnalytics.sort((a, b) => b.wrong_count - a.wrong_count),
        });
      }
      setLoading(false);
    }

    fetchTeacherData();
  }, [isSupabaseConfigured, supabase]);

  const filteredStudents = data.students.filter(
    (s) =>
      s.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStudents = data.students.length;
  const avgScore =
    totalStudents > 0
      ? Math.round(data.students.reduce((acc, s) => acc + s.total_score, 0) / totalStudents)
      : 0;
  const topQuestion = data.analytics[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-4 border-indigo-400 relative overflow-hidden mb-8">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-right">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-950/80 text-indigo-200 px-3.5 py-1 rounded-full text-xs font-black mb-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>لوحة التحكم التربوية للمعلم</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              متابعة أداء وتفاعل الطلاب • درس فتح مصر
            </h1>
            <p className="text-indigo-200 text-xs sm:text-sm font-semibold mt-1">
              تحليل فوري لمستوى تقدم الفصل وتحديد المفاهيم الأكثر صعوبة لتقديم الدعم العلاجي.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center shrink-0">
            <span className="text-xs text-indigo-200 font-bold">المعلم المسجل:</span>
            <div className="text-base font-black text-white">{profile?.display_name || "الأستاذ"}</div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border-4 border-amber-300 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-stone-500">إجمالي الطلاب</span>
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-950 mt-2">{totalStudents}</div>
          <p className="text-xs font-semibold text-stone-500 mt-1">طالب مسجل بالمنصة</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border-4 border-amber-300 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-stone-500">متوسط درجات الطلاب</span>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-black text-amber-950 mt-2">{avgScore}</div>
          <p className="text-xs font-semibold text-stone-500 mt-1">نقطة في المتوسط</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border-4 border-red-300 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-red-600">أكثر الأسئلة صعوبة</span>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-base font-black text-stone-900 mt-2 truncate">
            {topQuestion ? topQuestion.question_title : "لا توجد أخطاء مرصودة"}
          </div>
          <p className="text-xs font-semibold text-red-600 mt-1">
            {topQuestion ? `${topQuestion.wrong_count} إجابة غير دقيقة` : "كل الطلاب أحسنوا الإجابة"}
          </p>
        </div>
      </div>

      {/* Section 1: Most Missed Questions (أكثر الأسئلة التي يخطئ فيها الطلاب) */}
      <div className="bg-white rounded-3xl p-6 border-4 border-red-200 shadow-md mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-black text-stone-900">
            تحليل الأسئلة ونقاط الضعف الصفية (المفاهيم التي تحتاج تركيزاً)
          </h2>
        </div>
        <p className="text-xs font-semibold text-stone-600 mb-4">
          يتم رصد أخطاء الطلاب تلقائياً أثناء اللعب لمساعدتك في معالجة المفاهيم والتواريخ الأكثر التباساً:
        </p>

        <div className="space-y-3">
          {data.analytics.length === 0 ? (
            <p className="text-center py-6 text-stone-500 font-bold text-sm">
              لم يتم تسجيل أخطاء حتى الآن، استمر في تشجيع الطلاب على اللعب!
            </p>
          ) : (
            data.analytics.slice(0, 5).map((item, idx) => {
              const wrongRate =
                item.total_attempts > 0
                  ? Math.round((item.wrong_count / item.total_attempts) * 100)
                  : 0;

              return (
                <div
                  key={item.question_id || idx}
                  className="p-4 rounded-2xl border-2 border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-red-100 text-red-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="font-black text-sm text-stone-900 leading-snug">
                        {item.question_title}
                      </h3>
                      <span className="text-[11px] font-bold text-stone-500">
                        {item.level_id === "level-1" && "المحطة 1: مصر قبل الفتح"}
                        {item.level_id === "level-2" && "المحطة 2: بداية الفتح"}
                        {item.level_id === "level-3" && "المحطة 3: عين شمس والإسكندرية"}
                        {item.level_id === "level-4" && "المحطة 4: نتائج الفتح"}
                        {item.level_id === "level-5" && "المحطة 5: التحدي الشامل"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <div className="text-left">
                      <div className="text-xs font-black text-red-700">
                        {item.wrong_count} خطأ ({wrongRate}%)
                      </div>
                      <div className="text-[10px] font-bold text-stone-500">
                        من {item.total_attempts} محاولة
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Section 2: Student Roster & Scores Table */}
      <div className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-black text-amber-950">سجل الطلاب ونتايجهم</h2>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الطالب أو المعرف..."
              className="w-full px-4 py-2 pr-9 rounded-xl border-2 border-stone-300 bg-stone-50 font-bold text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b-2 border-amber-200 text-stone-600 font-black text-xs bg-amber-50/60">
                <th className="py-3 px-4">اسم الطالب</th>
                <th className="py-3 px-4">اسم المستخدم</th>
                <th className="py-3 px-4">المرحلة المنجزة</th>
                <th className="py-3 px-4">الأوسمة</th>
                <th className="py-3 px-4">مجموع النقاط</th>
                <th className="py-3 px-4">آخر نشاط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-semibold text-stone-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500 font-bold">
                    لا يوجد طلاب يطابقون البحث.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-black text-stone-900">
                      {std.display_name}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-stone-500">
                      @{std.username}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-full font-black">
                        المحطة {std.current_level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-bold text-stone-700">
                        {std.badges?.length || 0} وسام
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-amber-900">
                      {std.total_score} نقطة
                    </td>
                    <td className="py-3.5 px-4 text-xs text-stone-400">
                      {std.last_played_at
                        ? new Date(std.last_played_at).toLocaleDateString("ar-EG")
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
