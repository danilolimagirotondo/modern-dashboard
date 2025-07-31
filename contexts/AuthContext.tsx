import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gestor' | 'colaborador';
  avatar_url?: string;
  onboarded?: boolean;
  created_at: string;
  updated_at: string;
  phone?: string;
  location?: string;
  job_title?: string;
  department?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a87c52e3`;

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Demo users
const demoUsers = [
  {
    id: 'demo-admin',
    name: 'João Silva',
    email: 'admin@demo.com',
    role: 'admin' as const,
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    onboarded: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-gestor',
    name: 'Maria Santos',
    email: 'gestor@demo.com',
    role: 'gestor' as const,
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b2d33b33?w=100&h=100&fit=crop&crop=face',
    onboarded: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-colaborador',
    name: 'Pedro Costa',
    email: 'colaborador@demo.com',
    role: 'colaborador' as const,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    onboarded: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Stable function references to prevent re-renders
  const initializeDemoData = useCallback(async () => {
    try {
      await apiCall('/init');
      console.log('Demo data initialized');
    } catch (error) {
      console.error('Failed to initialize demo data:', error);
    }
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const userData = await apiCall(`/users/${userId}`);
      return userData;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  }, []);

  // Get current user's access token
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      // For demo users, return the public anon key
      if (user?.id.startsWith('demo-')) {
        console.log('🔑 Using public anon key for demo user');
        return publicAnonKey;
      }

      // For real users, get the actual session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        console.log('🔑 Found valid access token for real user');
        return session.access_token;
      }

      console.log('❌ No valid session found, using public anon key as fallback');
      return publicAnonKey;
    } catch (error) {
      console.error('❌ Error getting access token:', error);
      return publicAnonKey; // Fallback to public key
    }
  }, [user?.id]);

  // Initialize auth state only once
  useEffect(() => {
    if (initialized) return;

    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && isMounted) {
          console.log('Found existing session for user:', session.user.id);
          const userData = await fetchUserProfile(session.user.id);
          if (userData && isMounted) {
            setUser(userData);
          }
        } else {
          // Check for demo user in localStorage
          const demoUser = localStorage.getItem('demoUser');
          if (demoUser && isMounted) {
            try {
              const parsedDemoUser = JSON.parse(demoUser);
              console.log('Found demo user in localStorage:', parsedDemoUser.email);
              setUser(parsedDemoUser);
              // Initialize demo data for demo users
              await initializeDemoData();
            } catch (e) {
              console.error('Invalid demo user data in localStorage');
              localStorage.removeItem('demoUser');
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [initialized, fetchUserProfile, initializeDemoData]);

  // Listen for auth changes only after initialization
  useEffect(() => {
    if (!initialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (session?.user) {
        const userData = await fetchUserProfile(session.user.id);
        if (userData) {
          setUser(userData);
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('demoUser');
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [initialized, fetchUserProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase Auth Error:', error);
        
        if (error.message.includes('Email not confirmed') || error.message.includes('email_confirm')) {
          console.log('Email not confirmed, attempting auto-fix...');
          
          try {
            const confirmResult = await apiCall('/confirm-email', {
              method: 'POST',
              body: JSON.stringify({ email }),
            });

            if (confirmResult.success) {
              console.log('Email confirmed, retrying login...');
              await new Promise(resolve => setTimeout(resolve, 2000));
              return await signIn(email, password);
            } else {
              throw new Error(confirmResult.error || 'Failed to confirm email');
            }
          } catch (confirmError) {
            console.error('Auto-fix failed:', confirmError);
            throw new Error('Problema de confirmação de email. Tente criar uma nova conta.');
          }
        }
        
        throw error;
      }

      if (data.user) {
        console.log('Login successful:', data.user.id);
        const userData = await fetchUserProfile(data.user.id);
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to sign in');
    }
  }, [fetchUserProfile]);

  const signUp = useCallback(async (email: string, password: string, name: string, role: string = 'colaborador') => {
    try {
      console.log('Starting signup for NEW user:', { email, name, role });

      const response = await apiCall('/signup', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          name,
          role,
        }),
      });

      console.log('Server signup successful:', response.message);
      
      // Wait for account to be fully processed
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Sign in the new user
      await signIn(email, password);
      
      console.log(`NEW USER created and signed in: ${email} - CLEAN WORKSPACE`);
    } catch (error) {
      console.error('Sign up error:', error);
      
      let errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      
      if (errorMessage.includes('User already registered') || errorMessage.includes('already been registered')) {
        errorMessage = 'Este email já está registrado. Tente fazer login.';
      }
      
      throw new Error(errorMessage);
    }
  }, [signIn]);

  const signInDemo = useCallback(async () => {
    try {
      console.log('Activating demo mode...');
      const demoUser = demoUsers[0]; // Admin user
      localStorage.setItem('demoUser', JSON.stringify(demoUser));
      setUser(demoUser);
      
      // Initialize demo data
      await initializeDemoData();
      
      console.log('Demo mode activated with sample projects');
    } catch (error) {
      console.error('Demo sign in error:', error);
      throw new Error('Failed to sign in as demo user');
    }
  }, [initializeDemoData]);

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem('demoUser');
      await supabase.auth.signOut();
      setUser(null);
      console.log('User signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    if (!user) return;

    try {
      const updatedUser = { ...user, onboarded: true };
      
      if (user.id.startsWith('demo-')) {
        localStorage.setItem('demoUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        const userData = await apiCall(`/users/${user.id}`, {
          method: 'PUT',
          body: JSON.stringify({ onboarded: true }),
        });
        setUser(userData);
      }
      
      console.log('Onboarding completed for user:', user.id);
    } catch (error) {
      console.error('Complete onboarding error:', error);
      throw new Error('Failed to complete onboarding');
    }
  }, [user]);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
      
      if (user.id.startsWith('demo-')) {
        localStorage.setItem('demoUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        const userData = await apiCall(`/users/${user.id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
        setUser(userData);
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw new Error('Failed to update user');
    }
  }, [user]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    signIn,
    signUp,
    signInDemo,
    signOut,
    completeOnboarding,
    updateUser,
    getAccessToken,
  }), [
    user,
    loading,
    signIn,
    signUp,
    signInDemo,
    signOut,
    completeOnboarding,
    updateUser,
    getAccessToken,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}