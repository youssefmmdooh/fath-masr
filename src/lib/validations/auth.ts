import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "يرجى إدخال اسم المستخدم أو البريد الإلكتروني")
    .min(3, "يجب أن يتكون اسم المستخدم من 3 أحرف على الأقل"),
  password: z
    .string()
    .min(1, "يرجى إدخال كلمة المرور")
    .min(6, "كلمة المرور يجب ألا تقل عن 6 خانات"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .min(1, "يرجى إدخال الاسم الظاهر")
      .min(3, "الاسم الظاهر يجب أن يكون 3 أحرف على الأقل")
      .max(40, "الاسم طويل جداً"),
    username: z
      .string()
      .min(1, "يرجى إدخال اسم المستخدم")
      .min(3, "اسم المستخدم يجب أن يكون 3 أحرف بالإنجليزية أو أرقام")
      .regex(/^[a-zA-Z0-9_]+$/, "اسم المستخدم يحتوي على حروف إنجليزية وأرقام وعلامة _ فقط"),
    role: z.enum(["student", "teacher"]),
    password: z
      .string()
      .min(1, "يرجى كتابة كلمة المرور")
      .min(6, "كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل"),
    confirmPassword: z.string().min(1, "يرجى تأكيد كلمة المرور"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .min(3, "الاسم يجب أن يكون 3 أحرف على الأقل")
    .max(40, "الاسم طويل جداً"),
  newPassword: z
    .string()
    .min(6, "كلمة المرور الجديدة يجب أن تكون 6 خانات على الأقل")
    .optional()
    .or(z.literal("")),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
