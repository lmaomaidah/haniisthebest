import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const loadPinterestScript = () => {
  if (typeof window === "undefined") return;
  if (document.querySelector('script[src="https://assets.pinterest.com/js/pinit.js"]')) return;

  const script = document.createElement("script");
  script.src = "https://assets.pinterest.com/js/pinit.js";
  script.async = true;
  document.body.appendChild(script);
};

const extractPinIdFromUrl = (pinUrl: string): string | null => {
  const trimmed = pinUrl.trim();

  const directMatch = trimmed.match(/\/pin\/(\d+)/i);
  if (directMatch) return directMatch[1];

  const shortNumericMatch = trimmed.match(/pin\.it\/(\d+)(?:[/?#]|$)/i);
  if (shortNumericMatch) return shortNumericMatch[1];

  const queryMatch = trimmed.match(/[?&](?:pin_id|pinId|id)=(\d+)/i);
  if (queryMatch) return queryMatch[1];

  return null;
};

declare global {
  interface Window {
    PinUtils?: { build: () => void };
  }
}

/* ──────────── Pinterest Embed ──────────── */
function PinterestEmbed({ url }: { url: string }) {
  const [resolvedPinId, setResolvedPinId] = useState<string | null>(() =>
    extractPinIdFromUrl(url)
  );

  useEffect(() => {
    let cancelled = false;

    const resolvePin = async () => {
      const directPinId = extractPinIdFromUrl(url);
      if (directPinId) {
        setResolvedPinId(directPinId);
        return;
      }

      if (!/https?:\/\/(?:www\.)?pin\.it\//i.test(url)) {
        setResolvedPinId(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "resolve-pinterest-pin",
        { body: { url } }
      );

      if (cancelled) return;

      if (!error && data && typeof data === "object" && "pinId" in data) {
        const pinId =
          typeof (data as { pinId?: unknown }).pinId === "string"
            ? (data as { pinId: string }).pinId
            : null;

        setResolvedPinId(pinId);
        return;
      }

      setResolvedPinId(null);
    };

    resolvePin();

    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    if (resolvedPinId) return;
    loadPinterestScript();
    const timer = setTimeout(() => window.PinUtils?.build(), 450);
    return () => clearTimeout(timer);
  }, [resolvedPinId, url]);

  if (resolvedPinId) {
    return (
      <div className="w-full overflow-hidden rounded-xl">
        <iframe
          src={`https://assets.pinterest.com/ext/embed.html?id=${resolvedPinId}`}
          className="w-full border-0"
          style={{ minHeight: "400px" }}
          scrolling="no"
          title="Pinterest Pin"
        />
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl min-h-[400px] bg-card/40 flex items-center justify-center">
      <a data-pin-do="embedPin" data-pin-width="medium" href={url} className="sr-only">
        Pinterest pin
      </a>
      <p className="text-sm text-muted-foreground">Loading pin…</p>
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
      className="group bg-card/70 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
    >
      {canReorder && (
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center py-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </div>
      )}

      <PinterestEmbed url={pin.pin_url} />

      <div className="flex items-center justify-end gap-1 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onCopy(pin.pin_url, pin.id)}
        >
          {copiedId === pin.id ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>

        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(pin.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/* ──────────── Main Page ──────────── */
const PersonProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin, user } = useAuth();
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

  useEffect(() => {
    fetchPerson();
    fetchPins();
  }, [fetchPerson, fetchPins]);

  useEffect(() => {
    loadPinterestScript();
    const timer = setTimeout(() => window.PinUtils?.build(), 500);
    return () => clearTimeout(timer);
  }, [pins]);

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
    const { error } = await supabase.from("pinterest_pins").insert({
      image_id: id,
      pin_url: newPinUrl.trim(),
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

      <div className="container mx-auto relative z-10 max-w-5xl px-4 pb-20">
        {/* Back button */}
        <div className="pt-6 mb-6">
          <Link to="/profiles">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shrine Wall
            </Button>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="relative mb-12">
          <div className="h-40 md:h-56 rounded-3xl overflow-hidden bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30" />

          <div className="flex flex-col items-center -mt-16 md:-mt-20">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-card overflow-hidden shadow-xl bg-card">
              {person.image_url ? (
                <img
                  src={person.image_url}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">
                    {person.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold mt-4 text-foreground text-center">
              {person.name}
            </h1>

            {/* Bio */}
            <div className="mt-3 max-w-lg text-center">
              {editingBio && isAdmin ? (
                <div className="space-y-2">
                  <Textarea
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    placeholder="Write a bio…"
                    className="bg-card/70 border-border rounded-xl text-center"
                    rows={3}
                  />
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" onClick={handleSaveBio}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingBio(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p
                  className={`text-muted-foreground italic ${isAdmin ? "cursor-pointer hover:text-foreground transition-colors" : ""}`}
                  onClick={() => isAdmin && setEditingBio(true)}
                >
                  {person.bio ||
                    (isAdmin ? "Click to add a bio…" : "No bio yet.")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Add Pin Button */}
        <div className="flex justify-center mb-8">
          {showAddInput ? (
            <div className="w-full max-w-lg bg-card/80 backdrop-blur-md border-2 border-secondary/40 rounded-2xl p-6 space-y-4 shadow-lg">
              <Input
                placeholder="Paste a Pinterest link…"
                value={newPinUrl}
                onChange={(e) => setNewPinUrl(e.target.value)}
                className="border-2 border-border rounded-xl bg-background/50"
                onKeyDown={(e) => e.key === "Enter" && handleAddPin()}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddPin}
                  disabled={adding}
                  className="flex-1 gradient-pink-blue text-foreground rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />{" "}
                  {adding ? "Adding…" : "Add Pin"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowAddInput(false);
                    setNewPinUrl("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowAddInput(true)}
              className="gradient-chaos text-foreground rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Plus className="mr-2 h-5 w-5" /> Add Pinterest Pin
            </Button>
          )}
        </div>

        {/* Pins Grid */}
        {pins.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-2">
              This person is too NPC to have their own pin wall.
            </p>
            <p className="text-muted-foreground/60 text-sm italic">
              Die loser die
            </p>
          </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pins.map((pin) => (
                  <SortablePinCard
                    key={pin.id}
                    pin={pin}
                    isAdmin={isAdmin}
                    canDelete={isAdmin || pin.user_id === user?.id}
                    canReorder={isAdmin || pin.user_id === user?.id}
                    copiedId={copiedId}
                    onCopy={handleCopyLink}
                    onDelete={handleDeletePin}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Floating add button on mobile */}
      {!showAddInput && (
        <button
          onClick={() => setShowAddInput(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-chaos shadow-xl flex items-center justify-center hover:scale-110 transition-transform md:hidden"
        >
          <Plus className="h-6 w-6 text-foreground" />
        </button>
      )}
    </div>
  );
};

export default PersonProfile;
