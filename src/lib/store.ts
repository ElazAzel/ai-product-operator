'use client';

import { create } from 'zustand';
import { User, Module, Lesson, EvidenceCard, Artifact, Skill, WeeklyPlan, Review, Direction, LessonStatus, CompletionChecklist } from './types';
import { defaultUser, seedModules, seedLessons, defaultSkills } from './seed-data';
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
  currentLessonId: string | null;
  sidebarOpen: boolean;
  lessonChecklists: Record<string, CompletionChecklist>;
  lessonMoneyConnections: Record<string, string>;

  updateUser: (updates: Partial<User>) => void;
  updateModule: (id: string, updates: Partial<Module>) => void;
  updateLesson: (id: string, updates: Partial<Lesson>) => void;
  setCurrentLesson: (id: string | null) => void;
  startLesson: (id: string) => void;
  completeLesson: (id: string) => void;

  addEvidenceCard: (card: Omit<EvidenceCard, 'id' | 'created_at'>) => void;
  updateEvidenceCard: (id: string, updates: Partial<EvidenceCard>) => void;
  deleteEvidenceCard: (id: string) => void;

  addArtifact: (artifact: Omit<Artifact, 'id' | 'created_at'>) => void;
  updateArtifact: (id: string, updates: Partial<Artifact>) => void;
  deleteArtifact: (id: string) => void;

  updateSkill: (id: string, updates: Partial<Skill>) => void;

  addWeeklyPlan: (plan: Omit<WeeklyPlan, 'id' | 'created_at'>) => void;
  updateWeeklyPlan: (id: string, updates: Partial<WeeklyPlan>) => void;

  addReview: (review: Omit<Review, 'id' | 'created_at'>) => void;

  toggleSidebar: () => void;

  setLessonChecklist: (lessonId: string, checklist: CompletionChecklist) => void;
  setLessonMoneyConnection: (lessonId: string, text: string) => void;
  getLessonChecklist: (lessonId: string) => CompletionChecklist;
  getLessonMoneyConnection: (lessonId: string) => string;

  canCompleteLesson: (lessonId: string) => { canComplete: boolean; missing: string[] };

  getCourseProgress: () => number;
  getDirectionProgress: (direction: Direction) => number;
  getWeeklyHoursPlanned: () => number;
  getWeeklyHoursActual: () => number;
  getFirstIncompleteLesson: (moduleId: string) => Lesson | null;

  loadFromStorage: () => void;
  saveToStorage: () => void;
  resetData: () => void;
}

const STORAGE_KEY = 'ai-product-operator';

const defaultChecklist: CompletionChecklist = {
  practice_done: false,
  artifact_added: false,
  metric_specified: false,
  evidence_card_filled: false,
  application_selected: false,
  money_connection_written: false,
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
  currentLessonId: null,
  sidebarOpen: true,
  lessonChecklists: {},
  lessonMoneyConnections: {},

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
    const newLessons = state.lessons.map(l => l.id === id ? { ...l, status: 'completed' as LessonStatus } : l);
    const lesson = state.lessons.find(l => l.id === id);
    const newModules = lesson ? state.modules.map(m => {
      if (m.id === lesson.module_id) {
        const progress = calculateModuleProgress(newLessons, m.id);
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

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setLessonChecklist: (lessonId, checklist) => set((state) => {
    const newChecklists = { ...state.lessonChecklists, [lessonId]: checklist };
    setTimeout(() => get().saveToStorage(), 0);
    return { lessonChecklists: newChecklists };
  }),

  setLessonMoneyConnection: (lessonId, text) => set((state) => {
    const newConnections = { ...state.lessonMoneyConnections, [lessonId]: text };
    setTimeout(() => get().saveToStorage(), 0);
    return { lessonMoneyConnections: newConnections };
  }),

  getLessonChecklist: (lessonId) => {
    return get().lessonChecklists[lessonId] || { ...defaultChecklist };
  },

  getLessonMoneyConnection: (lessonId) => {
    return get().lessonMoneyConnections[lessonId] || '';
  },

  canCompleteLesson: (lessonId) => {
    const checklist = get().lessonChecklists[lessonId] || defaultChecklist;
    const missing: string[] = [];
    if (!checklist.practice_done) missing.push('Практика выполнена');
    if (!checklist.artifact_added) missing.push('Артефакт добавлен');
    if (!checklist.metric_specified) missing.push('Метрика указана');
    if (!checklist.evidence_card_filled) missing.push('Evidence Card заполнена');
    if (!checklist.application_selected) missing.push('Применение выбрано');
    if (!checklist.money_connection_written) missing.push('Вывод по деньгам / продукту / кейсу');
    return { canComplete: missing.length === 0, missing };
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

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        set({
          user: data.user || defaultUser,
          modules: data.modules || seedModules,
          lessons: data.lessons || seedLessons,
          evidenceCards: data.evidenceCards || [],
          artifacts: data.artifacts || [],
          skills: data.skills || defaultSkills,
          weeklyPlans: data.weeklyPlans || [],
          reviews: data.reviews || [],
          lessonChecklists: data.lessonChecklists || {},
          lessonMoneyConnections: data.lessonMoneyConnections || {},
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
        lessonChecklists: state.lessonChecklists,
        lessonMoneyConnections: state.lessonMoneyConnections,
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
      lessonChecklists: {},
      lessonMoneyConnections: {},
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
}));
