export type Direction = 'ai-services' | 'ai-products' | 'ai-teaching' | 'skill';
export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';
export type LessonStatus = 'not_started' | 'in_progress' | 'completed';
export type EvidenceStatus = 'draft' | 'submitted' | 'needs_revision' | 'approved' | 'waived';
export type ArtifactStatus = 'draft' | 'tested' | 'packaged' | 'published';
export type ArtifactType = 'prompt' | 'workflow' | 'offer' | 'case' | 'demo' | 'report' | 'automation' | 'lesson' | 'checklist' | 'api-spec' | 'rag-demo' | 'agent-blueprint';
export type CasePotential = 'yes' | 'no' | 'later';
export type UserRole = 'owner' | 'student' | 'mentor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  income_goal: number;
  weekly_hours_goal: number;
  active_directions: Direction[];
  theme: 'light' | 'dark';
  created_at: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  result: string;
  order_index: number;
  status: ModuleStatus;
  progress: number;
  artifact_count: number;
  evidence_count: number;
  market_rate: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  goal: string;
  mini_theory: string;
  practice: string;
  artifact_requirement: string;
  homework: string;
  metric: string;
  money_connection: string;
  eval_prompt: string;
  criteria_questions: string[];
  template_url: string;
  estimated_minutes: number;
  external_links: string[];
  application_area: Direction[];
  done_criteria: string;
  order_index: number;
  status: LessonStatus;
}

export interface EvidenceCard {
  id: string;
  user_id: string;
  lesson_id: string | null;
  module_id: string | null;
  date: string;
  direction: Direction;
  what_done: string;
  artifact: string;
  artifact_url: string;
  where_applied: string;
  metric: string;
  what_proven: string;
  what_not_proven: string;
  next_improvement: string;
  reflection: string;
  money_impact: string;
  money_amount: number;
  case_potential: CasePotential;
  status: EvidenceStatus;
  reviewer_id: string | null;
  review_comment: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface Artifact {
  id: string;
  user_id: string;
  lesson_id: string | null;
  title: string;
  type: ArtifactType;
  direction: Direction;
  description: string;
  url: string;
  status: ArtifactStatus;
  metric: string;
  created_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  description: string;
  score: number;
  confidence: number;
  last_artifact: string;
  main_gap: string;
  next_step: string;
  direction: Direction;
  market_rate_range: { min: number; max: number };
  updated_at: string;
}

export interface WeeklyPlan {
  id: string;
  user_id: string;
  week_start: string;
  focus: string;
  skill: string;
  artifact_goal: string;
  tasks: string[];
  material: string;
  experiment: string;
  metric: string;
  application_area: Direction[];
  planned_hours: number;
  actual_hours: number;
  weekly_reflection: string;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  artifacts_created: string;
  metrics_achieved: string;
  money_result: string;
  what_worked: string;
  what_failed: string;
  what_to_remove: string;
  what_to_improve: string;
  next_focus: string;
  created_at: string;
}

export interface Offer {
  id: string;
  user_id: string;
  title: string;
  direction: Direction;
  price: number;
  description: string;
  status: 'draft' | 'active' | 'paused';
  related_artifacts: string[];
  created_at: string;
}

export interface IncomeEntry {
  id: string;
  user_id: string;
  date: string;
  direction: Direction;
  amount: number;
  description: string;
  source: string;
  hours_spent: number;
  created_at: string;
}

export interface CompletionChecklist {
  criteria_1: boolean;
  criteria_2: boolean;
  criteria_3: boolean;
  artifact_added: boolean;
  evidence_card_filled: boolean;
}

export interface Certification {
  id: string;
  title: string;
  provider: string;
  url: string;
  cost: string;
  level: 'free' | 'paid' | 'premium';
  module_id: string | null;
  order_index: number;
  description: string;
  skills: string[];
  created_at: string;
}

export interface CertificationEvidenceCard {
  id: string;
  user_id: string;
  certification_id: string;
  certification_title: string;
  provider: string;
  date_completed: string;
  url: string;
  reflection: string;
  linked: boolean;
  created_at: string;
}
