-- ==============================================================================
-- مشروع التلعيب التعليمي: «رحلة الفاتحين - فتح مصر»
-- ملف إنشاء جداول وقواعد أمان Supabase (SQL Schema & RLS)
-- ==============================================================================

-- 1. جدول الملفات الشخصية (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
    total_score INTEGER NOT NULL DEFAULT 0,
    current_level INTEGER NOT NULL DEFAULT 1,
    badges JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. جدول تقدم الطلاب في المراحل (Student Progress)
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    level_id TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    stars INTEGER NOT NULL DEFAULT 0 CHECK (stars >= 0 AND stars <= 3),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    time_seconds INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_level UNIQUE (user_id, level_id)
);

-- 3. جدول تحليلات الأسئلة لمعرفة نقاط الضعف (Question Analytics)
CREATE TABLE IF NOT EXISTS public.question_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id TEXT UNIQUE NOT NULL,
    level_id TEXT NOT NULL,
    question_title TEXT NOT NULL,
    wrong_count INTEGER NOT NULL DEFAULT 0,
    total_attempts INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- محفز تلقائي (Trigger) لإنشاء الملف الشخصي فور تسجيل المستخدم الجديد في Supabase Auth
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    raw_role TEXT;
    raw_name TEXT;
    raw_user_name TEXT;
BEGIN
    raw_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
    raw_name := COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1));
    raw_user_name := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));

    INSERT INTO public.profiles (id, display_name, username, role, total_score, current_level, badges)
    VALUES (
        new.id,
        raw_name,
        raw_user_name,
        raw_role,
        0,
        1,
        '[]'::jsonb
    )
    ON CONFLICT (id) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        username = EXCLUDED.username;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ربط التريجر بجدول auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- سياسات الأمان على مستوى الصفوف (Row Level Security - RLS)
-- ==============================================================================

-- تفعيل RLS على كل الجداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_analytics ENABLE ROW LEVEL SECURITY;

-- 1) سياسات جدول profiles
-- السماح لجميع الزوار والمستخدمين بقراءة بيانات الصدارة والملفات
CREATE POLICY "Profiles are viewable by public"
ON public.profiles FOR SELECT
TO public
USING (true);

-- السماح للمستخدم بتعديل بيانات ملفه الشخصي فقط
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2) سياسات جدول student_progress
-- الطالب يرى تقدمه فقط، بينما المعلم يستطيع قراءة تقدم جميع الطلاب
CREATE POLICY "Users and teachers can view progress"
ON public.student_progress FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'teacher'
    )
);

-- الطالب يستطيع إضافة أو تحديث تقدمه الخاص
CREATE POLICY "Students can upsert their own progress"
ON public.student_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own progress"
ON public.student_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3) سياسات جدول question_analytics
-- القراءة متاحة للجميع (أو للمعلمين)
CREATE POLICY "Analytics are viewable by authenticated users"
ON public.question_analytics FOR SELECT
TO authenticated
USING (true);

-- التحديث والإضافة متاحين للجميع لتسجيل الخطأ والصواب أثناء اللعب
CREATE POLICY "Anyone authenticated can update question analytics"
ON public.question_analytics FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Anyone authenticated can increment analytics"
ON public.question_analytics FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- دالة ذرية لتسجيل محاولة السؤال (سواء صح أو خطأ)
CREATE OR REPLACE FUNCTION public.record_question_attempt(
    p_question_id TEXT,
    p_level_id TEXT,
    p_question_title TEXT,
    p_is_wrong BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.question_analytics (question_id, level_id, question_title, total_attempts, wrong_count)
    VALUES (
        p_question_id,
        p_level_id,
        p_question_title,
        1,
        CASE WHEN p_is_wrong THEN 1 ELSE 0 END
    )
    ON CONFLICT (question_id) DO UPDATE
    SET total_attempts = public.question_analytics.total_attempts + 1,
        wrong_count = public.question_analytics.wrong_count + (CASE WHEN p_is_wrong THEN 1 ELSE 0 END),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
