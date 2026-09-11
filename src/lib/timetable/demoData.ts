import type { TimetableData } from "./types";

export const DEMO_DATA: TimetableData = {
  batches: [
    { id: "b1", name: "CSE-3A", strength: 60 },
    { id: "b2", name: "CSE-3B", strength: 58 },
    { id: "b3", name: "ECE-3A", strength: 45 },
  ],
  faculty: [
    { id: "f1", name: "Dr. A. Menon", department: "CSE", maxWeeklyLoad: 18, unavailable: ["5-1", "5-2"] },
    { id: "f2", name: "Prof. R. Iyer", department: "CSE", maxWeeklyLoad: 18, unavailable: ["0-1"] },
    { id: "f3", name: "Dr. S. Kapoor", department: "CSE", maxWeeklyLoad: 16, unavailable: [] },
    { id: "f4", name: "Prof. N. Takeda", department: "ECE", maxWeeklyLoad: 16, unavailable: ["4-7"] },
    { id: "f5", name: "Dr. M. Bose", department: "ECE", maxWeeklyLoad: 16, unavailable: [] },
    { id: "f6", name: "Prof. L. Fernandes", department: "Maths", maxWeeklyLoad: 20, unavailable: [] },
  ],
  rooms: [
    { id: "r1", name: "LH-101", capacity: 70, type: "classroom" },
    { id: "r2", name: "LH-102", capacity: 70, type: "classroom" },
    { id: "r3", name: "LH-201", capacity: 50, type: "classroom" },
    { id: "r4", name: "Lab-A (Computing)", capacity: 60, type: "lab" },
    { id: "r5", name: "Lab-B (Electronics)", capacity: 50, type: "lab" },
  ],
  subjects: [
    { id: "s1", code: "CS301", name: "Data Structures", batchId: "b1", facultyId: "f1", weeklyHours: 4, type: "lecture" },
    { id: "s2", code: "CS302", name: "Operating Systems", batchId: "b1", facultyId: "f2", weeklyHours: 3, type: "lecture" },
    { id: "s3", code: "MA301", name: "Discrete Mathematics", batchId: "b1", facultyId: "f6", weeklyHours: 3, type: "lecture" },
    { id: "s4", code: "CS351", name: "DS Laboratory", batchId: "b1", facultyId: "f3", weeklyHours: 2, type: "lab" },
    { id: "s5", code: "CS391", name: "Elective: Cloud Basics", batchId: "b1", facultyId: "f3", weeklyHours: 2, type: "elective" },

    { id: "s6", code: "CS301", name: "Data Structures", batchId: "b2", facultyId: "f3", weeklyHours: 4, type: "lecture" },
    { id: "s7", code: "CS302", name: "Operating Systems", batchId: "b2", facultyId: "f2", weeklyHours: 3, type: "lecture" },
    { id: "s8", code: "MA301", name: "Discrete Mathematics", batchId: "b2", facultyId: "f6", weeklyHours: 3, type: "lecture" },
    { id: "s9", code: "CS352", name: "OS Laboratory", batchId: "b2", facultyId: "f1", weeklyHours: 2, type: "lab" },

    { id: "s10", code: "EC301", name: "Signals & Systems", batchId: "b3", facultyId: "f4", weeklyHours: 4, type: "lecture" },
    { id: "s11", code: "EC302", name: "Digital Circuits", batchId: "b3", facultyId: "f5", weeklyHours: 3, type: "lecture" },
    { id: "s12", code: "MA302", name: "Applied Probability", batchId: "b3", facultyId: "f6", weeklyHours: 3, type: "lecture" },
    { id: "s13", code: "EC351", name: "Circuits Laboratory", batchId: "b3", facultyId: "f5", weeklyHours: 2, type: "lab" },
  ],
  settings: {
    academicPeriods: [1, 2, 4, 5, 7],
    recoveryPeriods: [3, 6, 8],
    allowRecoveryOverride: false,
    maxPerSubjectPerDay: 1,
  },
};

export const RECOVERY_ACTIVITIES: Record<number, { title: string; detail: string; jp: string }> = {
  3: { title: "Asagohan Reset", jp: "朝のリセット", detail: "Guided breathing + hydration break (Shinrin-yoku inspired micro-walk)" },
  6: { title: "Kaizen Reflection", jp: "改善の時間", detail: "10-minute journaling on one small improvement for the day" },
  8: { title: "Zazen Wind-down", jp: "座禅", detail: "Seated stillness, stretching and end-of-day closure ritual" },
};
