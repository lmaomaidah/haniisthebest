import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import { CommentSection } from "@/components/CommentSection";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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

const getMedal = (index: number) => {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return `#${index + 1}`;
};

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-primary";
  if (score >= 75) return "text-accent";
  if (score >= 60) return "text-foreground";
  if (score >= 45) return "text-muted-foreground";
  return "text-destructive";
};

const Leaderboard = () => {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();

  const [ships, setShips] = useState<ShipEntry[]>([]);
  const [tierLists, setTierLists] = useState<TierListEntry[]>([]);
  const [loadingShips, setLoadingShips] = useState(true);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [expandedShip, setExpandedShip] = useState<string | null>(null);
  const [expandedTier, setExpandedTier] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ships" | "tiers">("ships");

  const fetchShips = useCallback(async () => {
    setLoadingShips(true);
    const { data } = await supabase
      .from("activity_logs")
      .select("id, action_details, created_at, user_id")
      .eq("action_type", "ship_calculate")
      .order("created_at", { ascending: false })
      .limit(200);

    if (data && data.length > 0) {
      // Fetch profiles for all unique user_ids
      const userIds = [...new Set(data.map((d) => d.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      // Deduplicate: keep highest score per pair
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

      const sorted = Array.from(bestByPair.values()).sort(
        (a, b) => (b.action_details?.score ?? 0) - (a.action_details?.score ?? 0)
      );

      setShips(sorted);
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

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

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
    fetchShips();
    fetchTierLists();
  }, [fetchShips, fetchTierLists]);

  const handleDeleteShip = async (id: string) => {
    const { error } = await supabase
      .from("activity_logs")
      .delete()
      .eq("id", id);
    if (!error) {
      setShips((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Ship entry removed 🗑️" });
    } else {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleDeleteTierList = async (id: string) => {
    const { error } = await supabase
      .from("tier_lists")
      .delete()
      .eq("id", id);
    if (!error) {
      setTierLists((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Tier list removed 🗑️" });
    } else {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const countTierItems = (tiers: any): number => {
    if (!tiers || typeof tiers !== "object") return 0;
    return Object.values(tiers).reduce(
      (sum, arr) => (sum as number) + (Array.isArray(arr) ? arr.length : 0),
      0
    ) as number;
  };

  return (
    <div className="min-h-screen py-8 px-4 relative">
      <WhimsicalBackground />

      <div className="container mx-auto max-w-4xl relative z-10">
        <PageHeader
          title="🏆 Leaderboard"
          subtitle="Hall of fame — top ships & public tier lists from the community."
        />

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-8 bg-card/60 backdrop-blur border border-border/50 rounded-2xl p-1.5">
          <button
            onClick={() => setActiveTab("ships")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "ships"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className="h-4 w-4" />
            Top Ships
          </button>
          <button
            onClick={() => setActiveTab("tiers")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "tiers"
                ? "bg-secondary text-secondary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className="h-4 w-4" />
            Public Tier Lists
          </button>
        </div>

        {/* Ships Tab */}
        {activeTab === "ships" && (
          <div className="space-y-3">
            {loadingShips ? (
              <p className="text-center text-muted-foreground animate-pulse py-12">Loading leaderboard…</p>
            ) : ships.length === 0 ? (
              <p className="text-center text-muted-foreground italic py-12">No ships calculated yet. Go match some people! 💘</p>
            ) : (
              ships.map((entry, index) => {
                const details = entry.action_details as any;
                const score = details?.score ?? 0;
                const isExpanded = expandedShip === entry.id;
                const breakdown = details?.breakdown;
                const avatarHue =
                  (entry.username || "")
                    .split("")
                    .reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) % 360;

                return (
                  <div key={entry.id} className="bg-card/65 backdrop-blur border border-border/50 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedShip(isExpanded ? null : entry.id)}
                      className="w-full p-4 flex items-center gap-4 text-left hover:bg-card/80 transition-colors"
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-10 text-center">
                        <span className={`text-lg font-bold ${index < 3 ? "text-2xl" : "text-muted-foreground"}`}>
                          {getMedal(index)}
                        </span>
                      </div>

                      {/* Score circle */}
                      <div
                        className="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center"
                        style={{
                          background: `conic-gradient(hsl(var(--primary)) ${score}%, hsl(var(--muted)) ${score}% 100%)`,
                        }}
                      >
                        <div className="h-9 w-9 rounded-full bg-card flex items-center justify-center">
                          <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}%</span>
                        </div>
                      </div>

                      {/* Names */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate">
                          {details?.person1 || "?"} × {details?.person2 || "?"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={entry.avatar_url || undefined} />
                            <AvatarFallback style={{ backgroundColor: `hsl(${avatarHue} 70% 55%)`, fontSize: "8px" }}>
                              {(entry.username || "?")[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {entry.username} · {format(new Date(entry.created_at), "MMM d")}
                          </span>
                          {details?.strengths && (
                            <span className="text-xs text-primary hidden sm:inline">
                              · {(details.strengths as string[]).join(" & ")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteShip(entry.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border/30 p-4 space-y-4">
                        {breakdown && (
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { key: "chemistry", label: "Chemistry", icon: <Flame className="h-3.5 w-3.5" /> },
                              { key: "communication", label: "Communication", icon: <MessageCircleIcon className="h-3.5 w-3.5" /> },
                              { key: "stability", label: "Stability", icon: <Shield className="h-3.5 w-3.5" /> },
                              { key: "adventure", label: "Adventure", icon: <Compass className="h-3.5 w-3.5" /> },
                            ].map((dim) => (
                              <div key={dim.key} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                                    {dim.icon} {dim.label}
                                  </span>
                                  <span className="text-foreground font-medium">{breakdown[dim.key]}</span>
                                </div>
                                <Progress value={breakdown[dim.key]} className="h-1.5" />
                              </div>
                            ))}
                          </div>
                        )}

                        {details?.challenges && (
                          <div className="flex gap-3 text-xs">
                            <span className="text-primary">Strengths: {(details.strengths as string[])?.join(", ")}</span>
                            <span className="text-muted-foreground">Watch-outs: {(details.challenges as string[])?.join(", ")}</span>
                          </div>
                        )}

                        <CommentSection contentType="ship-leaderboard" contentId={entry.id} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tier Lists Tab */}
        {activeTab === "tiers" && (
          <div className="space-y-3">
            {loadingTiers ? (
              <p className="text-center text-muted-foreground animate-pulse py-12">Loading tier lists…</p>
            ) : tierLists.length === 0 ? (
              <p className="text-center text-muted-foreground italic py-12">No public tier lists yet. Make one & share it! ⭐</p>
            ) : (
              tierLists.map((tl) => {
                const isExpanded = expandedTier === tl.id;
                const itemCount = countTierItems(tl.tiers);
                const avatarHue =
                  (tl.username || "")
                    .split("")
                    .reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) % 360;

                // Get tier summary
                const tierKeys = tl.tiers && typeof tl.tiers === "object" ? Object.keys(tl.tiers) : [];

                return (
                  <div key={tl.id} className="bg-card/65 backdrop-blur border border-border/50 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedTier(isExpanded ? null : tl.id)}
                      className="w-full p-4 flex items-center gap-4 text-left hover:bg-card/80 transition-colors"
                    >
                      <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center">
                        <Crown className="h-6 w-6 text-secondary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate">{tl.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={tl.avatar_url || undefined} />
                            <AvatarFallback style={{ backgroundColor: `hsl(${avatarHue} 70% 55%)`, fontSize: "8px" }}>
                              {(tl.username || "?")[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {tl.username} · {format(new Date(tl.updated_at || tl.created_at), "MMM d")}
                          </span>
                          <span className="text-xs text-accent">
                            · {itemCount} items · {tierKeys.length} tiers
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTierList(tl.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border/30 p-4 space-y-4">
                        {/* Tier overview */}
                        <div className="space-y-2">
                          {tierKeys.map((tier) => {
                            const items = (tl.tiers as any)[tier];
                            if (!Array.isArray(items) || items.length === 0) return null;
                            return (
                              <div key={tier} className="flex items-center gap-3">
                                <span className="flex-shrink-0 w-10 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                                  {tier}
                                </span>
                                <div className="flex gap-1.5 flex-wrap">
                                  {items.map((item: any, i: number) => (
                                    <span
                                      key={i}
                                      className="text-xs bg-muted/40 border border-border/40 px-2 py-0.5 rounded-full text-foreground/80 truncate max-w-[120px]"
                                    >
                                      {typeof item === "string" ? item : item?.name || "?"}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <CommentSection contentType="tier-list" contentId={tl.id} />
                      </div>
                    )}
                  </div>
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
