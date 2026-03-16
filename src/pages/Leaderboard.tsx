import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import { CommentSection } from "@/components/CommentSection";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { withSignedClassmateImageUrls } from "@/lib/classmateImages";
import {
  Trophy,
  Heart,
  Star,
  Trash2,
  ChevronDown,
  ChevronUp,
  Flame,
  MessageCircle as MessageCircleIcon,
  Shield,
  Compass,
  Crown,
  Zap,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

interface ShipEntry {
  id: string;
  action_details: any;
  created_at: string;
  user_id: string;
  username?: string;
  avatar_url?: string | null;
}

interface TierListEntry {
  id: string;
  name: string;
  tiers: any;
  created_at: string;
  updated_at: string;
  user_id: string;
  username?: string;
  avatar_url?: string | null;
}

interface ClassmateImage {
  id: string;
  name: string;
  image_url: string | null;
}

const getMedal = (index: number) => {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return null;
};

const getScoreGradient = (score: number) => {
  if (score >= 90) return "from-primary via-secondary to-accent";
  if (score >= 75) return "from-accent via-primary to-secondary";
  if (score >= 60) return "from-primary/80 to-accent/80";
  if (score >= 45) return "from-muted-foreground/50 to-muted-foreground/30";
  return "from-destructive/60 to-destructive/30";
};

const getVerdict = (score: number) => {
  if (score >= 90) return { text: "Legendary Pair", emoji: "👑" };
  if (score >= 75) return { text: "Power Couple", emoji: "⚡" };
  if (score >= 60) return { text: "Solid Match", emoji: "✨" };
  if (score >= 45) return { text: "Work In Progress", emoji: "🔧" };
  return { text: "Chaotic Orbit", emoji: "💥" };
};

const tierColors: Record<string, string> = {
  S: "from-primary to-secondary border-primary/50",
  A: "from-accent to-primary border-accent/50",
  B: "from-secondary to-accent border-secondary/50",
  C: "from-muted-foreground/40 to-muted-foreground/20 border-muted-foreground/30",
  D: "from-destructive/40 to-destructive/20 border-destructive/30",
  F: "from-destructive/60 to-destructive/30 border-destructive/40",
};

const Leaderboard = () => {
  const { isAdmin, logActivity } = useAuth();
  const { toast } = useToast();

  const [ships, setShips] = useState<ShipEntry[]>([]);
  const [tierLists, setTierLists] = useState<TierListEntry[]>([]);
  const [classmates, setClassmates] = useState<Map<string, ClassmateImage>>(new Map());
  const [loadingShips, setLoadingShips] = useState(true);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [expandedShip, setExpandedShip] = useState<string | null>(null);
  const [expandedTier, setExpandedTier] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ships" | "tiers">("ships");

  const handleTabChange = (tab: "ships" | "tiers") => {
    setActiveTab(tab);
    void logActivity("leaderboard_tab_switch", { tab, ships_loaded: ships.length, tiers_loaded: tierLists.length });
  };

  const handleExpandShip = (id: string) => {
    const next = expandedShip === id ? null : id;
    setExpandedShip(next);
    if (next) {
      const ship = ships.find(s => s.id === next);
      void logActivity("leaderboard_expand_ship", {
        person1: ship?.action_details?.person1,
        person2: ship?.action_details?.person2,
        score: ship?.action_details?.score,
        shipper: ship?.username,
      });
    }
  };

  const handleExpandTier = (id: string) => {
    const next = expandedTier === id ? null : id;
    setExpandedTier(next);
    if (next) {
      const tier = tierLists.find(t => t.id === next);
      void logActivity("leaderboard_expand_tier", { tier_name: tier?.name, owner: tier?.username });
    }
  };

  const fetchClassmates = useCallback(async () => {
    const { data } = await supabase
      .from("images")
      .select("id, name, image_url")
      .limit(10000);
    if (data) {
      const signed = await withSignedClassmateImageUrls(data);
      const map = new Map<string, ClassmateImage>();
      signed.forEach((img) => {
        map.set(img.id, img);
        map.set(img.name.trim().toLowerCase(), img);
      });
      setClassmates(map);
    }
  }, []);

  const fetchShips = useCallback(async () => {
    setLoadingShips(true);
    const { data } = await supabase
      .from("activity_logs")
      .select("id, action_details, created_at, user_id")
      .eq("action_type", "ship_calculate")
      .order("created_at", { ascending: false })
      .limit(200);

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((d) => d.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      const bestByPair = new Map<string, ShipEntry>();
      for (const entry of data) {
        const details = entry.action_details as any;
        const p1 = details?.person1 || "";
        const p2 = details?.person2 || "";
        const pairKey = [p1, p2].sort().join("|||");
        const score = details?.score ?? 0;
        const existing = bestByPair.get(pairKey);

        if (!existing || (existing.action_details?.score ?? 0) < score) {
          const profile = profileMap.get(entry.user_id);
          bestByPair.set(pairKey, {
            ...entry,
            username: profile?.username || "Unknown",
            avatar_url: profile?.avatar_url || null,
          });
        }
      }

      setShips(
        Array.from(bestByPair.values()).sort(
          (a, b) => (b.action_details?.score ?? 0) - (a.action_details?.score ?? 0)
        )
      );
    }
    setLoadingShips(false);
  }, []);

  const fetchTierLists = useCallback(async () => {
    setLoadingTiers(true);
    const { data } = await supabase
      .from("tier_lists")
      .select("id, name, tiers, created_at, updated_at, user_id")
      .eq("is_public", true)
      .order("updated_at", { ascending: false })
      .limit(100);

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((d) => d.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      setTierLists(
        data.map((tl) => {
          const profile = profileMap.get(tl.user_id);
          return {
            ...tl,
            username: profile?.username || "Unknown",
            avatar_url: profile?.avatar_url || null,
          };
        })
      );
    }
    setLoadingTiers(false);
  }, []);

  useEffect(() => {
    fetchClassmates();
    fetchShips();
    fetchTierLists();
  }, [fetchClassmates, fetchShips, fetchTierLists]);

  const handleDeleteShip = async (id: string) => {
    const { error } = await supabase.from("activity_logs").delete().eq("id", id);
    if (!error) {
      setShips((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Ship entry removed 🗑️" });
    } else {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleDeleteTierList = async (id: string) => {
    const { error } = await supabase.from("tier_lists").delete().eq("id", id);
    if (!error) {
      setTierLists((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Tier list removed 🗑️" });
    } else {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const getClassmateImage = (identifier: string) => {
    const key = (identifier || "").trim();
    if (!key) return undefined;
    return classmates.get(key) || classmates.get(key.toLowerCase());
  };

  const countTierItems = (tiers: any): number => {
    if (!tiers || typeof tiers !== "object") return 0;
    return Object.values(tiers).reduce(
      (sum, arr) => (sum as number) + (Array.isArray(arr) ? arr.length : 0),
      0
    ) as number;
  };

  const PersonBubble = ({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) => {
    const img = getClassmateImage(name);
    const sizeClasses = {
      sm: "h-8 w-8 text-[10px]",
      md: "h-14 w-14 text-xs",
      lg: "h-20 w-20 text-sm",
    };
    const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-card shadow-md flex-shrink-0`}>
        {img?.image_url ? (
          <img src={img.image_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-bold text-card"
            style={{ backgroundColor: `hsl(${hue} 65% 50%)` }}
          >
            {name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8 px-4 relative">
      <WhimsicalBackground />

      <div className="container mx-auto max-w-4xl relative z-10">
        <PageHeader
          title="🏆 Leaderboard"
          subtitle="Hall of fame — top ships & public tier lists from the community."
        />

        {/* Stats Banner */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-card/60 backdrop-blur border border-primary/20 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">{ships.length}</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Unique Ships</p>
          </div>
          <div className="bg-card/60 backdrop-blur border border-secondary/20 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Crown className="h-5 w-5 text-secondary" />
              <span className="text-2xl font-bold text-foreground">{tierLists.length}</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Public Tier Lists</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 mb-8 bg-card/70 backdrop-blur border border-border/40 rounded-2xl p-1">
          <button
            onClick={() => handleTabChange("ships")}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === "ships"
                ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            <Heart className="h-4 w-4" />
            Top Ships
          </button>
          <button
            onClick={() => handleTabChange("tiers")}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === "tiers"
                ? "bg-gradient-to-r from-secondary to-accent text-secondary-foreground shadow-lg shadow-secondary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            <Crown className="h-4 w-4" />
            Public Tier Lists
          </button>
        </div>

        {/* ═══════════ Ships Tab ═══════════ */}
        {activeTab === "ships" && (
          <div className="space-y-4">
            {loadingShips ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <Heart className="h-8 w-8 text-primary animate-pulse" />
                <p className="text-muted-foreground">Loading leaderboard…</p>
              </div>
            ) : ships.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <Heart className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-muted-foreground italic">No ships calculated yet. Go match some people! 💘</p>
              </div>
            ) : (
              <>
                {/* Top 3 Podium */}
                {ships.length >= 3 && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[1, 0, 2].map((rank) => {
                      const entry = ships[rank];
                      if (!entry) return null;
                      const details = entry.action_details as any;
                      const score = details?.score ?? 0;
                      const verdict = getVerdict(score);
                      const isCenter = rank === 0;

                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: rank * 0.1 }}
                          className={`bg-card/70 backdrop-blur border rounded-2xl p-4 text-center relative overflow-hidden ${
                            isCenter
                              ? "border-primary/40 shadow-[0_0_30px_hsl(var(--primary)/0.15)] -mt-2 pb-5"
                              : "border-border/40 mt-4"
                          }`}
                        >
                          {isCenter && (
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                          )}

                          <div className="relative z-10">
                            <span className="text-2xl md:text-3xl">{getMedal(rank)}</span>

                            <div className="flex justify-center items-center gap-1 my-3">
                              <PersonBubble name={details?.person1 || "?"} size={isCenter ? "lg" : "md"} />
                              <Heart className={`${isCenter ? "h-5 w-5" : "h-4 w-4"} text-primary -mx-1 relative z-10`} />
                              <PersonBubble name={details?.person2 || "?"} size={isCenter ? "lg" : "md"} />
                            </div>

                            <p className={`font-bold text-foreground ${isCenter ? "text-base" : "text-sm"} truncate`}>
                              {details?.person1} × {details?.person2}
                            </p>

                            <div className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-gradient-to-r ${getScoreGradient(score)} text-primary-foreground`}>
                              <span className={`font-black ${isCenter ? "text-xl" : "text-lg"}`}>{score}%</span>
                            </div>

                            <p className="text-xs text-muted-foreground mt-1.5">
                              {verdict.emoji} {verdict.text}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Rest of the list */}
                {ships.map((entry, index) => {
                  if (ships.length >= 3 && index < 3) return null;

                  const details = entry.action_details as any;
                  const score = details?.score ?? 0;
                  const isExpanded = expandedShip === entry.id;
                  const breakdown = details?.breakdown;
                  const verdict = getVerdict(score);
                  const avatarHue =
                    (entry.username || "").split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % 360;

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.3) }}
                      className="bg-card/65 backdrop-blur border border-border/40 rounded-2xl overflow-hidden hover:border-primary/20 transition-colors"
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => handleExpandShip(entry.id)}
                        onKeyDown={(e) => e.key === "Enter" && handleExpandShip(entry.id)}
                        className="w-full p-4 flex items-center gap-3 md:gap-4 text-left hover:bg-card/80 transition-colors cursor-pointer"
                      >
                        <div className="flex-shrink-0 w-8 text-center">
                          <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                        </div>

                        <div className="flex items-center -space-x-3 flex-shrink-0">
                          <PersonBubble name={details?.person1 || "?"} size="sm" />
                          <PersonBubble name={details?.person2 || "?"} size="sm" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">
                            {details?.person1 || "?"} × {details?.person2 || "?"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Avatar className="h-3.5 w-3.5">
                              <AvatarImage src={entry.avatar_url || undefined} />
                              <AvatarFallback
                                style={{ backgroundColor: `hsl(${avatarHue} 70% 55%)`, fontSize: "7px" }}
                              >
                                {(entry.username || "?")[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {entry.username} · {format(new Date(entry.created_at), "MMM d")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-[11px] text-muted-foreground">{verdict.emoji} {verdict.text}</p>
                          </div>
                          <div
                            className="h-11 w-11 rounded-full flex items-center justify-center"
                            style={{
                              background: `conic-gradient(hsl(var(--primary)) ${score}%, hsl(var(--muted)) ${score}% 100%)`,
                            }}
                          >
                            <div className="h-8 w-8 rounded-full bg-card flex items-center justify-center">
                              <span className="text-xs font-black text-foreground">{score}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100"
                              onClick={(e) => { e.stopPropagation(); handleDeleteShip(entry.id); }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-border/20 px-4 py-5 space-y-5">
                              {breakdown && (
                                <div className="grid grid-cols-2 gap-4">
                                  {[
                                    { key: "chemistry", label: "Chemistry", icon: <Flame className="h-4 w-4 text-primary" /> },
                                    { key: "communication", label: "Communication", icon: <MessageCircleIcon className="h-4 w-4 text-accent" /> },
                                    { key: "stability", label: "Stability", icon: <Shield className="h-4 w-4 text-secondary" /> },
                                    { key: "adventure", label: "Adventure", icon: <Compass className="h-4 w-4 text-primary" /> },
                                  ].map((dim) => (
                                    <div key={dim.key} className="bg-background/30 rounded-xl p-3 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                                          {dim.icon} {dim.label}
                                        </span>
                                        <span className="text-sm font-bold text-foreground">{breakdown[dim.key]}</span>
                                      </div>
                                      <Progress value={breakdown[dim.key]} className="h-2" />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {(details?.strengths || details?.challenges) && (
                                <div className="grid grid-cols-2 gap-3">
                                  {details.strengths && (
                                    <div className="bg-primary/5 border border-primary/15 rounded-xl p-3">
                                      <p className="text-[10px] uppercase tracking-wider text-primary font-bold mb-1">Strengths</p>
                                      <p className="text-xs text-foreground/80">{(details.strengths as string[]).join(" & ")}</p>
                                    </div>
                                  )}
                                  {details.challenges && (
                                    <div className="bg-muted/20 border border-border/30 rounded-xl p-3">
                                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Watch-outs</p>
                                      <p className="text-xs text-foreground/80">{(details.challenges as string[]).join(" & ")}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              <CommentSection contentType="ship" contentId={entry.id} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ═══════════ Tier Lists Tab ═══════════ */}
        {activeTab === "tiers" && (
          <div className="space-y-4">
            {loadingTiers ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <Crown className="h-8 w-8 text-secondary animate-pulse" />
                <p className="text-muted-foreground">Loading tier lists…</p>
              </div>
            ) : tierLists.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <Crown className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-muted-foreground italic">No public tier lists yet. Make one & share it! ⭐</p>
              </div>
            ) : (
              tierLists.map((tl, index) => {
                const isExpanded = expandedTier === tl.id;
                const itemCount = countTierItems(tl.tiers);
                const avatarHue =
                  (tl.username || "").split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % 360;
                const tierKeys = tl.tiers && typeof tl.tiers === "object" ? Object.keys(tl.tiers) : [];

                return (
                  <motion.div
                    key={tl.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.4) }}
                    className="bg-card/65 backdrop-blur border border-border/40 rounded-2xl overflow-hidden hover:border-secondary/20 transition-colors"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedTier(isExpanded ? null : tl.id)}
                      onKeyDown={(e) => e.key === "Enter" && setExpandedTier(isExpanded ? null : tl.id)}
                      className="w-full p-4 flex items-center gap-4 text-left hover:bg-card/80 transition-colors cursor-pointer"
                    >
                      <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-secondary/20 to-accent/10 border border-secondary/25 flex items-center justify-center">
                        <Crown className="h-6 w-6 text-secondary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate">{tl.name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <div className="inline-flex items-center gap-1.5">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={tl.avatar_url || undefined} />
                              <AvatarFallback style={{ backgroundColor: `hsl(${avatarHue} 70% 55%)`, fontSize: "7px" }}>
                                {(tl.username || "?")[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground font-medium">{tl.username}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground/60">·</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(tl.updated_at || tl.created_at), "MMM d, yyyy")}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">·</span>
                          <span className="inline-flex items-center gap-1 text-xs text-accent">
                            <Users className="h-3 w-3" /> {itemCount} items
                          </span>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-1 flex-shrink-0">
                        {tierKeys.slice(0, 4).map((t) => {
                          const items = (tl.tiers as any)[t];
                          const count = Array.isArray(items) ? items.length : 0;
                          if (count === 0) return null;
                          return (
                            <span
                              key={t}
                              className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-muted/30 border border-border/30 rounded-md px-1.5 py-0.5 text-foreground/70"
                            >
                              {t}<span className="text-muted-foreground font-normal">({count})</span>
                            </span>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-1">
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleDeleteTierList(tl.id); }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border/20 px-4 py-5 space-y-4">
                            <div className="space-y-2">
                              {tierKeys.map((tier) => {
                                const items = (tl.tiers as any)[tier];
                                if (!Array.isArray(items) || items.length === 0) return null;
                                const colorClass = tierColors[tier] || "from-muted/30 to-muted/10 border-border/30";

                                return (
                                  <div key={tier} className="flex items-stretch gap-2 rounded-xl overflow-hidden">
                                    <div className={`flex-shrink-0 w-12 bg-gradient-to-b ${colorClass} border flex items-center justify-center rounded-l-xl`}>
                                      <span className="text-sm font-black text-foreground">{tier}</span>
                                    </div>

                                    <div className="flex-1 bg-background/20 border border-border/20 rounded-r-xl p-2 flex gap-2 flex-wrap">
                                      {items.map((item: any, i: number) => {
                                        const rawIdentifier = typeof item === "string"
                                          ? item
                                          : item?.id || item?.name || "";
                                        const img = getClassmateImage(rawIdentifier);
                                        const displayName = typeof item === "string"
                                          ? img?.name || item
                                          : item?.name || img?.name || "?";

                                        return (
                                          <div key={i} className="flex items-center gap-1.5 bg-card/50 border border-border/30 rounded-lg px-2 py-1">
                                            {img?.image_url ? (
                                              <img src={img.image_url} alt={displayName} className="h-6 w-6 rounded-full object-cover flex-shrink-0" />
                                            ) : (
                                              <div
                                                className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-card flex-shrink-0"
                                                style={{ backgroundColor: `hsl(${displayName.split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % 360} 60% 50%)` }}
                                              >
                                                {displayName.slice(0, 2).toUpperCase()}
                                              </div>
                                            )}
                                            <span className="text-xs text-foreground/80 truncate max-w-[90px]">{displayName}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <CommentSection contentType="tier_list" contentId={tl.id} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
