export type Direction = 'ai-services' | 'linkmax' | 'academy' | 'skill';
export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';
export type LessonStatus = 'not_started' | 'in_progress' | 'completed';
export type EvidenceStatus = 'draft' | 'validated' | 'case-ready';
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
  case_potential: CasePotential;
  status: EvidenceStatus;
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
  score: number;
  confidence: number;
  last_artifact: string;
  main_gap: string;
  next_step: string;
  direction: Direction;
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

export interface CompletionChecklist {
  practice_done: boolean;
  artifact_added: boolean;
  metric_specified: boolean;
  evidence_card_filled: boolean;
  application_selected: boolean;
  money_connection_written: boolean;
}
