import type { Assignment, TimetableData } from "./types";
import { DAYS, PERIOD_TIMES } from "./types";

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCsv(data: TimetableData, schedule: Assignment[]) {
  const nameOf = <T extends { id: string; name: string }>(list: T[], id: string) =>
    list.find((x) => x.id === id)?.name ?? id;
  const rows = [
    ["Day", "Period", "Time", "Batch", "Subject Code", "Subject", "Faculty", "Room", "Recovery Slot"],
    ...schedule.map((a) => {
      const s = data.subjects.find((x) => x.id === a.subjectId);
      return [
        DAYS[a.day],
        String(a.period),
        PERIOD_TIMES[a.period - 1],
        nameOf(data.batches, a.batchId),
        s?.code ?? "",
        s?.name ?? "",
        nameOf(data.faculty, a.facultyId),
        nameOf(data.rooms, a.roomId),
        a.onRecovery ? "YES" : "NO",
      ];
    }),
  ];
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  download("timetable.csv", csv, "text/csv;charset=utf-8;");
}

export function exportJson(data: TimetableData, schedule: Assignment[]) {
  download(
    "timetable.json",
    JSON.stringify({ generatedAt: new Date().toISOString(), solver: "CSP backtracking + MRV", data, schedule }, null, 2),
    "application/json",
  );
}

export function printSummary() {
  if (typeof window !== "undefined") window.print();
}
