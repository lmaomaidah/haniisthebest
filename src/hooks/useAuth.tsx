import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  username: string;
  is_approved: boolean;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isApproved: boolean;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  logActivity: (actionType: string, actionDetails?: object) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndRole = useCallback(async (userId: string) => {
    try {
      const [{ data: profileData }, { data: roleData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('username, is_approved')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      if (profileData) {
        setProfile({
          username: profileData.username,
          is_approved: profileData.is_approved,
        });
        setIsApproved(profileData.is_approved);
      } else {
        setProfile(null);
        setIsApproved(false);
      }

      setIsAdmin(roleData?.role === 'admin');
    } catch (error) {
      console.error('Error fetching profile/role:', error);
      setProfile(null);
      setIsAdmin(false);
      setIsApproved(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const syncSessionState = async (nextSession: Session | null) => {
      if (!mounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        setIsAdmin(false);
        setIsApproved(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      await fetchProfileAndRole(nextSession.user.id);

      if (mounted) {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncSessionState(nextSession);
    });

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      void syncSessionState(existingSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfileAndRole]);

  const normalizeUsername = (value: string) => value.trim().toLowerCase();

  const buildActivityContext = () => ({
    page_path: window.location.pathname,
    page_url: window.location.href,
    referrer: document.referrer || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: navigator.language,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    user_agent: navigator.userAgent,
    client_time: new Date().toISOString(),
  });

  const insertActivity = async (userId: string, actionType: string, actionDetails: object = {}) => {
    const safeDetails = JSON.parse(JSON.stringify(actionDetails ?? {}));
    const enrichedDetails = {
      ...safeDetails,
      context: buildActivityContext(),
    };

    try {
      const { error } = await supabase.rpc('log_activity_event', {
        _action_type: actionType,
        _action_details: enrichedDetails,
      });

      if (!error) return;

      await supabase.from('activity_logs').insert([
        {
          user_id: userId,
          action_type: actionType,
          action_details: enrichedDetails,
        },
      ]);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  const signUp = async (_email: string, password: string, username: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const normalizedUsername = normalizeUsername(username);
    const email = `${normalizedUsername}@classmates.app`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: normalizedUsername,
        },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (username: string, password: string) => {
    const normalizedUsername = normalizeUsername(username);
    const email = `${normalizedUsername}@classmates.app`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        error: new Error('Invalid username or passcode.'),
      };
    }

    if (data.user) {
      await insertActivity(data.user.id, 'login', { username: normalizedUsername });
    }

    return { error: null };
  };

  const signOut = async () => {
    if (user) {
      await logActivity('logout', {});
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setIsApproved(false);
  };

  const logActivity = async (actionType: string, actionDetails: object = {}) => {
    if (!user) return;
    await insertActivity(user.id, actionType, actionDetails);
  };

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchProfileAndRole(user.id);
  }, [fetchProfileAndRole, user]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isAdmin,
      isApproved,
      loading,
      signUp,
      signIn,
      signOut,
      logActivity,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

