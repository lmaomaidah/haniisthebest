import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Home, Save, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { TierRow } from "@/components/TierRow";
import { ImagePool } from "@/components/ImagePool";
import html2canvas from "html2canvas";

interface ImageType {
  id: string;
  name: string;
  image_url: string;
}

interface TiersType {
  S: string[];
  A: string[];
  B: string[];
  C: string[];
  D: string[];
  pool: string[];
}

const tierColors = {
  S: "bg-red-500",
  A: "bg-orange-500",
  B: "bg-yellow-500",
  C: "bg-green-500",
  D: "bg-blue-500",
};

const TierList = () => {
  const [images, setImages] = useState<ImageType[]>([]);
  const [tiers, setTiers] = useState<TiersType>({
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    pool: [],
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
    loadTierList();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading images",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setImages(data || []);
      if (data && data.length > 0) {
        setTiers(prev => ({
          ...prev,
          pool: data.map(img => img.id),
        }));
      }
    }
  };

  const loadTierList = async () => {
    const { data, error } = await supabase
      .from('tier_lists')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setTiers(data.tiers as TiersType);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which tier the active item is in
    let fromTier: keyof TiersType | null = null;
    for (const [tier, items] of Object.entries(tiers)) {
      if (items.includes(activeId)) {
        fromTier = tier as keyof TiersType;
        break;
      }
    }

    if (!fromTier) {
      setActiveId(null);
      return;
    }

    // Determine target tier
    const toTier = overId as keyof TiersType;

    if (fromTier === toTier) {
      setActiveId(null);
      return;
    }

    // Move item
    setTiers(prev => {
      const newTiers = { ...prev };
      newTiers[fromTier!] = newTiers[fromTier!].filter(id => id !== activeId);
      newTiers[toTier] = [...newTiers[toTier], activeId];
      return newTiers;
    });

    setActiveId(null);
  };

  const saveTierList = async () => {
    try {
      const { error } = await supabase
        .from('tier_lists')
        .insert({
          name: 'My Tier List',
          tiers: tiers,
        });

      if (error) throw error;

      toast({
        title: "✨ Tier list saved!",
        description: "Your rankings are locked in! 🎉",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportAsImage = async () => {
    const element = document.getElementById('tier-list-container');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = 'tier-list.png';
      link.href = canvas.toDataURL();
      link.click();

      toast({
        title: "📸 Exported!",
        description: "Tier list saved as image! 🎨",
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const activeImage = activeId ? images.find(img => img.id === activeId) : null;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-5xl md:text-7xl font-bold text-gradient animate-bounce-in">
            ⭐ Tier List Maker
          </h1>
          <div className="flex gap-4">
            <Button onClick={saveTierList} className="gradient-pink-blue text-white rounded-2xl">
              <Save className="mr-2" />
              Save
            </Button>
            <Button onClick={exportAsImage} className="bg-neon-green text-foreground rounded-2xl">
              <Download className="mr-2" />
              Export
            </Button>
            <Link to="/">
              <Button variant="outline" className="border-4 border-primary rounded-2xl">
                <Home className="mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-card border-4 border-accent rounded-3xl p-6 mb-8 text-center">
          <p className="text-xl font-bold">
            🎯 Drag and drop your classmates into tiers! S = Iconic, D = NPC Energy 💅
          </p>
        </div>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div id="tier-list-container" className="space-y-4">
            {/* Tier Rows */}
            {(['S', 'A', 'B', 'C', 'D'] as const).map(tier => (
              <TierRow
                key={tier}
                tier={tier}
                color={tierColors[tier]}
                images={images.filter(img => tiers[tier].includes(img.id))}
              />
            ))}

            {/* Image Pool */}
            <ImagePool images={images.filter(img => tiers.pool.includes(img.id))} />
          </div>

          <DragOverlay>
            {activeImage ? (
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-primary shadow-glow">
                <img
                  src={activeImage.image_url}
                  alt={activeImage.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default TierList;
