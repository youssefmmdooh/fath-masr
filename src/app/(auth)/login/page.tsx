"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { useAuth } from "@/context/auth-context";
import { Eye, EyeOff, LogIn, Sparkles, User, ShieldCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/play";
  const { signIn } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    const res = await signIn(data.identifier, data.password);
    if (res.error) {
      setServerError(res.error);
    } else {
      router.push(redirectPath);
    }
  };

  const setQuickDemo = (type: "student" | "teacher") => {
    if (type === "student") {
      setValue("identifier", "طالب_مميز");
      setValue("password", "student123");
    } else {
      setValue("identifier", "المعلم_أحمد");
      setValue("password", "teacher123");
    }
  };

  return (
    <div className="max-w-md w-full bg-white border-4 border-amber-500 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
      {/* Top decorative badge */}
      <div className="absolute top-0 right-0 left-0 h-3 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-600 mb-4 shadow-inner">
          <LogIn className="w-8 h-8 text-amber-700" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-amber-950">
          تسجيل الدخول
        </h1>
        <p className="text-sm font-semibold text-stone-600 mt-2">
          ادخل بحسابك لاستكمال مسيرتك وجمع النقاط والشارات ⚔️
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-3.5 bg-red-50 border-2 border-red-300 rounded-2xl text-red-700 text-sm font-bold text-center">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-black text-amber-950 mb-1.5">
            اسم المستخدم أو البريد
          </label>
          <input
            type="text"
            {...register("identifier")}
            placeholder="مثال: ahmed أو ahmed@school.edu"
            className={`w-full px-4 py-3 rounded-2xl border-2 bg-stone-50 font-bold text-stone-900 focus:bg-white focus:outline-none transition-all ${
              errors.identifier
                ? "border-red-500 focus:border-red-600"
                : "border-stone-300 focus:border-amber-600"
            }`}
          />
          {errors.identifier && (
            <p className="text-xs font-bold text-red-600 mt-1">
              {errors.identifier.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-black text-amber-950 mb-1.5">
            كلمة المرور
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-2xl border-2 bg-stone-50 font-bold text-stone-900 focus:bg-white focus:outline-none transition-all pl-12 ${
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-2xl font-black text-base shadow-lg hover:shadow-xl transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span className="inline-block animate-spin">⏳</span>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>انطلق للعبة!</span>
            </>
          )}
        </button>
      </form>

      {/* Demo one-click shortcuts */}
      <div className="mt-6 pt-6 border-t-2 border-stone-200">
        <p className="text-xs font-bold text-stone-500 text-center mb-3">
          أو جرّب مباشرة بنقرة واحدة (حسابات تجريبية):
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setQuickDemo("student")}
            className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-900 text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
          >
            <User className="w-4 h-4 text-amber-600" />
            <span>دخول كطالب 👦</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickDemo("teacher")}
            className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-300 text-indigo-900 text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>دخول كمعلم 👨‍🏫</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs font-bold text-stone-600">
          ليس لديك حساب بعد؟{" "}
          <Link
            href="/register"
            className="text-amber-700 hover:text-amber-800 underline font-black"
          >
            أنشئ حسابك الجديد الآن مجاناً 🚀
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center font-bold text-amber-900">جاري التحميل...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
