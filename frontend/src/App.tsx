import React, { useState, useEffect } from 'react';

import {
  apiLogout, 
  apiFetchProfile,
  apiFetchRoutes,
  apiCreateRoute,
  apiUpdateRoute,
   
  apiRetireRoute,
  apiFetchSectors,
  apiCreateSector,
  apiFetchSetters,
  apiCreateSetter,
  apiFetchSessions,
  apiCreateSession,
  apiCreateSetterWithUser,
  apiUpdateSessionStatus,
  apiUpdateSession,
  apiFetchTasks,
  apiCreateTask,
  apiUpdateTaskStatus,
  apiFetchGymUsers,
  apiFetchResetLogs,
  apiCreateResetLog,
  apiPublishTask,
} from './services/apiService';
import { RouteItem, Sector, Setter, SettingSession, SetterTask, ResetHistoryLog, GymUser } from './types';
import { Sidebar, TabType } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { RouteDatabase } from './components/RouteDatabase';
import { ResetHistory } from './components/ResetHistory';
import { SettingPlanner } from './components/SettingPlanner';
import { SetterTasks } from './components/SetterTasks';
import { SettersView } from './components/SettersView';
import { RouteAging } from './components/RouteAging';
import { AnalyticsView } from './components/AnalyticsView';
import { QRCodeManager } from './components/QRCodeManager';
import { DjangoArchitectureModal } from './components/DjangoArchitectureModal';
import { AuthLanding, UserAccount } from './components/AuthLanding';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthLanding, setShowAuthLanding] = useState(true);

  // Default logged in user
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [setters, setSetters] = useState<Setter[]>([]);
  const [sessions, setSessions] = useState<SettingSession[]>([]);
  const [tasks, setTasks] = useState<SetterTask[]>([]);
  const [logs, setLogs] = useState<ResetHistoryLog[]>([]);
  const [gymUsers, setGymUsers] = useState<GymUser[]>([]);

  const [selectedRouteForQR, setSelectedRouteForQR] = useState<RouteItem | null>(null);





  // Fetch initial data from Django REST API backend
  const loadDataFromBackend = async (user: UserAccount) => {
    const backendRoutes = await apiFetchRoutes();
    const backendSectors = await apiFetchSectors();
    const backendSessions = await apiFetchSessions();
    const backendTasks = await apiFetchTasks();
    const backendLogs = await apiFetchResetLogs();

    setRoutes(backendRoutes);
    setSectors(backendSectors);
    setSessions(backendSessions);
    setTasks(backendTasks);
    setLogs(backendLogs);

    if (
      user.role === 'Gym Manager' ||
      user.role === 'Head Setter'
    ) {
      const backendSetters = await apiFetchSetters();
      setSetters(backendSetters);
    } else {
      setSetters([]);
    }

    if (user.role === 'Gym Manager') {
      const backendGymUsers = await apiFetchGymUsers();
      setGymUsers(backendGymUsers);
    } else {
      setGymUsers([]);
    }
  };

  useEffect(() => {
  const restoreSession = async () => {
    const token = localStorage.getItem('access_token');

    

    if (!token) {
      setShowAuthLanding(true);
      return;
    }

    const data = await apiFetchProfile();
     

    if (!data) {
      apiLogout();
      setCurrentUser(null);
      setShowAuthLanding(true);
      return;
    }

    const restoredUser: UserAccount = {
      id: String(data.id),
      email: data.email,
      name: data.name || data.email,
      role:
        data.role === 'gym_manager'
          ? 'Gym Manager'
          : data.role === 'head_setter'
          ? 'Head Setter'
          : 'Route Setter',
      gymName: data.gym_name || '',
      avatarUrl: '',
      isNewRegistration: false,
    };

    setCurrentUser(restoredUser);
    setShowAuthLanding(false);

    await loadDataFromBackend(restoredUser);
  };

  restoreSession();
}, []);




 

  // Derived Metrics
  const activeRoutes = routes.filter((r) => r.status === 'active');
  const expiredCount = activeRoutes.filter((r) => r.ageDays >= 45).length;
  const activeTasksCount = tasks.filter((t) => t.status !== 'done').length;

  // Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setShowAuthLanding(false);
    setActiveTab('dashboard');
    loadDataFromBackend(user);

     
  };



  const handleLogout = () => {
  apiLogout();
  setCurrentUser(null);
  setShowAuthLanding(true);
};

  const handleAddRoute = async (
  newRouteData: Omit<
    RouteItem,
    'id' | 'ageDays' | 'qrCodeUrl' | 'ratingAverage' | 'ratingCount' | 'ascentCount'
  >
) => {
  try {
    const createdApiRoute = await apiCreateRoute(newRouteData);

    if (!createdApiRoute) {
      throw new Error('Nie udało się utworzyć drogi.');
    }

    setRoutes((prev) => [createdApiRoute, ...prev]);
  } catch (error: any) {
    console.error('Create route error:', error);

    if (error?.data) {
      const messages = Object.entries(error.data)
        .flatMap(([field, messages]) => {
          const text = Array.isArray(messages)
            ? messages.join(', ')
            : String(messages);

          return `${field}: ${text}`;
        })
        .join('\n');

      alert(messages);
    } else {
      alert('Nie udało się utworzyć drogi.');
    }
  }
};

const handleUpdateRoute = async (
  routeId: string,
  updatedRouteData: Partial<RouteItem>
) => {
  try {
    const updatedRoute = await apiUpdateRoute(routeId, updatedRouteData);

    if (!updatedRoute) {
      throw new Error('Nie udało się zaktualizować drogi.');
    }

    setRoutes((prev) =>
      prev.map((route) =>
        route.id === routeId ? updatedRoute : route
      )
    );
  } catch (error: any) {
    console.error('Update route error:', error);

    if (error?.data) {
      const messages = Object.entries(error.data)
        .flatMap(([field, messages]) => {
          const text = Array.isArray(messages)
            ? messages.join(', ')
            : String(messages);

          return `${field}: ${text}`;
        })
        .join('\n');

      alert(messages);
    } else {
      alert('Nie udało się zaktualizować drogi.');
    }

    throw error;
  }
};


  const handleRetireRoute = async (routeId: string) => {
  const success = await apiRetireRoute(routeId);

  if (!success) {
    alert('Nie udało się zdemontować drogi.');
    return;
  }

  setRoutes((prev) =>
    prev.map((r) =>
      r.id === routeId ? { ...r, status: 'deprecated' } : r
    )
  );
};

  const handleAddLog = async (
  newLogData: Omit<ResetHistoryLog, 'id'>
  ) => {
  try {
    const created = await apiCreateResetLog(newLogData);

    if (!created) {
      throw new Error('Nie udało się utworzyć wpisu historii resetu.');
    }

    setLogs((prev) => [created, ...prev]);
  } catch (error) {
    console.error('Create reset log error:', error);
    alert('Nie udało się utworzyć wpisu historii resetu.');
  }
  };

  const handleAddSession = async (
  newSessionData: Omit<SettingSession, 'id'>
) => {
  try {
    const created = await apiCreateSession(newSessionData);

    if (!created) {
      throw new Error('Nie udało się utworzyć sesji.');
    }

    setSessions((prev) => [created, ...prev]);
  } catch (error: any) {
    console.error('Create session error:', error);

    const errorData = error?.data;

    if (errorData) {
      const messages = Object.entries(errorData)
        .flatMap(([field, messages]) => {
          const text = Array.isArray(messages)
            ? messages.join(', ')
            : String(messages);

          return `${field}: ${text}`;
        })
        .join('\n');

      alert(messages);
    } else {
      alert('Nie udało się utworzyć sesji.');
    }
  }
};

  const handleUpdateSessionStatus = async (
  sessionId: string,
  status: 'planned' | 'in_progress' | 'completed'
) => {
  const success = await apiUpdateSessionStatus(sessionId, status);

  if (!success) {
    return;
  }

  setSessions(
    sessions.map((s) =>
      s.id === sessionId ? { ...s, status } : s
    )
  );
};
  const handleUpdateSession = async (
  id: string,
  updates: Partial<SettingSession>
) => {
  const updated = await apiUpdateSession(id, updates);

  if (!updated) {
    alert('Nie udało się zaktualizować sesji.');
    return;
  }

  setSessions((prev) =>
    prev.map((session) =>
      session.id === id ? updated : session
    )
  );
};



  const handleAddTask = async (
  newTaskData: Omit<SetterTask, 'id' | 'createdAt'>
) => {
  try {
    const created = await apiCreateTask(newTaskData);

    if (!created) {
      throw new Error('Nie udało się utworzyć zadania.');
    }

    setTasks((prev) => [created, ...prev]);
  } catch (error: any) {
    console.error('Create task error:', error);

    if (error?.data) {
      const messages = Object.entries(error.data)
        .flatMap(([field, messages]) => {
          const text = Array.isArray(messages)
            ? messages.join(', ')
            : String(messages);

          return `${field}: ${text}`;
        })
        .join('\n');

      alert(messages);
    } else {
      alert('Nie udało się utworzyć zadania.');
    }
  }
};

  const handleUpdateTaskStatus = async (
  taskId: string,
  status: SetterTask['status']
) => {
  try {
    const success = await apiUpdateTaskStatus(taskId, status);

    if (!success) {
      throw new Error('Nie udało się zmienić statusu zadania.');
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status }
          : task
      )
    );
  } catch (error) {
    console.error('Update task status error:', error);
    alert('Nie udało się zmienić statusu zadania.');
  }
};

  const handleConvertTaskToRoute = async (task: SetterTask) => {
  if (!task.sectorId) {
  alert('To zadanie nie ma przypisanego sektora.');
  return;
}
    
  

  
  const published = await apiPublishTask(task.id);

if (!published) {
  alert('Nie udało się opublikować zadania jako drogi.');
  return;
}

setRoutes((prev) => [published.route, ...prev]);

setTasks((prev) =>
  prev.map((t) =>
    t.id === task.id ? published.task : t
  )
);
};


const handleAddSector = async (newSectorData: {
  name: string;
  type: 'bouldering' | 'rope_wall' | 'training';
  maxCapacity: number;
  colorCode: string;
}) => {
  try {
    const created = await apiCreateSector(newSectorData);

    if (!created) {
      throw new Error('Nie udało się utworzyć sektora.');
    }

    setSectors((prev) => [...prev, created]);
  } catch (error) {
    console.error('Create sector error:', error);
    alert('Nie udało się utworzyć sektora.');
  }
};

  const handleAddSetter = async (newSetterData: {
  userId: string;
  name: string;
  email: string;
  role: string;
  specialties: string[];
}) => {
  try {
    const created = await apiCreateSetter(newSetterData);

    if (!created) {
      throw new Error('Nie udało się utworzyć settera.');
    }

    setSetters((prev) => [...prev, created]);
  } catch (error) {
    console.error('Create setter error:', error);
    alert('Nie udało się utworzyć settera.');
  }
};

  const handleAddSetterWithUser = async (newSetterData: {
  name: string;
  email: string;
  password: string;
  userRole: 'route_setter' | 'head_setter';
  role: string;
  specialties: string[];
}) => {
  try {
    const created = await apiCreateSetterWithUser(newSetterData);

    if (!created) {
      throw new Error('Nie udało się utworzyć użytkownika i settera.');
    }

    setSetters((prev) => [...prev, created]);
  } catch (error) {
    console.error('Create setter with user error:', error);
    alert('Nie udało się utworzyć użytkownika i settera.');
  }
  };

  const handleSelectRouteForQR = (route: RouteItem) => {
    setSelectedRouteForQR(route);
    setActiveTab('qrcode');
  };

  if (showAuthLanding || !currentUser) {
    return <AuthLanding onLoginSuccess={handleLoginSuccess} />;
  }

  const isGymManager = currentUser.role === 'Gym Manager';
  const isHeadSetter = currentUser.role === 'Head Setter';

  return (
    <div className="min-h-screen bg-[#fafaf9] text-zinc-900 font-sans flex flex-col md:flex-row antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeTasksCount={activeTasksCount}
        expiredCount={expiredCount}
        currentUser={currentUser}
        onOpenLanding={() => setShowAuthLanding(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <Header
           
           
          onOpenPlanningClick={() => setActiveTab('planner')}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Content Body */}
        <main className="p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              routes={routes}
              currentUser={currentUser} 
              setters={setters}
              sessions={sessions}
              tasks={tasks}
              
              onNewRouteClick={() => setActiveTab('routes')}
              onOpenPlanningClick={() => setActiveTab('planner')}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              
            />
          )}

          {activeTab === 'routes' && (
            <RouteDatabase
              routes={routes}
              sectors={sectors}
              setters={setters}
              currentUser={currentUser}
              onSelectRouteForQR={handleSelectRouteForQR}
              onRetireRoute={handleRetireRoute}
              onAddRoute={handleAddRoute}
              onUpdateRoute={handleUpdateRoute}
            />
          )}

          {activeTab === 'aging' && (
            <RouteAging
              routes={routes}
              sectors={sectors}
              onRetireRoute={handleRetireRoute}
              onNavigateToPlanner={() => setActiveTab('planner')}
              onAddSector={handleAddSector}
            />
          )}

          {activeTab === 'planner' && (
            <SettingPlanner
              sessions={sessions}
              sectors={sectors}
              setters={setters}
              currentUser={currentUser}
              onAddSession={handleAddSession}
              onUpdateSessionStatus={handleUpdateSessionStatus}
              onUpdateSession={handleUpdateSession}
            />
          )}

          {activeTab === 'tasks' && (
            <SetterTasks
              tasks={tasks}
              setters={setters}
              sessions={sessions}
              currentUser = {currentUser}
              onAddTask={handleAddTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onConvertTaskToRoute={handleConvertTaskToRoute}
            />
          )}

          {activeTab === 'setters' && isGymManager && (
            <SettersView
              setters={setters}
              onSelectSetter={() => setActiveTab('tasks')}
              onAddSetter={handleAddSetter}
              onAddSetterWithUser={handleAddSetterWithUser}
              gymUsers={gymUsers}
            />
          )}

          {activeTab === 'history' && (
            <ResetHistory logs={logs}  sessions={sessions} currentUser={currentUser} onAddLog={handleAddLog} />
          )}

          {activeTab === 'analytics' && (isGymManager || isHeadSetter) && (
            <AnalyticsView routes={routes} setters={setters} sectors={sectors} />
          )}

          {activeTab === 'qrcode' && (
            <QRCodeManager
              routes={routes}
              selectedRouteForQR={selectedRouteForQR}
              onClearSelection={() => setSelectedRouteForQR(null)}
            />
          )}

          {activeTab === 'django' && <DjangoArchitectureModal />}
        </main>
      </div>
    </div>
  );
}
