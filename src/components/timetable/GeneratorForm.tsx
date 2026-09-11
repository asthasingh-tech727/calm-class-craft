import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { SubjectType, TimetableData } from "@/lib/timetable/types";
import { DAYS, PERIOD_COUNT, slotKey } from "@/lib/timetable/types";
import { CalendarClock, Plus, Trash2 } from "lucide-react";

interface Props {
  data: TimetableData;
  setData: (fn: (prev: TimetableData) => TimetableData) => void;
}

const uid = (p: string) => `${p}${Math.random().toString(36).slice(2, 8)}`;

export function GeneratorForm({ data, setData }: Props) {
  const update = (fn: (d: TimetableData) => void) =>
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as TimetableData;
      fn(next);
      return next;
    });

  return (
    <div className="space-y-6">
      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="font-display">Scheduling constraints</CardTitle>
          <CardDescription>
            Recovery periods are removed from the solver's search space before backtracking begins.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Recovery / wellness periods</Label>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: PERIOD_COUNT }, (_, i) => i + 1).map((p) => {
                const on = data.settings.recoveryPeriods.includes(p);
                return (
                  <Button
                    key={p}
                    type="button"
                    size="sm"
                    variant={on ? "default" : "outline"}
                    className={on ? "bg-wellness text-wellness-foreground hover:bg-wellness/90" : ""}
                    onClick={() =>
                      update((d) => {
                        const set = new Set(d.settings.recoveryPeriods);
                        if (set.has(p)) set.delete(p);
                        else set.add(p);
                        d.settings.recoveryPeriods = [...set].sort((a, b) => a - b);
                        d.settings.academicPeriods = Array.from({ length: PERIOD_COUNT }, (_, i) => i + 1).filter(
                          (x) => !set.has(x),
                        );
                      })
                    }
                  >
                    P{p}
                  </Button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Academic periods: {data.settings.academicPeriods.join(", ") || "none"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="override">Allow academics in recovery periods</Label>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Switch
                id="override"
                checked={data.settings.allowRecoveryOverride}
                onCheckedChange={(v) => update((d) => (d.settings.allowRecoveryOverride = v))}
              />
              <span className="text-xs text-muted-foreground">
                {data.settings.allowRecoveryOverride ? "Override ON — wellness slots are schedulable" : "Protected"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="perday">Max sessions of one subject per day</Label>
            <Input
              id="perday"
              type="number"
              min={1}
              max={4}
              value={data.settings.maxPerSubjectPerDay}
              onChange={(e) => update((d) => (d.settings.maxPerSubjectPerDay = Math.max(1, Number(e.target.value) || 1)))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Batches */}
        <Card className="surface-panel">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="font-display">Batches / classes</CardTitle>
              <CardDescription>Cohort name and strength</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => update((d) => d.batches.push({ id: uid("b"), name: "New Batch", strength: 40 }))}
            >
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.batches.map((b, i) => (
              <div key={b.id} className="grid grid-cols-[minmax(0,1fr)_88px_auto] items-center gap-2">
                <Input value={b.name} onChange={(e) => update((d) => (d.batches[i].name = e.target.value))} />
                <Input
                  type="number"
                  min={1}
                  value={b.strength}
                  onChange={(e) => update((d) => (d.batches[i].strength = Number(e.target.value) || 0))}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Remove ${b.name}`}
                  onClick={() =>
                    update((d) => {
                      d.batches = d.batches.filter((x) => x.id !== b.id);
                      d.subjects = d.subjects.filter((s) => s.batchId !== b.id);
                    })
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Rooms */}
        <Card className="surface-panel">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="font-display">Rooms &amp; labs</CardTitle>
              <CardDescription>Capacity and room type</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => update((d) => d.rooms.push({ id: uid("r"), name: "New Room", capacity: 60, type: "classroom" }))}
            >
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.rooms.map((r, i) => (
              <div key={r.id} className="grid grid-cols-[minmax(0,1fr)_80px_130px_auto] items-center gap-2">
                <Input value={r.name} onChange={(e) => update((d) => (d.rooms[i].name = e.target.value))} />
                <Input
                  type="number"
                  min={1}
                  value={r.capacity}
                  onChange={(e) => update((d) => (d.rooms[i].capacity = Number(e.target.value) || 0))}
                />
                <Select
                  value={r.type}
                  onValueChange={(v) => update((d) => (d.rooms[i].type = v as "classroom" | "lab"))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classroom">Classroom</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Remove ${r.name}`}
                  onClick={() => update((d) => (d.rooms = d.rooms.filter((x) => x.id !== r.id)))}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Faculty */}
      <Card className="surface-panel">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="font-display">Faculty &amp; availability</CardTitle>
            <CardDescription>Blocked slots are excluded from the solver's domains</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              update((d) =>
                d.faculty.push({ id: uid("f"), name: "New Faculty", department: "General", maxWeeklyLoad: 16, unavailable: [] }),
              )
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.faculty.map((f, i) => (
            <div key={f.id} className="grid gap-2 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_90px_auto_auto] md:items-center">
              <Input value={f.name} onChange={(e) => update((d) => (d.faculty[i].name = e.target.value))} />
              <Input
                value={f.department}
                onChange={(e) => update((d) => (d.faculty[i].department = e.target.value))}
              />
              <Input
                type="number"
                min={1}
                value={f.maxWeeklyLoad}
                onChange={(e) => update((d) => (d.faculty[i].maxWeeklyLoad = Number(e.target.value) || 0))}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-start">
                    <CalendarClock className="mr-1 h-4 w-4" />
                    Availability
                    {f.unavailable.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {f.unavailable.length} blocked
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto">
                  <p className="mb-2 text-xs text-muted-foreground">Click a slot to block it for {f.name}.</p>
                  <div className="grid grid-cols-[auto_repeat(8,minmax(0,1fr))] gap-1">
                    <span />
                    {Array.from({ length: PERIOD_COUNT }, (_, p) => (
                      <span key={p} className="text-center font-mono text-[10px] text-muted-foreground">
                        {p + 1}
                      </span>
                    ))}
                    {DAYS.map((day, di) => (
                      <>
                        <span key={day} className="pr-1 text-[10px] text-muted-foreground">
                          {day.slice(0, 3)}
                        </span>
                        {Array.from({ length: PERIOD_COUNT }, (_, pi) => {
                          const k = slotKey(di, pi + 1);
                          const blocked = f.unavailable.includes(k);
                          return (
                            <button
                              key={`${day}-${pi}`}
                              type="button"
                              aria-label={`${day} period ${pi + 1}`}
                              onClick={() =>
                                update((d) => {
                                  const list = d.faculty[i].unavailable;
                                  d.faculty[i].unavailable = list.includes(k)
                                    ? list.filter((x) => x !== k)
                                    : [...list, k];
                                })
                              }
                              className={`h-6 w-6 rounded border text-[9px] transition-colors ${
                                blocked
                                  ? "border-destructive bg-destructive/15 text-destructive"
                                  : "border-border hover:bg-accent"
                              }`}
                            >
                              {blocked ? "✕" : ""}
                            </button>
                          );
                        })}
                      </>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Remove ${f.name}`}
                onClick={() =>
                  update((d) => {
                    d.faculty = d.faculty.filter((x) => x.id !== f.id);
                    d.subjects = d.subjects.filter((s) => s.facultyId !== f.id);
                  })
                }
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Subjects */}
      <Card className="surface-panel">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="font-display">Subjects, labs &amp; electives</CardTitle>
            <CardDescription>Each weekly hour becomes one CSP variable</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={data.batches.length === 0 || data.faculty.length === 0}
            onClick={() =>
              update((d) =>
                d.subjects.push({
                  id: uid("s"),
                  code: "NEW101",
                  name: "New Subject",
                  batchId: d.batches[0].id,
                  facultyId: d.faculty[0].id,
                  weeklyHours: 3,
                  type: "lecture",
                }),
              )
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.subjects.map((s, i) => (
            <div
              key={s.id}
              className="grid gap-2 xl:grid-cols-[110px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_130px_80px_auto] xl:items-center"
            >
              <Input
                value={s.code}
                className="font-mono text-xs"
                onChange={(e) => update((d) => (d.subjects[i].code = e.target.value))}
              />
              <Input value={s.name} onChange={(e) => update((d) => (d.subjects[i].name = e.target.value))} />
              <Select value={s.batchId} onValueChange={(v) => update((d) => (d.subjects[i].batchId = v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.batches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={s.facultyId} onValueChange={(v) => update((d) => (d.subjects[i].facultyId = v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.faculty.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={s.type} onValueChange={(v) => update((d) => (d.subjects[i].type = v as SubjectType))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lecture">Lecture</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                  <SelectItem value="elective">Elective</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={0}
                max={12}
                value={s.weeklyHours}
                onChange={(e) => update((d) => (d.subjects[i].weeklyHours = Number(e.target.value) || 0))}
              />
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Remove ${s.name}`}
                onClick={() => update((d) => (d.subjects = d.subjects.filter((x) => x.id !== s.id)))}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {data.subjects.length === 0 && (
            <p className="text-sm text-muted-foreground">No subjects yet — add one to schedule.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
