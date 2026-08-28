import { RouteItem, Sector, Setter, SettingSession, SetterTask, ResetHistoryLog } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';


export type ApiErrorData = Record<string, string[] | string>;

// Helper for HTTP requests
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      console.warn(
        `API Error [${response.status}] for ${endpoint}`,
        errorData
      );

      throw {
        status: response.status,
        data: errorData,
      };
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    throw error;
  }
}

export async function apiLogin(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      console.warn(`Login failed [${response.status}]`);
      return null;
    }

    const data = await response.json();

    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);

    return data;
  } catch (error) {
    console.log('Login API unavailable:', error);
    return null;
  }
}

export async function apiFetchProfile() {
  return await request<any>('/accounts/profile/');
}

export function apiLogout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// --- SECTORS API ---
export async function apiFetchSectors(): Promise<Sector[]> {
  const data = await request<any[]>('/gyms/sectors/');
  if (!data || !Array.isArray(data)) return [];

  return data.map((item) => ({
    id: String(item.id),
    name: item.name || 'Sektor',
    type: item.sector_type || 'bouldering',
    maxCapacity: item.max_capacity || 20,
    currentRouteCount: item.active_routes_count || 0,
    lastResetDate: item.last_reset_date || new Date().toISOString().split('T')[0],
    nextScheduledReset: item.next_scheduled_reset || new Date().toISOString().split('T')[0],
    colorCode: item.color_code || '#3b82f6',
  }));
}

export async function apiCreateSector(sector: Partial<Sector>): Promise<Sector | null> {
  const payload = {
    name: sector.name,
    sector_type: sector.type || 'bouldering',
    max_capacity: sector.maxCapacity || 20,
    color_code: sector.colorCode || '#3b82f6',
    last_reset_date: sector.lastResetDate,
    next_scheduled_reset: sector.nextScheduledReset,
    
  };

  const created = await request<any>('/gyms/sectors/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!created) return null;

  return {
    id: String(created.id),
    name: created.name,
    type: created.sector_type,
    maxCapacity: created.max_capacity,
    currentRouteCount: created.active_routes_count || 0,
    lastResetDate: created.last_reset_date || new Date().toISOString().split('T')[0],
    nextScheduledReset: created.next_scheduled_reset || new Date().toISOString().split('T')[0],
    colorCode: created.color_code,
  };
}

export async function apiDeleteSector(id: string): Promise<boolean> {
  const res = await request<any>(`/gyms/sectors/${id}/`, { method: 'DELETE' });
  return res !== null;
}

// --- ROUTES API ---

const colorHexMap: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#eab308',
  green: '#10b981',
  black: '#18181b',
  purple: '#a855f7',
  orange: '#ff4d00',
  white: '#f4f4f5',
  pink: '#ec4899',
  wood: '#a16207',
};

function mapApiRoute(r: any): RouteItem {
  const holdColor = r.hold_color || 'red';

  return {
    id: String(r.id),
    name: r.name,
    type: r.route_type === 'boulder' ? 'boulder' : 'rope',
    grade: r.grade || '',
    vGrade: r.v_grade || undefined,
    sectorId: String(r.sector || ''),
    sectorName: r.sector_name || '',
    wallLineNumber: r.wall_line_number || undefined,
    holdColor,
    holdColorHex: colorHexMap[holdColor] || '#a1a1aa',
    setterId: String(r.setter || ''),
    setterName: r.setter_name || '',
    dateSet: r.date_set || '',
    ageDays: r.age_days ?? 0,
    status: r.status,
    description: r.description || '',
    ratingAverage: r.rating_average ?? 0,
    ratingCount: r.rating_count ?? 0,
    ascentCount: r.ascent_count ?? 0,
    qrCodeUrl: r.qr_code || '',
    tags: r.tags || [],
  };
}


export async function apiFetchRoutes(): Promise<RouteItem[]> {
  const data = await request<any[]>('/routes/routes/');
  if (!data || !Array.isArray(data)) return [];

  return data.map(mapApiRoute);
}

export async function apiCreateRoute(route: Partial<RouteItem>): Promise<RouteItem | null> {
  const payload = {
    name: route.name,
    route_type: route.type === 'boulder' ? 'boulder' : 'rope',
    grade: route.grade || '6A',
    v_grade: route.vGrade || 'V2',
    sector: route.sectorId,
    wall_line_number: route.wallLineNumber || 1,
    hold_color: route.holdColor || 'red',
    setter: route.setterId || null,
    setter_name: route.setterName || 'Główny Setter',
    date_set: route.dateSet || new Date().toISOString().split('T')[0],
    status: route.status || 'active',
    description: route.description || '',
  };

  const created = await request<any>('/routes/routes/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!created) return null;

  return mapApiRoute(created);
}


export async function apiUpdateRoute(
  id: string,
  route: Partial<RouteItem>
): Promise<RouteItem | null> {
  const payload = {
    name: route.name,
    route_type: route.type,
    grade: route.grade,
    v_grade: route.vGrade,
    sector: route.sectorId,
    wall_line_number: route.wallLineNumber,
    hold_color: route.holdColor,
    setter: route.setterId,
    date_set: route.dateSet,
    status: route.status,
    description: route.description,
  };

  const updated = await request<any>(`/routes/routes/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!updated) return null;

  return mapApiRoute(updated);
}


export async function apiUpdateRouteStatus(id: string, status: string): Promise<boolean> {
  const res = await request<any>(`/routes/routes/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return res !== null;
}


export async function apiRetireRoute(id: string): Promise<boolean> {
  const res = await request<any>(`/routes/routes/${id}/retire/`, {
    method: 'POST',
  });

  return res !== null;
}

export async function apiDeleteRoute(id: string): Promise<boolean> {
  const res = await request<any>(`/routes/routes/${id}/`, { method: 'DELETE' });
  return res !== null;
}

// --- SETTERS API ---
export async function apiFetchSetters(): Promise<Setter[]> {
  const data = await request<any[]>('/setting/setters/');
  if (!data || !Array.isArray(data)) return [];

  return data.map((s) => ({
    id: String(s.id),
    name: s.full_name || 'Setter',
    role: s.role || 'Route Setter',
    avatar: s.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    specialties: s.specialties ? s.specialties.split(',') : ['Baldery'],
    assignedTasksCount: 0,
    completedTasksCount: 0,
    totalRoutesSet: 0,
    email: '',
  }));
}

export async function apiCreateSetter(setter: {
  name: string;
  email: string;
  role: string;
  specialties: string[];
}): Promise<Setter | null> {
  const payload = {
    full_name: setter.name,
    email: setter.email,
    role: setter.role || 'Route Setter',
    specialties: setter.specialties.join(','),
  };

  const created = await request<any>('/setting/setters/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!created) return null;

  return {
    id: String(created.id),
    name: created.full_name || setter.name,
    role: created.role || setter.role,
    avatar: created.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    specialties: created.specialties ? created.specialties.split(',') : setter.specialties,
    assignedTasksCount: 0,
    completedTasksCount: 0,
    totalRoutesSet: 0,
    email: setter.email,
  };
}

// --- SETTING SESSIONS API ---
export async function apiFetchSessions(): Promise<SettingSession[]> {
  const data = await request<any[]>('/setting/sessions/');
  if (!data || !Array.isArray(data)) return [];

  return data.map((sess) => ({
    id: String(sess.id),
    title: sess.title,
    sectorId: String(sess.sector || ''),
    sectorName: sess.sector_name || 'Sektor',
    scheduledDate: sess.scheduled_date,
    status: sess.status || 'planned',
    leadSetterId: String(sess.lead_setter || ''),
    leadSetterName: sess.lead_setter_name || 'Szef Resetu',
    assignedSetterIds: [],
     
    targetRouteCount: sess.target_route_count ?? 0,
    targetGradeBreakdown: sess.target_grade_breakdown || {},
    notes: sess.notes || '',
    
  }));
}

export async function apiCreateSession(
  session: Partial<SettingSession>
): Promise<SettingSession | null> {

  const payload = {
    title: session.title,
    sector: session.sectorId,
    scheduled_date:
      session.scheduledDate || new Date().toISOString().split('T')[0],
    status: session.status || 'planned',
    lead_setter: session.leadSetterId || null,
    notes: session.notes || '',
    target_route_count: session.targetRouteCount,
    target_grade_breakdown: session.targetGradeBreakdown,
  };

  const created = await request<any>('/setting/sessions/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!created) return null;

  return {
    id: String(created.id),
    title: created.title,
    sectorId: String(created.sector),
    sectorName: created.sector_name || session.sectorName || 'Sektor',
    scheduledDate: created.scheduled_date,
    status: created.status,
    leadSetterId: String(created.lead_setter || ''),
    leadSetterName: created.lead_setter_name || 'Head Setter',
    assignedSetterIds: [],
    targetRouteCount: 0,
    notes: created.notes,
    targetGradeBreakdown: {},
  };
}



// --- SETTER TASKS API ---
export async function apiFetchTasks(): Promise<SetterTask[]> {
  const data = await request<any[]>('/setting/tasks/');
  if (!data || !Array.isArray(data)) return [];

  return data.map((t) => ({
    id: String(t.id),
    sessionId: String(t.session || ''),
    setterId: String(t.setter || ''),
    setterName: t.setter_name || 'Setter',
    title: t.title,
    description: t.description || '',
    type: t.route_type === 'boulder' ? 'boulder' : 'rope',
    sectorId: String(t.sector || ''),
    sectorName: t.sector_name || 'Sektor',
    createdRouteId: t.created_route  ? String(t.created_route)   : undefined,
    targetGrade: t.target_grade || '6A',
    holdColor: t.hold_color || 'red',
    status: t.status || 'todo',
    createdAt: t.created_at || new Date().toISOString().split('T')[0],
    dueDate: t.due_date || new Date().toISOString().split('T')[0],
  }));
}


export async function apiPublishTask(
  taskId: string
): Promise<{ task: SetterTask; route: RouteItem } | null> {
  const data = await request<any>(
    `/setting/tasks/${taskId}/publish/`,
    {
      method: 'POST',
    }
  );

  if (!data) return null;

  return {
    task: {
      id: String(data.task.id),
      sessionId: String(data.task.session || ''),
      setterId: String(data.task.setter || ''),
      setterName: data.task.setter_name || '',
      title: data.task.title,
      description: data.task.description || '',
      type: data.task.route_type === 'boulder' ? 'boulder' : 'rope',
      sectorId: String(data.task.sector || ''),
      sectorName: data.task.sector_name || '',
      targetGrade: data.task.target_grade,
      holdColor: data.task.hold_color,
      status: data.task.status,
      createdAt: data.task.created_at || '',
      dueDate: data.task.due_date || '',
      createdRouteId: data.task.created_route
        ? String(data.task.created_route)
        : undefined,
    },
    route: mapApiRoute(data.route),
  };
}




export async function apiCreateTask(task: Partial<SetterTask>): Promise<SetterTask | null> {
  const payload = {
    title: task.title,
    session: task.sessionId,
    setter: task.setterId,
    target_grade: task.targetGrade || '6A',
    hold_color: task.holdColor || 'red',
    sector: task.sectorId,
    sector_name: task.sectorName || 'Sektor Główny',
    route_type: task.type,
    status: task.status || 'todo',
    description: task.description || '',
    due_date: task.dueDate || new Date().toISOString().split('T')[0],
  };

  const created = await request<any>('/setting/tasks/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!created) return null;

  return {
    id: String(created.id),
    sessionId: String(created.session || ''),
    setterId: String(created.setter || ''),
    setterName: created.setter_name || task.setterName || 'Setter',
    title: created.title,
    description: created.description,
    type: task.type || 'boulder',
    sectorId: String(created.sector || ''),
    sectorName: created.sector_name,
    targetGrade: created.target_grade,
    holdColor: created.hold_color,
    status: created.status,
    createdAt: created.created_at || new Date().toISOString().split('T')[0],
    dueDate: created.due_date || new Date().toISOString().split('T')[0],
  };
}

export async function apiUpdateTaskStatus(id: string, status: string): Promise<boolean> {
  const res = await request<any>(`/setting/tasks/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return res !== null;
}




// --- RESET HISTORY LOGS API ---
export async function apiFetchResetLogs(): Promise<ResetHistoryLog[]> {
  const data = await request<any[]>('/setting/logs/');
  if (!data || !Array.isArray(data)) return [];

  return data.map((l) => ({
    id: String(l.id),
    date: l.date || new Date().toISOString().split('T')[0],
    sectorName: l.sector_name,
    leadSetterName: l.lead_setter_name,
    routesStripped: l.routes_stripped,
    routesSet: l.routes_set,
    notes: l.notes || '',
  }));
}

export async function apiCreateResetLog(log: Partial<ResetHistoryLog>): Promise<ResetHistoryLog | null> {
  const payload = {
    sector_name: log.sectorName,
    lead_setter_name: log.leadSetterName,
    routes_stripped: log.routesStripped || 0,
    routes_set: log.routesSet || 0,
    notes: log.notes || '',
  };

  const created = await request<any>('/setting/logs/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!created) return null;

  return {
    id: String(created.id),
    date: created.date,
    sectorName: created.sector_name,
    leadSetterName: created.lead_setter_name,
    routesStripped: created.routes_stripped,
    routesSet: created.routes_set,
    notes: created.notes,
  };
}

export async function apiUpdateSessionStatus(
  id: string,
  status: string
): Promise<boolean> {
  const res = await request<any>(`/setting/sessions/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

  return res !== null;
}

export async function apiUpdateSession(
  id: string,
  session: Partial<SettingSession>
): Promise<SettingSession | null> {
  const payload = {
    title: session.title,
    sector: session.sectorId,
    scheduled_date: session.scheduledDate,
    lead_setter: session.leadSetterId || null,
    notes: session.notes,
    target_route_count: session.targetRouteCount,
    target_grade_breakdown: session.targetGradeBreakdown,
  };

  const updated = await request<any>(
    `/setting/sessions/${id}/`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );

  if (!updated) return null;
  

  return {
    id: String(updated.id),
    title: updated.title,
    sectorId: String(updated.sector || ''),
    sectorName: updated.sector_name || '',
    scheduledDate: updated.scheduled_date || '',
    status: updated.status,
    leadSetterId: String(updated.lead_setter || ''),
    leadSetterName: updated.lead_setter_name || '',
    assignedSetterIds: session.assignedSetterIds || [],
    targetRouteCount: updated.target_route_count ?? session.targetRouteCount ?? 0,

    notes: updated.notes ?? session.notes ?? '',

  targetGradeBreakdown:
  updated.target_grade_breakdown ??
  session.targetGradeBreakdown ??
  {},   
  };
}