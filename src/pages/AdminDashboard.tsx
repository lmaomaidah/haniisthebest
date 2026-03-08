import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Activity, Shield, Trash2, UserCog, Eye, MessageCircle, Star, Heart, Upload, LogIn, LogOut, FileText, Zap } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  action_details: Record<string, unknown> | null;
  created_at: string;
  profiles?: {
    username: string;
  };
}

interface UserProfile {
  user_id: string;
  username: string;
  is_approved: boolean;
  created_at: string;
  user_roles?: {
    id: string;
    role: string;
  }[];
}

// ─── Readable formatting helpers ───

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  login: { icon: <LogIn className="h-3.5 w-3.5" />, label: "Logged in", color: "bg-green-500/20 text-green-400 border-green-500/40" },
  logout: { icon: <LogOut className="h-3.5 w-3.5" />, label: "Logged out", color: "bg-red-500/20 text-red-400 border-red-500/40" },
  page_view: { icon: <Eye className="h-3.5 w-3.5" />, label: "Visited", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" },
  page_access: { icon: <Eye className="h-3.5 w-3.5" />, label: "Visited", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" },
  tier_list_save: { icon: <Star className="h-3.5 w-3.5" />, label: "Saved tier list", color: "bg-purple-500/20 text-purple-400 border-purple-500/40" },
  rating_save: { icon: <Zap className="h-3.5 w-3.5" />, label: "Rated someone", color: "bg-blue-500/20 text-blue-400 border-blue-500/40" },
  classification_save: { icon: <FileText className="h-3.5 w-3.5" />, label: "Classified", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" },
  image_upload: { icon: <Upload className="h-3.5 w-3.5" />, label: "Uploaded image", color: "bg-pink-500/20 text-pink-400 border-pink-500/40" },
  quiz_complete: { icon: <FileText className="h-3.5 w-3.5" />, label: "Finished quiz", color: "bg-orange-500/20 text-orange-400 border-orange-500/40" },
  ship_calculate: { icon: <Heart className="h-3.5 w-3.5" />, label: "Shipped", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" },
  comment_post: { icon: <MessageCircle className="h-3.5 w-3.5" />, label: "Commented", color: "bg-teal-500/20 text-teal-400 border-teal-500/40" },
  admin_user_deleted: { icon: <Trash2 className="h-3.5 w-3.5" />, label: "Deleted user", color: "bg-destructive/20 text-destructive border-destructive/40" },
};

function getActionConfig(actionType: string) {
  return ACTION_CONFIG[actionType] || {
    icon: <Activity className="h-3.5 w-3.5" />,
    label: actionType.replace(/_/g, ' '),
    color: "bg-muted text-muted-foreground border-border",
  };
}

function formatReadableActivity(actionType: string, details: Record<string, unknown> | null): string {
  if (!details) return "";

  const pageName = details.page_name as string | undefined;
  const pagePath = details.page_path || details.page as string | undefined;

  switch (actionType) {
    case "page_view":
    case "page_access":
      return pageName || (typeof pagePath === 'string' ? pagePath : "");
    
    case "tier_list_save": {
      const counts = details.tierCounts as Record<string, number> | undefined;
      if (counts) {
        const parts = Object.entries(counts)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => `${v} in ${k}`)
          .join(", ");
        return parts ? `Ranked: ${parts}` : "Saved rankings";
      }
      return "Saved rankings";
    }

    case "ship_calculate": {
      const p1 = details.person1 as string | undefined;
      const p2 = details.person2 as string | undefined;
      const score = details.score as number | undefined;
      if (p1 && p2) {
        return `${p1} × ${p2}${score != null ? ` → ${score}%` : ""}`;
      }
      return "Calculated ship compatibility";
    }

    case "rating_save": {
      const name = details.image_name || details.name as string | undefined;
      return name ? `Rated ${name}` : "Saved ratings";
    }

    case "image_upload": {
      const imgName = details.name as string | undefined;
      return imgName ? `Uploaded "${imgName}"` : "Uploaded a new classmate";
    }

    case "admin_user_deleted": {
      const username = details.username || details.deleted_username as string | undefined;
      return username ? `Deleted user "${username}"` : "Deleted a user";
    }

    case "login":
      return "Signed into the platform";

    case "logout":
      return "Signed out";

    default: {
      // Build readable string from non-context keys
      const contextKeys = new Set(['page_path', 'page_url', 'referrer', 'timezone', 'locale', 'viewport', 'user_agent', 'client_time', 'context', 'source', 'page', 'page_name']);
      const meaningful = Object.entries(details)
        .filter(([key]) => !contextKeys.has(key))
        .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${String(value)}`)
        .slice(0, 3);
      return meaningful.join(" · ") || "";
    }
  }
}

const AdminDashboard = () => {
  const { user, isAdmin, loading, profile } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'activity' | 'users'>('activity');
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading) {
      if (!user) navigate('/auth');
      else if (!isAdmin) navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [{ data: activityData }, { data: usersData }] = await Promise.all([
        supabase.from('activity_logs').select('*, profiles(username)').order('created_at', { ascending: false }).limit(250),
        supabase.from('profiles').select('*, user_roles(id, role)').order('created_at', { ascending: false }),
      ]);
      if (activityData) setActivities(activityData as unknown as ActivityLog[]);
      if (usersData) setUsers(usersData as unknown as UserProfile[]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDeleteUser = async (userProfile: UserProfile) => {
    if (userProfile.user_id === user?.id) { toast.error("You cannot delete your own account!"); return; }
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', { body: { userId: userProfile.user_id } });
      if (error) { toast.error(error.message || 'Failed to delete user'); return; }
      if (data?.error) { toast.error(data.error); return; }
      toast.success(`User "${userProfile.username}" has been completely deleted`);
      fetchData();
    } catch { toast.error('Failed to delete user'); }
  };

  const handleChangeRole = async (userProfile: UserProfile, newRole: 'admin' | 'user') => {
    if (userProfile.user_id === user?.id) { toast.error("You cannot change your own role!"); return; }
    try {
      const existingRole = userProfile.user_roles?.[0];
      if (existingRole) {
        const { error } = await supabase.from('user_roles').update({ role: newRole }).eq('id', existingRole.id);
        if (error) { toast.error('Failed to update user role'); return; }
      } else {
        const { error } = await supabase.from('user_roles').insert({ user_id: userProfile.user_id, role: newRole });
        if (error) { toast.error('Failed to set user role'); return; }
      }
      toast.success(`Changed ${userProfile.username}'s role to ${newRole}`);
      fetchData();
    } catch { toast.error('Failed to change role'); }
  };

  const handleToggleApproval = async (userProfile: UserProfile, nextApproved: boolean) => {
    if (userProfile.user_id === user?.id) { toast.error("You cannot change your own approval status!"); return; }
    try {
      const { error } = await supabase.from('profiles').update({ is_approved: nextApproved }).eq('user_id', userProfile.user_id);
      if (error) { toast.error('Failed to update approval status'); return; }
      toast.success(nextApproved ? `${userProfile.username} is now approved` : `${userProfile.username} access has been revoked`);
      fetchData();
    } catch { toast.error('Failed to update approval status'); }
  };

  const handleDeleteSelectedLogs = async () => {
    if (selectedLogs.size === 0) return;
    try {
      const { error } = await supabase.from('activity_logs').delete().in('id', Array.from(selectedLogs));
      if (error) { toast.error('Failed to delete selected logs'); return; }
      toast.success(`Deleted ${selectedLogs.size} log(s)`);
      setSelectedLogs(new Set());
      fetchData();
    } catch { toast.error('Failed to delete logs'); }
  };

  const handleDeleteAllLogs = async () => {
    try {
      const { error } = await supabase.from('activity_logs').delete().gte('id', '00000000-0000-0000-0000-000000000000');
      if (error) { toast.error('Failed to delete all logs'); return; }
      toast.success('All activity logs deleted');
      setSelectedLogs(new Set());
      fetchData();
    } catch { toast.error('Failed to delete logs'); }
  };

  const toggleLogSelection = (id: string) => {
    setSelectedLogs(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const toggleAllLogs = () => {
    selectedLogs.size === activities.length ? setSelectedLogs(new Set()) : setSelectedLogs(new Set(activities.map(a => a.id)));
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin text-6xl">🔍</div>
          <p className="text-xl text-foreground/80">Loading admin intel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen relative overflow-hidden p-6">
      <div className="absolute top-6 right-6 z-50"><ThemeToggle /></div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 text-4xl animate-float drop-shadow-[0_0_20px_rgba(255,100,150,0.8)]">👑</div>
        <div className="absolute top-20 right-32 text-3xl animate-wiggle drop-shadow-[0_0_20px_rgba(100,200,255,0.8)]">🔮</div>
        <div className="absolute bottom-20 left-20 text-4xl animate-spin-slow drop-shadow-[0_0_20px_rgba(150,255,100,0.8)]">⚡</div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gradient flex items-center gap-3">
                <Shield className="h-10 w-10 text-primary" />
                Admin Command Center
              </h1>
              <p className="text-foreground/70 text-lg mt-1">
                Welcome, {profile?.username} 👑 You see everything.
              </p>
            </div>
          </div>
          <Button onClick={fetchData} className="gradient-pink-blue text-white">Refresh Data 🔄</Button>
        </div>

        {/* Stats cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-2 border-primary dark:shadow-[0_0_25px_rgba(255,100,150,0.3)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Total Users</CardTitle>
              <Users className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {users.filter(u => u.is_approved).length} approved
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-2 border-secondary dark:shadow-[0_0_25px_rgba(100,200,255,0.3)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Total Activities</CardTitle>
              <Activity className="h-6 w-6 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-secondary">{activities.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Last 250 shown
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-2 border-accent dark:shadow-[0_0_25px_rgba(255,200,100,0.3)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Admin Users</CardTitle>
              <Shield className="h-6 w-6 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-accent">
                {users.filter(u => u.user_roles?.some(r => r.role === 'admin')).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('activity')}
            className={activeTab === 'activity' ? 'gradient-pink-blue text-white' : 'bg-card border-2 border-primary/50'}
          >
            <Activity className="mr-2 h-4 w-4" /> Activity Feed
          </Button>
          <Button
            onClick={() => setActiveTab('users')}
            className={activeTab === 'users' ? 'gradient-pink-blue text-white' : 'bg-card border-2 border-primary/50'}
          >
            <Users className="mr-2 h-4 w-4" /> All Users
          </Button>
        </div>

        <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-2 border-primary/30">
          <CardContent className="p-0">
            {activeTab === 'activity' ? (
              <div>
                {activities.length > 0 && (
                  <div className="flex items-center gap-3 p-4 border-b border-border/30">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={selectedLogs.size === 0}>
                          <Trash2 className="h-4 w-4 mr-1" /> Delete Selected ({selectedLogs.size})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Selected Logs</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {selectedLogs.size} selected log(s)? This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteSelectedLogs} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" /> Delete All
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete All Logs</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete ALL {activities.length} activity logs? This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAllLogs} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete All</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

                {/* Activity feed as cards instead of raw table */}
                <div className="divide-y divide-border/20">
                  {/* Table header */}
                  <div className="grid grid-cols-[40px_1fr_auto_2fr_auto] gap-3 px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <div>
                      <Checkbox
                        checked={activities.length > 0 && selectedLogs.size === activities.length}
                        onCheckedChange={toggleAllLogs}
                      />
                    </div>
                    <div>User</div>
                    <div>Action</div>
                    <div>Details</div>
                    <div>When</div>
                  </div>

                  {activities.length === 0 ? (
                    <div className="text-center py-12 text-foreground/60">
                      No activity yet. Everyone's being too quiet... 🤫
                    </div>
                  ) : (
                    activities.map((activity) => {
                      const config = getActionConfig(activity.action_type);
                      const readable = formatReadableActivity(activity.action_type, activity.action_details);
                      const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });

                      return (
                        <div
                          key={activity.id}
                          className="grid grid-cols-[40px_1fr_auto_2fr_auto] gap-3 px-4 py-3 items-center hover:bg-card/50 transition-colors group"
                        >
                          <div>
                            <Checkbox
                              checked={selectedLogs.has(activity.id)}
                              onCheckedChange={() => toggleLogSelection(activity.id)}
                            />
                          </div>

                          {/* User */}
                          <div className="font-medium text-sm text-foreground truncate">
                            {activity.profiles?.username || 'Unknown'}
                          </div>

                          {/* Action badge */}
                          <div>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${config.color}`}>
                              {config.icon}
                              {config.label}
                            </span>
                          </div>

                          {/* Readable details */}
                          <div className="text-sm text-foreground/80 truncate" title={readable}>
                            {readable || <span className="text-muted-foreground/50">—</span>}
                          </div>

                          {/* Time */}
                          <div className="text-xs text-muted-foreground whitespace-nowrap" title={format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}>
                            {timeAgo}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="text-foreground font-bold">Username</TableHead>
                    <TableHead className="text-foreground font-bold">Role</TableHead>
                    <TableHead className="text-foreground font-bold">Approval</TableHead>
                    <TableHead className="text-foreground font-bold">Joined</TableHead>
                    <TableHead className="text-foreground font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-foreground/60">
                        No users yet. Lonely out here... 😢
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((userProfile) => {
                      const isCurrentUser = userProfile.user_id === user?.id;
                      const currentRole = userProfile.user_roles?.[0]?.role || 'user';
                      
                      return (
                        <TableRow key={userProfile.user_id} className="border-border/30 hover:bg-card/50">
                          <TableCell className="font-medium text-foreground">
                            {userProfile.username}
                            {isCurrentUser && <span className="ml-2 text-xs text-primary">(you)</span>}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              currentRole === 'admin'
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30 border'
                            }>
                              {currentRole}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={userProfile.is_approved ? 'default' : 'secondary'}>
                              {userProfile.is_approved ? 'approved' : 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground/60 text-sm">
                            {format(new Date(userProfile.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant={userProfile.is_approved ? 'secondary' : 'default'}
                                size="sm"
                                disabled={isCurrentUser}
                                className="h-8"
                                onClick={() => handleToggleApproval(userProfile, !userProfile.is_approved)}
                              >
                                {userProfile.is_approved ? 'Revoke' : 'Approve'}
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" disabled={isCurrentUser} className="h-8">
                                    <UserCog className="h-4 w-4 mr-1" /> Role
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleChangeRole(userProfile, 'admin')} disabled={currentRole === 'admin'}>
                                    <Shield className="h-4 w-4 mr-2 text-yellow-500" /> Make Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeRole(userProfile, 'user')} disabled={currentRole === 'user'}>
                                    <Users className="h-4 w-4 mr-2 text-gray-500" /> Make User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" disabled={isCurrentUser} className="h-8">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete <strong>{userProfile.username}</strong>? 
                                      This will remove their profile and roles. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(userProfile)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
