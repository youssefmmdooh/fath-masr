"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Trophy,
  MapPin,
  User,
  GraduationCap,
  LogOut,
  Sparkles,
  Menu,
  X,
  Compass,
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isTeacher = profile?.role === "teacher";

  const navLinks = [
    { href: "/play", label: "خريطة الفتح", icon: MapPin },
    { href: "/leaderboard", label: "لوحة المتصدرين", icon: Trophy },
    ...(isTeacher ? [{ href: "/teacher", label: "لوحة المعلم", icon: GraduationCap }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-amber-500/90 backdrop-blur-md border-b-4 border-amber-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Platform Name */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-transform hover:scale-105"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-200 to-yellow-400 border-2 border-amber-700 flex items-center justify-center shadow-inner">
              <Compass className="w-7 h-7 text-amber-900 animate-spin-slow" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-amber-950 flex items-center gap-1.5 tracking-wide">
                <span>رحلة الفاتحين</span>
                <span className="text-xs bg-amber-800 text-amber-100 px-2 py-0.5 rounded-full font-bold">
                  فتح مصر
                </span>
              </div>
              <div className="text-[11px] font-semibold text-amber-900/80 -mt-1">
                الصف السادس الابتدائي • دراسات اجتماعية
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center gap-1.5 bg-amber-600/30 p-1.5 rounded-2xl border border-amber-400/40">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? "bg-amber-950 text-amber-100 shadow-md scale-102"
                        : "text-amber-950 hover:bg-amber-400/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Score & Profile Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && profile ? (
              <>
                {/* Score badge for students */}
                <div className="hidden sm:flex items-center gap-1.5 bg-amber-100 border-2 border-amber-600 px-3.5 py-1.5 rounded-full shadow-sm text-amber-900 font-black text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse" />
                  <span>{profile.total_score || 0}</span>
                  <span className="text-xs font-bold text-amber-700">نقطة</span>
                </div>

                {/* Profile link */}
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all ${
                    pathname === "/profile"
                      ? "bg-amber-950 text-amber-100 border-amber-950"
                      : "bg-white/80 hover:bg-white text-amber-950 border-amber-600"
                  }`}
                >
                  <User className="w-4 h-4 text-amber-700" />
                  <span className="text-sm font-bold max-w-[100px] sm:max-w-[130px] truncate">
                    {profile.display_name}
                  </span>
                  {profile.role === "teacher" && (
                    <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-black">
                      معلم
                    </span>
                  )}
                </Link>

                {/* Logout button */}
                <button
                  onClick={signOut}
                  title="تسجيل الخروج"
                  className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl font-black text-sm text-amber-950 hover:bg-amber-400/40 transition-colors"
                >
                  دخول
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl font-black text-sm bg-amber-950 text-amber-100 hover:bg-amber-900 shadow-md transition-transform hover:scale-105"
                >
                  حساب جديد 🚀
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-amber-400 text-amber-950 border border-amber-600"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {user && mobileMenuOpen && (
          <div className="md:hidden py-3 border-t-2 border-amber-600/30 flex flex-col gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-bold transition-colors ${
                    isActive
                      ? "bg-amber-950 text-amber-100"
                      : "text-amber-950 hover:bg-amber-400/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
