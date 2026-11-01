"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { useAuth } from "@/context/auth-context";
import { Eye, EyeOff, UserPlus, Sparkles, GraduationCap, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      username: "",
      role: "student",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    const res = await signUp({
      displayName: data.displayName,
      username: data.username,
      role: data.role,
      password: data.password,
    });

    if (res.error) {
      setServerError(res.error);
    } else {
      if (data.role === "teacher") {
        window.location.href = "/teacher";
      } else {
        window.location.href = "/play";
      }
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border-4 border-amber-500 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-3 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-600 mb-3 shadow-inner">
            <UserPlus className="w-8 h-8 text-amber-700" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-amber-950">
            إنشاء حساب جديد
          </h1>
          <p className="text-sm font-semibold text-stone-600 mt-1">
            انضم الآن إلى رحلة الفاتحين ونافس أصدقاءك في لوحة الصدارة 🏆
          </p>
        </div>

        {serverError && (
          <div className="mb-5 p-3.5 bg-red-50 border-2 border-red-300 rounded-2xl text-red-700 text-sm font-bold text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-black text-amber-950 mb-1.5">
              نوع الحساب
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("role", "student")}
                className={`py-2.5 px-3 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-2 transition-all ${
                  selectedRole === "student"
                    ? "bg-amber-100 border-amber-600 text-amber-950 shadow-md scale-102"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                <User className="w-4 h-4 text-amber-600" />
                <span>طالب (العب وتعلّم)</span>
              </button>
              <button
                type="button"
                onClick={() => setValue("role", "teacher")}
                className={`py-2.5 px-3 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-2 transition-all ${
                  selectedRole === "teacher"
                    ? "bg-indigo-100 border-indigo-600 text-indigo-950 shadow-md scale-102"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>معلم (لوحة متابعة)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-amber-950 mb-1">
              الاسم الظاهر
            </label>
            <input
              type="text"
              {...register("displayName")}
              placeholder="مثال: يوسف ممدوح"
              className={`w-full px-4 py-2.5 rounded-2xl border-2 bg-stone-50 font-bold text-stone-900 focus:bg-white focus:outline-none transition-all ${
                errors.displayName
                  ? "border-red-500 focus:border-red-600"
                  : "border-stone-300 focus:border-amber-600"
              }`}
            />
            {errors.displayName && (
              <p className="text-xs font-bold text-red-600 mt-1">
                {errors.displayName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-black text-amber-950 mb-1">
              اسم المستخدم (بالإنجليزية)
            </label>
            <input
              type="text"
              {...register("username")}
              placeholder="مثال: youssef_m"
              className={`w-full px-4 py-2.5 rounded-2xl border-2 bg-stone-50 font-bold text-stone-900 focus:bg-white focus:outline-none transition-all ${
                errors.username
                  ? "border-red-500 focus:border-red-600"
                  : "border-stone-300 focus:border-amber-600"
              }`}
            />
            {errors.username && (
              <p className="text-xs font-bold text-red-600 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-black text-amber-950 mb-1">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-2xl border-2 bg-stone-50 font-bold text-stone-900 focus:bg-white focus:outline-none transition-all pl-12 ${
                  errors.password
                    ? "border-red-500 focus:border-red-600"
                    : "border-stone-300 focus:border-amber-600"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-bold text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-black text-amber-950 mb-1">
              تأكيد كلمة المرور
            </label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 rounded-2xl border-2 bg-stone-50 font-bold text-stone-900 focus:bg-white focus:outline-none transition-all ${
                errors.confirmPassword
                  ? "border-red-500 focus:border-red-600"
                  : "border-stone-300 focus:border-amber-600"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-xs font-bold text-red-600 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-2xl font-black text-base shadow-lg hover:shadow-xl transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>تسجيل وبدء المغامرة</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-xs font-bold text-stone-600">
            لديك حساب بالفعل؟{" "}
            <Link
              href="/login"
              className="text-amber-700 hover:text-amber-800 underline font-black"
            >
              سجّل دخولك من هنا 🔑
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
