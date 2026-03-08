import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Home, Save, Download, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { TierRow } from "@/components/TierRow";
import { ImagePool } from "@/components/ImagePool";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import html2canvas from "html2canvas";
import { withSignedClassmateImageUrls } from "@/lib/classmateImages";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useCategories, fetchAllImageCategories } from "@/hooks/useCategories";

interface ImageType {
  id: string;
  name: string;
  image_url: string | null;
}

interface TiersType {
  S: string[];
  A: string[];
  B: string[];
  C: string[];
  D: string[];
  F: string[];
  pool: string[];
}

const tierColors = {
  S: "bg-red-500",
  A: "bg-orange-500",
  B: "bg-yellow-500",
  C: "bg-green-500",
  D: "bg-blue-500",
  F: "bg-purple-500",
};

const TierList = () => {
  const [images, setImages] = useState<ImageType[]>([]);
  const [allImages, setAllImages] = useState<ImageType[]>([]);
  const [tiers, setTiers] = useState<TiersType>({ S: [], A: [], B: [], C: [], D: [], F: [], pool: [] });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [imageCategoryMap, setImageCategoryMap] = useState<Record<string, string[]>>({});
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

    const { data: tierData } = await supabase
      .from("tier_lists")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tierData && tierData.tiers) {
      const savedTiers = tierData.tiers as unknown as TiersType;
      const placedIds = new Set([
        ...savedTiers.S, ...savedTiers.A, ...savedTiers.B,
        ...savedTiers.C, ...savedTiers.D, ...(savedTiers.F || []), ...savedTiers.pool,
      ]);
      const newImageIds = allImageIds.filter((id) => !placedIds.has(id));
      setTiers({ ...savedTiers, F: savedTiers.F || [], pool: [...savedTiers.pool, ...newImageIds] });
    } else {
      setTiers((prev) => ({ ...prev, pool: allImageIds }));
    }
  };

  // Filter images when category filter changes
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

  const resetTierList = () => {
    const filteredIds = images.map((img) => img.id);
    setTiers({ S: [], A: [], B: [], C: [], D: [], F: [], pool: filteredIds });
    toast({ title: "🔄 Reset complete!", description: "All rankings cleared. Start fresh!" });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) { setActiveId(null); return; }

    const dragId = active.id as string;
    const overId = over.id as string;

    let fromTier: keyof TiersType | null = null;
    for (const [tier, items] of Object.entries(tiers)) {
      if (items.includes(dragId)) { fromTier = tier as keyof TiersType; break; }
    }
    if (!fromTier) { setActiveId(null); return; }

    const tierKeys = ["S", "A", "B", "C", "D", "F", "pool"] as const;
    const isDroppedOnTier = tierKeys.includes(overId as any);

    if (isDroppedOnTier) {
      const toTier = overId as keyof TiersType;
      if (fromTier === toTier) { setActiveId(null); return; }
      setTiers((prev) => {
        const newTiers = { ...prev };
        newTiers[fromTier!] = newTiers[fromTier!].filter((id) => id !== dragId);
        newTiers[toTier] = [...newTiers[toTier], dragId];
        return newTiers;
      });
    } else {
      let toTier: keyof TiersType | null = null;
      for (const [tier, items] of Object.entries(tiers)) {
        if (items.includes(overId)) { toTier = tier as keyof TiersType; break; }
      }
      if (toTier && fromTier === toTier) {
        setTiers((prev) => {
          const items = [...prev[fromTier!]];
          const oldIndex = items.indexOf(dragId);
          const newIndex = items.indexOf(overId);
          items.splice(oldIndex, 1);
          items.splice(newIndex, 0, dragId);
          return { ...prev, [fromTier!]: items };
        });
      } else if (toTier) {
        setTiers((prev) => {
          const newTiers = { ...prev };
          newTiers[fromTier!] = newTiers[fromTier!].filter((id) => id !== dragId);
          const targetItems = [...newTiers[toTier!]];
          const insertIndex = targetItems.indexOf(overId);
          targetItems.splice(insertIndex, 0, dragId);
          newTiers[toTier!] = targetItems;
          return newTiers;
        });
      }
    }
    setActiveId(null);
  };

  const saveTierList = async () => {
    try {
      const { error } = await supabase.from("tier_lists").insert({ name: "My Tier List", tiers: tiers as any });
      if (error) throw error;
      await logActivity("tier_list_save", { tierCounts: { S: tiers.S.length, A: tiers.A.length, B: tiers.B.length, C: tiers.C.length, D: tiers.D.length } });
      toast({ title: "✨ Tier list saved!", description: "Your rankings are locked in! 🎉" });
    } catch (error: any) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    }
  };

  const exportAsImage = async () => {
    const element = document.getElementById("tier-list-container");
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.download = "tier-list.png";
      link.href = canvas.toDataURL();
      link.click();
      toast({ title: "📸 Exported!", description: "Tier list saved as image! 🎨" });
    } catch (error: any) {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateCategory = async (name: string) => {
    if (!user) return;
    try {
      await createCategory(name, user.id);
      toast({ title: "Category created! 🏷️" });
    } catch (err: any) {
      toast({ title: "Couldn't create category", description: err.message, variant: "destructive" });
    }
  };

  const handleRenameCategory = async (id: string, newName: string) => {
    try {
      await renameCategory(id, newName);
      toast({ title: "Category renamed! ✏️" });
    } catch (err: any) {
      toast({ title: "Couldn't rename", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      await loadCategoryMap();
      toast({ title: "Category deleted! 🗑️" });
    } catch (err: any) {
      toast({ title: "Couldn't delete", description: err.message, variant: "destructive" });
    }
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

      <div className="container mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-5xl md:text-7xl font-bold text-gradient animate-bounce-in">⭐ Tier List Maker</h1>
          <div className="flex gap-4 flex-wrap">
            <Button onClick={resetTierList} variant="outline" className="border-4 border-destructive rounded-2xl bg-card/80 dark:bg-card/60 backdrop-blur-sm">
              <RotateCcw className="mr-2" /> Reset
            </Button>
            <Button onClick={saveTierList} className="gradient-pink-blue text-white rounded-2xl">
              <Save className="mr-2" /> Save
            </Button>
            <Button onClick={exportAsImage} className="bg-lime-green text-background rounded-2xl">
              <Download className="mr-2" /> Export
            </Button>
            <Link to="/">
              <Button variant="outline" className="border-4 border-primary rounded-2xl bg-card/80 dark:bg-card/60 backdrop-blur-sm">
                <Home className="mr-2" /> Home
              </Button>
            </Link>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mb-6">
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
        )}

        <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-4 border-accent rounded-3xl p-6 mb-8 text-center">
          <p className="text-xl font-bold text-foreground">
            🎯 Drag and drop your classmates into tiers! S = Iconic, D = NPC Energy 💅
          </p>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div id="tier-list-container" className="space-y-4">
            {(["S", "A", "B", "C", "D", "F"] as const).map((tier) => (
              <TierRow key={tier} tier={tier} color={tierColors[tier]} images={getOrderedImages(tiers[tier])} />
            ))}
            <ImagePool images={getOrderedImages(tiers.pool)} />
          </div>

          <DragOverlay>
            {activeImage ? (
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-primary shadow-glow">
                {activeImage.image_url ? (
                  <img src={activeImage.image_url} alt={activeImage.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-card flex items-center justify-center p-2">
                    <p className="text-xs font-bold text-foreground text-center break-words leading-tight">{activeImage.name}</p>
                  </div>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default TierList;
