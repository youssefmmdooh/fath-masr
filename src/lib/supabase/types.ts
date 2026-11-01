export type Role = "student" | "teacher";

export interface Profile {
  id: string;
  display_name: string;
  username: string;
  role: Role;
  total_score: number;
  current_level: number;
  badges: string[];
  last_played_at: string | null;
  created_at: string;
}

export interface StudentProgress {
  id: string;
  user_id: string;
  level_id: string;
  score: number;
  stars: number;
  completed: boolean;
  time_seconds: number;
  updated_at: string;
}

export interface QuestionAnalytics {
  id: string;
  question_id: string;
  level_id: string;
  question_title: string;
  wrong_count: number;
  total_attempts: number;
}
