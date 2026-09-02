export type RouteType = 'boulder' | 'rope';

export type RouteStatus = 'active' | 'in_reset' | 'deprecated' | 'planned';

export type HoldColor = 'red' | 'blue' | 'yellow' | 'green' | 'black' | 'purple' | 'orange' | 'white' | 'pink' | 'wood';

export interface RouteItem {
  id: string;
  name: string;
  type: RouteType;
  grade: string; // French grade (e.g. 6b+) or Font (e.g. 6C)
  vGrade?: string; // V-scale equivalent (e.g. V4)
  sectorId: string;
  sectorName: string;
  wallLineNumber?: number;
  holdColor: HoldColor;
  holdColorHex: string;
  setterId: string;
  setterName: string;
  dateSet: string; // YYYY-MM-DD
  ageDays: number;
  status: RouteStatus;
  description?: string;
  ratingAverage: number; // 1-5
  ratingCount: number;
  ascentCount: number;
  consensusGrade?: string; // Climber consensus
  qrCodeUrl: string;
  tags: string[]; // e.g. ['Dyno', 'Crimps', 'Overhang', 'Slab', 'Endurance']
}

export interface Sector {
  id: string;
  name: string;
  type: 'bouldering' | 'rope_wall' | 'training';
  maxCapacity: number;
  currentRouteCount: number;
  lastResetDate: string;
  nextScheduledReset: string;
  colorCode: string;
}

export interface Setter {
  id: string;
  name: string;
  userId: string;
  role: string;
  avatar: string;
  specialties: string[];
  assignedTasksCount: number;
  completedTasksCount: number;
  totalRoutesSet: number;
  email: string;
}

export interface SettingSession {
  id: string;
  title: string;
  sectorId: string;
  sectorName: string;
  scheduledDate: string;
  status: 'planned' | 'in_progress' | 'completed';
  leadSetterId: string;
  leadSetterName: string;
  assignedSetterIds: string[];
  targetRouteCount: number;
  notes?: string;
  targetGradeBreakdown: Record<string, number>; // e.g. {"6a": 2, "6b": 3}
}

export interface SetterTask {
  id: string;
  sessionId: string;
  setterId: string;
  setterName: string;
  title: string;
  description: string;
  type: RouteType;
  sectorId: string;
  sectorName: string;
  targetGrade: string;
  holdColor: HoldColor;
  status: 'todo' | 'in_progress' | 'testing' | 'done';
  createdAt: string;
  dueDate: string;
  createdRouteId?: string;
}

export interface ResetHistoryLog {
  id: string;
  sessionId: string;
  date: string;
  sectorName: string;
  leadSetterName: string;
  routesStripped: number;
  routesSet: number;
  notes: string;
}

export interface RouteAscentFeedback {
  id: string;
  routeId: string;
  climberName: string;
  gradeFeedback: string;
  stars: number;
  comment: string;
  date: string;
}


export interface GymUser {
  id: string;
  email: string;
  name: string;
  role: string;
}