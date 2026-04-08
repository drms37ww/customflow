CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  recurrence JSONB,
  source TEXT DEFAULT 'standalone',
  source_id UUID,
  field_timestamps JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_ce_user ON public.calendar_events(user_id);
CREATE INDEX idx_ce_date ON public.calendar_events(event_date);
CREATE INDEX idx_ce_source ON public.calendar_events(source, source_id);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own events"
  ON public.calendar_events FOR ALL USING (auth.uid() = user_id);

-- Event-Label junction
CREATE TABLE public.calendar_event_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.labels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, label_id)
);

ALTER TABLE public.calendar_event_labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own event labels"
  ON public.calendar_event_labels FOR ALL USING (auth.uid() = user_id);
