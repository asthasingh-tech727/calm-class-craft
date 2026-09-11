import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Cpu, Database, LayoutGrid, Leaf, Server } from "lucide-react";

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. Abstract",
    body: [
      "Smart Timetable Generator with Japanese-Inspired Wellness Scheduling is a constraint-driven scheduling system for schools and colleges. It builds a conflict-free 6-day × 8-period weekly timetable while structurally protecting three recovery periods (3, 6 and 8) inspired by Japanese practices of ma (intentional pause), kaizen (small daily improvement) and shinrin-yoku (restorative breaks).",
      "The scheduler is rule-based: it models the timetable as a Constraint Satisfaction Problem and solves it with backtracking search guided by the Minimum Remaining Values heuristic. No machine learning is used, and results are fully deterministic and explainable.",
    ],
  },
  {
    title: "2. Problem Statement (PS1)",
    body: [
      "Institutions build timetables manually, which produces faculty and room clashes, uneven daily loads and zero space for structured student recovery. Existing tools optimise only for slot packing, and treat breaks as leftovers rather than as a hard requirement.",
      "PS1 target users: Educational Institutions (Schools/Colleges). The system must handle multiple batches, subjects, faculty, rooms and labs, respect faculty availability, room capacity and room type, and reserve wellness periods unless an administrator explicitly overrides them.",
    ],
  },
  {
    title: "3. System Architecture",
    body: [
      "Four layers: (a) Input layer — batches, subjects, faculty, rooms and constraint configuration; (b) Persistence layer — SQLite in the reference Python implementation, browser localStorage in this prototype; (c) Constraint engine — domain construction, MRV variable ordering, backtracking search with constraint propagation on faculty/room/batch occupancy; (d) Presentation layer — batch/faculty/room views, conflict validator, analytics and CSV/JSON/print export.",
    ],
  },
  {
    title: "4. Algorithmic Approach",
    body: [
      "Variables: one per required weekly session of each subject. Domain: every (day, period, room) triple that satisfies the static constraints — period is academic (or override-allowed), faculty is available, room type matches, room capacity ≥ batch strength.",
      "Hard constraints checked during search: a faculty member, a room and a batch may each occupy a slot only once, and a subject may not exceed its per-day cap. MRV picks the most constrained session next, so failures surface early and the search tree stays small. Chronological backtracking undoes the last assignment on failure.",
    ],
  },
  {
    title: "5. Core Implementation",
    body: [
      "The reference stack is Python + SQLite with a CSP backtracking core. This prototype ports the same algorithm to deterministic TypeScript so it runs entirely in the browser for demo purposes — identical inputs always yield an identical timetable.",
    ],
  },
  {
    title: "6. Wellness Workflow",
    body: [
      "Periods 3, 6 and 8 are removed from every variable's domain before search begins, so recovery time cannot be consumed by academics. Period 3 hosts a breathing and hydration reset, period 6 a kaizen reflection, period 8 a zazen wind-down.",
      "An administrator may explicitly enable the override switch; when they do, any session landing on a recovery period is flagged in the conflict validator and lowers the recovery-compliance metric, keeping the trade-off visible.",
    ],
  },
  {
    title: "7. Expected Impact",
    body: [
      "Timetable preparation drops from days of manual work to seconds. Clash count falls to zero for feasible inputs, faculty workload spread narrows, room utilisation becomes measurable, and every student cohort receives 18 protected recovery periods per week (3 per day × 6 days).",
    ],
  },
];

const ARCH = [
  { icon: LayoutGrid, title: "Input Layer", detail: "Batches, subjects, faculty, rooms, constraint configuration" },
  { icon: Database, title: "Persistence", detail: "SQLite (reference) · localStorage (prototype)" },
  { icon: Cpu, title: "Constraint Engine", detail: "Domain build → MRV ordering → backtracking search" },
  { icon: Leaf, title: "Wellness Guard", detail: "Periods 3/6/8 removed from domains unless overridden" },
  { icon: Server, title: "Presentation", detail: "Views, validator, analytics, CSV/JSON/print export" },
];

const CODE = `# core/scheduler.py — CSP backtracking with MRV
def solve(sessions, slots, rooms, state):
    if not sessions:
        return True                      # all variables assigned

    # MRV: pick the session with the fewest feasible (slot, room) pairs
    session = min(sessions, key=lambda s: len(options(s, slots, rooms, state)))
    rest = [s for s in sessions if s is not session]

    for slot, room in options(session, slots, rooms, state):
        assign(state, session, slot, room)
        if solve(rest, slots, rooms, state):
            return True
        unassign(state, session, slot, room)   # backtrack

    return False

def options(s, slots, rooms, state):
    return [
        (slot, room)
        for slot in slots                                  # recovery periods excluded
        if slot not in s.faculty.unavailable
        for room in rooms
        if room.type == s.required_room_type
        and room.capacity >= s.batch.strength
        and state.free(s.faculty, s.batch, room, slot)     # no faculty/room/batch clash
        and state.per_day(s.subject, slot.day) < s.max_per_day
    ]`;

export function ProposalPanel() {
  return (
    <div className="space-y-6">
      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="font-display">Architecture at a glance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            {ARCH.map((a, i) => (
              <div key={a.title} className="flex flex-1 items-center gap-3">
                <div className="flex-1 rounded-xl border border-border bg-muted/40 p-4">
                  <a.icon className="mb-2 h-5 w-5 text-primary" />
                  <div className="font-display text-sm font-semibold">{a.title}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{a.detail}</p>
                </div>
                {i < ARCH.length - 1 && (
                  <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground lg:block" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="surface-panel">
          <CardHeader>
            <CardTitle className="font-display">Proposal sections</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="0">
              {SECTIONS.map((s, i) => (
                <AccordionItem key={s.title} value={String(i)}>
                  <AccordionTrigger className="text-left font-display text-sm">{s.title}</AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    {s.body.map((p) => (
                      <p key={p.slice(0, 24)}>{p}</p>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="surface-panel">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle className="font-display">Reference implementation</CardTitle>
              <Badge variant="secondary" className="font-mono text-[10px]">
                Python · SQLite · CSP
              </Badge>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[420px] overflow-auto rounded-lg bg-ink/95 p-4 font-mono text-[11px] leading-relaxed text-background dark:bg-muted dark:text-foreground">
                <code>{CODE}</code>
              </pre>
            </CardContent>
          </Card>

          <Card className="surface-panel">
            <CardHeader>
              <CardTitle className="font-display">Method labelling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                This system is <strong className="text-foreground">rule-based constraint satisfaction</strong> —
                backtracking search with the Minimum Remaining Values heuristic. It contains no machine learning,
                no training data and no probabilistic inference.
              </p>
              <p>
                Every run is deterministic: the same inputs always produce the same timetable, which makes results
                auditable by an academic office.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
