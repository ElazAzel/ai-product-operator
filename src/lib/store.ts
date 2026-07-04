'use client';

import { create } from 'zustand';
import { User, Module, Lesson, EvidenceCard, Artifact, Skill, WeeklyPlan, Review, Direction, LessonStatus, EvidenceStatus, CompletionChecklist, IncomeEntry, Certification, CertificationEvidenceCard } from './types';
import { defaultUser, seedModules, seedLessons, defaultSkills, seedCertifications } from './seed-data';
import { generateId, calculateModuleProgress } from './utils';

interface AppState {
  user: User;
  modules: Module[];
  lessons: Lesson[];
  evidenceCards: EvidenceCard[];
  artifacts: Artifact[];
  skills: Skill[];
  weeklyPlans: WeeklyPlan[];
  reviews: Review[];
  incomeEntries: IncomeEntry[];
  certifications: Certification[];
  certificationCards: CertificationEvidenceCard[];
  currentLessonId: string | null;
  sidebarOpen: boolean;
  lessonChecklists: Record<string, CompletionChecklist>;

  updateUser: (updates: Partial<User>) => void;
  updateModule: (id: string, updates: Partial<Module>) => void;
  updateLesson: (id: string, updates: Partial<Lesson>) => void;
  setCurrentLesson: (id: string | null) => void;
  startLesson: (id: string) => void;
  completeLesson: (id: string) => void;

  addEvidenceCard: (card: Omit<EvidenceCard, 'id' | 'created_at'>) => void;
  updateEvidenceCard: (id: string, updates: Partial<EvidenceCard>) => void;
  deleteEvidenceCard: (id: string) => void;
  submitEvidenceForReview: (id: string) => void;
  approveEvidence: (id: string, reviewerId: string, comment?: string) => void;
  requestEvidenceRevision: (id: string, reviewerId: string, comment: string) => void;

  addArtifact: (artifact: Omit<Artifact, 'id' | 'created_at'>) => void;
  updateArtifact: (id: string, updates: Partial<Artifact>) => void;
  deleteArtifact: (id: string) => void;

  updateSkill: (id: string, updates: Partial<Skill>) => void;

  addWeeklyPlan: (plan: Omit<WeeklyPlan, 'id' | 'created_at'>) => void;
  updateWeeklyPlan: (id: string, updates: Partial<WeeklyPlan>) => void;

  addReview: (review: Omit<Review, 'id' | 'created_at'>) => void;

  addIncomeEntry: (entry: Omit<IncomeEntry, 'id' | 'created_at'>) => void;
  deleteIncomeEntry: (id: string) => void;

  addCertificationCard: (card: Omit<CertificationEvidenceCard, 'id' | 'created_at'>) => void;
  deleteCertificationCard: (id: string) => void;

  toggleSidebar: () => void;

  setLessonChecklist: (lessonId: string, checklist: CompletionChecklist) => void;
  getLessonChecklist: (lessonId: string) => CompletionChecklist;

  canCompleteLesson: (lessonId: string) => { canComplete: boolean; missing: string[] };
  getEvidenceForLesson: (lessonId: string) => EvidenceCard[];
  getPendingEvidence: () => EvidenceCard[];

  getCourseProgress: () => number;
  getDirectionProgress: (direction: Direction) => number;
  getWeeklyHoursPlanned: () => number;
  getWeeklyHoursActual: () => number;
  getFirstIncompleteLesson: (moduleId: string) => Lesson | null;
  getTotalIncome: () => number;
  getIncomeByDirection: (direction: Direction) => number;

  loadFromStorage: () => void;
  saveToStorage: () => void;
  resetData: () => void;
}

const STORAGE_KEY = 'ai-product-operator';

const defaultChecklist: CompletionChecklist = {
  criteria_1: false,
  criteria_2: false,
  criteria_3: false,
  artifact_added: false,
  evidence_card_filled: false,
};

export const useStore = create<AppState>((set, get) => ({
  user: defaultUser,
  modules: seedModules,
  lessons: seedLessons,
  evidenceCards: [],
  artifacts: [],
  skills: defaultSkills,
  weeklyPlans: [],
  reviews: [],
  incomeEntries: [],
  certifications: seedCertifications,
  certificationCards: [],
  currentLessonId: null,
  sidebarOpen: true,
  lessonChecklists: {},

  updateUser: (updates) => set((state) => {
    const newUser = { ...state.user, ...updates };
    setTimeout(() => get().saveToStorage(), 0);
    return { user: newUser };
  }),

  updateModule: (id, updates) => set((state) => {
    const newModules = state.modules.map(m => m.id === id ? { ...m, ...updates } : m);
    setTimeout(() => get().saveToStorage(), 0);
    return { modules: newModules };
  }),

  updateLesson: (id, updates) => set((state) => {
    const newLessons = state.lessons.map(l => l.id === id ? { ...l, ...updates } : l);
    setTimeout(() => get().saveToStorage(), 0);
    return { lessons: newLessons };
  }),

  setCurrentLesson: (id) => set({ currentLessonId: id }),

  startLesson: (id) => set((state) => {
    const lesson = state.lessons.find(l => l.id === id);
    if (!lesson || lesson.status === 'completed') return {};
    const newLessons = state.lessons.map(l => l.id === id && l.status === 'not_started' ? { ...l, status: 'in_progress' as LessonStatus } : l);
    const newModules = state.modules.map(m => {
      if (m.id === lesson?.module_id && m.status === 'not_started') {
        return { ...m, status: 'in_progress' as const };
      }
      return m;
    });
    setTimeout(() => get().saveToStorage(), 0);
    return { lessons: newLessons, modules: newModules };
  }),

  completeLesson: (id) => set((state) => {
    const hasApprovedEvidence = state.evidenceCards.some(e => e.lesson_id === id && e.status === 'approved');
    if (!hasApprovedEvidence) return {};
    const newLessons = state.lessons.map(l => l.id === id ? { ...l, status: 'completed' as LessonStatus } : l);
    const lesson = state.lessons.find(l => l.id === id);
    const newModules = lesson ? state.modules.map(m => {
      if (m.id === lesson.module_id) {
        const evidenceIds = newLessons.filter(l => l.module_id === m.id).map(l => l.id);
        const approvedEvidenceCount = state.evidenceCards.filter(e => evidenceIds.includes(e.lesson_id || '') && e.status === 'approved').length;
        const totalLessons = newLessons.filter(l => l.module_id === m.id).length;
        const progress = totalLessons > 0 ? Math.round((approvedEvidenceCount / totalLessons) * 100) : 0;
        const allCompleted = newLessons.filter(l => l.module_id === m.id).every(l => l.status === 'completed');
        const moduleEvidence = state.evidenceCards.filter(e => e.module_id === m.id).length;
        const moduleArtifacts = state.artifacts.filter(a => {
          const aLesson = state.lessons.find(l => l.id === a.lesson_id);
          return aLesson?.module_id === m.id;
        }).length;
        return {
          ...m,
          progress,
          artifact_count: moduleArtifacts,
          evidence_count: moduleEvidence,
          status: allCompleted ? 'completed' as const : progress > 0 ? 'in_progress' as const : m.status,
        };
      }
      return m;
    }) : state.modules;
    setTimeout(() => get().saveToStorage(), 0);
    return { lessons: newLessons, modules: newModules };
  }),

  addEvidenceCard: (card) => set((state) => {
    const newCard: EvidenceCard = {
      ...card,
      id: generateId(),
      created_at: new Date().toISOString(),
      reflection: card.reflection || '',
      money_impact: card.money_impact || '',
      money_amount: card.money_amount || 0,
      reviewer_id: card.reviewer_id || null,
      review_comment: card.review_comment || null,
      submitted_at: card.status === 'submitted' ? new Date().toISOString() : null,
      approved_at: card.approved_at || null,
    };
    const newModules = card.module_id ? state.modules.map(m => {
      if (m.id === card.module_id) {
        return { ...m, evidence_count: state.evidenceCards.filter(e => e.module_id === m.id).length + 1 };
      }
      return m;
    }) : state.modules;
    setTimeout(() => get().saveToStorage(), 0);
    return { evidenceCards: [...state.evidenceCards, newCard], modules: newModules };
  }),

  updateEvidenceCard: (id, updates) => set((state) => {
    const newCards = state.evidenceCards.map(c => c.id === id ? { ...c, ...updates } : c);
    setTimeout(() => get().saveToStorage(), 0);
    return { evidenceCards: newCards };
  }),

  deleteEvidenceCard: (id) => set((state) => {
    const card = state.evidenceCards.find(c => c.id === id);
    const newModules = card?.module_id ? state.modules.map(m => {
      if (m.id === card.module_id) {
        return { ...m, evidence_count: Math.max(0, m.evidence_count - 1) };
      }
      return m;
    }) : state.modules;
    setTimeout(() => get().saveToStorage(), 0);
    return { evidenceCards: state.evidenceCards.filter(c => c.id !== id), modules: newModules };
  }),

  submitEvidenceForReview: (id) => set((state) => {
    const newCards = state.evidenceCards.map(c => c.id === id && c.status === 'draft' ? {
      ...c,
      status: 'submitted' as EvidenceStatus,
      submitted_at: new Date().toISOString(),
    } : c);
    setTimeout(() => get().saveToStorage(), 0);
    return { evidenceCards: newCards };
  }),

  approveEvidence: (id, reviewerId, comment) => set((state) => {
    const newCards = state.evidenceCards.map(c => c.id === id && c.status === 'submitted' ? {
      ...c,
      status: 'approved' as EvidenceStatus,
      reviewer_id: reviewerId,
      review_comment: comment || null,
      approved_at: new Date().toISOString(),
    } : c);
    setTimeout(() => get().saveToStorage(), 0);
    return { evidenceCards: newCards };
  }),

  requestEvidenceRevision: (id, reviewerId, comment) => set((state) => {
    const newCards = state.evidenceCards.map(c => c.id === id && c.status === 'submitted' ? {
      ...c,
      status: 'needs_revision' as EvidenceStatus,
      reviewer_id: reviewerId,
      review_comment: comment,
    } : c);
    setTimeout(() => get().saveToStorage(), 0);
    return { evidenceCards: newCards };
  }),

  addArtifact: (artifact) => set((state) => {
    const newArtifact: Artifact = {
      ...artifact,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    setTimeout(() => get().saveToStorage(), 0);
    return { artifacts: [...state.artifacts, newArtifact] };
  }),

  updateArtifact: (id, updates) => set((state) => {
    const newArtifacts = state.artifacts.map(a => a.id === id ? { ...a, ...updates } : a);
    setTimeout(() => get().saveToStorage(), 0);
    return { artifacts: newArtifacts };
  }),

  deleteArtifact: (id) => set((state) => {
    setTimeout(() => get().saveToStorage(), 0);
    return { artifacts: state.artifacts.filter(a => a.id !== id) };
  }),

  updateSkill: (id, updates) => set((state) => {
    const newSkills = state.skills.map(s => s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s);
    setTimeout(() => get().saveToStorage(), 0);
    return { skills: newSkills };
  }),

  addWeeklyPlan: (plan) => set((state) => {
    const newPlan: WeeklyPlan = {
      ...plan,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    setTimeout(() => get().saveToStorage(), 0);
    return { weeklyPlans: [...state.weeklyPlans, newPlan] };
  }),

  updateWeeklyPlan: (id, updates) => set((state) => {
    const newPlans = state.weeklyPlans.map(p => p.id === id ? { ...p, ...updates } : p);
    setTimeout(() => get().saveToStorage(), 0);
    return { weeklyPlans: newPlans };
  }),

  addReview: (review) => set((state) => {
    const newReview: Review = {
      ...review,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    setTimeout(() => get().saveToStorage(), 0);
    return { reviews: [...state.reviews, newReview] };
  }),

  addIncomeEntry: (entry) => set((state) => {
    const newEntry: IncomeEntry = {
      ...entry,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    setTimeout(() => get().saveToStorage(), 0);
    return { incomeEntries: [...state.incomeEntries, newEntry] };
  }),

  deleteIncomeEntry: (id) => set((state) => {
    setTimeout(() => get().saveToStorage(), 0);
    return { incomeEntries: state.incomeEntries.filter(e => e.id !== id) };
  }),

  addCertificationCard: (card) => set((state) => {
    const newCard: CertificationEvidenceCard = {
      ...card,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    setTimeout(() => get().saveToStorage(), 0);
    return { certificationCards: [...state.certificationCards, newCard] };
  }),

  deleteCertificationCard: (id) => set((state) => {
    setTimeout(() => get().saveToStorage(), 0);
    return { certificationCards: state.certificationCards.filter(c => c.id !== id) };
  }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setLessonChecklist: (lessonId, checklist) => set((state) => {
    const newChecklists = { ...state.lessonChecklists, [lessonId]: checklist };
    setTimeout(() => get().saveToStorage(), 0);
    return { lessonChecklists: newChecklists };
  }),

  getLessonChecklist: (lessonId) => {
    return get().lessonChecklists[lessonId] || { ...defaultChecklist };
  },

  canCompleteLesson: (lessonId) => {
    const checklist = get().lessonChecklists[lessonId] || defaultChecklist;
    const lesson = get().lessons.find(l => l.id === lessonId);
    const evidence = get().evidenceCards.filter(e => e.lesson_id === lessonId);
    const hasApprovedEvidence = evidence.some(e => e.status === 'approved');
    const hasSubmittedEvidence = evidence.some(e => e.status === 'submitted');
    const missing: string[] = [];
    if (!checklist.evidence_card_filled && !hasSubmittedEvidence) missing.push('Evidence Card не заполнена');
    if (!checklist.artifact_added) missing.push('Артефакт не добавлен');
    if (!hasApprovedEvidence) {
      if (hasSubmittedEvidence) {
        missing.push('Evidence Card ожидает проверки');
      } else if (!checklist.evidence_card_filled) {
        missing.push('Заполни Evidence Card и отправь на проверку');
      } else {
        missing.push('Отправь Evidence Card на проверку');
      }
    }
    return { canComplete: missing.length === 0 && hasApprovedEvidence, missing };
  },

  getEvidenceForLesson: (lessonId) => {
    return get().evidenceCards.filter(e => e.lesson_id === lessonId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getPendingEvidence: () => {
    return get().evidenceCards.filter(e => e.status === 'submitted').sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  getCourseProgress: () => {
    const modules = get().modules;
    if (modules.length === 0) return 0;
    const total = modules.reduce((sum, m) => sum + m.progress, 0);
    return Math.round(total / modules.length);
  },

  getDirectionProgress: (direction) => {
    const lessons = get().lessons;
    const relevantLessons = lessons.filter(l => l.application_area.includes(direction));
    if (relevantLessons.length === 0) return 0;
    const completed = relevantLessons.filter(l => l.status === 'completed').length;
    return Math.round((completed / relevantLessons.length) * 100);
  },

  getWeeklyHoursPlanned: () => {
    const plans = get().weeklyPlans;
    const now = new Date();
    const currentWeek = plans.find(p => {
      const start = new Date(p.week_start);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return now >= start && now < end;
    });
    return currentWeek?.planned_hours || 0;
  },

  getWeeklyHoursActual: () => {
    const plans = get().weeklyPlans;
    const now = new Date();
    const currentWeek = plans.find(p => {
      const start = new Date(p.week_start);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return now >= start && now < end;
    });
    return currentWeek?.actual_hours || 0;
  },

  getFirstIncompleteLesson: (moduleId) => {
    const lessons = get().lessons.filter(l => l.module_id === moduleId);
    return lessons.find(l => l.status !== 'completed') || null;
  },

  getTotalIncome: () => {
    return get().incomeEntries.reduce((sum, e) => sum + e.amount, 0);
  },

  getIncomeByDirection: (direction) => {
    return get().incomeEntries.filter(e => e.direction === direction).reduce((sum, e) => sum + e.amount, 0);
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const mergedLessons = seedLessons.map(seed => {
          const stored = data.lessons?.find((l: { id: string }) => l.id === seed.id);
          return stored ? { ...seed, ...stored } : seed;
        });
        const mergedModules = seedModules.map(seed => {
          const stored = data.modules?.find((m: { id: string }) => m.id === seed.id);
          return stored ? { ...seed, ...stored } : seed;
        });
        const mergedSkills = defaultSkills.map(seed => {
          const stored = data.skills?.find((s: { id: string }) => s.id === seed.id);
          return stored ? { ...seed, ...stored } : seed;
        });
        set({
          user: data.user ? { ...defaultUser, ...data.user } : defaultUser,
          modules: data.modules ? mergedModules : seedModules,
          lessons: data.lessons ? mergedLessons : seedLessons,
          evidenceCards: data.evidenceCards || [],
          artifacts: data.artifacts || [],
          skills: data.skills ? mergedSkills : defaultSkills,
          weeklyPlans: data.weeklyPlans || [],
          reviews: data.reviews || [],
          incomeEntries: data.incomeEntries || [],
          certifications: data.certifications || seedCertifications,
          certificationCards: data.certificationCards || [],
          lessonChecklists: data.lessonChecklists || {},
        });
      }
    } catch (e) {
      console.error('Failed to load from storage:', e);
    }
  },

  saveToStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const state = get();
      const data = {
        user: state.user,
        modules: state.modules,
        lessons: state.lessons,
        evidenceCards: state.evidenceCards,
        artifacts: state.artifacts,
        skills: state.skills,
        weeklyPlans: state.weeklyPlans,
        reviews: state.reviews,
        incomeEntries: state.incomeEntries,
        certifications: state.certifications,
        certificationCards: state.certificationCards,
        lessonChecklists: state.lessonChecklists,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to storage:', e);
    }
  },

  resetData: () => {
    set({
      user: defaultUser,
      modules: seedModules,
      lessons: seedLessons,
      evidenceCards: [],
      artifacts: [],
      skills: defaultSkills,
      weeklyPlans: [],
      reviews: [],
      incomeEntries: [],
      certifications: seedCertifications,
      certificationCards: [],
      lessonChecklists: {},
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
}));
