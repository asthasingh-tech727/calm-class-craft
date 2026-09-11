import type { Assignment, SolveResult, TimetableData } from "./types";
import { DAYS, PERIOD_COUNT, slotKey } from "./types";

/**
 * Deterministic CSP solver: backtracking search + MRV (minimum remaining values)
 * variable ordering. This is rule-based constraint solving — no AI/ML involved.
 * Given identical input it always produces an identical schedule.
 */

interface Variable {
  id: string;
  subjectId: string;
  batchId: string;
  facultyId: string;
  needsLab: boolean;
  strength: number;
  label: string;
}

interface Domain {
  day: number;
  period: number;
  roomId: string;
}

const MAX_STEPS = 200_000;

export function solve(data: TimetableData): SolveResult {
  const start = Date.now();
  const { settings } = data;
  const allowedPeriods: number[] = [];
  for (let p = 1; p <= PERIOD_COUNT; p++) {
    const isRecovery = settings.recoveryPeriods.includes(p);
    if (!isRecovery || settings.allowRecoveryOverride) allowedPeriods.push(p);
  }

  const batchById = new Map(data.batches.map((b) => [b.id, b]));
  const facultyById = new Map(data.faculty.map((f) => [f.id, f]));

  // Build one variable per required weekly session (deterministic order).
  const variables: Variable[] = [];
  for (const s of [...data.subjects].sort((a, b) => a.id.localeCompare(b.id))) {
    const batch = batchById.get(s.batchId);
    const fac = facultyById.get(s.facultyId);
    if (!batch || !fac) continue;
    for (let i = 0; i < Math.max(0, s.weeklyHours); i++) {
      variables.push({
        id: `${s.id}#${i}`,
        subjectId: s.id,
        batchId: s.batchId,
        facultyId: s.facultyId,
        needsLab: s.type === "lab",
        strength: batch.strength,
        label: `${s.code} · ${batch.name}`,
      });
    }
  }

  if (variables.length === 0) {
    return { ok: true, assignments: [], message: "Nothing to schedule — add subjects first.", steps: 0, backtracks: 0, elapsedMs: 0, unplaced: [] };
  }

  const capacityCheck: string[] = [];
  // Precompute static domains per variable.
  const rooms = [...data.rooms].sort((a, b) => a.capacity - b.capacity || a.id.localeCompare(b.id));
  const staticDomain = new Map<string, Domain[]>();
  for (const v of variables) {
    const fac = facultyById.get(v.facultyId)!;
    const okRooms = rooms.filter(
      (r) => r.capacity >= v.strength && (v.needsLab ? r.type === "lab" : r.type === "classroom"),
    );
    if (okRooms.length === 0 && !capacityCheck.includes(v.label)) capacityCheck.push(v.label);
    const dom: Domain[] = [];
    for (let d = 0; d < DAYS.length; d++) {
      for (const p of allowedPeriods) {
        if (fac.unavailable.includes(slotKey(d, p))) continue;
        for (const r of okRooms) dom.push({ day: d, period: p, roomId: r.id });
      }
    }
    staticDomain.set(v.id, dom);
  }

  if (capacityCheck.length > 0) {
    return {
      ok: false,
      assignments: [],
      message: `Infeasible: no room satisfies capacity/type for ${capacityCheck.slice(0, 4).join(", ")}${capacityCheck.length > 4 ? "…" : ""}. Add a larger room or a lab, or reduce batch strength.`,
      steps: 0,
      backtracks: 0,
      elapsedMs: Date.now() - start,
      unplaced: capacityCheck,
    };
  }

  const capacityTotal = DAYS.length * allowedPeriods.length;
  for (const b of data.batches) {
    const need = variables.filter((v) => v.batchId === b.id).length;
    if (need > capacityTotal) {
      return {
        ok: false,
        assignments: [],
        message: `Infeasible: ${b.name} needs ${need} sessions but only ${capacityTotal} academic slots exist. Reduce weekly hours or allow recovery periods.`,
        steps: 0,
        backtracks: 0,
        elapsedMs: Date.now() - start,
        unplaced: [b.name],
      };
    }
  }

  const usedFaculty = new Set<string>(); // facultyId@d-p
  const usedRoom = new Set<string>();
  const usedBatch = new Set<string>();
  const perDayCount = new Map<string, number>(); // subjectId@day

  const assigned = new Map<string, Domain>();
  let steps = 0;
  let backtracks = 0;
  let aborted = false;

  const feasible = (v: Variable, d: Domain) =>
    !usedFaculty.has(`${v.facultyId}@${d.day}-${d.period}`) &&
    !usedRoom.has(`${d.roomId}@${d.day}-${d.period}`) &&
    !usedBatch.has(`${v.batchId}@${d.day}-${d.period}`) &&
    (perDayCount.get(`${v.subjectId}@${d.day}`) ?? 0) < Math.max(1, settings.maxPerSubjectPerDay);

  const place = (v: Variable, d: Domain, on: boolean) => {
    const fk = `${v.facultyId}@${d.day}-${d.period}`;
    const rk = `${d.roomId}@${d.day}-${d.period}`;
    const bk = `${v.batchId}@${d.day}-${d.period}`;
    const pk = `${v.subjectId}@${d.day}`;
    if (on) {
      usedFaculty.add(fk);
      usedRoom.add(rk);
      usedBatch.add(bk);
      perDayCount.set(pk, (perDayCount.get(pk) ?? 0) + 1);
      assigned.set(v.id, d);
    } else {
      usedFaculty.delete(fk);
      usedRoom.delete(rk);
      usedBatch.delete(bk);
      perDayCount.set(pk, (perDayCount.get(pk) ?? 1) - 1);
      assigned.delete(v.id);
    }
  };

  const search = (remaining: Variable[]): boolean => {
    if (remaining.length === 0) return true;
    if (steps > MAX_STEPS) {
      aborted = true;
      return false;
    }

    // MRV: choose the variable with the fewest currently-feasible values.
    let best: Variable | null = null;
    let bestOptions: Domain[] = [];
    for (const v of remaining) {
      const opts = staticDomain.get(v.id)!.filter((d) => feasible(v, d));
      if (best === null || opts.length < bestOptions.length) {
        best = v;
        bestOptions = opts;
        if (opts.length === 0) break; // fail fast
      }
    }
    if (!best) return true;
    if (bestOptions.length === 0) {
      backtracks++;
      return false;
    }

    const rest = remaining.filter((v) => v.id !== best!.id);
    for (const d of bestOptions) {
      steps++;
      if (steps > MAX_STEPS) {
        aborted = true;
        return false;
      }
      place(best, d, true);
      if (search(rest)) return true;
      place(best, d, false);
    }
    backtracks++;
    return false;
  };

  const ok = search(variables);
  const elapsedMs = Date.now() - start;

  if (!ok) {
    return {
      ok: false,
      assignments: [],
      message: aborted
        ? "Search limit reached — the constraint set is too tight for the demo solver. Try relaxing faculty unavailability, adding rooms, or allowing recovery periods."
        : "Infeasible: no conflict-free assignment exists under the current constraints. Relax faculty availability, add rooms/labs, reduce weekly hours, or allow recovery periods.",
      steps,
      backtracks,
      elapsedMs,
      unplaced: variables.filter((v) => !assigned.has(v.id)).map((v) => v.label),
    };
  }

  const subjectById = new Map(data.subjects.map((s) => [s.id, s]));
  const assignments: Assignment[] = variables.map((v) => {
    const d = assigned.get(v.id)!;
    return {
      subjectId: v.subjectId,
      batchId: v.batchId,
      facultyId: v.facultyId,
      roomId: d.roomId,
      day: d.day,
      period: d.period,
      onRecovery: settings.recoveryPeriods.includes(d.period),
    };
  });
  assignments.sort((a, b) => a.day - b.day || a.period - b.period || a.batchId.localeCompare(b.batchId));

  return {
    ok: true,
    assignments,
    message: `Solved ${assignments.length} sessions across ${subjectById.size} subjects with zero conflicts.`,
    steps,
    backtracks,
    elapsedMs,
    unplaced: [],
  };
}

export interface Conflict {
  kind: "faculty" | "room" | "batch" | "recovery" | "overload";
  detail: string;
  severity: "error" | "warning";
}

export function validate(data: TimetableData, assignments: Assignment[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const name = <T extends { id: string; name: string }>(list: T[], id: string) =>
    list.find((x) => x.id === id)?.name ?? id;

  const seen = new Map<string, Assignment[]>();
  const push = (k: string, a: Assignment) => {
    const arr = seen.get(k) ?? [];
    arr.push(a);
    seen.set(k, arr);
  };
  for (const a of assignments) {
    push(`faculty|${a.facultyId}|${a.day}-${a.period}`, a);
    push(`room|${a.roomId}|${a.day}-${a.period}`, a);
    push(`batch|${a.batchId}|${a.day}-${a.period}`, a);
  }
  for (const [k, arr] of seen) {
    if (arr.length < 2) continue;
    const [kind, id, slot] = k.split("|");
    const [d, p] = slot.split("-");
    const who =
      kind === "faculty" ? name(data.faculty, id) : kind === "room" ? name(data.rooms, id) : name(data.batches, id);
    conflicts.push({
      kind: kind as Conflict["kind"],
      severity: "error",
      detail: `${who} is double-booked on ${DAYS[Number(d)]}, period ${p} (${arr.length} sessions).`,
    });
  }

  for (const a of assignments) {
    if (a.onRecovery) {
      conflicts.push({
        kind: "recovery",
        severity: "warning",
        detail: `${name(data.batches, a.batchId)} has an academic session in protected recovery period ${a.period} on ${DAYS[a.day]}.`,
      });
    }
    const fac = data.faculty.find((f) => f.id === a.facultyId);
    if (fac?.unavailable.includes(slotKey(a.day, a.period))) {
      conflicts.push({
        kind: "faculty",
        severity: "error",
        detail: `${fac.name} is marked unavailable on ${DAYS[a.day]}, period ${a.period}.`,
      });
    }
  }

  for (const f of data.faculty) {
    const load = assignments.filter((a) => a.facultyId === f.id).length;
    if (load > f.maxWeeklyLoad) {
      conflicts.push({
        kind: "overload",
        severity: "warning",
        detail: `${f.name} is assigned ${load} hours, above the declared max load of ${f.maxWeeklyLoad}.`,
      });
    }
  }

  return conflicts;
}
