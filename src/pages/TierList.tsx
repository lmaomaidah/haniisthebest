import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Save, Download, RotateCcw, Globe, Lock, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { TierRow } from "@/components/TierRow";
import { ImagePool } from "@/components/ImagePool";
import PageHeader from "@/components/PageHeader";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import html2canvas from "html2canvas";
import { withSignedClassmateImageUrls } from "@/lib/classmateImages";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useCategories, fetchAllImageCategories } from "@/hooks/useCategories";
import { CommentSection } from "@/components/CommentSection";
import { Switch } from "@/components/ui/switch";

interface ImageType {
  id: string;
  name: string;
  image_url: string | null;
}

// Default tier config
const DEFAULT_TIERS = [
  { key: "S", label: "S", color: "bg-red-500" },
  { key: "A", label: "A", color: "bg-orange-500" },
  { key: "B", label: "B", color: "bg-yellow-500" },
  { key: "C", label: "C", color: "bg-green-500" },
  { key: "D", label: "D", color: "bg-blue-500" },
  { key: "F", label: "F", color: "bg-purple-500" },
];

const CUSTOM_TIER_COLORS = [
  "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-cyan-500",
  "bg-violet-500", "bg-pink-500", "bg-teal-500", "bg-indigo-500",
];

interface TierConfig {
  key: string;
  label: string;
  color: string;
}

const TierList = () => {
  const [images, setImages] = useState<ImageType[]>([]);
  const [allImages, setAllImages] = useState<ImageType[]>([]);
  const [tierConfigs, setTierConfigs] = useState<TierConfig[]>(DEFAULT_TIERS);
  const [tierData, setTierData] = useState<Record<string, string[]>>({});
  const [pool, setPool] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [imageCategoryMap, setImageCategoryMap] = useState<Record<string, string[]>>({});
  const [isPublic, setIsPublic] = useState(false);
  const [tierListId, setTierListId] = useState<string | null>(null);
  const [showAddTier, setShowAddTier] = useState(false);
  const [newTierName, setNewTierName] = useState("");
  const { toast } = useToast();
  const { logActivity, user } = useAuth();
  const { categories, createCategory, renameCategory, deleteCategory } = useCategories();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    fetchImagesAndLoadTierList();
    loadCategoryMap();
  }, []);

  const loadCategoryMap = async () => {
    const map = await fetchAllImageCategories();
    setImageCategoryMap(map);
  };

  const fetchImagesAndLoadTierList = async () => {
    const { data: imagesData, error } = await supabase
      .from("images")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10000);

    if (error) {
      toast({ title: "Error loading images", description: error.message, variant: "destructive" });
      return;
    }

    const signedImages = await withSignedClassmateImageUrls(imagesData || []);
    setAllImages(signedImages);
    setImages(signedImages);
    const allImageIds = (imagesData || []).map((img) => img.id);

    const { data: savedTierList } = await supabase
      .from("tier_lists")
      .select("*")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (savedTierList && savedTierList.tiers) {
      const saved = savedTierList.tiers as any;

      // Restore tier configs if saved
      if (saved._tierConfigs) {
        setTierConfigs(saved._tierConfigs);
      }

      // Restore tier data
      const restoredData: Record<string, string[]> = {};
      const allPlaced = new Set<string>();

      const configs = saved._tierConfigs || DEFAULT_TIERS;
      for (const tc of configs) {
        const items = saved[tc.key] || [];
        restoredData[tc.key] = items;
        items.forEach((id: string) => allPlaced.add(id));
      }

      const restoredPool = saved.pool || [];
      restoredPool.forEach((id: string) => allPlaced.add(id));

      const newIds = allImageIds.filter((id) => !allPlaced.has(id));

      setTierData(restoredData);
      setPool([...restoredPool, ...newIds]);
      setIsPublic((savedTierList as any).is_public ?? false);
      setTierListId(savedTierList.id);
    } else {
      // Initialize empty tiers
      const initData: Record<string, string[]> = {};
      for (const tc of DEFAULT_TIERS) initData[tc.key] = [];
      setTierData(initData);
      setPool(allImageIds);
    }
  };

  // Filter images when category changes
  useEffect(() => {
    if (filterCategories.length === 0) {
      setImages(allImages);
    } else {
      setImages(
        allImages.filter((img) => {
          const cats = imageCategoryMap[img.id] || [];
          return filterCategories.some((fc) => cats.includes(fc));
        })
      );
    }
  }, [filterCategories, allImages, imageCategoryMap]);

  const allTierKeys = [...tierConfigs.map((t) => t.key), "pool"];

  const findTierForItem = (itemId: string): string | null => {
    for (const tc of tierConfigs) {
      if ((tierData[tc.key] || []).includes(itemId)) return tc.key;
    }
    if (pool.includes(itemId)) return "pool";
    return null;
  };

  const getItems = (key: string): string[] => {
    if (key === "pool") return pool;
    return tierData[key] || [];
  };

  const setItems = (key: string, items: string[]) => {
    if (key === "pool") {
      setPool(items);
    } else {
      setTierData((prev) => ({ ...prev, [key]: items }));
    }
  };

  const resetTierList = () => {
    const filteredIds = images.map((img) => img.id);
    const emptyData: Record<string, string[]> = {};
    for (const tc of tierConfigs) emptyData[tc.key] = [];
    setTierData(emptyData);
    setPool(filteredIds);
    toast({ title: "🔄 Reset complete!", description: "All rankings cleared." });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) { setActiveId(null); return; }

    const dragId = active.id as string;
    const overId = over.id as string;

    const fromTier = findTierForItem(dragId);
    if (!fromTier) { setActiveId(null); return; }

    const isDroppedOnTier = allTierKeys.includes(overId);

    if (isDroppedOnTier) {
      const toTier = overId;
      if (fromTier === toTier) { setActiveId(null); return; }
      setItems(fromTier, getItems(fromTier).filter((id) => id !== dragId));
      setItems(toTier, [...getItems(toTier), dragId]);
    } else {
      const toTier = findTierForItem(overId);
      if (toTier && fromTier === toTier) {
        const items = [...getItems(fromTier)];
        const oldIndex = items.indexOf(dragId);
        const newIndex = items.indexOf(overId);
        items.splice(oldIndex, 1);
        items.splice(newIndex, 0, dragId);
        setItems(fromTier, items);
      } else if (toTier) {
        setItems(fromTier, getItems(fromTier).filter((id) => id !== dragId));
        const targetItems = [...getItems(toTier)];
        const insertIndex = targetItems.indexOf(overId);
        targetItems.splice(insertIndex, 0, dragId);
        setItems(toTier, targetItems);
      }
    }
    setActiveId(null);
  };

  const saveTierList = async () => {
    try {
      const tiersPayload: any = { _tierConfigs: tierConfigs, pool };
      for (const tc of tierConfigs) {
        tiersPayload[tc.key] = tierData[tc.key] || [];
      }

      const { data, error } = await supabase
        .from("tier_lists")
        .insert({ name: "My Tier List", tiers: tiersPayload, is_public: isPublic } as any)
        .select()
        .single();

      if (error) throw error;
      if (data) setTierListId(data.id);

      const counts: Record<string, number> = {};
      tierConfigs.forEach((tc) => { counts[tc.label] = (tierData[tc.key] || []).length; });
      await logActivity("tier_list_save", { tierCounts: counts });
      toast({ title: "✨ Tier list saved!", description: "Your rankings are locked in! 🎉" });
    } catch (error: any) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    }
  };

  const togglePublic = async () => {
    const newVal = !isPublic;
    setIsPublic(newVal);
    if (tierListId) {
      await supabase.from("tier_lists").update({ is_public: newVal } as any).eq("id", tierListId);
      toast({ title: newVal ? "🌍 Now public!" : "🔒 Now private" });
    }
  };

  const exportAsImage = async () => {
    const element = document.getElementById("tier-list-container");
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { backgroundColor: "#1a1410", scale: 2 });
      const link = document.createElement("a");
      link.download = "tier-list.png";
      link.href = canvas.toDataURL();
      link.click();
      toast({ title: "📸 Exported!" });
    } catch (error: any) {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
    }
  };

  const addCustomTier = () => {
    if (!newTierName.trim()) return;
    const key = `custom_${Date.now()}`;
    const colorIndex = tierConfigs.length % CUSTOM_TIER_COLORS.length;
    setTierConfigs((prev) => [...prev, { key, label: newTierName.trim(), color: CUSTOM_TIER_COLORS[colorIndex] }]);
    setTierData((prev) => ({ ...prev, [key]: [] }));
    setNewTierName("");
    setShowAddTier(false);
  };

  const removeTier = (key: string) => {
    const items = tierData[key] || [];
    setPool((prev) => [...prev, ...items]);
    setTierConfigs((prev) => prev.filter((t) => t.key !== key));
    setTierData((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const renameTierLabel = (key: string, newLabel: string) => {
    setTierConfigs((prev) =>
      prev.map((t) => (t.key === key ? { ...t, label: newLabel } : t))
    );
  };

  const handleCreateCategory = async (name: string) => {
    if (!user) return;
    try { await createCategory(name, user.id); toast({ title: "Category created! 🏷️" }); }
    catch (err: any) { toast({ title: "Couldn't create category", description: err.message, variant: "destructive" }); }
  };

  const handleRenameCategory = async (id: string, newName: string) => {
    try { await renameCategory(id, newName); toast({ title: "Category renamed! ✏️" }); }
    catch (err: any) { toast({ title: "Couldn't rename", description: err.message, variant: "destructive" }); }
  };

  const handleDeleteCategory = async (id: string) => {
    try { await deleteCategory(id); await loadCategoryMap(); toast({ title: "Category deleted! 🗑️" }); }
    catch (err: any) { toast({ title: "Couldn't delete", description: err.message, variant: "destructive" }); }
  };

  const getOrderedImages = (ids: string[]) =>
    ids.map((id) => images.find((img) => img.id === id)).filter((img): img is ImageType => Boolean(img));

  const activeImage = activeId ? images.find((img) => img.id === activeId) : null;

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <WhimsicalBackground />
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserMenu />
        <ThemeToggle />
      </div>

      <div className="container mx-auto relative z-10 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient font-['Luckiest_Guy'] tracking-wide">
              ⭐ Tier List
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Drag classmates into tiers • Click tier labels to rename • Add custom tiers below
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={resetTierList} variant="outline" size="sm" className="rounded-xl border-2 border-destructive/50 bg-card/80 backdrop-blur-sm hover:bg-destructive/10">
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
            </Button>
            <Button onClick={saveTierList} size="sm" className="rounded-xl gradient-pink-blue text-white">
              <Save className="mr-1.5 h-3.5 w-3.5" /> Save
            </Button>
            <Button onClick={exportAsImage} size="sm" className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export
            </Button>
            <Link to="/">
              <Button variant="outline" size="sm" className="rounded-xl border-2 border-primary/50 bg-card/80 backdrop-blur-sm">
                <Home className="mr-1.5 h-3.5 w-3.5" /> Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Public toggle - cleaner design */}
        <div className="flex items-center gap-3 mb-5 bg-card/60 backdrop-blur-sm border border-border/30 rounded-xl px-4 py-2.5">
          <Switch checked={isPublic} onCheckedChange={togglePublic} />
          <div className="flex items-center gap-2 flex-1">
            {isPublic ? (
              <>
                <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <Globe className="h-3.5 w-3.5 text-accent" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground">Public</span>
                  <span className="text-xs text-muted-foreground ml-2">Others can view & comment on your rankings</span>
                </div>
              </>
            ) : (
              <>
                <div className="h-6 w-6 rounded-full bg-muted/40 flex items-center justify-center">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Private</span>
                  <span className="text-xs text-muted-foreground/60 ml-2">Only visible to you</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-5">
          <CategoryFilter
            categories={categories}
            selected={filterCategories}
            onChange={setFilterCategories}
            allowCreate
            onCreateCategory={handleCreateCategory}
            allowEdit
            onRenameCategory={handleRenameCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </div>

        {/* Tier rows */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div id="tier-list-container" className="space-y-2">
            {tierConfigs.map((tc) => (
              <div key={tc.key} className="group/tier relative">
                <TierRow
                  tier={tc.key}
                  color={tc.color}
                  label={tc.label}
                  images={getOrderedImages(tierData[tc.key] || [])}
                  onRenameLabel={(newLabel) => renameTierLabel(tc.key, newLabel)}
                />
                {/* Delete custom tier button */}
                {tc.key.startsWith("custom_") && (
                  <button
                    onClick={() => removeTier(tc.key)}
                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/tier:opacity-100 transition-opacity shadow-md z-10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}

            {/* Add tier button */}
            {showAddTier ? (
              <div className="flex gap-2 items-center bg-card/60 backdrop-blur-sm border-2 border-dashed border-accent/40 rounded-xl px-4 py-3">
                <Input
                  value={newTierName}
                  onChange={(e) => setNewTierName(e.target.value.slice(0, 12))}
                  placeholder="Tier name (e.g. GOD, MID, 🗑️)"
                  className="h-8 max-w-[200px] rounded-lg text-sm"
                  onKeyDown={(e) => e.key === "Enter" && addCustomTier()}
                  autoFocus
                />
                <Button size="sm" onClick={addCustomTier} className="rounded-lg h-8">Add</Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowAddTier(false); setNewTierName(""); }} className="h-8">Cancel</Button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddTier(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-muted-foreground/20 text-muted-foreground/60 hover:border-accent/50 hover:text-accent hover:bg-accent/5 transition-all text-sm"
              >
                <Plus className="h-4 w-4" /> Add Custom Tier
              </button>
            )}

            {/* Pool */}
            <ImagePool images={getOrderedImages(pool)} />
          </div>

          <DragOverlay>
            {activeImage ? (
              <div className="w-[88px] h-[88px] rounded-xl overflow-hidden border-2 border-primary shadow-xl">
                {activeImage.image_url ? (
                  <img src={activeImage.image_url} alt={activeImage.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center p-2">
                    <p className="text-[10px] font-bold text-foreground text-center break-words leading-tight">{activeImage.name}</p>
                  </div>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Comments */}
        {isPublic && tierListId && (
          <div className="mt-10 bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-6">
            <CommentSection contentType="tier_list" contentId={tierListId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TierList;
