import type { Prescription } from "@/lib/program";

export interface ExerciseRow {
  id: number;
  name: string;
  youtube_id: string;
  level: number;
  category: string;
}

export interface TodayData {
  week: number;
  dayIndex: number;
  dayTitle: string;
  rx: Prescription;
  exercises: ExerciseRow[];
  // exercise id -> set_number -> {weight, reps}
  logs: Record<number, Record<number, { weight: number; reps: number }>>;
}
