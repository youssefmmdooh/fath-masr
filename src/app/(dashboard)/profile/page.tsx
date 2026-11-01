"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema, type ProfileUpdateFormData } from "@/lib/validations/auth";
import {
  User,
  Shield,
  Sparkles,
  Trophy,
  Award,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Compass,
} from "lucide-react";
import { LESSON_LEVELS } from "@/data/lesson-data";

export default function ProfilePage() {
  const { profile, updateProfileName, updatePassword } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    values: {
      displayName: profile?.display_name || "",
      newPassword: "",
    },
  });

  const onSubmit = async (data: ProfileUpdateFormData) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    let hadUpdate = false;

    if (data.displayName && data.displayName !== profile?.display_name) {
      const res = await updateProfileName(data.displayName);
      if (res.error) {
        setErrorMessage(res.error);
        return;
      }
      hadUpdate = true;
    }

    if (data.newPassword && data.newPassword.trim().length >= 6) {
      const res = await updatePassword(data.newPassword);
      if (res.error) {
        setErrorMessage(res.error);
        return;
      }
      hadUpdate = true;
    }

    if (hadUpdate) {
      setSuccessMessage("تم حفظ تعديلات حسابك بنجاح! 🎉");
    } else {
      setSuccessMessage("لم يتم إجراء أي تغييرات جديدة.");
    }
  };

  const earnedBadges = profile?.badges || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-8 border-4 border-amber-400">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-right">
          <div className="w-24 h-24 rounded-3xl bg-amber-100 border-4 border-amber-300 flex items-center justify-center text-amber-900 shadow-xl shrink-0">
            <User className="w-12 h-12 text-amber-800" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black">{profile?.display_name || "البطل"}</h1>
              <span className="text-xs bg-amber-950/60 border border-amber-300/40 px-3 py-1 rounded-full font-bold">
                {profile?.role === "teacher" ? "👨‍🏫 حساب معلم" : "👦 حساب طالب"}
              </span>
            </div>
            <p className="text-amber-100 text-sm font-semibold">
              اسم المستخدم: @{profile?.username}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/30 text-sm font-black">
                <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span>{profile?.total_score || 0} نقطة</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/30 text-sm font-black">
                <Compass className="w-4 h-4 text-amber-200" />
                <span>المرحلة الحالية: {profile?.current_level || 1} من {LESSON_LEVELS.length}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/30 text-sm font-black">
                <Award className="w-4 h-4 text-yellow-300" />
                <span>{earnedBadges.length} أوسمة مكتسبة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Badges Section */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-black text-amber-950">سجل الأوسمة والشارات التاريخية</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LESSON_LEVELS.map((lvl) => {
              const isEarned = earnedBadges.includes(lvl.badgeName);
              return (
                <div
                  key={lvl.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 ${
                    isEarned
                      ? "bg-amber-50 border-amber-500 shadow-sm"
                      : "bg-stone-50 border-stone-200 opacity-60"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 text-xl ${
                      isEarned
                        ? "bg-amber-200 border-amber-600 text-amber-950"
                        : "bg-stone-200 border-stone-300 text-stone-400"
                    }`}
                  >
                    {isEarned ? "🎖️" : "🔒"}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-stone-900 flex items-center gap-1.5">
                      <span>{lvl.badgeName}</span>
                      {isEarned && (
                        <span className="text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded">
                          مكتمل
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 font-semibold leading-relaxed">
                      {lvl.badgeDescription}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <KeyRound className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-black text-amber-950">تعديل بيانات الحساب</h2>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border-2 border-green-300 rounded-2xl text-green-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-2xl text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-stone-700 mb-1">
                الاسم الظاهر
              </label>
              <input
                type="text"
                {...register("displayName")}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 focus:border-amber-600 bg-stone-50 font-bold text-sm text-stone-900 focus:outline-none"
              />
              {errors.displayName && (
                <p className="text-xs font-bold text-red-600 mt-1">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-stone-700 mb-1">
                كلمة المرور الجديدة (اختياري)
              </label>
              <input
                type="password"
                {...register("newPassword")}
                placeholder="اتركه فارغاً إن لم ترغب بتغييره"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 focus:border-amber-600 bg-stone-50 font-bold text-sm text-stone-900 focus:outline-none"
              />
              {errors.newPassword && (
                <p className="text-xs font-bold text-red-600 mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-sm shadow-md transition-transform active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات 💾"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
