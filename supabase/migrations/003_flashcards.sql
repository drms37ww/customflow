-- Folders
CREATE TABLE public.flashcard_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.flashcard_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  field_timestamps JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_ff_user ON public.flashcard_folders(user_id);
CREATE INDEX idx_ff_parent ON public.flashcard_folders(parent_id);

ALTER TABLE public.flashcard_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own folders"
  ON public.flashcard_folders FOR ALL USING (auth.uid() = user_id);

-- Decks
CREATE TABLE public.flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.flashcard_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_mode TEXT DEFAULT 'front_first',
  starred BOOLEAN DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  field_timestamps JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_fd_user ON public.flashcard_decks(user_id);
CREATE INDEX idx_fd_folder ON public.flashcard_decks(folder_id);

ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own decks"
  ON public.flashcard_decks FOR ALL USING (auth.uid() = user_id);

-- Deck-Label junction
CREATE TABLE public.flashcard_deck_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.labels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(deck_id, label_id)
);

ALTER TABLE public.flashcard_deck_labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own deck labels"
  ON public.flashcard_deck_labels FOR ALL USING (auth.uid() = user_id);

-- Cards
CREATE TABLE public.flashcard_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  front_text TEXT DEFAULT '',
  back_text TEXT DEFAULT '',
  front_image_id UUID,
  back_image_id UUID,
  sort_order INTEGER NOT NULL DEFAULT 0,
  fsrs_state TEXT DEFAULT 'new',
  fsrs_stability REAL DEFAULT 0,
  fsrs_difficulty REAL DEFAULT 0,
  fsrs_due TIMESTAMPTZ,
  fsrs_last_review TIMESTAMPTZ,
  fsrs_reps INTEGER DEFAULT 0,
  fsrs_lapses INTEGER DEFAULT 0,
  fsrs_elapsed_days INTEGER DEFAULT 0,
  fsrs_scheduled_days INTEGER DEFAULT 0,
  field_timestamps JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_fc_user ON public.flashcard_cards(user_id);
CREATE INDEX idx_fc_deck ON public.flashcard_cards(deck_id);
CREATE INDEX idx_fc_due ON public.flashcard_cards(fsrs_due);

ALTER TABLE public.flashcard_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cards"
  ON public.flashcard_cards FOR ALL USING (auth.uid() = user_id);
