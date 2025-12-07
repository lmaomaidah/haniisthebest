import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, DragEndEvent, DragOverlay, useDroppable } from "@dnd-kit/core";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { DraggableImage } from "@/components/DraggableImage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Plus, Trash2, Save, Download, Home } from "lucide-react";

interface ImageType {
  id: string;
  name: string;
  image_url: string | null;
}

interface Circle {
  id: string;
  label: string;
  color: string;
}

interface Placements {
  [imageId: string]: string; // zone id (circle-id or combo like "circle1+circle2")
}

const CIRCLE_COLORS = [
  "rgba(255, 100, 150, 0.5)",
  "rgba(100, 200, 255, 0.5)",
  "rgba(150, 255, 100, 0.5)",
  "rgba(255, 200, 100, 0.5)",
  "rgba(200, 100, 255, 0.5)",
  "rgba(255, 150, 200, 0.5)",
  "rgba(100, 255, 200, 0.5)",
  "rgba(200, 255, 100, 0.5)",
];

export default function Classifications() {
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageType[]>([]);
  const [circles, setCircles] = useState<Circle[]>([
    { id: 'circle-1', label: 'Circle 1', color: CIRCLE_COLORS[0] },
    { id: 'circle-2', label: 'Circle 2', color: CIRCLE_COLORS[1] },
  ]);
  const [placements, setPlacements] = useState<Placements>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    loadImages();
    loadClassifications();
  }, []);

  const loadImages = async () => {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setImages(data);
    }
  };

  const loadClassifications = async () => {
    const { data, error } = await supabase
      .from('venn_diagrams')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      if (data.circles) setCircles(data.circles as unknown as Circle[]);
      if (data.placements) setPlacements(data.placements as unknown as Placements);
    }
  };

  const saveClassifications = async () => {
    try {
      const { data: existing } = await supabase
        .from('venn_diagrams')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('venn_diagrams')
          .update({
            circles: circles as any,
            placements: placements as any,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('venn_diagrams')
          .insert({
            name: 'My Classifications',
            circles: circles as any,
            placements: placements as any,
          });

        if (error) throw error;
      }

      toast.success("💾 Classifications saved!");
    } catch (error) {
      console.error('Error saving:', error);
      toast.error("Failed to save");
    }
  };

  const exportClassifications = async () => {
    const element = document.getElementById('classification-board');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.download = 'classifications.png';
      link.href = canvas.toDataURL();
      link.click();
      toast.success("📸 Classifications exported!");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export");
    }
  };

  const addCircle = () => {
    if (!newLabel.trim()) {
      toast.error("Please enter a label");
      return;
    }

    const newCircle: Circle = {
      id: `circle-${Date.now()}`,
      label: newLabel,
      color: CIRCLE_COLORS[circles.length % CIRCLE_COLORS.length],
    };

    setCircles([...circles, newCircle]);
    setNewLabel("");
    toast.success(`✨ Added ${newLabel}!`);
  };

  const removeCircle = (id: string) => {
    setCircles(circles.filter(c => c.id !== id));
    setPlacements(prev => {
      const newPlacements = { ...prev };
      Object.keys(newPlacements).forEach(key => {
        if (newPlacements[key].includes(id)) {
          delete newPlacements[key];
        }
      });
      return newPlacements;
    });
    toast.success("🗑️ Circle removed!");
  };

  const updateCircleLabel = (id: string, label: string) => {
    setCircles(circles.map(c => c.id === id ? { ...c, label } : c));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      setPlacements(prev => {
        const newPlacements = { ...prev };
        delete newPlacements[active.id as string];
        return newPlacements;
      });
      return;
    }

    setPlacements(prev => ({
      ...prev,
      [active.id as string]: over.id as string,
    }));
  };

  const getImagesInZone = (zoneId: string) => {
    return images.filter(img => placements[img.id] === zoneId);
  };

  const getUnplacedImages = () => {
    return images.filter(img => !placements[img.id]);
  };

  // Generate all possible combinations (2+ circles)
  const combinations = useMemo(() => {
    if (circles.length < 2) return [];
    
    const combos: { id: string; label: string; circleIds: string[] }[] = [];
    
    // Generate all combinations of 2 or more circles
    const generateCombinations = (start: number, current: string[]) => {
      if (current.length >= 2) {
        const sortedIds = [...current].sort();
        const id = sortedIds.join('+');
        const labels = sortedIds.map(cid => circles.find(c => c.id === cid)?.label || '').join(' + ');
        combos.push({ id, label: labels, circleIds: sortedIds });
      }
      
      for (let i = start; i < circles.length; i++) {
        generateCombinations(i + 1, [...current, circles[i].id]);
      }
    };
    
    generateCombinations(0, []);
    return combos;
  }, [circles]);

  // Filter to only show combinations that have images
  const activeCombinations = combinations.filter(combo => getImagesInZone(combo.id).length > 0);

  const activeImage = images.find(img => img.id === activeId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-2 border-primary gap-2"
          >
            <Home className="w-4 h-4" /> Home
          </Button>
          <ThemeToggle />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 text-primary animate-bounce-in">
          🔵 Classify 🟣
        </h1>

        {/* Add Circle Section */}
        <div className="bg-card rounded-3xl p-6 border-4 border-primary shadow-bounce mb-6">
          <h3 className="text-xl font-bold mb-4">➕ Add Category</h3>
          <div className="flex gap-2 flex-wrap items-center">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Category label..."
              className="border-2 border-primary max-w-xs"
              onKeyDown={(e) => e.key === 'Enter' && addCircle()}
            />
            <Button onClick={addCircle} className="gap-2">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
          
          {/* Circle Labels */}
          <div className="flex flex-wrap gap-3 mt-4">
            {circles.map((circle) => (
              <div key={circle.id} className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-foreground/50" 
                  style={{ backgroundColor: circle.color }}
                />
                <Input
                  value={circle.label}
                  onChange={(e) => updateCircleLabel(circle.id, e.target.value)}
                  className="border-none bg-transparent font-bold w-32 p-0 h-auto"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCircle(circle.id)}
                  className="text-destructive hover:bg-destructive/20 h-6 w-6"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DndContext onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
          {/* Unplaced Images */}
          <div className="bg-card rounded-3xl p-6 border-4 border-secondary shadow-bounce mb-6">
            <h3 className="text-2xl font-bold mb-4">🎯 Available Classmates</h3>
            <p className="text-muted-foreground mb-4 text-sm">Drag classmates into categories below</p>
            <div className="flex flex-wrap gap-4 min-h-[80px]">
              {getUnplacedImages().map(img => (
                <DraggableImage key={img.id} image={img} />
              ))}
              {getUnplacedImages().length === 0 && (
                <p className="text-muted-foreground italic">All classmates placed! 🎉</p>
              )}
            </div>
          </div>

          {/* Classification Circles */}
          <div id="classification-board" className="space-y-6">
            {/* Individual Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {circles.map((circle) => {
                const imagesInZone = getImagesInZone(circle.id);
                const minHeight = Math.max(150, 80 + imagesInZone.length * 25);
                
                return (
                  <DropZone
                    key={circle.id}
                    id={circle.id}
                    label={circle.label}
                    color={circle.color}
                    minHeight={minHeight}
                  >
                    {imagesInZone.map(img => (
                      <DraggableImage key={img.id} image={img} />
                    ))}
                  </DropZone>
                );
              })}
            </div>

            {/* Combination Zones */}
            {circles.length >= 2 && (
              <div className="bg-card/50 rounded-3xl p-6 border-4 border-dashed border-accent">
                <h3 className="text-2xl font-bold mb-4 text-center">✨ Combinations (Overlaps)</h3>
                <p className="text-muted-foreground text-center mb-4 text-sm">
                  Drop here for classmates that fit multiple categories
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {combinations.map((combo) => {
                    const imagesInZone = getImagesInZone(combo.id);
                    const minHeight = Math.max(120, 60 + imagesInZone.length * 25);
                    const isActive = imagesInZone.length > 0;
                    
                    return (
                      <DropZone
                        key={combo.id}
                        id={combo.id}
                        label={combo.label}
                        color={isActive ? "rgba(255, 220, 100, 0.5)" : "rgba(150, 150, 150, 0.2)"}
                        minHeight={minHeight}
                        isCombo
                      >
                        {imagesInZone.map(img => (
                          <DraggableImage key={img.id} image={img} />
                        ))}
                      </DropZone>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeImage ? <DraggableImage image={activeImage} /> : null}
          </DragOverlay>
        </DndContext>

        {/* Actions */}
        <div className="flex gap-4 justify-center flex-wrap mt-8">
          <Button onClick={saveClassifications} size="lg" className="text-lg gap-2 animate-pulse-glow">
            <Save className="w-5 h-5" /> Save
          </Button>
          <Button onClick={exportClassifications} variant="secondary" size="lg" className="text-lg gap-2">
            <Download className="w-5 h-5" /> Export as Image
          </Button>
        </div>
      </div>
    </div>
  );
}

function DropZone({ 
  id, 
  label, 
  color, 
  minHeight,
  isCombo,
  children 
}: { 
  id: string; 
  label: string;
  color: string;
  minHeight: number;
  isCombo?: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const hasChildren = Array.isArray(children) ? children.length > 0 : !!children;

  return (
    <div
      ref={setNodeRef}
      className={`rounded-3xl p-4 transition-all border-4 ${
        isOver ? 'scale-[1.02] border-primary shadow-xl ring-4 ring-primary/30' : 'border-foreground/20'
      } ${isCombo ? 'border-dashed' : ''}`}
      style={{
        backgroundColor: color,
        backdropFilter: 'blur(4px)',
        minHeight: `${minHeight}px`,
      }}
    >
      <h4 className="font-bold text-lg text-foreground mb-3 text-center drop-shadow-md">
        {label}
      </h4>
      <div className="flex flex-wrap gap-2 justify-center items-start">
        {children}
        {!hasChildren && (
          <p className="text-foreground/50 text-sm italic text-center py-4">
            Drop classmates here
          </p>
        )}
      </div>
    </div>
  );
}
