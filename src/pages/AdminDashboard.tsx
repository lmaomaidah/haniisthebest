import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Users, Activity, Shield, Trash2, UserCog, Eye, MessageCircle,
  Star, Heart, Upload, LogIn, LogOut, FileText, Zap, BarChart3, TrendingUp,
  Clock, ChevronUp, ChevronDown, Monitor, Smartphone, Globe, MapPin,
  MousePointer, Info, ExternalLink, Layers, Wifi, Cpu, Palette, UserX,
  ScreenShare, Languages
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { format, formatDistanceToNow, subDays, isAfter } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  action_details: Record<string, unknown> | null;
  created_at: string;
  profiles?: { username: string };
}

interface UserProfile {
  user_id: string;
  username: string;
  is_approved: boolean;
  created_at: string;
  avatar_url?: string | null;
  user_roles?: { id: string; role: string }[];
}

// ─── Action Config ───
const ACTION_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; category: string }> = {
  login: { icon: <LogIn className="h-3.5 w-3.5" />, label: "Sign In", color: "bg-green-500/20 text-green-400 border-green-500/40", category: "auth" },
  logout: { icon: <LogOut className="h-3.5 w-3.5" />, label: "Sign Out", color: "bg-red-500/20 text-red-400 border-red-500/40", category: "auth" },
  page_view: { icon: <Eye className="h-3.5 w-3.5" />, label: "Page View", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40", category: "navigation" },
  page_access: { icon: <Eye className="h-3.5 w-3.5" />, label: "Page View", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40", category: "navigation" },
  tier_list_save: { icon: <Star className="h-3.5 w-3.5" />, label: "Tier Save", color: "bg-purple-500/20 text-purple-400 border-purple-500/40", category: "tier" },
  tier_list_reset: { icon: <Star className="h-3.5 w-3.5" />, label: "Tier Reset", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", category: "tier" },
  tier_list_made_public: { icon: <Star className="h-3.5 w-3.5" />, label: "Tier Public", color: "bg-purple-500/20 text-purple-400 border-purple-500/40", category: "tier" },
  tier_list_made_private: { icon: <Star className="h-3.5 w-3.5" />, label: "Tier Private", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", category: "tier" },
  tier_list_exported: { icon: <Star className="h-3.5 w-3.5" />, label: "Tier Export", color: "bg-purple-500/20 text-purple-400 border-purple-500/40", category: "tier" },
  tier_custom_added: { icon: <Star className="h-3.5 w-3.5" />, label: "Custom Tier", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", category: "tier" },
  rating_save: { icon: <Zap className="h-3.5 w-3.5" />, label: "Rating", color: "bg-blue-500/20 text-blue-400 border-blue-500/40", category: "rating" },
  rating_select_person: { icon: <Zap className="h-3.5 w-3.5" />, label: "View Rating", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", category: "rating" },
  classification_save: { icon: <Layers className="h-3.5 w-3.5" />, label: "Classification", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40", category: "classify" },
  classification_exported: { icon: <Layers className="h-3.5 w-3.5" />, label: "Export", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", category: "classify" },
  classification_circle_added: { icon: <Layers className="h-3.5 w-3.5" />, label: "Add Circle", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", category: "classify" },
  venn_save: { icon: <Layers className="h-3.5 w-3.5" />, label: "Venn Save", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40", category: "classify" },
  venn_exported: { icon: <Layers className="h-3.5 w-3.5" />, label: "Venn Export", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", category: "classify" },
  venn_circle_added: { icon: <Layers className="h-3.5 w-3.5" />, label: "Venn Circle", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", category: "classify" },
  image_upload: { icon: <Upload className="h-3.5 w-3.5" />, label: "Upload", color: "bg-pink-500/20 text-pink-400 border-pink-500/40", category: "gallery" },
  image_deleted: { icon: <Trash2 className="h-3.5 w-3.5" />, label: "Delete Image", color: "bg-pink-500/20 text-pink-300 border-pink-500/30", category: "gallery" },
  ship_calculate: { icon: <Heart className="h-3.5 w-3.5" />, label: "Ship", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40", category: "ship" },
  ship_reset: { icon: <Heart className="h-3.5 w-3.5" />, label: "Ship Reset", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", category: "ship" },
  comment_post: { icon: <MessageCircle className="h-3.5 w-3.5" />, label: "Comment", color: "bg-teal-500/20 text-teal-400 border-teal-500/40", category: "social" },
  comment_deleted: { icon: <MessageCircle className="h-3.5 w-3.5" />, label: "Del Comment", color: "bg-teal-500/20 text-teal-300 border-teal-500/30", category: "social" },
  quiz_complete: { icon: <FileText className="h-3.5 w-3.5" />, label: "Quiz Done", color: "bg-orange-500/20 text-orange-400 border-orange-500/40", category: "quiz" },
  poll_created: { icon: <FileText className="h-3.5 w-3.5" />, label: "New Poll", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40", category: "poll" },
  poll_deleted: { icon: <Trash2 className="h-3.5 w-3.5" />, label: "Del Poll", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", category: "poll" },
  poll_voted: { icon: <FileText className="h-3.5 w-3.5" />, label: "Poll Vote", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40", category: "poll" },
  poll_view: { icon: <Eye className="h-3.5 w-3.5" />, label: "View Poll", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", category: "poll" },
  poll_edit_view: { icon: <Eye className="h-3.5 w-3.5" />, label: "Edit Poll", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", category: "poll" },
  poll_editor_added: { icon: <FileText className="h-3.5 w-3.5" />, label: "Add Editor", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40", category: "poll" },
  poll_results_revealed: { icon: <Eye className="h-3.5 w-3.5" />, label: "Reveal Results", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40", category: "poll" },
  poll_results_hidden: { icon: <Eye className="h-3.5 w-3.5" />, label: "Hide Results", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", category: "poll" },
  poll_joined_via_invite: { icon: <FileText className="h-3.5 w-3.5" />, label: "Join Invite", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40", category: "poll" },
  admin_user_deleted: { icon: <Trash2 className="h-3.5 w-3.5" />, label: "User Delete", color: "bg-destructive/20 text-destructive border-destructive/40", category: "admin" },
};

function getActionConfig(actionType: string) {
  return ACTION_CONFIG[actionType] || {
    icon: <Activity className="h-3.5 w-3.5" />,
    label: actionType.replace(/_/g, ' '),
    color: "bg-muted text-muted-foreground border-border",
    category: "other",
  };
}

// ─── Rich, human-readable activity descriptions ───
function formatReadableActivity(actionType: string, details: Record<string, unknown> | null): { summary: string; bullets: string[] } {
  const bullets: string[] = [];
  if (!details) return { summary: "", bullets };

  const pageName = details.page_name as string | undefined;
  const pagePath = (details.page_path || details.page) as string | undefined;
  const ctx = details.context as Record<string, unknown> | undefined;

  switch (actionType) {
    case "page_view":
    case "page_access": {
      const name = pageName || "a page";
      const path = (ctx?.page_path || pagePath) as string | undefined;
      return {
        summary: `Navigated to ${name}`,
        bullets: path ? [`Route: ${path}`] : [],
      };
    }
    case "login": {
      const username = details.username as string | undefined;
      return {
        summary: `Signed into the platform${username ? ` as "${username}"` : ""}`,
        bullets: [],
      };
    }
    case "logout":
      return { summary: "Signed out of the platform", bullets: [] };
    case "tier_list_save": {
      const counts = details.tierCounts as Record<string, number> | undefined;
      if (counts) {
        const parts = Object.entries(counts).filter(([, v]) => v > 0).map(([k, v]) => `${k}: ${v} people`);
        return {
          summary: `Saved their tier list rankings`,
          bullets: parts.length > 0 ? [`Placement breakdown — ${parts.join(", ")}`] : [],
        };
      }
      return { summary: "Saved their tier list rankings", bullets: [] };
    }
    case "tier_list_reset":
      return { summary: "Reset all tier list rankings to start fresh", bullets: [] };
    case "tier_list_made_public":
      return { summary: "Made their tier list visible to all users", bullets: [] };
    case "tier_list_made_private":
      return { summary: "Changed their tier list to private (only they can see it)", bullets: [] };
    case "tier_list_exported":
      return { summary: "Downloaded their tier list as an image file", bullets: [] };
    case "tier_custom_added": {
      const label = details.label as string | undefined;
      return {
        summary: label ? `Created a custom tier row labeled "${label}"` : "Added a custom tier row",
        bullets: [],
      };
    }
    case "ship_calculate": {
      const p1 = details.person1 as string | undefined;
      const p2 = details.person2 as string | undefined;
      const score = details.score as number | undefined;
      if (p1 && p2) {
        bullets.push(`Paired: ${p1} × ${p2}`);
        if (score != null) bullets.push(`Compatibility score: ${score}%`);
        return { summary: `Calculated ship compatibility between ${p1} and ${p2}`, bullets };
      }
      return { summary: "Calculated ship compatibility", bullets: [] };
    }
    case "ship_reset":
      return { summary: "Reset the Ship-O-Meter to try a new pairing", bullets: [] };
    case "rating_save": {
      const name = (details.imageName || details.image_name || details.name) as string | undefined;
      const total = details.total as number | undefined;
      const sa = details.sex_appeal as number | undefined;
      const cd = details.character_design as number | undefined;
      const iq = details.iq as number | undefined;
      const eq = details.eq as number | undefined;
      if (name) {
        bullets.push(`Person rated: ${name}`);
        if (total != null) bullets.push(`Overall score: ${total}/40`);
        const breakdown: string[] = [];
        if (sa != null) breakdown.push(`Sex Appeal: ${sa}/10`);
        if (cd != null) breakdown.push(`Character Design: ${cd}/10`);
        if (iq != null) breakdown.push(`IQ: ${iq}/10`);
        if (eq != null) breakdown.push(`EQ: ${eq}/10`);
        if (breakdown.length > 0) bullets.push(breakdown.join(" · "));
        return { summary: `Rated ${name}${total != null ? ` with a score of ${total}/40` : ""}`, bullets };
      }
      return { summary: "Submitted ratings for a classmate", bullets: [] };
    }
    case "rating_select_person": {
      const person = details.person as string | undefined;
      return {
        summary: person ? `Opened the rating panel for ${person}` : "Selected a person to rate",
        bullets: [],
      };
    }
    case "image_upload": {
      const imgName = details.name as string | undefined;
      return {
        summary: imgName ? `Uploaded a new classmate photo: "${imgName}"` : "Uploaded a new classmate photo",
        bullets: [],
      };
    }
    case "image_deleted":
      return { summary: "Removed a classmate image from the gallery", bullets: [] };
    case "classification_save": {
      const circles = details.circles as number | undefined;
      const placed = details.placed as number | undefined;
      return {
        summary: "Saved their classification diagram",
        bullets: [
          `${circles || 0} circle(s) configured`,
          `${placed || 0} classmate(s) placed into circles`,
        ],
      };
    }
    case "classification_exported":
      return { summary: "Exported their classification diagram as an image", bullets: [] };
    case "classification_circle_added": {
      const label = details.label as string | undefined;
      return {
        summary: label ? `Added a new classification circle labeled "${label}"` : "Added a new circle to their classification",
        bullets: [],
      };
    }
    case "venn_save": {
      const circles = details.circles as number | undefined;
      const placed = details.placed as number | undefined;
      return {
        summary: "Saved their Venn diagram",
        bullets: [
          `${circles || 0} circle(s) in diagram`,
          `${placed || 0} classmate(s) placed`,
        ],
      };
    }
    case "venn_exported":
      return { summary: "Exported their Venn diagram as an image", bullets: [] };
    case "venn_circle_added": {
      const label = details.label as string | undefined;
      return {
        summary: label ? `Added a Venn diagram circle labeled "${label}"` : "Added a new circle to their Venn diagram",
        bullets: [],
      };
    }
    case "comment_post": {
      const ct = details.content_type as string | undefined;
      const isReply = details.is_reply as boolean | undefined;
      const len = details.body_length as number | undefined;
      const contentId = details.content_id as string | undefined;
      const section = ct ? ct.replace(/_/g, " ") : "unknown section";
      if (isReply) {
        return {
          summary: `Replied to a comment on ${section}`,
          bullets: [
            len ? `Reply length: ${len} characters` : "",
            contentId ? `Content thread: ${contentId.slice(0, 8)}…` : "",
          ].filter(Boolean),
        };
      }
      return {
        summary: `Posted a new comment on ${section}`,
        bullets: [
          len ? `Comment length: ${len} characters` : "",
          contentId ? `Content thread: ${contentId.slice(0, 8)}…` : "",
        ].filter(Boolean),
      };
    }
    case "comment_deleted": {
      const ct = details.content_type as string | undefined;
      return {
        summary: `Deleted a comment${ct ? ` from ${ct.replace(/_/g, " ")}` : ""}`,
        bullets: [],
      };
    }
    case "poll_created": {
      const title = details.title as string | undefined;
      return {
        summary: title ? `Created a new poll: "${title}"` : "Created a new poll",
        bullets: [],
      };
    }
    case "poll_deleted": {
      const title = details.title as string | undefined;
      return {
        summary: title ? `Deleted the poll: "${title}"` : "Deleted a poll",
        bullets: [],
      };
    }
    case "poll_voted": {
      const count = details.votes_count as number | undefined;
      const title = details.poll_title as string | undefined;
      return {
        summary: `Submitted ${count || 0} vote(s)${title ? ` on "${title}"` : " on a poll"}`,
        bullets: [],
      };
    }
    case "poll_view": {
      const title = details.poll_title || details.title as string | undefined;
      return {
        summary: title ? `Viewed the poll: "${title}"` : "Viewed a poll",
        bullets: [],
      };
    }
    case "poll_edit_view":
      return { summary: "Opened the poll editor to modify questions", bullets: [] };
    case "poll_editor_added": {
      const editorName = details.editor_username as string | undefined;
      return {
        summary: editorName ? `Added "${editorName}" as a poll collaborator` : "Added a collaborator to their poll",
        bullets: [],
      };
    }
    case "poll_results_revealed":
      return { summary: "Revealed the poll results to all participants", bullets: [] };
    case "poll_results_hidden":
      return { summary: "Hid the poll results from participants", bullets: [] };
    case "poll_joined_via_invite":
      return { summary: "Joined a poll through an invite link", bullets: [] };
    case "quiz_complete": {
      const result = details.result as string | undefined;
      const score = details.score as number | undefined;
      if (result) bullets.push(`Result: ${result}`);
      if (score != null) bullets.push(`Score: ${score}`);
      return {
        summary: result ? `Completed the Judgement Quiz — result: "${result}"` : "Completed the Judgement Quiz",
        bullets,
      };
    }
    case "admin_user_deleted": {
      const username = (details.username || details.deleted_username) as string | undefined;
      return {
        summary: username ? `Permanently deleted user "${username}" and all their data` : "Permanently deleted a user account",
        bullets: [],
      };
    }
    default: {
      const contextKeys = new Set(['page_path', 'page_url', 'referrer', 'timezone', 'locale', 'viewport', 'user_agent', 'client_time', 'context', 'source', 'page', 'page_name']);
      const meaningful = Object.entries(details)
        .filter(([key]) => !contextKeys.has(key))
        .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${String(value)}`)
        .slice(0, 4);
      return {
        summary: actionType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        bullets: meaningful,
      };
    }
  }
}

// ─── Parse user agent into readable device/browser ───
function parseUserAgent(ua: string | undefined): { browser: string; device: string } {
  if (!ua) return { browser: "Unknown", device: "Unknown" };
  let browser = "Unknown";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

  let device = "Desktop";
  if (/iPhone|iPad/i.test(ua)) device = "iPhone/iPad";
  else if (/Android/i.test(ua)) device = "Android";
  else if (/Mobile/i.test(ua)) device = "Mobile";

  return { browser, device };
}

// ─── Extract context metadata from activity details ───
function extractContext(details: Record<string, unknown> | null): {
  browser: string; device: string; viewport: string; timezone: string; pagePath: string; referrer: string; clientTime: string;
} {
  const ctx = (details?.context || {}) as Record<string, unknown>;
  const ua = parseUserAgent(ctx.user_agent as string | undefined);
  return {
    browser: ua.browser,
    device: ua.device,
    viewport: (ctx.viewport as string) || "—",
    timezone: (ctx.timezone as string) || "—",
    pagePath: (ctx.page_path as string) || (details?.page_path as string) || "—",
    referrer: (ctx.referrer as string) || "—",
    clientTime: (ctx.client_time as string) || "—",
  };
}

const AdminDashboard = () => {
  const { user, isAdmin, loading, profile } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'activity' | 'users' | 'insights'>('insights');
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [activityUserFilter, setActivityUserFilter] = useState<string>('all');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  const [activitySearch, setActivitySearch] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) navigate('/auth');
      else if (!isAdmin) navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => { if (isAdmin) fetchData(); }, [isAdmin]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [{ data: activityData }, { data: usersData }] = await Promise.all([
        supabase.from('activity_logs').select('*, profiles(username)').order('created_at', { ascending: false }).limit(1000),
        supabase.from('profiles').select('*, user_roles(id, role)').order('created_at', { ascending: false }),
      ]);
      if (activityData) setActivities(activityData as unknown as ActivityLog[]);
      if (usersData) setUsers(usersData as unknown as UserProfile[]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally { setLoadingData(false); }
  };

  // ─── Computed analytics ───
  const analytics = useMemo(() => {
    const now = new Date();
    const last7 = subDays(now, 7);

    const recentActivities = activities.filter(a => isAfter(new Date(a.created_at), last7));
    const todayActivities = activities.filter(a => new Date(a.created_at).toDateString() === now.toDateString());

    const actionCounts: Record<string, number> = {};
    activities.forEach(a => { actionCounts[a.action_type] = (actionCounts[a.action_type] || 0) + 1; });
    const topActions = Object.entries(actionCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

    const userActivityCounts: Record<string, { count: number; username: string }> = {};
    recentActivities.forEach(a => {
      const un = a.profiles?.username || 'Unknown';
      if (!userActivityCounts[a.user_id]) userActivityCounts[a.user_id] = { count: 0, username: un };
      userActivityCounts[a.user_id].count++;
    });
    const topUsers = Object.values(userActivityCounts).sort((a, b) => b.count - a.count).slice(0, 5);

    const pageCounts: Record<string, number> = {};
    activities.filter(a => a.action_type === 'page_view' || a.action_type === 'page_access').forEach(a => {
      const page = (a.action_details?.page_name || a.action_details?.page_path || 'Unknown') as string;
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const activeUsersToday = new Set(todayActivities.map(a => a.user_id)).size;
    const activeUsersWeek = new Set(recentActivities.map(a => a.user_id)).size;

    const dailyCounts: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = subDays(now, i);
      const dayStr = day.toDateString();
      dailyCounts.push(activities.filter(a => new Date(a.created_at).toDateString() === dayStr).length);
    }

    return { topActions, topUsers, topPages, activeUsersToday, activeUsersWeek, todayActivities: todayActivities.length, weeklyActivities: recentActivities.length, dailyCounts };
  }, [activities]);

  // ─── Handlers ───
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

  // Mini sparkline component
  const Sparkline = ({ data }: { data: number[] }) => {
    const max = Math.max(...data, 1);
    return (
      <div className="flex items-end gap-0.5 h-8">
        {data.map((v, i) => (
          <div key={i} className="flex-1 rounded-sm bg-primary/60 min-w-[4px] transition-all" style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? '2px' : '0' }} />
        ))}
      </div>
    );
  };

  // ─── Context detail chip ───
  const ContextChip = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => {
    if (!value || value === "—") return null;
    return (
      <div className="flex items-center gap-1.5 rounded-lg bg-muted/40 border border-border/30 px-2.5 py-1.5">
        <span className="text-muted-foreground">{icon}</span>
        <div className="flex flex-col">
          <span className="text-[9px] text-muted-foreground/70 uppercase tracking-wider font-semibold leading-none">{label}</span>
          <span className="text-[11px] text-foreground/80 font-medium leading-tight truncate max-w-[180px]">{value}</span>
        </div>
      </div>
    );
  };

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
            <Link to="/"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-6 w-6" /></Button></Link>
            <div>
              <h1 className="text-4xl font-bold text-gradient flex items-center gap-3">
                <Shield className="h-10 w-10 text-primary" /> Admin Command Center
              </h1>
              <p className="text-foreground/70 text-lg mt-1">Welcome, {profile?.username} 👑 You see everything.</p>
            </div>
          </div>
          <Button onClick={fetchData} className="gradient-pink-blue text-white">Refresh Data 🔄</Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total Users', value: users.length, sub: `${users.filter(u => u.is_approved).length} approved`, icon: <Users className="h-5 w-5" />, gradient: 'from-primary to-secondary' },
            { label: 'Today', value: analytics.todayActivities, sub: `${analytics.activeUsersToday} active users`, icon: <Clock className="h-5 w-5" />, gradient: 'from-secondary to-accent' },
            { label: 'This Week', value: analytics.weeklyActivities, sub: `${analytics.activeUsersWeek} active users`, icon: <TrendingUp className="h-5 w-5" />, gradient: 'from-accent to-primary' },
            { label: 'Admins', value: users.filter(u => u.user_roles?.some(r => r.role === 'admin')).length, sub: 'with full access', icon: <Shield className="h-5 w-5" />, gradient: 'from-primary to-accent' },
            { label: 'Pending', value: users.filter(u => !u.is_approved).length, sub: 'awaiting approval', icon: <Eye className="h-5 w-5" />, gradient: 'from-secondary to-primary' },
          ].map((stat, i) => (
            <Card key={i} className="bg-card/80 backdrop-blur-sm border border-border/40 overflow-hidden">
              <div className={`h-1 w-full bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="pt-3 pb-3 px-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{stat.icon}</div>
                </div>
                <p className="text-2xl font-black text-foreground tabular-nums">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab buttons */}
        <div className="flex gap-3 mb-6">
          {[
            { key: 'insights' as const, icon: <BarChart3 className="h-4 w-4 mr-1.5" />, label: 'Insights' },
            { key: 'activity' as const, icon: <Activity className="h-4 w-4 mr-1.5" />, label: 'Activity Feed' },
            { key: 'users' as const, icon: <Users className="h-4 w-4 mr-1.5" />, label: 'All Users' },
          ].map(t => (
            <Button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={activeTab === t.key ? 'gradient-pink-blue text-white' : 'bg-card border-2 border-primary/50'}
              size="sm"
            >
              {t.icon} {t.label}
            </Button>
          ))}
        </div>

        {/* ─── Insights Tab ─── */}
        {activeTab === 'insights' && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-card/80 backdrop-blur-sm border border-border/40">
              <CardContent className="pt-5 pb-4">
                <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> 7-Day Activity
                </h3>
                <p className="text-[10px] text-muted-foreground mb-3">{analytics.weeklyActivities} total actions this week</p>
                <Sparkline data={analytics.dailyCounts} />
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-muted-foreground">6d ago</span>
                  <span className="text-[9px] text-muted-foreground">Today</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-border/40">
              <CardContent className="pt-5 pb-4">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-secondary" /> Action Breakdown
                </h3>
                <div className="space-y-2">
                  {analytics.topActions.map(([action, count]) => {
                    const config = getActionConfig(action);
                    const pct = Math.round((count / Math.max(activities.length, 1)) * 100);
                    return (
                      <div key={action} className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${config.color} min-w-[90px]`}>
                          {config.icon} {config.label}
                        </span>
                        <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                          <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="bg-card/80 backdrop-blur-sm border border-border/40">
                <CardContent className="pt-5 pb-4">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" /> Most Active Users
                    <span className="text-[9px] text-muted-foreground font-normal">(7 days)</span>
                  </h3>
                  <div className="space-y-2">
                    {analytics.topUsers.map((u, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary w-4">{i + 1}.</span>
                        <div
                          className="h-5 w-5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-background"
                          style={{ backgroundColor: `hsl(${u.username.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360} 65% 50%)` }}
                        >{u.username[0].toUpperCase()}</div>
                        <span className="text-xs font-medium text-foreground flex-1 truncate">{u.username}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{u.count} actions</span>
                      </div>
                    ))}
                    {analytics.topUsers.length === 0 && <p className="text-xs text-muted-foreground">No activity this week</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border border-border/40">
                <CardContent className="pt-5 pb-4">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-secondary" /> Top Pages
                  </h3>
                  <div className="space-y-1.5">
                    {analytics.topPages.map(([page, count], i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-foreground flex-1 truncate">{page}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{count}</span>
                      </div>
                    ))}
                    {analytics.topPages.length === 0 && <p className="text-xs text-muted-foreground">No page views yet</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ─── Activity Feed Tab ─── */}
        {activeTab === 'activity' && (() => {
          const uniqueUsers = Array.from(new Set(activities.map(a => a.profiles?.username || 'Unknown'))).sort();
          const uniqueTypes = Array.from(new Set(activities.map(a => a.action_type))).sort();
          const searchLower = activitySearch.toLowerCase();

          const filteredActivities = activities.filter(a => {
            if (activityUserFilter !== 'all' && (a.profiles?.username || 'Unknown') !== activityUserFilter) return false;
            if (activityTypeFilter !== 'all' && a.action_type !== activityTypeFilter) return false;
            if (searchLower) {
              const { summary } = formatReadableActivity(a.action_type, a.action_details);
              const username = (a.profiles?.username || '').toLowerCase();
              const actionLabel = getActionConfig(a.action_type).label.toLowerCase();
              if (!summary.toLowerCase().includes(searchLower) && !username.includes(searchLower) && !actionLabel.includes(searchLower)) return false;
            }
            return true;
          });

          return (
            <Card className="bg-card/80 backdrop-blur-sm border border-border/40 overflow-hidden">
              <CardContent className="p-0">
                {/* Filters bar */}
                <div className="flex flex-wrap items-center gap-2 p-4 border-b border-border/20 bg-muted/10">
                  <input
                    type="text"
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    placeholder="Search activity..."
                    className="h-8 px-3 text-sm rounded-lg bg-background/50 border border-border/40 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 w-48"
                  />
                  <select
                    value={activityUserFilter}
                    onChange={(e) => setActivityUserFilter(e.target.value)}
                    className="h-8 px-2 text-sm rounded-lg bg-background/50 border border-border/40 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="all">All users</option>
                    {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <select
                    value={activityTypeFilter}
                    onChange={(e) => setActivityTypeFilter(e.target.value)}
                    className="h-8 px-2 text-sm rounded-lg bg-background/50 border border-border/40 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="all">All actions</option>
                    {uniqueTypes.map(t => <option key={t} value={t}>{getActionConfig(t).label} ({t})</option>)}
                  </select>
                  <span className="text-[11px] text-muted-foreground ml-auto font-mono">{filteredActivities.length} / {activities.length}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={selectedLogs.size === 0}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> {selectedLogs.size}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Logs</AlertDialogTitle>
                        <AlertDialogDescription>Delete {selectedLogs.size} selected log(s)? This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSelectedLogs} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm"><Trash2 className="h-3.5 w-3.5 mr-1" /> All</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete All Logs</AlertDialogTitle>
                        <AlertDialogDescription>Delete ALL {activities.length} activity logs? This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAllLogs} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete All</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Column headers */}
                <div className="flex items-center gap-3 px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/15 border-b border-border/15">
                  <div className="w-7">
                    <Checkbox
                      checked={filteredActivities.length > 0 && selectedLogs.size === filteredActivities.length}
                      onCheckedChange={() => {
                        if (selectedLogs.size === filteredActivities.length) setSelectedLogs(new Set());
                        else setSelectedLogs(new Set(filteredActivities.map(a => a.id)));
                      }}
                    />
                  </div>
                  <div className="w-24">User</div>
                  <div className="w-28">Action</div>
                  <div className="flex-1">What happened</div>
                  <div className="w-32 text-right">When</div>
                  <div className="w-8"></div>
                </div>

                {filteredActivities.length === 0 ? (
                  <div className="text-center py-16 text-foreground/50">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                    {activities.length === 0 ? "No activity yet. Everyone's being too quiet... 🤫" : "No logs match your filters."}
                  </div>
                ) : (
                  <div className="divide-y divide-border/10">
                    {filteredActivities.map((activity) => {
                      const config = getActionConfig(activity.action_type);
                      const { summary, bullets } = formatReadableActivity(activity.action_type, activity.action_details);
                      const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });
                      const exactTime = format(new Date(activity.created_at), 'MMM d, yyyy · h:mm:ss a');
                      const isLogExpanded = expandedLogId === activity.id;
                      const context = extractContext(activity.action_details);

                      return (
                        <div key={activity.id}>
                          {/* Main row */}
                          <div
                            className={`flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer group ${
                              selectedLogs.has(activity.id) ? "bg-primary/5" : "hover:bg-muted/8"
                            }`}
                            onClick={() => setExpandedLogId(isLogExpanded ? null : activity.id)}
                          >
                            <div className="w-7" onClick={(e) => e.stopPropagation()}>
                              <Checkbox checked={selectedLogs.has(activity.id)} onCheckedChange={() => toggleLogSelection(activity.id)} />
                            </div>
                            <div className="w-24 flex items-center gap-1.5 min-w-0">
                              <div
                                className="h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-background shadow-sm"
                                style={{ backgroundColor: `hsl(${(activity.profiles?.username || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360} 60% 45%)` }}
                              >
                                {(activity.profiles?.username || "?")[0].toUpperCase()}
                              </div>
                              <span className="text-sm font-semibold text-foreground truncate">{activity.profiles?.username || 'Unknown'}</span>
                            </div>
                            <div className="w-28">
                              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${config.color}`}>
                                {config.icon} {config.label}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground/85 truncate font-medium">
                                {summary || <span className="text-muted-foreground/40 italic">No details</span>}
                              </p>
                              {bullets.length > 0 && (
                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                  {bullets[0]}
                                </p>
                              )}
                            </div>
                            <div className="w-32 text-right">
                              <p className="text-[11px] text-muted-foreground whitespace-nowrap">{timeAgo}</p>
                              <p className="text-[9px] text-muted-foreground/50 whitespace-nowrap">{format(new Date(activity.created_at), 'h:mm a')}</p>
                            </div>
                            <div className="w-8 flex items-center justify-center">
                              <Info className={`h-3.5 w-3.5 transition-colors ${isLogExpanded ? 'text-primary' : 'text-muted-foreground/30 group-hover:text-muted-foreground/60'}`} />
                            </div>
                          </div>

                          {/* Expanded detail panel */}
                          {isLogExpanded && (
                            <div className="bg-muted/8 border-t border-border/10 px-4 py-4">
                              <div className="ml-7 space-y-3">
                                {/* Full description */}
                                <div className="bg-background/60 rounded-xl border border-border/20 p-4">
                                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold mb-1.5">Full Description</p>
                                  <p className="text-sm text-foreground font-medium">{summary}</p>
                                  {bullets.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                      {bullets.map((b, i) => (
                                        <li key={i} className="text-[12px] text-foreground/70 flex items-start gap-1.5">
                                          <span className="text-primary mt-0.5">•</span>
                                          {b}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  <p className="text-[10px] text-muted-foreground/50 mt-2 font-mono">{exactTime}</p>
                                </div>

                                {/* Context metadata chips */}
                                <div>
                                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold mb-2">Session Context</p>
                                  <div className="flex flex-wrap gap-2">
                                    <ContextChip icon={<Monitor className="h-3 w-3" />} label="Browser" value={context.browser} />
                                    <ContextChip icon={<Smartphone className="h-3 w-3" />} label="Device" value={context.device} />
                                    <ContextChip icon={<MousePointer className="h-3 w-3" />} label="Viewport" value={context.viewport} />
                                    <ContextChip icon={<Globe className="h-3 w-3" />} label="Timezone" value={context.timezone} />
                                    <ContextChip icon={<ExternalLink className="h-3 w-3" />} label="Page Route" value={context.pagePath} />
                                    {context.referrer !== "—" && context.referrer && (
                                      <ContextChip icon={<MapPin className="h-3 w-3" />} label="Referrer" value={context.referrer} />
                                    )}
                                  </div>
                                </div>

                                {/* Raw data (collapsed) */}
                                <details className="group">
                                  <summary className="text-[10px] text-muted-foreground/40 cursor-pointer hover:text-muted-foreground/70 transition-colors font-mono">
                                    View raw JSON payload
                                  </summary>
                                  <pre className="mt-2 text-[10px] text-muted-foreground/60 bg-background/40 rounded-lg p-3 overflow-auto max-h-48 border border-border/15 font-mono leading-relaxed">
                                    {JSON.stringify(activity.action_details, null, 2)}
                                  </pre>
                                </details>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* ─── Users Tab ─── */}
        {activeTab === 'users' && (() => {
          const userActivityMap = new Map<string, ActivityLog[]>();
          activities.forEach(a => {
            const list = userActivityMap.get(a.user_id) || [];
            if (list.length < 10) list.push(a);
            userActivityMap.set(a.user_id, list);
          });

          return (
            <Card className="bg-card/80 backdrop-blur-sm border border-border/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-foreground font-bold w-8"></TableHead>
                      <TableHead className="text-foreground font-bold">Username</TableHead>
                      <TableHead className="text-foreground font-bold">Role</TableHead>
                      <TableHead className="text-foreground font-bold">Approval</TableHead>
                      <TableHead className="text-foreground font-bold">Joined</TableHead>
                      <TableHead className="text-foreground font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-foreground/60">No users yet 😢</TableCell></TableRow>
                    ) : (
                      users.map((userProfile) => {
                        const isCurrentUser = userProfile.user_id === user?.id;
                        const currentRole = userProfile.user_roles?.[0]?.role || 'user';
                        const isExpanded = expandedUserId === userProfile.user_id;
                        const userLogs = userActivityMap.get(userProfile.user_id) || [];

                        return (
                          <React.Fragment key={userProfile.user_id}>
                            <TableRow className="border-border/30 hover:bg-card/50">
                              <TableCell className="w-8 px-2">
                                <button
                                  onClick={() => setExpandedUserId(isExpanded ? null : userProfile.user_id)}
                                  className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-muted/40 transition-colors text-muted-foreground"
                                >
                                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                              </TableCell>
                              <TableCell className="font-medium text-foreground">
                                {userProfile.username}
                                {isCurrentUser && <span className="ml-2 text-xs text-primary">(you)</span>}
                                <span className="ml-2 text-[10px] text-muted-foreground">{userLogs.length > 0 ? `${userLogs.length} recent` : 'no activity'}</span>
                              </TableCell>
                              <TableCell>
                                <Badge className={currentRole === 'admin' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border' : 'bg-muted text-muted-foreground border-border border'}>
                                  {currentRole}
                                </Badge>
                              </TableCell>
                              <TableCell><Badge variant={userProfile.is_approved ? 'default' : 'secondary'}>{userProfile.is_approved ? 'approved' : 'pending'}</Badge></TableCell>
                              <TableCell className="text-foreground/60 text-sm">{format(new Date(userProfile.created_at), 'MMM d, yyyy')}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button variant={userProfile.is_approved ? 'secondary' : 'default'} size="sm" disabled={isCurrentUser} className="h-8" onClick={() => handleToggleApproval(userProfile, !userProfile.is_approved)}>
                                    {userProfile.is_approved ? 'Revoke' : 'Approve'}
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="outline" size="sm" disabled={isCurrentUser} className="h-8"><UserCog className="h-4 w-4 mr-1" /> Role</Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleChangeRole(userProfile, 'admin')} disabled={currentRole === 'admin'}><Shield className="h-4 w-4 mr-2 text-yellow-500" /> Make Admin</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleChangeRole(userProfile, 'user')} disabled={currentRole === 'user'}><Users className="h-4 w-4 mr-2" /> Make User</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="destructive" size="sm" disabled={isCurrentUser} className="h-8"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                                        <AlertDialogDescription>Delete <strong>{userProfile.username}</strong>? This removes their profile and all data. Cannot be undone.</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteUser(userProfile)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                            {/* Inline activity timeline */}
                            {isExpanded && (
                              <TableRow className="border-border/20 bg-muted/5">
                                <TableCell colSpan={6} className="p-0">
                                  <div className="px-6 py-4">
                                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                                      Recent Activity — {userProfile.username}
                                    </p>
                                    {userLogs.length === 0 ? (
                                      <p className="text-xs text-muted-foreground/50 italic py-2">No activity recorded yet.</p>
                                    ) : (
                                      <div className="relative pl-5 border-l-2 border-primary/20 space-y-3">
                                        {userLogs.map((log) => {
                                          const cfg = getActionConfig(log.action_type);
                                          const { summary, bullets: logBullets } = formatReadableActivity(log.action_type, log.action_details);
                                          const ago = formatDistanceToNow(new Date(log.created_at), { addSuffix: true });
                                          const ctx = extractContext(log.action_details);
                                          return (
                                            <div key={log.id} className="relative group">
                                              {/* Timeline dot */}
                                              <div className="absolute -left-[1.45rem] top-1.5 h-3 w-3 rounded-full bg-primary/30 border-2 border-background group-hover:bg-primary transition-colors" />
                                              <div className="flex items-start gap-2">
                                                <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border flex-shrink-0 ${cfg.color}`}>
                                                  {cfg.icon} {cfg.label}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-xs text-foreground/80 font-medium">{summary || '—'}</p>
                                                  {logBullets.length > 0 && (
                                                    <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">{logBullets[0]}</p>
                                                  )}
                                                  <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] text-muted-foreground/40">{ctx.browser} · {ctx.device}</span>
                                                  </div>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground/50 whitespace-nowrap flex-shrink-0" title={format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}>
                                                  {ago}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })()}
      </div>
    </div>
  );
};

export default AdminDashboard;
