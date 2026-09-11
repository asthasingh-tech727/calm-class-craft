import { Badge } from "@/components/ui/badge";
import { RECOVERY_ACTIVITIES } from "@/lib/timetable/demoData";
import type { Assignment, TimetableData } from "@/lib/timetable/types";
import { DAYS, PERIOD_COUNT, PERIOD_TIMES } from "@/lib/timetable/types";

export type ViewMode = "batch" | "faculty" | "room";

interface Props {
  data: TimetableData;
  schedule: Assignment[] | null;
  mode: ViewMode;
  entityId: string;
}

export function ScheduleGrid({ data, schedule, mode, entityId }: Props) {
  const rows = schedule ?? [];
  const filtered = rows.filter((a) =>
    mode === "batch" ? a.batchId === entityId : mode === "faculty" ? a.facultyId === entityId : a.roomId === entityId,
  );

  const at = (day: number, period: number) => filtered.filter((a) => a.day === day && a.period === period);
  const subject = (id: string) => data.subjects.find((s) => s.id === id);
  const nameOf = <T extends { id: string; name: string }>(list: T[], id: string) =>
    list.find((x) => x.id === id)?.name ?? "—";

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[840px] border-separate border-spacing-1 text-left text-xs">
        <thead>
          <tr>
            <th className="w-28 px-2 py-2 font-medium text-muted-foreground">Period</th>
            {DAYS.map((d) => (
              <th key={d} className="px-2 py-2 font-display text-sm font-semibold text-foreground">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: PERIOD_COUNT }, (_, i) => i + 1).map((p) => {
            const isRecovery = data.settings.recoveryPeriods.includes(p);
            const activity = RECOVERY_ACTIVITIES[p];
            return (
              <tr key={p}>
                <th className="rounded-lg bg-muted/60 px-2 py-2 align-top">
                  <div className="font-mono text-sm font-semibold text-foreground">P{p}</div>
                  <div className="text-[10px] font-normal text-muted-foreground">{PERIOD_TIMES[p - 1]}</div>
                  {isRecovery && (
                    <Badge variant="outline" className="mt-1 border-wellness text-[9px] text-wellness">
                      Recovery
                    </Badge>
                  )}
                </th>
                {DAYS.map((d, di) => {
                  const cells = at(di, p);
                  if (cells.length === 0) {
                    return (
                      <td key={d} className="align-top">
                        {isRecovery ? (
                          <div className="cell-wellness h-full min-h-[62px] rounded-lg p-2">
                            <div className="font-display text-[11px] font-semibold text-wellness">
                              {activity?.title}
                            </div>
                            <div className="text-[10px] text-muted-foreground">{activity?.jp}</div>
                          </div>
                        ) : (
                          <div className="min-h-[62px] rounded-lg border border-dashed border-border/70 p-2 text-[10px] text-muted-foreground">
                            Free
                          </div>
                        )}
                      </td>
                    );
                  }
                  return (
                    <td key={d} className="align-top">
                      <div className="flex flex-col gap-1">
                        {cells.map((a, idx) => {
                          const s = subject(a.subjectId);
                          return (
                            <div
                              key={`${a.subjectId}-${idx}`}
                              className={`${a.onRecovery ? "cell-wellness" : "cell-academic"} min-h-[62px] rounded-lg p-2 transition-transform hover:-translate-y-0.5`}
                            >
                              <div className="font-mono text-[10px] text-muted-foreground">{s?.code}</div>
                              <div className="truncate font-semibold text-foreground">{s?.name}</div>
                              <div className="truncate text-[10px] text-muted-foreground">
                                {mode !== "faculty" && nameOf(data.faculty, a.facultyId)}
                                {mode === "faculty" && nameOf(data.batches, a.batchId)}
                                {" · "}
                                {mode === "room" ? nameOf(data.batches, a.batchId) : nameOf(data.rooms, a.roomId)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
