import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CloudUpload, FolderOpen, Loader2, RefreshCw, Trash2 } from "lucide-react";
import type { Assignment, TimetableData } from "@/lib/timetable/types";

interface SavedRow {
  id: string;
  name: string;
  data: TimetableData;
  schedule: Assignment[] | null;
  created_at: string;
}

export function SavedPanel({
  data,
  schedule,
  onLoad,
}: {
  data: TimetableData;
  schedule: Assignment[] | null;
  onLoad: (data: TimetableData, schedule: Assignment[] | null) => void;
}) {
  const [rows, setRows] = useState<SavedRow[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data: list, error } = await supabase
      .from("saved_timetables")
      .select("id, name, data, schedule, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) toast.error("Could not load saved timetables", { description: error.message });
    setRows((list ?? []) as unknown as SavedRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = async () => {
    const label = name.trim() || `Timetable ${new Date().toLocaleString()}`;
    setSaving(true);
    const { error } = await supabase.from("saved_timetables").insert({
      name: label,
      data: data as unknown as never,
      schedule: (schedule ?? null) as unknown as never,
    });
    setSaving(false);
    if (error) {
      toast.error("Save failed", { description: error.message });
      return;
    }
    setName("");
    toast.success("Timetable saved", { description: label });
    void refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("saved_timetables").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed", { description: error.message });
      return;
    }
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Deleted");
  };

  return (
    <Card className="surface-panel">
      <CardHeader>
        <CardTitle className="font-display">Saved timetables</CardTitle>
        <CardDescription>
          Stores the full setup (batches, faculty, rooms, subjects, constraints) together with the generated
          schedule so any judge or teammate can reopen it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name this timetable (e.g. Semester 3 — Final)"
            className="sm:max-w-sm"
          />
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CloudUpload className="mr-2 h-4 w-4" />}
              Save current
            </Button>
            <Button variant="outline" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>

        {!schedule && (
          <p className="text-xs text-muted-foreground">
            No schedule generated yet — saving now keeps the setup only.
          </p>
        )}

        {loading && rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing saved yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium">{row.name}</span>
                    <Badge variant={row.schedule ? "default" : "outline"}>
                      {row.schedule ? `${row.schedule.length} sessions` : "setup only"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onLoad(row.data, row.schedule ?? null);
                      toast.success("Timetable loaded", { description: row.name });
                    }}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" /> Open
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void remove(row.id)} aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
