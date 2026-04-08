CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reminder_type TEXT NOT NULL,
  offset_minutes INTEGER,
  exact_datetime TIMESTAMPTZ,
  channels JSONB DEFAULT '["push", "email"]',
  fired BOOLEAN DEFAULT false,
  field_timestamps JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_reminders_user ON public.reminders(user_id);
CREATE INDEX idx_reminders_target ON public.reminders(target_type, target_id);
CREATE INDEX idx_reminders_unfired ON public.reminders(fired, exact_datetime) WHERE fired = false;

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own reminders"
  ON public.reminders FOR ALL USING (auth.uid() = user_id);
