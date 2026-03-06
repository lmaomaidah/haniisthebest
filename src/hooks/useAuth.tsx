import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: { username: string } | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  logActivity: (actionType: string, actionDetails?: object) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ username: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile/role fetching with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfileAndRole(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfileAndRole = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile({ username: profileData.username });
      }

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      setIsAdmin(roleData?.role === 'admin');
    } catch (error) {
      console.error('Error fetching profile/role:', error);
    }
  };

  const normalizeUsername = (value: string) => value.trim().toLowerCase();

  const insertActivity = async (userId: string, actionType: string, actionDetails: object = {}) => {
    try {
      await supabase.from('activity_logs').insert([
        {
          user_id: userId,
          action_type: actionType,
          action_details: JSON.parse(JSON.stringify(actionDetails)),
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
  };

  const logActivity = async (actionType: string, actionDetails: object = {}) => {
    if (!user) return;
    await insertActivity(user.id, actionType, actionDetails);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isAdmin,
      loading,
      signUp,
      signIn,
      signOut,
      logActivity
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
