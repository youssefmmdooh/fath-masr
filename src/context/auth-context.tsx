"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Role } from "@/lib/supabase/types";

interface AuthContextType {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (identifier: string, pass: string) => Promise<{ error: string | null }>;
  signUp: (data: {
    displayName: string;
    username: string;
    role: Role;
    password: string;
  }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileName: (newName: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = "egypt_conquest_current_user";
const USERS_STORE_KEY = "egypt_conquest_all_users";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();
  const isSupabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder-project");

  const loadProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProfile(parsed);
          setUser({ id: parsed.id, email: `${parsed.username}@school.edu` });
        } catch {
          // ignore
        }
      }
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data && !error) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConfigured, supabase]);

  useEffect(() => {
    async function initAuth() {
      if (!isSupabaseConfigured) {
        const stored = localStorage.getItem(CURRENT_USER_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setUser({ id: parsed.id, email: `${parsed.username}@school.edu` });
            setProfile(parsed);
          } catch {
            // ignore
          }
        }
        setIsLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        await loadProfile(session.user.id);
      } else {
        setIsLoading(false);
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (newSession?.user) {
          setUser({ id: newSession.user.id, email: newSession.user.email });
          await loadProfile(newSession.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    initAuth();
  }, [isSupabaseConfigured, loadProfile, supabase]);

  const signIn = async (identifier: string, pass: string) => {
    setIsLoading(true);
    if (!isSupabaseConfigured) {
      // Local Demo Auth
      const usersRaw = localStorage.getItem(USERS_STORE_KEY);
      const usersMap = usersRaw ? JSON.parse(usersRaw) : {};
      const cleanId = identifier.trim().toLowerCase();

      let targetUser = usersMap[cleanId];
      if (!targetUser) {
        // Auto-create local user on the fly so login never fails for demo!
        const isTeacher =
          cleanId.includes("teacher") || cleanId.includes("معلم") || identifier.includes("معلم");
        targetUser = {
          id: "demo-" + Math.random().toString(36).substring(2, 9),
          display_name: isTeacher ? "الأستاذ " + identifier : identifier,
          username: cleanId.replace(/\s+/g, "_"),
          role: isTeacher ? "teacher" : "student",
          total_score: 150,
          current_level: 2,
          badges: ["مستكشف التاريخ 🛡️"],
          last_played_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        usersMap[cleanId] = targetUser;
        localStorage.setItem(USERS_STORE_KEY, JSON.stringify(usersMap));
      }

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(targetUser));
      setUser({ id: targetUser.id, email: `${targetUser.username}@school.edu` });
      setProfile(targetUser);
      setIsLoading(false);
      return { error: null };
    }

    const email = identifier.includes("@")
      ? identifier
      : `${identifier.toLowerCase().trim()}@school.local`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      setIsLoading(false);
      return { error: "اسم المستخدم أو كلمة المرور غير صحيحة، يرجى المحاولة ثانية" };
    }

    if (data.user) {
      await loadProfile(data.user.id);
    }
    setIsLoading(false);
    return { error: null };
  };

  const signUp = async (data: {
    displayName: string;
    username: string;
    role: Role;
    password: string;
  }) => {
    setIsLoading(true);
    const cleanUsername = data.username.toLowerCase().trim();

    if (!isSupabaseConfigured) {
      const usersRaw = localStorage.getItem(USERS_STORE_KEY);
      const usersMap = usersRaw ? JSON.parse(usersRaw) : {};

      const newLocalProfile: Profile = {
        id: "demo-" + Date.now(),
        display_name: data.displayName,
        username: cleanUsername,
        role: data.role,
        total_score: 0,
        current_level: 1,
        badges: [],
        last_played_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      usersMap[cleanUsername] = newLocalProfile;
      localStorage.setItem(USERS_STORE_KEY, JSON.stringify(usersMap));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newLocalProfile));

      setUser({ id: newLocalProfile.id, email: `${cleanUsername}@school.edu` });
      setProfile(newLocalProfile);
      setIsLoading(false);
      return { error: null };
    }

    const email = `${cleanUsername}@school.local`;
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        data: {
          display_name: data.displayName,
          username: cleanUsername,
          role: data.role,
        },
      },
    });

    if (error) {
      setIsLoading(false);
      return { error: error.message };
    }

    if (authData.user) {
      if (!authData.session) {
        await supabase.auth.signInWithPassword({
          email,
          password: data.password,
        });
      }
      await new Promise((r) => setTimeout(r, 600));
      await loadProfile(authData.user.id);
    }

    setIsLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
      return;
    }
    if (user) {
      await loadProfile(user.id);
    }
  };

  const updateProfileName = async (newName: string) => {
    if (!profile) return { error: "غير مسجل دخول" };
    if (!isSupabaseConfigured) {
      const updated = { ...profile, display_name: newName };
      setProfile(updated);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
      return { error: null };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: newName })
      .eq("id", profile.id);

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, display_name: newName } : null));
      return { error: null };
    }
    return { error: "فشل تحديث الاسم في قاعدة البيانات" };
  };

  const updatePassword = async (newPassword: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      return { error: "فشل تغيير كلمة المرور: " + error.message };
    }
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        updateProfileName,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
