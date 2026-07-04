/**
 * RBAC engine — granular permissions, the role→permission matrix, and the
 * Segregation-of-Duties (SoD) rules. This is the single source of truth that
 * the roles matrix in ARCHITECTURE.md documents.
 *
 * `scope` on a grant:
 *   "full"      → unrestricted
 *   "masked"    → allowed but content is masked / aggregated only
 *   "assigned"  → limited to assigned certifications / centers / vendor
 *   "self"      → limited to the acting user's own records
 */
import type { PermissionKey, Role, RoleKey, Permission } from "./types";

export type Scope = "full" | "masked" | "assigned" | "self";

export const ROLES: Record<RoleKey, Role> = {
  sys_admin: { key: "sys_admin", name: "System Administrator", description: "Platform configuration, users, and security. Not an exam-content authority.", isSystem: true },
  exam_ops_manager: { key: "exam_ops_manager", name: "Exam Operations Manager", description: "Scheduling, hosting, centers, invigilation oversight.", isSystem: false },
  certification_manager: { key: "certification_manager", name: "Certification Manager", description: "Owns certifications, blueprints, candidate lifecycle, result release.", isSystem: false },
  question_author: { key: "question_author", name: "Question Author (SME)", description: "Drafts questions. Cannot approve own work.", isSystem: false },
  question_reviewer: { key: "question_reviewer", name: "Question Reviewer", description: "Technical / language review of questions.", isSystem: false },
  psychometrician: { key: "psychometrician", name: "Psychometrician", description: "Item analysis, blueprint validity, question-bank health.", isSystem: false },
  committee_approver: { key: "committee_approver", name: "Exam Committee Approver", description: "Governance: approves questions, forms, result release.", isSystem: false },
  invigilator: { key: "invigilator", name: "Invigilator / Proctor", description: "Runs live sessions. No question-bank access.", isSystem: false },
  candidate: { key: "candidate", name: "Candidate", description: "Sits exams, views own results and certificates.", isSystem: false },
  auditor: { key: "auditor", name: "Auditor", description: "Read-only access to audit, security, and reports.", isSystem: false },
  executive: { key: "executive", name: "Executive Viewer", description: "Aggregated dashboards and reports only.", isSystem: false },
  vendor: { key: "vendor", name: "Vendor (limited)", description: "Sees only assigned operational data.", isSystem: false },
};

export const PERMISSIONS: Record<PermissionKey, Permission> = {
  view_question: { key: "view_question", name: "View question stem", category: "content", sensitivity: "high" },
  view_correct_answer: { key: "view_correct_answer", name: "View correct answer", category: "content", sensitivity: "high" },
  edit_question: { key: "edit_question", name: "Edit question", category: "content", sensitivity: "high" },
  approve_question: { key: "approve_question", name: "Approve question", category: "content", sensitivity: "high" },
  export_question: { key: "export_question", name: "Export question", category: "content", sensitivity: "high" },
  generate_exam_form: { key: "generate_exam_form", name: "Generate exam form", category: "assembly", sensitivity: "high" },
  approve_exam_form: { key: "approve_exam_form", name: "Approve exam form", category: "assembly", sensitivity: "high" },
  view_candidate: { key: "view_candidate", name: "View candidate", category: "candidate", sensitivity: "medium" },
  edit_candidate: { key: "edit_candidate", name: "Edit candidate", category: "candidate", sensitivity: "medium" },
  release_result: { key: "release_result", name: "Release result", category: "results", sensitivity: "high" },
  view_reports: { key: "view_reports", name: "View reports", category: "reports", sensitivity: "medium" },
  download_reports: { key: "download_reports", name: "Download reports", category: "reports", sensitivity: "medium" },
  run_invigilation: { key: "run_invigilation", name: "Run invigilation", category: "candidate", sensitivity: "medium" },
  manage_users: { key: "manage_users", name: "Manage users", category: "admin", sensitivity: "high" },
  view_audit: { key: "view_audit", name: "View audit logs", category: "security", sensitivity: "high" },
  governance_decision: { key: "governance_decision", name: "Governance decisions", category: "admin", sensitivity: "high" },
  view_security: { key: "view_security", name: "View security center", category: "security", sensitivity: "high" },
  sit_exam: { key: "sit_exam", name: "Sit exam", category: "candidate", sensitivity: "low" },
};

/** The role → permission grants. Absent = denied. */
export const ROLE_GRANTS: Record<RoleKey, Partial<Record<PermissionKey, Scope>>> = {
  sys_admin: {
    view_question: "full", view_correct_answer: "full", edit_question: "full", approve_question: "full",
    export_question: "full", generate_exam_form: "full", approve_exam_form: "full", view_candidate: "full",
    edit_candidate: "full", release_result: "full", view_reports: "full", download_reports: "full",
    run_invigilation: "full", manage_users: "full", view_audit: "full", governance_decision: "full", view_security: "full",
  },
  exam_ops_manager: {
    view_question: "full", export_question: "masked", generate_exam_form: "full", view_candidate: "full",
    edit_candidate: "full", view_reports: "full", download_reports: "full", run_invigilation: "full",
    view_audit: "masked", view_security: "full",
  },
  certification_manager: {
    view_question: "full", generate_exam_form: "full", view_candidate: "full", edit_candidate: "full",
    release_result: "full", view_reports: "full", download_reports: "full",
  },
  question_author: {
    // Authors see stems + answers, but only edit/answer on their OWN drafts (SoD enforced below).
    view_question: "full", view_correct_answer: "self", edit_question: "self",
  },
  question_reviewer: {
    view_question: "full", view_correct_answer: "full",
  },
  psychometrician: {
    view_question: "full", view_correct_answer: "full", export_question: "masked",
    view_reports: "full", download_reports: "full", view_security: "masked",
  },
  committee_approver: {
    view_question: "full", view_correct_answer: "full", approve_question: "full", approve_exam_form: "full",
    release_result: "full", view_reports: "full", download_reports: "full", view_audit: "masked",
    governance_decision: "full", view_security: "masked",
  },
  invigilator: {
    run_invigilation: "full", view_candidate: "masked",
  },
  candidate: {
    sit_exam: "full", view_candidate: "self",
  },
  auditor: {
    view_question: "masked", view_reports: "full", download_reports: "full", view_audit: "full", view_security: "full",
    governance_decision: "masked",
  },
  executive: {
    view_candidate: "masked", view_reports: "masked",
  },
  vendor: {
    view_candidate: "assigned", view_reports: "assigned",
  },
};

/** Does the role have any grant for the permission? */
export function can(roleKey: RoleKey, perm: PermissionKey): boolean {
  return ROLE_GRANTS[roleKey]?.[perm] !== undefined;
}

/** The scope of a grant (undefined if denied). */
export function scopeOf(roleKey: RoleKey, perm: PermissionKey): Scope | undefined {
  return ROLE_GRANTS[roleKey]?.[perm];
}

/** True only for an unrestricted ("full") grant. */
export function canFull(roleKey: RoleKey, perm: PermissionKey): boolean {
  return ROLE_GRANTS[roleKey]?.[perm] === "full";
}

/**
 * Can this user view the correct answer for a specific question?
 * SoD nuance: an author with a "self" grant may only see answers on questions
 * they authored; a reviewer/approver/psychometrician with "full" sees any.
 */
export function canViewAnswer(roleKey: RoleKey, authorId: string, viewerId: string): boolean {
  const s = scopeOf(roleKey, "view_correct_answer");
  if (!s) return false;
  if (s === "self") return authorId === viewerId;
  return true;
}

/**
 * SoD: a user may not approve a question they authored.
 */
export function canApproveQuestion(roleKey: RoleKey, authorId: string, viewerId: string): boolean {
  if (!can(roleKey, "approve_question")) return false;
  return authorId !== viewerId; // maker ≠ checker
}

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
export const ALL_ROLES = Object.values(ROLES);
