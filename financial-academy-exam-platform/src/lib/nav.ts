import type { PermissionKey, RoleKey } from "./types";

/**
 * Sidebar navigation. Each item may require a permission (any-of) to appear.
 * Items with no `perm` are visible to everyone with platform access.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: string; // inline SVG path key (see components/Icon)
  perm?: PermissionKey[]; // visible if the role has ANY of these
  hideForRoles?: RoleKey[];
  group: "Overview" | "Content" | "Delivery" | "Trust" | "Admin";
}

export const NAV: NavItem[] = [
  { label: "Executive Dashboard", href: "/", icon: "dashboard", group: "Overview" },
  { label: "Certifications", href: "/certifications", icon: "certificate", group: "Content" },
  { label: "Question Bank", href: "/question-bank", icon: "bank", perm: ["view_question"], group: "Content" },
  { label: "Authoring Workflow", href: "/authoring", icon: "pen", perm: ["view_question", "approve_question"], group: "Content" },
  { label: "Exam Blueprints", href: "/blueprints", icon: "blueprint", group: "Content" },
  { label: "Exam Assembly", href: "/assembly", icon: "assembly", perm: ["generate_exam_form", "approve_exam_form"], group: "Content" },
  { label: "Exam Sessions", href: "/sessions", icon: "calendar", group: "Delivery" },
  { label: "Candidates", href: "/candidates", icon: "users", perm: ["view_candidate"], group: "Delivery" },
  { label: "Exam Centers", href: "/centers", icon: "building", group: "Delivery" },
  { label: "Invigilation", href: "/invigilation", icon: "eye", perm: ["run_invigilation"], group: "Delivery" },
  { label: "Results", href: "/results", icon: "chart", group: "Delivery" },
  { label: "Reports", href: "/reports", icon: "report", perm: ["view_reports"], group: "Trust" },
  { label: "Security Center", href: "/security", icon: "shield", perm: ["view_security"], group: "Trust" },
  { label: "Incidents", href: "/incidents", icon: "alert", group: "Trust" },
  { label: "Appeals", href: "/appeals", icon: "gavel", group: "Trust" },
  { label: "Certificates", href: "/certificates", icon: "award", group: "Delivery" },
  { label: "Committees", href: "/committees", icon: "committee", perm: ["governance_decision"], group: "Trust" },
  { label: "Vendors", href: "/vendors", icon: "vendor", group: "Admin" },
  { label: "Users & Roles", href: "/users", icon: "id", perm: ["manage_users"], group: "Admin" },
  { label: "Audit Trail", href: "/audit", icon: "log", perm: ["view_audit"], group: "Admin" },
  { label: "Settings", href: "/settings", icon: "cog", group: "Admin" },
];
