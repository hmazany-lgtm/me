export type Center = {
  id: string;
  name: string;
  region: string;
  manager: string;
  score: number;
  trend: "up" | "down" | "stable";
  traineeCount: number;
  completionRate: number;
  satisfactionScore: number;
  programs: number;
  status: "excellent" | "good" | "warning" | "critical";
  monthlyData: { month: string; score: number; trainees: number }[];
};

export type Program = {
  id: string;
  name: string;
  centerId: string;
  centerName: string;
  category: string;
  duration: number;
  enrolledCount: number;
  completionRate: number;
  satisfactionScore: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "upcoming" | "paused";
  instructor: string;
  budget: number;
  spent: number;
};

export type Target = {
  id: string;
  centerId: string;
  centerName: string;
  metric: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  status: "on_track" | "at_risk" | "achieved" | "missed";
};

export type Alert = {
  id: string;
  type: "performance" | "slowdown" | "innovation" | "critical";
  title: string;
  message: string;
  centerId: string;
  centerName: string;
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
  isRead: boolean;
  agentSource: "performance" | "slowdown" | "innovation";
};

export const centers: Center[] = [
  {
    id: "c1",
    name: "Riyadh Excellence Center",
    region: "Central",
    manager: "Ahmed Al-Rashid",
    score: 94,
    trend: "up",
    traineeCount: 1240,
    completionRate: 91,
    satisfactionScore: 4.7,
    programs: 18,
    status: "excellent",
    monthlyData: [
      { month: "Oct", score: 88, trainees: 1100 },
      { month: "Nov", score: 90, trainees: 1150 },
      { month: "Dec", score: 91, trainees: 1180 },
      { month: "Jan", score: 92, trainees: 1200 },
      { month: "Feb", score: 93, trainees: 1220 },
      { month: "Mar", score: 94, trainees: 1240 },
    ],
  },
  {
    id: "c2",
    name: "Jeddah Innovation Hub",
    region: "Western",
    manager: "Sara Al-Zahrani",
    score: 89,
    trend: "up",
    traineeCount: 980,
    completionRate: 87,
    satisfactionScore: 4.5,
    programs: 14,
    status: "good",
    monthlyData: [
      { month: "Oct", score: 82, trainees: 900 },
      { month: "Nov", score: 84, trainees: 920 },
      { month: "Dec", score: 85, trainees: 940 },
      { month: "Jan", score: 86, trainees: 950 },
      { month: "Feb", score: 88, trainees: 960 },
      { month: "Mar", score: 89, trainees: 980 },
    ],
  },
  {
    id: "c3",
    name: "Dammam Tech Academy",
    region: "Eastern",
    manager: "Khalid Al-Otaibi",
    score: 76,
    trend: "stable",
    traineeCount: 720,
    completionRate: 74,
    satisfactionScore: 4.1,
    programs: 11,
    status: "good",
    monthlyData: [
      { month: "Oct", score: 74, trainees: 700 },
      { month: "Nov", score: 75, trainees: 705 },
      { month: "Dec", score: 75, trainees: 710 },
      { month: "Jan", score: 76, trainees: 715 },
      { month: "Feb", score: 76, trainees: 718 },
      { month: "Mar", score: 76, trainees: 720 },
    ],
  },
  {
    id: "c4",
    name: "Medina Leadership Institute",
    region: "Western",
    manager: "Fatima Al-Ghamdi",
    score: 68,
    trend: "down",
    traineeCount: 540,
    completionRate: 65,
    satisfactionScore: 3.8,
    programs: 9,
    status: "warning",
    monthlyData: [
      { month: "Oct", score: 75, trainees: 600 },
      { month: "Nov", score: 73, trainees: 580 },
      { month: "Dec", score: 72, trainees: 570 },
      { month: "Jan", score: 70, trainees: 560 },
      { month: "Feb", score: 69, trainees: 550 },
      { month: "Mar", score: 68, trainees: 540 },
    ],
  },
  {
    id: "c5",
    name: "Abha Digital Campus",
    region: "Southern",
    manager: "Omar Al-Shahri",
    score: 58,
    trend: "down",
    traineeCount: 320,
    completionRate: 55,
    satisfactionScore: 3.4,
    programs: 7,
    status: "critical",
    monthlyData: [
      { month: "Oct", score: 68, trainees: 420 },
      { month: "Nov", score: 65, trainees: 400 },
      { month: "Dec", score: 63, trainees: 380 },
      { month: "Jan", score: 61, trainees: 360 },
      { month: "Feb", score: 60, trainees: 340 },
      { month: "Mar", score: 58, trainees: 320 },
    ],
  },
  {
    id: "c6",
    name: "Tabuk Skills Center",
    region: "Northern",
    manager: "Nora Al-Harbi",
    score: 82,
    trend: "up",
    traineeCount: 650,
    completionRate: 80,
    satisfactionScore: 4.3,
    programs: 12,
    status: "good",
    monthlyData: [
      { month: "Oct", score: 77, trainees: 600 },
      { month: "Nov", score: 78, trainees: 610 },
      { month: "Dec", score: 79, trainees: 625 },
      { month: "Jan", score: 80, trainees: 630 },
      { month: "Feb", score: 81, trainees: 640 },
      { month: "Mar", score: 82, trainees: 650 },
    ],
  },
];

export const programs: Program[] = [
  {
    id: "p1",
    name: "Advanced Data Science",
    centerId: "c1",
    centerName: "Riyadh Excellence Center",
    category: "Technology",
    duration: 120,
    enrolledCount: 85,
    completionRate: 92,
    satisfactionScore: 4.8,
    startDate: "2025-01-15",
    endDate: "2025-06-15",
    status: "active",
    instructor: "Dr. Ahmad Hassan",
    budget: 250000,
    spent: 198000,
  },
  {
    id: "p2",
    name: "Leadership Excellence Program",
    centerId: "c1",
    centerName: "Riyadh Excellence Center",
    category: "Leadership",
    duration: 80,
    enrolledCount: 45,
    completionRate: 88,
    satisfactionScore: 4.6,
    startDate: "2025-02-01",
    endDate: "2025-05-01",
    status: "active",
    instructor: "Prof. Layla Mansour",
    budget: 180000,
    spent: 145000,
  },
  {
    id: "p3",
    name: "AI & Machine Learning Fundamentals",
    centerId: "c2",
    centerName: "Jeddah Innovation Hub",
    category: "Technology",
    duration: 100,
    enrolledCount: 72,
    completionRate: 85,
    satisfactionScore: 4.5,
    startDate: "2025-01-20",
    endDate: "2025-05-20",
    status: "active",
    instructor: "Dr. Faris Al-Amin",
    budget: 220000,
    spent: 175000,
  },
  {
    id: "p4",
    name: "Project Management Professional",
    centerId: "c3",
    centerName: "Dammam Tech Academy",
    category: "Management",
    duration: 60,
    enrolledCount: 55,
    completionRate: 78,
    satisfactionScore: 4.2,
    startDate: "2025-03-01",
    endDate: "2025-06-01",
    status: "active",
    instructor: "Ibrahim Al-Dosari",
    budget: 120000,
    spent: 89000,
  },
  {
    id: "p5",
    name: "Digital Marketing Mastery",
    centerId: "c4",
    centerName: "Medina Leadership Institute",
    category: "Marketing",
    duration: 45,
    enrolledCount: 38,
    completionRate: 62,
    satisfactionScore: 3.7,
    startDate: "2025-02-15",
    endDate: "2025-04-30",
    status: "active",
    instructor: "Hana Al-Bishi",
    budget: 90000,
    spent: 72000,
  },
  {
    id: "p6",
    name: "Cybersecurity Fundamentals",
    centerId: "c2",
    centerName: "Jeddah Innovation Hub",
    category: "Technology",
    duration: 90,
    enrolledCount: 62,
    completionRate: 91,
    satisfactionScore: 4.7,
    startDate: "2024-10-01",
    endDate: "2025-01-15",
    status: "completed",
    instructor: "Dr. Sami Al-Qahtani",
    budget: 195000,
    spent: 191000,
  },
  {
    id: "p7",
    name: "Cloud Architecture Mastery",
    centerId: "c1",
    centerName: "Riyadh Excellence Center",
    category: "Technology",
    duration: 110,
    enrolledCount: 70,
    completionRate: 0,
    satisfactionScore: 0,
    startDate: "2025-05-01",
    endDate: "2025-09-15",
    status: "upcoming",
    instructor: "Dr. Rania Al-Shehri",
    budget: 240000,
    spent: 0,
  },
  {
    id: "p8",
    name: "Soft Skills for Leaders",
    centerId: "c5",
    centerName: "Abha Digital Campus",
    category: "Leadership",
    duration: 30,
    enrolledCount: 28,
    completionRate: 45,
    satisfactionScore: 3.2,
    startDate: "2025-02-01",
    endDate: "2025-04-01",
    status: "paused",
    instructor: "Mona Al-Asmari",
    budget: 60000,
    spent: 32000,
  },
];

export const targets: Target[] = [
  { id: "t1", centerId: "c1", centerName: "Riyadh Excellence Center", metric: "Completion Rate", target: 95, current: 91, unit: "%", deadline: "2025-06-30", status: "on_track" },
  { id: "t2", centerId: "c1", centerName: "Riyadh Excellence Center", metric: "Trainee Satisfaction", target: 4.8, current: 4.7, unit: "/5", deadline: "2025-06-30", status: "on_track" },
  { id: "t3", centerId: "c2", centerName: "Jeddah Innovation Hub", metric: "Completion Rate", target: 90, current: 87, unit: "%", deadline: "2025-06-30", status: "on_track" },
  { id: "t4", centerId: "c3", centerName: "Dammam Tech Academy", metric: "Enrollments", target: 800, current: 720, unit: "trainees", deadline: "2025-06-30", status: "at_risk" },
  { id: "t5", centerId: "c4", centerName: "Medina Leadership Institute", metric: "Completion Rate", target: 80, current: 65, unit: "%", deadline: "2025-06-30", status: "at_risk" },
  { id: "t6", centerId: "c5", centerName: "Abha Digital Campus", metric: "Overall Score", target: 75, current: 58, unit: "pts", deadline: "2025-06-30", status: "missed" },
  { id: "t7", centerId: "c6", centerName: "Tabuk Skills Center", metric: "Trainee Satisfaction", target: 4.5, current: 4.3, unit: "/5", deadline: "2025-06-30", status: "on_track" },
];

export const alerts: Alert[] = [
  {
    id: "a1",
    type: "critical",
    title: "Critical Drop in Completion Rate",
    message: "Abha Digital Campus has shown a 15% decline in completion rates over the past 6 weeks. Immediate intervention required.",
    centerId: "c5",
    centerName: "Abha Digital Campus",
    severity: "critical",
    createdAt: "2025-04-20T08:30:00Z",
    isRead: false,
    agentSource: "performance",
  },
  {
    id: "a2",
    type: "slowdown",
    title: "Engagement Slowdown Detected",
    message: "Medina Leadership Institute shows a consistent downward trend in trainee engagement metrics for 3 consecutive months.",
    centerId: "c4",
    centerName: "Medina Leadership Institute",
    severity: "high",
    createdAt: "2025-04-19T14:15:00Z",
    isRead: false,
    agentSource: "slowdown",
  },
  {
    id: "a3",
    type: "innovation",
    title: "Innovation Opportunity Identified",
    message: "Based on industry trends and trainee feedback, introducing VR-based simulation training could boost completion rates by 25% at Riyadh Excellence Center.",
    centerId: "c1",
    centerName: "Riyadh Excellence Center",
    severity: "low",
    createdAt: "2025-04-18T10:00:00Z",
    isRead: true,
    agentSource: "innovation",
  },
  {
    id: "a4",
    type: "performance",
    title: "Target Achievement Risk",
    message: "Dammam Tech Academy is 11% below enrollment target with 10 weeks remaining. Recommend targeted outreach campaign.",
    centerId: "c3",
    centerName: "Dammam Tech Academy",
    severity: "medium",
    createdAt: "2025-04-17T09:45:00Z",
    isRead: true,
    agentSource: "performance",
  },
  {
    id: "a5",
    type: "innovation",
    title: "Best Practice Replication",
    message: "Jeddah Innovation Hub's peer-learning model has shown 18% higher retention. Recommend piloting in 3 underperforming centers.",
    centerId: "c2",
    centerName: "Jeddah Innovation Hub",
    severity: "low",
    createdAt: "2025-04-16T11:30:00Z",
    isRead: true,
    agentSource: "innovation",
  },
  {
    id: "a6",
    type: "slowdown",
    title: "Instructor Availability Gap",
    message: "Soft Skills program at Abha Digital Campus paused due to instructor unavailability. 28 trainees affected.",
    centerId: "c5",
    centerName: "Abha Digital Campus",
    severity: "high",
    createdAt: "2025-04-15T16:00:00Z",
    isRead: false,
    agentSource: "slowdown",
  },
];

export const kpiSummary = {
  totalCenters: 6,
  totalTrainees: 4450,
  avgCompletionRate: 77,
  avgSatisfaction: 4.1,
  activePrograms: 5,
  totalBudget: 1115000,
  totalSpent: 711000,
  alertsCount: 6,
  criticalAlerts: 1,
};

export const innovationPipeline = [
  { id: "i1", title: "VR Training Simulations", stage: "Research", impact: "High", effort: "High", centerId: "c1", centerName: "Riyadh Excellence Center", daysInStage: 14 },
  { id: "i2", title: "AI-Powered Assessment System", stage: "Pilot", impact: "High", effort: "Medium", centerId: "c2", centerName: "Jeddah Innovation Hub", daysInStage: 7 },
  { id: "i3", title: "Gamification Framework", stage: "Implementation", impact: "Medium", effort: "Low", centerId: "c6", centerName: "Tabuk Skills Center", daysInStage: 21 },
  { id: "i4", title: "Mobile Learning App", stage: "Research", impact: "High", effort: "High", centerId: "c3", centerName: "Dammam Tech Academy", daysInStage: 5 },
  { id: "i5", title: "Peer Mentorship Platform", stage: "Completed", impact: "Medium", effort: "Medium", centerId: "c2", centerName: "Jeddah Innovation Hub", daysInStage: 45 },
];
