import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { DraggableImage } from "@/components/DraggableImage";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import { RotateCcw } from "lucide-react";

interface ImageType {
  id: string;
  name: string;
  image_url: string | null;
}

interface Circle {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface Placements {
  [imageId: string]: string; // regionId
}

const CIRCLE_RADIUS = 150;

export default function VennDiagram() {
  const navigate = useNavigate();
  const { logActivity } = useAuth();
  const [images, setImages] = useState<ImageType[]>([]);
  const [circles, setCircles] = useState<Circle[]>([
    { id: 'A', label: 'Circle A', x: 250, y: 250 },
    { id: 'B', label: 'Circle B', x: 400, y: 250 },
  ]);
  const [placements, setPlacements] = useState<Placements>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    loadImages();
    loadVennDiagram();
  }, []);

  const loadImages = async () => {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10000);

    if (!error && data) {
      setImages(data);
    }
  };

  const loadVennDiagram = async () => {
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

  const saveVennDiagram = async () => {
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
            name: 'My Venn Diagram',
            circles: circles as any,
            placements: placements as any,
          });

        if (error) throw error;
      }

      await logActivity('venn_save', {
        circles: circles.length,
        placed: Object.keys(placements).length,
      });

      toast.success("💾 Venn diagram saved!");
    } catch (error) {
      console.error('Error saving:', error);
      toast.error("Failed to save diagram");
    }
  };

  const exportDiagram = async () => {
    const element = document.getElementById('venn-diagram');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.download = 'venn-diagram.png';
      link.href = canvas.toDataURL();
      link.click();
      toast.success("📸 Diagram exported!");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export diagram");
    }
  };

  const addCircle = () => {
    if (!newLabel.trim()) {
      toast.error("Please enter a label");
      return;
    }

    const newId = String.fromCharCode(65 + circles.length);
    const newCircle: Circle = {
      id: newId,
      label: newLabel,
      x: 250 + (circles.length * 100),
      y: 250,
    };

    setCircles([...circles, newCircle]);
    setNewLabel("");
    toast.success(`✨ Added ${newLabel}!`);
  };

  const resetVennDiagram = () => {
    setCircles([
      { id: 'A', label: 'Circle A', x: 250, y: 250 },
      { id: 'B', label: 'Circle B', x: 400, y: 250 },
    ]);
    setPlacements({});
    toast.success("🔄 Venn diagram reset!");
  };

  const updateCircleLabel = (id: string, label: string) => {
    setCircles(circles.map(c => c.id === id ? { ...c, label } : c));
  };

  const getRegionForPosition = (circles: Circle[]): string => {
    // For simplicity, return a region based on number of circles
    if (circles.length === 2) return 'AB';
    if (circles.length === 3) return 'ABC';
    return circles.map(c => c.id).join('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      // Remove from diagram
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

  const getImagesInRegion = (regionId: string) => {
    return images.filter(img => placements[img.id] === regionId);
  };

  const getUnplacedImages = () => {
    return images.filter(img => !placements[img.id]);
  };

  const activeImage = images.find(img => img.id === activeId);

  // Calculate overlapping regions
  const regions = circles.length === 2
    ? [
        { id: 'A', label: circles[0].label, style: { left: 150, top: 150 } },
        { id: 'AB', label: 'Both', style: { left: 325, top: 200 } },
        { id: 'B', label: circles[1].label, style: { left: 500, top: 150 } },
      ]
    : circles.length === 3
    ? [
        { id: 'A', label: circles[0].label, style: { left: 150, top: 150 } },
        { id: 'B', label: circles[1].label, style: { left: 450, top: 150 } },
        { id: 'C', label: circles[2].label, style: { left: 300, top: 350 } },
        { id: 'AB', label: `${circles[0].label} & ${circles[1].label}`, style: { left: 300, top: 120 } },
        { id: 'AC', label: `${circles[0].label} & ${circles[2].label}`, style: { left: 200, top: 280 } },
        { id: 'BC', label: `${circles[1].label} & ${circles[2].label}`, style: { left: 400, top: 280 } },
        { id: 'ABC', label: 'All Three', style: { left: 300, top: 240 } },
      ]
    : circles.map(c => ({ id: c.id, label: c.label, style: { left: c.x, top: c.y } }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-secondary p-8 animate-fade-in relative">
      <WhimsicalBackground />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-4 border-primary"
          >
            🏠 Back to Home
          </Button>
          <Button
            onClick={resetVennDiagram}
            variant="outline"
            className="border-4 border-destructive"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        <h1 className="text-6xl font-bold text-center mb-8 text-primary animate-bounce-in">
          🔮 Venn Diagram Sorter 🔮
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-card rounded-3xl p-6 border-4 border-primary shadow-bounce">
            <h3 className="text-2xl font-bold mb-4">🎯 Available Classmates</h3>
            <div className="flex flex-wrap gap-4">
              {getUnplacedImages().map(img => (
                <DraggableImage key={img.id} image={img} />
              ))}
              {getUnplacedImages().length === 0 && (
                <p className="text-muted-foreground italic">All placed in diagram!</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-card rounded-3xl p-6 border-4 border-primary shadow-bounce">
            <h3 className="text-2xl font-bold mb-4">⚙️ Customize Circles</h3>
            <div className="space-y-4">
              {circles.map(circle => (
                <div key={circle.id} className="flex gap-2">
                  <span className="font-bold text-lg">Circle {circle.id}:</span>
                  <Input
                    value={circle.label}
                    onChange={(e) => updateCircleLabel(circle.id, e.target.value)}
                    className="border-2 border-primary"
                  />
                </div>
              ))}
              {circles.length < 3 && (
                <div className="flex gap-2">
                  <Input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="New circle label..."
                    className="border-2 border-primary"
                  />
                  <Button onClick={addCircle} className="whitespace-nowrap">
                    ➕ Add Circle
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <DndContext onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
          <div id="venn-diagram" className="bg-card rounded-3xl p-8 border-4 border-primary shadow-bounce relative" style={{ minHeight: 600 }}>
            {/* Draw circles */}
            {circles.map(circle => (
              <div
                key={circle.id}
                className="absolute rounded-full border-8 opacity-30"
                style={{
                  left: circle.x,
                  top: circle.y,
                  width: CIRCLE_RADIUS * 2,
                  height: CIRCLE_RADIUS * 2,
                  borderColor: `hsl(var(--primary))`,
                  backgroundColor: `hsl(var(--primary) / 0.1)`,
                }}
              />
            ))}

            {/* Drop zones for regions */}
            {regions.map(region => (
              <DropRegion key={region.id} id={region.id} label={region.label} style={region.style}>
                {getImagesInRegion(region.id).map(img => (
                  <DraggableImage key={img.id} image={img} />
                ))}
              </DropRegion>
            ))}
          </div>

          <DragOverlay>
            {activeImage ? <DraggableImage image={activeImage} /> : null}
          </DragOverlay>
        </DndContext>

        <div className="flex gap-4 mt-6 justify-center">
          <Button onClick={saveVennDiagram} size="lg" className="text-xl animate-pulse-glow">
            💾 Save Diagram
          </Button>
          <Button onClick={exportDiagram} variant="secondary" size="lg" className="text-xl">
            📸 Export as Image
          </Button>
        </div>
      </div>
    </div>
  );
}

function DropRegion({ id, label, style, children }: { id: string; label: string; style: any; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`absolute rounded-2xl border-4 border-dashed p-4 transition-all ${
        isOver ? 'bg-primary/20 scale-105 border-primary' : 'bg-muted/50 border-muted-foreground'
      }`}
      style={{ ...style, minWidth: 120, minHeight: 120 }}
    >
      <div className="text-xs font-bold mb-2 text-center">{label}</div>
      <div className="flex flex-wrap gap-2 justify-center">
        {children}
      </div>
    </div>
  );
}
