import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneratorForm } from "@/components/timetable/GeneratorForm";
import { ConflictPanel } from "@/components/timetable/ConflictPanel";
import { AnalyticsPanel } from "@/components/timetable/AnalyticsPanel";
import { ProposalPanel } from "@/components/timetable/ProposalPanel";
import { ScheduleGrid, type ViewMode } from "@/components/timetable/ScheduleGrid";
import { computeMetrics } from "@/lib/timetable/analytics";
import { exportCsv, exportJson, printSummary } from "@/lib/timetable/exporters";
import { solve, validate } from "@/lib/timetable/solver";
import { useTheme, useTimetableStore } from "@/lib/timetable/store";
import type { SolveResult } from "@/lib/timetable/types";
import { DAYS } from "@/lib/timetable/types";
import {
  Activity,
  CalendarRange,
  Download,
  FileJson,
  Moon,
  Printer,
  RefreshCw,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";

const TITLE = "Smart Timetable Generator · Japanese-Inspired Wellness Scheduling";
const DESC =
  "Campusathon 2026 PS1 prototype: a deterministic CSP + MRV backtracking timetable generator for schools and colleges that protects recovery periods 3, 6 and 8.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { data, setData, schedule, setSchedule, resetDemo, hydrated } = useTimetableStore();
  const { dark, toggle } = useTheme();
  const [result, setResult] = useState<SolveResult | null>(null);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<ViewMode>("batch");
  const [entityId, setEntityId] = useState<string>("");

  const metrics = useMemo(() => computeMetrics(data, schedule), [data, schedule]);
  const conflicts = useMemo(() => (schedule ? validate(data, schedule) : []), [data, schedule]);
  const errorCount = conflicts.filter((c) => c.severity === "error").length;

  const entities = mode === "batch" ? data.batches : mode === "faculty" ? data.faculty : data.rooms;
  const activeEntity = entities.find((e) => e.id === entityId)?.id ?? entities[0]?.id ?? "";

  const generate = () => {
    setRunning(true);
    setTimeout(() => {
      const res = solve(data);
      setResult(res);
      setSchedule(res.ok ? res.assignments : null);
      setRunning(false);
      if (res.ok) toast.success("Timetable generated", { description: res.message });
      else toast.error("Constraints infeasible", { description: res.message });
    }, 60);
  };

  const doExport = (kind: "csv" | "json") => {
    if (!schedule) {
      toast.error("Generate a timetable first");
      return;
    }
    if (kind === "csv") exportCsv(data, schedule);
    else exportJson(data, schedule);
    toast.success(`Exported ${kind.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      <header className="gradient-hero relative overflow-hidden text-primary-foreground">
        <div className="washi-grid absolute inset-0 opacity-10" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
            <div className="min-w-0 rise-in">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-background/15 text-primary-foreground">Campusathon 2026</Badge>
                <Badge className="bg-background/15 text-primary-foreground">PS1</Badge>
                <Badge className="bg-background/15 text-primary-foreground">Demo Mode</Badge>
              </div>
              <h1 className="mt-3 font-display text-2xl leading-tight font-bold sm:text-4xl">
                Smart Timetable Generator
                <span className="block text-lg font-medium opacity-90 sm:text-2xl">
                  with Japanese-Inspired Wellness Scheduling · 時間割
                </span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm opacity-90 sm:text-base">
                Conflict-free 6-day × 8-period timetables for schools and colleges, solved by rule-based CSP
                backtracking with the MRV heuristic — with recovery periods 3, 6 and 8 structurally protected.
              </p>
            </div>
            <Button variant="secondary" size="icon" onClick={toggle} aria-label="Toggle theme" className="no-print">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="no-print mb-6 flex flex-wrap gap-2">
          <Button onClick={generate} disabled={running || !hydrated}>
            <Sparkles className={`mr-2 h-4 w-4 ${running ? "animate-spin" : ""}`} />
            {running ? "Solving…" : "Generate New Timetable"}
          </Button>
          <Button variant="outline" onClick={() => { resetDemo(); setResult(null); toast.success("Demo data restored"); }}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reset Demo Data
          </Button>
          <Button variant="outline" onClick={() => doExport("csv")}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" onClick={() => doExport("json")}>
            <FileJson className="mr-2 h-4 w-4" /> JSON
          </Button>
          <Button variant="outline" onClick={printSummary}>
            <Printer className="mr-2 h-4 w-4" /> Print / PDF
          </Button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Sessions placed" value={String(metrics.totalSessions)} hint={`${DAYS.length} days × 8 periods`} icon={CalendarRange} />
          <Metric label="Conflicts" value={String(errorCount)} hint={schedule ? "validated" : "not generated"} icon={Activity} tone={errorCount ? "bad" : "good"} />
          <Metric label="Slot utilisation" value={`${Math.round(metrics.utilization)}%`} hint="academic capacity used" icon={Users} />
          <Metric label="Wellness score" value={`${metrics.wellnessScore}`} hint="recovery + balance" icon={Sparkles} tone="wellness" />
          <Metric
            label="Solver status"
            value={result ? (result.ok ? "Solved" : "Infeasible") : schedule ? "Loaded" : "Idle"}
            hint={result ? `${result.steps} steps · ${result.backtracks} backtracks · ${result.elapsedMs}ms` : "CSP + MRV"}
            icon={Activity}
            tone={result && !result.ok ? "bad" : "good"}
          />
        </div>

        {result && !result.ok && (
          <Card className="mb-6 border-destructive/50 bg-destructive/10">
            <CardHeader>
              <CardTitle className="font-display text-base">No feasible schedule found</CardTitle>
              <CardDescription className="text-foreground">{result.message}</CardDescription>
            </CardHeader>
          </Card>
        )}

        <Tabs defaultValue="overview">
          <TabsList className="no-print mb-4 flex h-auto flex-wrap justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="views">Schedule Views</TabsTrigger>
            <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="proposal">Proposal</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="surface-panel rise-in">
              <CardHeader>
                <CardTitle className="font-display">
                  Weekly schedule — {data.batches.find((b) => b.id === activeEntity)?.name ?? data.batches[0]?.name ?? "no batch"}
                </CardTitle>
                <CardDescription>
                  Dashed rose cells are protected recovery periods. The demo solver is deterministic: identical inputs
                  always produce this exact timetable.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.batches.length > 1 && (
                  <div className="no-print mb-4 flex flex-wrap gap-2">
                    {data.batches.map((b) => (
                      <Button
                        key={b.id}
                        size="sm"
                        variant={activeEntity === b.id ? "default" : "outline"}
                        onClick={() => { setMode("batch"); setEntityId(b.id); }}
                      >
                        {b.name}
                      </Button>
                    ))}
                  </div>
                )}
                <ScheduleGrid data={data} schedule={schedule} mode="batch" entityId={mode === "batch" ? activeEntity : data.batches[0]?.id ?? ""} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generator">
            <GeneratorForm data={data} setData={setData} />
          </TabsContent>

          <TabsContent value="views">
            <Card className="surface-panel">
              <CardHeader>
                <CardTitle className="font-display">Schedule by batch, faculty or room</CardTitle>
                <CardDescription>The same solution projected onto different resources.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="no-print flex flex-wrap gap-2">
                  <Select value={mode} onValueChange={(v) => { setMode(v as ViewMode); setEntityId(""); }}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="batch">By batch</SelectItem>
                      <SelectItem value="faculty">By faculty</SelectItem>
                      <SelectItem value="room">By room</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={activeEntity} onValueChange={setEntityId}>
                    <SelectTrigger className="w-60">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ScheduleGrid data={data} schedule={schedule} mode={mode} entityId={activeEntity} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conflicts">
            <ConflictPanel conflicts={conflicts} hasSchedule={Boolean(schedule)} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsPanel metrics={metrics} data={data} schedule={schedule} />
          </TabsContent>

          <TabsContent value="proposal">
            <ProposalPanel />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Campusathon 2026 · PS1 · Rule-based CSP backtracking with MRV — no AI/ML involved.
      </footer>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ElementType;
  tone?: "neutral" | "good" | "bad" | "wellness";
}) {
  const toneClass =
    tone === "bad" ? "text-destructive" : tone === "good" ? "text-success" : tone === "wellness" ? "text-wellness" : "text-foreground";
  return (
    <Card className="surface-panel rise-in">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
        <div className={`mt-2 font-display text-2xl font-bold ${toneClass}`}>{value}</div>
        <p className="mt-1 truncate text-[11px] text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
