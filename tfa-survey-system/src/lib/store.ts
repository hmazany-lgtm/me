"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RespondentRole, Sector, CompanySize, SurveyQuestion } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

interface SurveyStore {
  sessionId: string;
  language: "en" | "ar";
  role: RespondentRole | null;
  sector: Sector | null;
  companySize: CompanySize | null;
  currentStep: number;
  answers: Record<string, string | string[] | number>;
  visibleQuestions: SurveyQuestion[];
  isSubmitting: boolean;
  isComplete: boolean;

  setLanguage: (lang: "en" | "ar") => void;
  setRole: (role: RespondentRole) => void;
  setSector: (sector: Sector) => void;
  setCompanySize: (size: CompanySize) => void;
  setAnswer: (questionId: string, value: string | string[] | number) => void;
  setVisibleQuestions: (questions: SurveyQuestion[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setSubmitting: (v: boolean) => void;
  setComplete: (v: boolean) => void;
  reset: () => void;
}

export const useSurveyStore = create<SurveyStore>()(
  persist(
    (set) => ({
      sessionId: uuidv4(),
      language: "en",
      role: null,
      sector: null,
      companySize: null,
      currentStep: 0,
      answers: {},
      visibleQuestions: [],
      isSubmitting: false,
      isComplete: false,

      setLanguage: (lang) => set({ language: lang }),
      setRole: (role) => set({ role }),
      setSector: (sector) => set({ sector }),
      setCompanySize: (size) => set({ companySize: size }),
      setAnswer: (questionId, value) =>
        set((s) => ({ answers: { ...s.answers, [questionId]: value } })),
      setVisibleQuestions: (questions) => set({ visibleQuestions: questions }),
      nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
      prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
      goToStep: (step) => set({ currentStep: step }),
      setSubmitting: (v) => set({ isSubmitting: v }),
      setComplete: (v) => set({ isComplete: v }),
      reset: () =>
        set({
          sessionId: uuidv4(),
          role: null,
          sector: null,
          companySize: null,
          currentStep: 0,
          answers: {},
          visibleQuestions: [],
          isSubmitting: false,
          isComplete: false,
        }),
    }),
    {
      name: "tfa-survey-session",
      partialize: (s) => ({
        sessionId: s.sessionId,
        language: s.language,
        role: s.role,
        sector: s.sector,
        companySize: s.companySize,
        currentStep: s.currentStep,
        answers: s.answers,
      }),
    }
  )
);

// ─── Admin Store ──────────────────────────────────────────────────────────────

import { SurveyQuestion as Q } from "@/lib/types";
import { INITIAL_QUESTIONS } from "@/data/questions";

interface AdminStore {
  questions: Q[];
  selectedQuestionId: string | null;
  previewRole: RespondentRole | null;
  previewLanguage: "en" | "ar";
  unsavedChanges: boolean;

  setQuestions: (qs: Q[]) => void;
  addQuestion: (q: Q) => void;
  updateQuestion: (id: string, updates: Partial<Q>) => void;
  deleteQuestion: (id: string) => void;
  reorderQuestions: (orderedIds: string[]) => void;
  selectQuestion: (id: string | null) => void;
  setPreviewRole: (role: RespondentRole | null) => void;
  setPreviewLanguage: (lang: "en" | "ar") => void;
  setUnsavedChanges: (v: boolean) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      questions: INITIAL_QUESTIONS,
      selectedQuestionId: null,
      previewRole: null,
      previewLanguage: "en",
      unsavedChanges: false,

      setQuestions: (qs) => set({ questions: qs }),
      addQuestion: (q) =>
        set((s) => ({ questions: [...s.questions, q], unsavedChanges: true })),
      updateQuestion: (id, updates) =>
        set((s) => ({
          questions: s.questions.map((q) =>
            q.id === id
              ? {
                  ...q,
                  ...updates,
                  version: q.version + 1,
                  updatedAt: new Date().toISOString(),
                }
              : q
          ),
          unsavedChanges: true,
        })),
      deleteQuestion: (id) =>
        set((s) => ({
          questions: s.questions.filter((q) => q.id !== id),
          unsavedChanges: true,
        })),
      reorderQuestions: (orderedIds) =>
        set((s) => ({
          questions: orderedIds.map((id, idx) => {
            const q = s.questions.find((q) => q.id === id)!;
            return { ...q, order: idx + 1 };
          }),
          unsavedChanges: true,
        })),
      selectQuestion: (id) => set({ selectedQuestionId: id }),
      setPreviewRole: (role) => set({ previewRole: role }),
      setPreviewLanguage: (lang) => set({ previewLanguage: lang }),
      setUnsavedChanges: (v) => set({ unsavedChanges: v }),
    }),
    {
      name: "tfa-admin-store",
    }
  )
);
