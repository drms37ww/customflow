CREATE TABLE public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.todos(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  due_time TIME,
  priority INTEGER DEFAULT 0,
  starred BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  url_links JSONB DEFAULT '[]',
  recurrence JSONB,
  linked_deck_id UUID REFERENCES public.flashcard_decks(id) ON DELETE SET NULL,
  linked_folder_id UUID REFERENCES public.flashcard_folders(id) ON DELETE SET NULL,
  has_attachments BOOLEAN DEFAULT false,
  field_timestamps JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_todos_user ON public.todos(user_id);
CREATE INDEX idx_todos_parent ON public.todos(parent_id);
CREATE INDEX idx_todos_due ON public.todos(due_date);
CREATE INDEX idx_todos_completed ON public.todos(completed);

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own todos"
  ON public.todos FOR ALL USING (auth.uid() = user_id);

-- Todo-Label junction
CREATE TABLE public.todo_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id UUID NOT NULL REFERENCES public.todos(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.labels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(todo_id, label_id)
);

ALTER TABLE public.todo_labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own todo labels"
  ON public.todo_labels FOR ALL USING (auth.uid() = user_id);

-- Custom tabs
CREATE TABLE public.todo_tabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filter_config JSONB NOT NULL DEFAULT '{"logic": "AND", "conditions": []}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  field_timestamps JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.todo_tabs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tabs"
  ON public.todo_tabs FOR ALL USING (auth.uid() = user_id);
