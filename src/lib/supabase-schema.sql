-- Supabase Schema for AI Product Operator

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('owner', 'student', 'mentor', 'admin')),
  income_goal BIGINT DEFAULT 1000000,
  weekly_hours_goal INT DEFAULT 15,
  active_directions TEXT[] DEFAULT ARRAY['ai-services', 'ai-products', 'ai-teaching'],
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Modules table
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  result TEXT,
  order_index INT NOT NULL UNIQUE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  artifact_count INT DEFAULT 0,
  evidence_count INT DEFAULT 0
);

-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  goal TEXT,
  mini_theory TEXT,
  practice TEXT,
  artifact_requirement TEXT,
  homework TEXT,
  metric TEXT,
  application_area TEXT[] DEFAULT ARRAY['ai-services'],
  done_criteria TEXT,
  order_index INT NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  UNIQUE(module_id, order_index)
);

-- Evidence Cards table
CREATE TABLE evidence_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('ai-services', 'ai-products', 'ai-teaching', 'skill')),
  what_done TEXT,
  artifact TEXT,
  artifact_url TEXT,
  where_applied TEXT,
  metric TEXT,
  what_proven TEXT,
  what_not_proven TEXT,
  next_improvement TEXT,
  case_potential TEXT DEFAULT 'later' CHECK (case_potential IN ('yes', 'no', 'later')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'case-ready')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Artifacts table
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('prompt', 'workflow', 'offer', 'case', 'demo', 'report', 'automation', 'lesson', 'checklist', 'api-spec', 'rag-demo', 'agent-blueprint')),
  direction TEXT NOT NULL CHECK (direction IN ('ai-services', 'ai-products', 'ai-teaching', 'skill')),
  description TEXT,
  url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'tested', 'packaged', 'published')),
  metric TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Skills table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  score INT DEFAULT 0 CHECK (score >= 0 AND score <= 5),
  confidence INT DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 5),
  last_artifact TEXT,
  main_gap TEXT,
  next_step TEXT,
  direction TEXT CHECK (direction IN ('ai-services', 'ai-products', 'ai-teaching', 'skill')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Weekly Plans table
CREATE TABLE weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  focus TEXT,
  skill TEXT,
  artifact_goal TEXT,
  tasks TEXT[],
  material TEXT,
  experiment TEXT,
  metric TEXT,
  application_area TEXT[] DEFAULT ARRAY['ai-services'],
  planned_hours INT DEFAULT 15,
  actual_hours INT DEFAULT 0,
  weekly_reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  artifacts_created TEXT,
  metrics_achieved TEXT,
  money_result TEXT,
  what_worked TEXT,
  what_failed TEXT,
  what_to_remove TEXT,
  what_to_improve TEXT,
  next_focus TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Offers table
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('ai-services', 'ai-products', 'ai-teaching')),
  price BIGINT,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  related_artifacts UUID[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_evidence_cards_user ON evidence_cards(user_id);
CREATE INDEX idx_evidence_cards_lesson ON evidence_cards(lesson_id);
CREATE INDEX idx_evidence_cards_direction ON evidence_cards(direction);
CREATE INDEX idx_artifacts_user ON artifacts(user_id);
CREATE INDEX idx_artifacts_lesson ON artifacts(lesson_id);
CREATE INDEX idx_skills_user ON skills(user_id);
CREATE INDEX idx_weekly_plans_user ON weekly_plans(user_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Policies (single user MVP - owner access)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own evidence cards" ON evidence_cards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own artifacts" ON artifacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own skills" ON skills FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own weekly plans" ON weekly_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own reviews" ON reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own offers" ON offers FOR ALL USING (auth.uid() = user_id);

-- Public read for modules and lessons
CREATE POLICY "Anyone can view modules" ON modules FOR SELECT USING (true);
CREATE POLICY "Anyone can view lessons" ON lessons FOR SELECT USING (true);
