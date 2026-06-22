import type { ResolvedRx } from "@/lib/program";

export interface ExerciseRow {
  id: number;
  name: string;
  youtube_id: string;
  level: number;
  category: string;
}

export type WorkoutStyle = "hypertrophy" | "strength" | "endurance";

export interface TodayData {
  week: number;
  dayIndex: number;
  dayTitle: string;
  rx: ResolvedRx;
  exercises: ExerciseRow[];
  // exercise id -> set_number -> {weight, reps}
  logs: Record<number, Record<number, { weight: number; reps: number }>>;
}
