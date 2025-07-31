import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  due_date: string;
  progress: number;
  assignee: {
    id: string;
    name: string;
    avatar_url?: string;
  } | null;
  priority: 'low' | 'medium' | 'high';
  client: string;
  budget: number;
  created_by_user: {
    id: string;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface Stats {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  totalUsers: number;
  totalBudget: number;
  averageProgress: number;
}

interface AppContextType {
  projects: Project[];
  stats: Stats;
  loading: boolean;
  fetchProjects: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createProject: (projectData: any) => Promise<Project>;
  updateProject: (projectId: string, updates: any) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a87c52e3`;

async function apiCall(endpoint: string, options: RequestInit = {}, accessToken?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

const defaultStats: Stats = {
  totalProjects: 0,
  completedProjects: 0,
  inProgressProjects: 0,
  totalUsers: 0,
  totalBudget: 0,
  averageProgress: 0
};

// Helper function to dispatch custom events for notifications
const dispatchProjectEvent = (eventType: string, data: any) => {
  console.log(`📡 Dispatching ${eventType} event:`, data);
  const event = new CustomEvent(eventType, { detail: data });
  window.dispatchEvent(event);
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, getAccessToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!user || authLoading) {
      console.log('⚠️ Skipping fetchProjects:', { hasUser: !!user, authLoading });
      return;
    }

    try {
      setLoading(true);
      console.log(`📂 Fetching projects for user: ${user.id}`);
      
      // Get the real access token for the user
      const accessToken = await getAccessToken();
      console.log('🔑 Using access token for projects fetch:', !!accessToken);
      
      const projectsData = await apiCall('/projects', { method: 'GET' }, accessToken);
      
      console.log(`📊 Received ${projectsData.length} projects for user ${user.id}`);
      if (projectsData.length > 0) {
        console.log('📝 First project sample:', {
          id: projectsData[0].id,
          name: projectsData[0].name,
          created_by: projectsData[0].created_by,
          assignee_id: projectsData[0].assignee_id
        });
      }
      
      setProjects(projectsData);
    } catch (error) {
      console.error('❌ Failed to fetch projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, authLoading, getAccessToken]);

  const fetchStats = useCallback(async () => {
    if (!user || authLoading) {
      console.log('⚠️ Skipping fetchStats:', { hasUser: !!user, authLoading });
      return;
    }

    try {
      console.log(`📊 Fetching stats for user: ${user.id}`);
      
      // Get the real access token for the user
      const accessToken = await getAccessToken();
      console.log('🔑 Using access token for stats fetch:', !!accessToken);
      
      const statsData = await apiCall('/projects/stats', { method: 'GET' }, accessToken);
      
      console.log(`📈 Stats for user ${user.id}:`, statsData);
      setStats(statsData);
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error);
      setStats(defaultStats);
    }
  }, [user?.id, authLoading, getAccessToken]);

  const createProject = useCallback(async (projectData: any): Promise<Project> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const accessToken = await getAccessToken();
      const newProject = await apiCall('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      }, accessToken);

      console.log('✅ Project created:', newProject.id);
      
      // Dispatch event for team notifications
      dispatchProjectEvent('projectCreated', {
        project: newProject,
        user: user
      });
      
      // Refresh projects and stats
      await Promise.all([fetchProjects(), fetchStats()]);
      
      return newProject;
    } catch (error) {
      console.error('❌ Failed to create project:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create project');
    }
  }, [user, getAccessToken, fetchProjects, fetchStats]);

  const updateProject = useCallback(async (projectId: string, updates: any): Promise<Project> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const accessToken = await getAccessToken();
      const updatedProject = await apiCall(`/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }, accessToken);

      console.log('✅ Project updated:', projectId);
      
      // Determine action for notification
      let action = 'atualizou';
      if (updates.status === 'completed') {
        action = 'concluiu';
      } else if (updates.status === 'in_progress') {
        action = 'iniciou';
      } else if (updates.assignee) {
        action = 'atribuiu';
      }
      
      // Dispatch event for team notifications
      dispatchProjectEvent('projectUpdated', {
        projectId: projectId,
        action: action,
        user: user,
        updates: updates
      });
      
      // Refresh projects and stats
      await Promise.all([fetchProjects(), fetchStats()]);
      
      return updatedProject;
    } catch (error) {
      console.error('❌ Failed to update project:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update project');
    }
  }, [user, getAccessToken, fetchProjects, fetchStats]);

  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const accessToken = await getAccessToken();
      await apiCall(`/projects/${projectId}`, {
        method: 'DELETE',
      }, accessToken);

      console.log('✅ Project deleted:', projectId);
      
      // Dispatch event for team notifications
      dispatchProjectEvent('projectUpdated', {
        projectId: projectId,
        action: 'removeu',
        user: user
      });
      
      // Refresh projects and stats
      await Promise.all([fetchProjects(), fetchStats()]);
    } catch (error) {
      console.error('❌ Failed to delete project:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete project');
    }
  }, [user, getAccessToken, fetchProjects, fetchStats]);

  // Initialize data only once when user is available and auth is ready
  useEffect(() => {
    // Wait for auth to be ready
    if (authLoading) {
      console.log('⏳ Waiting for auth to be ready...');
      return;
    }

    // If no user, clear data
    if (!user) {
      console.log('👤 No user, clearing data...');
      setProjects([]);
      setStats(defaultStats);
      setInitialized(false);
      return;
    }

    // Initialize data only once per user
    if (!initialized) {
      console.log('🚀 Initializing data for user:', user.id);
      setInitialized(true);
      
      // Add a small delay to ensure everything is ready
      const initializeData = async () => {
        try {
          console.log('🔄 Starting data initialization...');
          await Promise.all([fetchProjects(), fetchStats()]);
          console.log('✅ Data initialization completed');
        } catch (error) {
          console.error('❌ Failed to initialize data:', error);
        }
      };
      
      // Small delay to ensure auth context is fully ready
      setTimeout(initializeData, 100);
    }
  }, [user?.id, authLoading, initialized, fetchProjects, fetchStats]);

  // Reset initialized state when user changes
  useEffect(() => {
    if (user?.id) {
      console.log('🔄 User changed, resetting initialized state for:', user.id);
    }
    setInitialized(false);
  }, [user?.id]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<AppContextType>(() => ({
    projects,
    stats,
    loading,
    fetchProjects,
    fetchStats,
    createProject,
    updateProject,
    deleteProject,
  }), [
    projects,
    stats,
    loading,
    fetchProjects,
    fetchStats,
    createProject,
    updateProject,
    deleteProject,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}