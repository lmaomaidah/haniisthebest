import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  X,
  ExternalLink,
  Copy,
  Check,
  GripVertical,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import { withSignedClassmateImageUrls } from "@/lib/classmateImages";
import { CategoryPicker } from "@/components/CategoryPicker";
import { useCategories, fetchImageCategoryIds, setImageCategories } from "@/hooks/useCategories";
import { CommentSection } from "@/components/CommentSection";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Pin {
  id: string;
  pin_url: string;
  pin_order: number;
  created_at: string;
  user_id: string | null;
}

interface PersonData {
  id: string;
  name: string;
  image_url: string | null;
  bio: string | null;
}

const normalizePinterestUrl = (rawUrl: string) => {
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const extractPinIdFromUrl = (pinUrl: string): string | null => {
  const normalized = normalizePinterestUrl(pinUrl);

  const directMatch = normalized.match(/\/pin\/(\d+)/i);
  if (directMatch) return directMatch[1];

  const shortNumericMatch = normalized.match(/pin\.it\/(\d+)(?:[/?#]|$)/i);
  if (shortNumericMatch) return shortNumericMatch[1];

  const queryMatch = normalized.match(/[?&](?:pin_id|pinId|id)=(\d+)/i);
  if (queryMatch) return queryMatch[1];

  return null;
};

type PinResolveResult = {
  pinId?: string | null;
  resolvedUrl?: string;
  previewImageUrl?: string | null;
  error?: string;
};

const sanitizePinPreviewUrl = (value: unknown): string | null => {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = trimmed
    .replace(/\\\//g, "/")
    .replace(/\\u002F/gi, "/")
    .match(/https?:\/\/i\.pinimg\.com\/[^\s"'<>\\)]+/i);

  if (!match?.[0]) return null;

  const cleaned = match[0].replace(/[),.;]+$/g, "");

  try {
    const parsed = new URL(cleaned);
    if (!/(^|\.)pinimg\.com$/i.test(parsed.hostname)) return null;
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
};

/* ──────────── Pinterest Embed ──────────── */
function PinterestEmbed({ url }: { url: string }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [resolvedPinId, setResolvedPinId] = useState<string | null>(() =>
    extractPinIdFromUrl(url)
  );
  const [resolvedUrl, setResolvedUrl] = useState<string>(() =>
    normalizePinterestUrl(url)
  );
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewImageFailed, setPreviewImageFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const resolvePin = async () => {
      const normalizedUrl = normalizePinterestUrl(url);
      setResolvedUrl(normalizedUrl);
      setResolvedPinId(null);
      setPreviewImageUrl(null);
      setPreviewImageFailed(false);
      setStatus("loading");

      const isPinterestUrl = /https?:\/\/(?:www\.)?(?:pin\.it|pinterest\.com)\//i.test(
        normalizedUrl
      );

      if (!isPinterestUrl) {
        setStatus("error");
        return;
      }

      const directPinId = extractPinIdFromUrl(normalizedUrl);

      try {
        const { data, error } = await supabase.functions.invoke(
          "resolve-pinterest-pin",
          { body: { url: normalizedUrl } }
        );

        if (cancelled) return;

        const payload = (data ?? {}) as PinResolveResult;
        const pinIdFromResolver =
          typeof payload.pinId === "string" && payload.pinId.length > 0
            ? payload.pinId
            : null;
        const pinId = pinIdFromResolver ?? directPinId;
        const preview = sanitizePinPreviewUrl(payload.previewImageUrl);
        const finalUrl = pinId
          ? `https://www.pinterest.com/pin/${pinId}/`
          : typeof payload.resolvedUrl === "string"
            ? payload.resolvedUrl
            : normalizedUrl;

        setResolvedUrl(finalUrl);
        setResolvedPinId(pinId);
        setPreviewImageUrl(preview);

        if (!error && (pinId || preview)) {
          setStatus("ready");
          return;
        }

        if (pinId || preview) {
          setStatus("ready");
          return;
        }

        setStatus("error");
      } catch {
        if (cancelled) return;

        if (directPinId) {
          setResolvedPinId(directPinId);
          setResolvedUrl(`https://www.pinterest.com/pin/${directPinId}/`);
          setStatus("ready");
          return;
        }

        setStatus("error");
      }
    };

    resolvePin();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (status === "ready") {
    return (
      <div className="w-full overflow-hidden">
        {previewImageUrl && !previewImageFailed ? (
          <a href={resolvedUrl} target="_blank" rel="noreferrer" className="block">
            <img
              src={previewImageUrl}
              alt="Pinterest pin image preview"
              loading="lazy"
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </a>
        ) : resolvedPinId ? (
          <div className="w-full min-h-[420px] bg-background/40">
            <iframe
              src={`https://assets.pinterest.com/ext/embed.html?id=${resolvedPinId}`}
              title={`Pinterest pin ${resolvedPinId}`}
              className="w-full h-[520px] border-0"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="min-h-[260px] flex items-center justify-center px-4 text-center">
            <p className="text-sm text-muted-foreground">Open this pin on Pinterest.</p>
          </div>
        )}
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="w-full overflow-hidden min-h-[300px] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Loading pin…</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      {previewImageUrl ? (
        <img
          src={previewImageUrl}
          alt="Pinterest pin preview"
          loading="lazy"
          className="w-full h-auto object-cover"
        />
      ) : (
        <div className="min-h-[200px] flex flex-col items-center justify-center px-4 text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">Couldn't render preview</p>
        </div>
      )}

      <div className="p-3">
        <a
          href={resolvedUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          Open on Pinterest <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

/* ──────────── Sortable Pin Card ──────────── */
function SortablePinCard({
  pin,
  isAdmin,
  canDelete,
  canReorder,
  copiedId,
  onCopy,
  onDelete,
}: {
  pin: Pin;
  isAdmin: boolean;
  canDelete: boolean;
  canReorder: boolean;
  copiedId: string | null;
  onCopy: (url: string, id: string) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pin.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-card/80 backdrop-blur-sm border border-border/30 rounded-2xl overflow-hidden shadow-md hover:shadow-[0_8px_30px_hsl(var(--primary)/0.15)] transition-all duration-500 hover:-translate-y-1 break-inside-avoid mb-5"
    >
      {/* Gradient accent top bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-secondary to-accent opacity-60" />

      {canReorder && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm border border-border/50 flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-card transition-all opacity-0 group-hover:opacity-100 shadow-sm"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      <PinterestEmbed url={pin.pin_url} />

      {/* Action overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-card/95 via-card/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-end gap-1.5">
        <a
          href={normalizePinterestUrl(pin.pin_url)}
          target="_blank"
          rel="noreferrer"
          className="h-8 w-8 rounded-full bg-background/80 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <button
          className="h-8 w-8 rounded-full bg-background/80 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          onClick={() => onCopy(pin.pin_url, pin.id)}
        >
          {copiedId === pin.id ? (
            <Check className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
        {canDelete && (
          <button
            className="h-8 w-8 rounded-full bg-background/80 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => onDelete(pin.id)}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ──────────── Main Page ──────────── */
const PersonProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin, user, logActivity } = useAuth();
  const { toast } = useToast();

  const [person, setPerson] = useState<PersonData | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [newPinUrl, setNewPinUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [personCategories, setPersonCategories] = useState<string[]>([]);
  const { categories, createCategory } = useCategories();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchPerson = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("images")
      .select("id, name, image_url, bio")
      .eq("id", id)
      .maybeSingle();

    if (data) {
      const [signed] = await withSignedClassmateImageUrls([data]);
      setPerson(signed);
      setBioText(signed.bio || "");
    }
    setLoading(false);
  }, [id]);

  const fetchPins = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("pinterest_pins")
      .select("*")
      .eq("image_id", id)
      .order("pin_order", { ascending: true });

    if (data) setPins(data as Pin[]);
  }, [id]);

  const fetchPersonCategories = useCallback(async () => {
    if (!id) return;
    const cats = await fetchImageCategoryIds(id);
    setPersonCategories(cats);
  }, [id]);

  useEffect(() => {
    fetchPerson();
    fetchPins();
    fetchPersonCategories();
  }, [fetchPerson, fetchPins, fetchPersonCategories]);

  // Log profile view with rich context
  useEffect(() => {
    if (person) {
      void logActivity("profile_view", {
        person_id: person.id,
        person_name: person.name,
        has_bio: !!person.bio,
        has_image: !!person.image_url,
        pin_count: pins.length,
        category_count: personCategories.length,
      });
    }
  }, [person?.id]);

  const handleCategoryChange = async (newCats: string[]) => {
    if (!id) return;
    try {
      await setImageCategories(id, newCats);
      setPersonCategories(newCats);
      const catNames = newCats.map(cid => categories.find(c => c.id === cid)?.name || cid);
      void logActivity("profile_categories_changed", { person_id: id, person_name: person?.name, categories: catNames, count: newCats.length });
      toast({ title: "Categories updated! 🏷️" });
    } catch (err: any) {
      toast({ title: "Couldn't update categories", description: err.message, variant: "destructive" });
    }
  };

  const handleCreateCategoryOnProfile = async (name: string) => {
    if (!user) return;
    try {
      const cat = await createCategory(name, user.id);
      if (cat) {
        const updated = [...personCategories, cat.id];
        await setImageCategories(id!, updated);
        setPersonCategories(updated);
      }
      toast({ title: "Category created & assigned! 🏷️" });
    } catch (err: any) {
      toast({ title: "Couldn't create category", description: err.message, variant: "destructive" });
    }
  };


  const handleAddPin = async () => {
    if (!newPinUrl.trim() || !id) return;
    if (
      !newPinUrl.includes("pinterest.com") &&
      !newPinUrl.includes("pin.it")
    ) {
      toast({
        title: "Invalid link",
        description: "Please paste a valid Pinterest link!",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);

    let normalizedToSave = normalizePinterestUrl(newPinUrl);
    try {
      const { data } = await supabase.functions.invoke("resolve-pinterest-pin", {
        body: { url: normalizedToSave },
      });

      const payload = (data ?? {}) as PinResolveResult;
      if (payload.pinId) {
        normalizedToSave = `https://www.pinterest.com/pin/${payload.pinId}/`;
      } else if (payload.resolvedUrl) {
        normalizedToSave = payload.resolvedUrl;
      }
    } catch {
      // keep original normalized url as fallback
    }

    const { error } = await supabase.from("pinterest_pins").insert({
      image_id: id,
      pin_url: normalizedToSave,
      pin_order: pins.length,
      user_id: user?.id,
    });

    if (error) {
      toast({
        title: "Error adding pin",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "📌 Pin added!" });
      void logActivity("pin_added", { person_id: id, person_name: person?.name, pin_url: normalizedToSave, total_pins: pins.length + 1 });
      setNewPinUrl("");
      setShowAddInput(false);
      fetchPins();
    }
    setAdding(false);
  };

  const handleDeletePin = async (pinId: string) => {
    const { error } = await supabase
      .from("pinterest_pins")
      .delete()
      .eq("id", pinId);
    if (!error) {
      setPins((prev) => prev.filter((p) => p.id !== pinId));
      void logActivity("pin_deleted", { person_id: id, person_name: person?.name, pin_id: pinId });
      toast({ title: "Pin removed 🗑️" });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pins.findIndex((p) => p.id === active.id);
    const newIndex = pins.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(pins, oldIndex, newIndex);

    setPins(reordered);

    const updates = await Promise.all(
      reordered.map((pin, i) =>
        supabase
          .from("pinterest_pins")
          .update({ pin_order: i })
          .eq("id", pin.id)
      )
    );

    const failed = updates.some((r) => r.error);
    if (failed) {
      toast({
        title: "Couldn't save order",
        description: "You can still drag, but this order couldn't be saved.",
        variant: "destructive",
      });
      fetchPins();
    }
  };

  const handleSaveBio = async () => {
    if (!id) return;
    const { error } = await supabase
      .from("images")
      .update({ bio: bioText.trim() || null })
      .eq("id", id);

    if (!error) {
      setPerson((prev) =>
        prev ? { ...prev, bio: bioText.trim() || null } : prev
      );
      setEditingBio(false);
      void logActivity("profile_bio_updated", { person_id: id, person_name: person?.name, bio_length: bioText.trim().length });
      toast({ title: "Bio saved ✨" });
    }
  };

  const handleCopyLink = (url: string, pinId: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(pinId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-2xl text-muted-foreground">Person not found 🥀</p>
        <Link to="/profiles">
          <Button variant="outline">← Back to Shrine Wall</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <WhimsicalBackground />
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserMenu />
        <ThemeToggle />
      </div>

      <div className="container mx-auto relative z-10 max-w-6xl px-4 pb-20">
        <div className="pt-6 mb-6">
          <Link to="/profiles">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shrine Wall
            </Button>
          </Link>
        </div>

        {/* ── Enhanced Profile Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-14"
        >
          {/* Banner with gradient overlay */}
          <div className="h-48 md:h-64 rounded-3xl overflow-hidden relative">
            {person.image_url ? (
              <>
                <img
                  src={person.image_url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover scale-125 blur-3xl opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
            )}
            {/* Decorative gradient line at top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-80" />
          </div>

          <div className="flex flex-col items-center -mt-20 md:-mt-24">
            {/* Avatar with ring */}
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-primary via-secondary to-accent opacity-70 blur-sm" />
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-card overflow-hidden shadow-[0_8px_40px_hsl(var(--primary)/0.3)] bg-card group">
                {person.image_url ? (
                  <img src={person.image_url} alt={person.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center">
                    <span className="text-5xl font-bold text-foreground font-['Luckiest_Guy']">{person.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}</span>
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-['Luckiest_Guy'] font-bold mt-5 text-foreground text-center tracking-wide drop-shadow-[0_2px_10px_hsl(var(--primary)/0.2)]">
              {person.name}
            </h1>

            {/* Pin count badge */}
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                📌 {pins.length} {pins.length === 1 ? "pin" : "pins"}
              </span>
            </div>

            {/* Bio */}
            <div className="mt-4 max-w-lg text-center">
              {editingBio ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <Textarea value={bioText} onChange={(e) => setBioText(e.target.value)} placeholder="Write a bio…" className="bg-card/70 border-border/50 rounded-xl text-center min-h-[80px]" rows={3} />
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" onClick={handleSaveBio} className="rounded-full px-6">Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingBio(false)} className="rounded-full">Cancel</Button>
                  </div>
                </motion.div>
              ) : (
                <p className="text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors text-sm leading-relaxed" onClick={() => setEditingBio(true)}>
                  {person.bio || "Click to add a bio…"}
                </p>
              )}
            </div>

            <div className="mt-4 max-w-md">
              <CategoryPicker
                categories={categories}
                selected={personCategories}
                onChange={handleCategoryChange}
                onCreateCategory={async (name) => {
                  if (!user) return null;
                  try {
                    const cat = await createCategory(name, user.id);
                    if (cat && id) { const updated = [...personCategories, cat.id]; await setImageCategories(id, updated); setPersonCategories(updated); }
                    toast({ title: "Category created & assigned! 🏷️" });
                    return cat;
                  } catch (err: any) { toast({ title: "Couldn't create category", description: err.message, variant: "destructive" }); return null; }
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Separator ── */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Pin Wall</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* ── Add Pin ── */}
        <div className="flex justify-center mb-10">
          <AnimatePresence mode="wait">
            {showAddInput ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="w-full max-w-lg bg-card/90 backdrop-blur-md border border-border/50 rounded-2xl p-5 space-y-4 shadow-[0_8px_30px_hsl(var(--secondary)/0.1)]"
              >
                <Input
                  placeholder="Paste a Pinterest link…"
                  value={newPinUrl}
                  onChange={(e) => setNewPinUrl(e.target.value)}
                  className="border border-border/50 rounded-xl bg-background/50 h-11"
                  onKeyDown={(e) => e.key === "Enter" && handleAddPin()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddPin}
                    disabled={adding}
                    className="flex-1 gradient-pink-blue text-foreground rounded-xl h-10"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {adding ? "Adding…" : "Add Pin"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() => { setShowAddInput(false); setNewPinUrl(""); }}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button
                  onClick={() => setShowAddInput(true)}
                  className="gradient-chaos text-foreground rounded-full px-8 py-5 text-base shadow-lg hover:shadow-[0_8px_30px_hsl(var(--primary)/0.3)] hover:scale-105 transition-all duration-300"
                >
                  <Plus className="mr-2 h-5 w-5" /> Add Pinterest Pin
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Pins Masonry Grid ── */}
        {pins.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/30 border border-border/30 mb-6">
              <span className="text-4xl">💀</span>
            </div>
            <p className="text-xl text-muted-foreground mb-2 font-['Schoolbell']">
              This person is too NPC to have their own pin wall.
            </p>
            <p className="text-muted-foreground/50 text-sm italic">
              Die loser die
            </p>
          </motion.div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pins.map((p) => p.id)}
              strategy={rectSortingStrategy}
            >
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
                {pins.map((pin, i) => (
                  <motion.div
                    key={pin.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  >
                    <SortablePinCard
                      pin={pin}
                      isAdmin={isAdmin}
                      canDelete={isAdmin || pin.user_id === user?.id}
                      canReorder={isAdmin || pin.user_id === user?.id}
                      copiedId={copiedId}
                      onCopy={handleCopyLink}
                      onDelete={handleDeletePin}
                    />
                  </motion.div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* ── Comments Section ── */}
        <div className="mt-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Comments</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
          <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-6">
            <CommentSection contentType="pin" contentId={id} />
          </div>
        </div>
      </div>

      {/* Floating add button on mobile */}
      {!showAddInput && (
        <button
          onClick={() => setShowAddInput(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-chaos shadow-[0_4px_20px_hsl(var(--primary)/0.4)] flex items-center justify-center hover:scale-110 transition-transform md:hidden"
        >
          <Plus className="h-6 w-6 text-foreground" />
        </button>
      )}
    </div>
  );
};

export default PersonProfile;
