export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const PERIOD_COUNT = 8;
export const PERIOD_TIMES = [
  "08:30 – 09:20",
  "09:25 – 10:15",
  "10:20 – 11:10",
  "11:15 – 12:05",
  "12:10 – 13:00",
  "13:45 – 14:35",
  "14:40 – 15:30",
  "15:35 – 16:25",
];

export type RoomType = "classroom" | "lab";
export type SubjectType = "lecture" | "lab" | "elective";

export interface Batch {
  id: string;
  name: string;
  strength: number;
}

export interface Faculty {
  id: string;
  name: string;
  department: string;
  maxWeeklyLoad: number;
  /** blocked slots encoded "dayIndex-periodNumber" */
  unavailable: string[];
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: RoomType;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  batchId: string;
  facultyId: string;
  weeklyHours: number;
  type: SubjectType;
}

export interface Settings {
  /** period numbers (1-indexed) reserved for wellness / recovery */
  recoveryPeriods: number[];
  academicPeriods: number[];
  allowRecoveryOverride: boolean;
  maxPerSubjectPerDay: number;
}

export interface TimetableData {
  batches: Batch[];
  faculty: Faculty[];
  rooms: Room[];
  subjects: Subject[];
  settings: Settings;
}

export interface Assignment {
  subjectId: string;
  batchId: string;
  facultyId: string;
  roomId: string;
  day: number; // 0-5
  period: number; // 1-8
  onRecovery: boolean;
}

export interface SolveResult {
  ok: boolean;
  assignments: Assignment[];
  message: string;
  steps: number;
  backtracks: number;
  elapsedMs: number;
  unplaced: string[];
}

export const slotKey = (d: number, p: number) => `${d}-${p}`;
