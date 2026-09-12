CREATE TABLE public.saved_timetables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  schedule JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_timetables TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_timetables TO authenticated;
GRANT ALL ON public.saved_timetables TO service_role;

ALTER TABLE public.saved_timetables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Demo mode: anyone can read saved timetables"
  ON public.saved_timetables FOR SELECT USING (true);
CREATE POLICY "Demo mode: anyone can save timetables"
  ON public.saved_timetables FOR INSERT WITH CHECK (true);
CREATE POLICY "Demo mode: anyone can update saved timetables"
  ON public.saved_timetables FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Demo mode: anyone can delete saved timetables"
  ON public.saved_timetables FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_saved_timetables_updated_at
BEFORE UPDATE ON public.saved_timetables
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();