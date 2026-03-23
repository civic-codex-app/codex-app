-- Public submissions: contact, suggest politician, update politician, report error, submit tip
CREATE TABLE IF NOT EXISTS public_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- contact, suggest_politician, update_politician, report_error, submit_tip
  status TEXT NOT NULL DEFAULT 'new', -- new, reviewed, resolved, dismissed
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT,
  email TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public_submissions ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage public_submissions"
  ON public_submissions FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert public_submissions"
  ON public_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can see their own submissions
CREATE POLICY "Users can see own submissions"
  ON public_submissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
