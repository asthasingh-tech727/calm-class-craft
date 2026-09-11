import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Conflict } from "@/lib/timetable/solver";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

export function ConflictPanel({ conflicts, hasSchedule }: { conflicts: Conflict[]; hasSchedule: boolean }) {
  const errors = conflicts.filter((c) => c.severity === "error");
  const warnings = conflicts.filter((c) => c.severity === "warning");

  return (
    <Card className="surface-panel">
      <CardHeader>
        <CardTitle className="font-display">Conflict validator</CardTitle>
        <CardDescription>
          Re-checks faculty, room and batch occupancy, declared availability, recovery protection and workload caps.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={errors.length ? "destructive" : "secondary"}>{errors.length} hard conflicts</Badge>
          <Badge variant="outline" className="border-warning text-warning">
            {warnings.length} warnings
          </Badge>
        </div>

        {!hasSchedule && <p className="text-sm text-muted-foreground">Generate a timetable to run validation.</p>}

        {hasSchedule && conflicts.length === 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-success/40 bg-success/10 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">Conflict-free schedule</p>
              <p className="text-muted-foreground">
                No faculty, room or batch overlaps. All recovery periods are intact.
              </p>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {[...errors, ...warnings].map((c, i) => (
            <li
              key={`${c.kind}-${i}`}
              className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${
                c.severity === "error" ? "border-destructive/40 bg-destructive/10" : "border-warning/40 bg-warning/10"
              }`}
            >
              {c.severity === "error" ? (
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              )}
              <span>
                <Badge variant="outline" className="mr-2 text-[10px] uppercase">
                  {c.kind}
                </Badge>
                {c.detail}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
