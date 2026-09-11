import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Metrics } from "@/lib/timetable/analytics";
import type { Assignment, TimetableData } from "@/lib/timetable/types";
import { DAYS } from "@/lib/timetable/types";

interface Props {
  metrics: Metrics;
  data: TimetableData;
  schedule: Assignment[] | null;
}

export function AnalyticsPanel({ metrics, data, schedule }: Props) {
  const perDay = DAYS.map((d, i) => ({ day: d, count: (schedule ?? []).filter((a) => a.day === i).length }));
  const maxDay = Math.max(1, ...perDay.map((p) => p.count));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="font-display">Faculty workload balance</CardTitle>
          <CardDescription>Assigned hours vs declared maximum weekly load</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.workload.map((w) => (
            <div key={w.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate">{w.name}</span>
                <span className={`font-mono text-xs ${w.hours > w.max ? "text-destructive" : "text-muted-foreground"}`}>
                  {w.hours}/{w.max} h
                </span>
              </div>
              <Progress value={Math.min(100, (w.hours / Math.max(1, w.max)) * 100)} />
            </div>
          ))}
          <p className="pt-2 text-xs text-muted-foreground">
            Balance index {Math.round(metrics.balanceIndex)}% — higher means load is spread more evenly.
          </p>
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="font-display">Room utilisation</CardTitle>
          <CardDescription>Occupied slots out of {DAYS.length * 8} weekly slots</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.roomUsage.map((r) => (
            <div key={r.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate">{r.name}</span>
                <span className="font-mono text-xs text-muted-foreground">{Math.round(r.utilization)}%</span>
              </div>
              <Progress value={r.utilization} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="font-display">Weekly load distribution</CardTitle>
          <CardDescription>Sessions scheduled each day across all batches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-end gap-3">
            {perDay.map((p) => (
              <div key={p.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{p.count}</span>
                <div
                  className="w-full rounded-t-md bg-primary/80 transition-all duration-500"
                  style={{ height: `${(p.count / maxDay) * 100}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{p.day.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="font-display">Wellness &amp; efficiency</CardTitle>
          <CardDescription>Recovery compliance is weighted highest in the wellness score</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Recovery compliance", value: metrics.recoveryCompliance },
            { label: "Scheduling efficiency", value: metrics.efficiency },
            { label: "Slot utilisation", value: metrics.utilization },
            { label: "Wellness score", value: metrics.wellnessScore },
          ].map((m) => (
            <div key={m.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{m.label}</span>
                <span className="font-mono text-xs text-muted-foreground">{Math.round(m.value)}%</span>
              </div>
              <Progress value={m.value} />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Protected recovery slots this week:{" "}
            <span className="font-mono text-foreground">
              {DAYS.length * data.settings.recoveryPeriods.length * Math.max(1, data.batches.length)}
            </span>{" "}
            · academic sessions placed:{" "}
            <span className="font-mono text-foreground">{metrics.totalSessions}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
