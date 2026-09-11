import type { Assignment, TimetableData } from "./types";
import { DAYS, PERIOD_COUNT } from "./types";

export interface Metrics {
  totalSessions: number;
  academicCapacity: number;
  utilization: number;
  wellnessScore: number;
  recoveryCompliance: number;
  efficiency: number;
  workload: { name: string; hours: number; max: number }[];
  roomUsage: { name: string; hours: number; utilization: number }[];
  balanceIndex: number;
}

export function computeMetrics(data: TimetableData, schedule: Assignment[] | null): Metrics {
  const assignments = schedule ?? [];
  const academicPerDay = PERIOD_COUNT - data.settings.recoveryPeriods.length;
  const academicCapacity = DAYS.length * academicPerDay * Math.max(1, data.batches.length);
  const totalSessions = assignments.length;
  const utilization = academicCapacity ? Math.min(100, (totalSessions / academicCapacity) * 100) : 0;

  const recoverySlots = DAYS.length * data.settings.recoveryPeriods.length * Math.max(1, data.batches.length);
  const intrusions = assignments.filter((a) => a.onRecovery).length;
  const recoveryCompliance = recoverySlots ? ((recoverySlots - intrusions) / recoverySlots) * 100 : 100;

  const workload = data.faculty.map((f) => ({
    name: f.name,
    hours: assignments.filter((a) => a.facultyId === f.id).length,
    max: f.maxWeeklyLoad,
  }));
  const loads = workload.map((w) => w.hours);
  const mean = loads.length ? loads.reduce((a, b) => a + b, 0) / loads.length : 0;
  const variance = loads.length ? loads.reduce((a, b) => a + (b - mean) ** 2, 0) / loads.length : 0;
  const spread = mean > 0 ? Math.sqrt(variance) / mean : 0;
  const balanceIndex = Math.max(0, Math.min(100, (1 - spread) * 100));

  const roomSlots = DAYS.length * PERIOD_COUNT;
  const roomUsage = data.rooms.map((r) => {
    const hours = assignments.filter((a) => a.roomId === r.id).length;
    return { name: r.name, hours, utilization: (hours / roomSlots) * 100 };
  });

  // Spread of sessions across days — a flat distribution means a healthier week.
  const perDay = DAYS.map((_, d) => assignments.filter((a) => a.day === d).length);
  const dayMean = perDay.reduce((a, b) => a + b, 0) / DAYS.length;
  const dayVar = perDay.reduce((a, b) => a + (b - dayMean) ** 2, 0) / DAYS.length;
  const daySpread = dayMean > 0 ? Math.sqrt(dayVar) / dayMean : 0;
  const dayEvenness = Math.max(0, Math.min(100, (1 - daySpread) * 100));

  const wellnessScore = Math.round(recoveryCompliance * 0.6 + dayEvenness * 0.25 + balanceIndex * 0.15);
  const efficiency = Math.round(utilization * 0.5 + balanceIndex * 0.3 + dayEvenness * 0.2);

  return {
    totalSessions,
    academicCapacity,
    utilization,
    wellnessScore,
    recoveryCompliance,
    efficiency,
    workload,
    roomUsage,
    balanceIndex,
  };
}
