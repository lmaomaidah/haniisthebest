import { useState, useEffect } from "react";
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
  [imageId: string]: string; // zone id (circle-id or overlap-id)
}

const CIRCLE_COLORS = [
  "rgba(255, 100, 150, 0.4)",
  "rgba(100, 200, 255, 0.4)",
  "rgba(150, 255, 100, 0.4)",
  "rgba(255, 200, 100, 0.4)",
  "rgba(200, 100, 255, 0.4)",
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
            name: 'My Venn Diagram',
            circles: circles as any,
            placements: placements as any,
          });

        if (error) throw error;
      }

      toast.success("💾 Venn diagram saved!");
    } catch (error) {
      console.error('Error saving:', error);
      toast.error("Failed to save");
    }
  };

  const exportClassifications = async () => {
    const element = document.getElementById('venn-board');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.download = 'venn-diagram.png';
      link.href = canvas.toDataURL();
      link.click();
      toast.success("📸 Venn diagram exported!");
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
    if (circles.length >= 3) {
      toast.error("Maximum 3 circles supported for overlap clarity");
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

  const activeImage = images.find(img => img.id === activeId);

  // Generate zone IDs based on circles
  const getZones = () => {
    const zones: { id: string; label: string; circles: string[] }[] = [];
    
    // Individual circles
    circles.forEach(c => {
      zones.push({ id: c.id, label: c.label, circles: [c.id] });
    });

    // Two-circle overlaps
    if (circles.length >= 2) {
      for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
          const id = `overlap-${circles[i].id}-${circles[j].id}`;
          zones.push({
            id,
            label: `${circles[i].label} + ${circles[j].label}`,
            circles: [circles[i].id, circles[j].id],
          });
        }
      }
    }

    // Three-circle center overlap
    if (circles.length === 3) {
      zones.push({
        id: `center-${circles.map(c => c.id).join('-')}`,
        label: 'All Three',
        circles: circles.map(c => c.id),
      });
    }

    return zones;
  };

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
          🔵 Venn Diagram 🟣
        </h1>

        {/* Add Circle Section */}
        <div className="bg-card rounded-3xl p-6 border-4 border-primary shadow-bounce mb-6">
          <h3 className="text-xl font-bold mb-4">➕ Add Circle (max 3)</h3>
          <div className="flex gap-2 flex-wrap items-center">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Circle label..."
              className="border-2 border-primary max-w-xs"
              onKeyDown={(e) => e.key === 'Enter' && addCircle()}
            />
            <Button onClick={addCircle} className="gap-2" disabled={circles.length >= 3}>
              <Plus className="w-4 h-4" /> Add Circle
            </Button>
          </div>
          
          {/* Circle Labels */}
          <div className="flex flex-wrap gap-3 mt-4">
            {circles.map((circle, idx) => (
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

        {/* Unplaced Images */}
        <div className="bg-card rounded-3xl p-6 border-4 border-secondary shadow-bounce mb-6">
          <h3 className="text-2xl font-bold mb-4">🎯 Available Classmates</h3>
          <p className="text-muted-foreground mb-4 text-sm">Drag classmates into circles or overlapping zones</p>
          <DndContext onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
            <div className="flex flex-wrap gap-4 min-h-[80px]">
              {getUnplacedImages().map(img => (
                <DraggableImage key={img.id} image={img} />
              ))}
              {getUnplacedImages().length === 0 && (
                <p className="text-muted-foreground italic">All classmates placed! 🎉</p>
              )}
            </div>

            {/* Venn Diagram */}
            <div id="venn-board" className="relative mt-8 mx-auto" style={{ height: circles.length === 3 ? 500 : 400, maxWidth: 700 }}>
              <VennDiagram
                circles={circles}
                getImagesInZone={getImagesInZone}
              />
            </div>

            <DragOverlay>
              {activeImage ? <DraggableImage image={activeImage} /> : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center flex-wrap">
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

function VennDiagram({ 
  circles, 
  getImagesInZone 
}: { 
  circles: Circle[];
  getImagesInZone: (zoneId: string) => ImageType[];
}) {
  if (circles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Add circles to start creating your Venn diagram
      </div>
    );
  }

  if (circles.length === 1) {
    return <SingleCircle circle={circles[0]} getImagesInZone={getImagesInZone} />;
  }

  if (circles.length === 2) {
    return <TwoCircles circles={circles} getImagesInZone={getImagesInZone} />;
  }

  return <ThreeCircles circles={circles} getImagesInZone={getImagesInZone} />;
}

function SingleCircle({ circle, getImagesInZone }: { circle: Circle; getImagesInZone: (id: string) => ImageType[] }) {
  return (
    <div className="flex items-center justify-center h-full">
      <DropZone
        id={circle.id}
        label={circle.label}
        color={circle.color}
        className="w-80 h-80 rounded-full"
      >
        {getImagesInZone(circle.id).map(img => (
          <DraggableImage key={img.id} image={img} />
        ))}
      </DropZone>
    </div>
  );
}

function TwoCircles({ circles, getImagesInZone }: { circles: Circle[]; getImagesInZone: (id: string) => ImageType[] }) {
  const [c1, c2] = circles;
  const overlapId = `overlap-${c1.id}-${c2.id}`;

  return (
    <div className="relative h-full">
      {/* Left Circle */}
      <div className="absolute left-[10%] top-1/2 -translate-y-1/2">
        <DropZone
          id={c1.id}
          label={c1.label}
          color={c1.color}
          className="w-64 h-64 md:w-72 md:h-72 rounded-full"
        >
          {getImagesInZone(c1.id).map(img => (
            <DraggableImage key={img.id} image={img} />
          ))}
        </DropZone>
      </div>

      {/* Right Circle */}
      <div className="absolute right-[10%] top-1/2 -translate-y-1/2">
        <DropZone
          id={c2.id}
          label={c2.label}
          color={c2.color}
          className="w-64 h-64 md:w-72 md:h-72 rounded-full"
        >
          {getImagesInZone(c2.id).map(img => (
            <DraggableImage key={img.id} image={img} />
          ))}
        </DropZone>
      </div>

      {/* Center Overlap */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <DropZone
          id={overlapId}
          label="Both"
          color="rgba(200, 150, 255, 0.6)"
          className="w-32 h-40 md:w-36 md:h-48"
          style={{ borderRadius: '50%' }}
        >
          {getImagesInZone(overlapId).map(img => (
            <DraggableImage key={img.id} image={img} />
          ))}
        </DropZone>
      </div>
    </div>
  );
}

function ThreeCircles({ circles, getImagesInZone }: { circles: Circle[]; getImagesInZone: (id: string) => ImageType[] }) {
  const [c1, c2, c3] = circles;
  const overlap12 = `overlap-${c1.id}-${c2.id}`;
  const overlap23 = `overlap-${c2.id}-${c3.id}`;
  const overlap13 = `overlap-${c1.id}-${c3.id}`;
  const centerId = `center-${c1.id}-${c2.id}-${c3.id}`;

  return (
    <div className="relative h-full">
      {/* Top Circle */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0">
        <DropZone
          id={c1.id}
          label={c1.label}
          color={c1.color}
          className="w-56 h-56 md:w-64 md:h-64 rounded-full"
        >
          {getImagesInZone(c1.id).map(img => (
            <DraggableImage key={img.id} image={img} />
          ))}
        </DropZone>
      </div>

      {/* Bottom Left Circle */}
      <div className="absolute left-[5%] md:left-[15%] bottom-0">
        <DropZone
          id={c2.id}
          label={c2.label}
          color={c2.color}
          className="w-56 h-56 md:w-64 md:h-64 rounded-full"
        >
          {getImagesInZone(c2.id).map(img => (
            <DraggableImage key={img.id} image={img} />
          ))}
        </DropZone>
      </div>

      {/* Bottom Right Circle */}
      <div className="absolute right-[5%] md:right-[15%] bottom-0">
        <DropZone
          id={c3.id}
          label={c3.label}
          color={c3.color}
          className="w-56 h-56 md:w-64 md:h-64 rounded-full"
        >
          {getImagesInZone(c3.id).map(img => (
            <DraggableImage key={img.id} image={img} />
          ))}
        </DropZone>
      </div>

      {/* Overlap 1-2 (Top-Left) */}
      <div className="absolute left-[25%] top-[35%] z-10">
        <DropZone
          id={overlap12}
          label=""
          color="rgba(200, 150, 200, 0.5)"
          className="w-20 h-24 md:w-24 md:h-28"
          style={{ borderRadius: '50%' }}
        >
          {getImagesInZone(overlap12).map(img => (
            <DraggableImage key={img.id} image={img} />
          ))}
        </DropZone>
      </div>

      {/* Overlap 1-3 (Top-Right) */}
      <div className="absolute right-[25%] top-[35%] z-10">
        <DropZone
          id={overlap13}
          label=""
          color="rgba(200, 200, 150, 0.5)"
          className="w-20 h-24 md:w-24 md:h-28"
          style={{ borderRadius: '50%' }}
        >
          {getImagesInZone(overlap13).map(img => (
            <DraggableImage key={img.id} image={img} />
          ))}
        </DropZone>
      </div>

      {/* Overlap 2-3 (Bottom) */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[15%] z-10">
        <DropZone
          id={overlap23}
          label=""
          color="rgba(150, 200, 200, 0.5)"
          className="w-20 h-24 md:w-24 md:h-28"
          style={{ borderRadius: '50%' }}
        >
          {getImagesInZone(overlap23).map(img => (
            <DraggableImage key={img.id} image={img} />
          ))}
        </DropZone>
      </div>

      {/* Center (all three) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <DropZone
          id={centerId}
          label="All"
          color="rgba(255, 255, 255, 0.7)"
          className="w-16 h-16 md:w-20 md:h-20 rounded-full"
        >
          {getImagesInZone(centerId).map(img => (
            <DraggableImage key={img.id} image={img} />
          ))}
        </DropZone>
      </div>
    </div>
  );
}

function DropZone({ 
  id, 
  label, 
  color, 
  className, 
  style,
  children 
}: { 
  id: string; 
  label: string;
  color: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col items-center justify-center p-2 transition-all border-4 ${
        isOver ? 'scale-105 border-primary shadow-lg' : 'border-transparent'
      } ${className}`}
      style={{
        backgroundColor: color,
        backdropFilter: 'blur(4px)',
        ...style,
      }}
    >
      {label && (
        <span className="font-bold text-xs md:text-sm text-foreground/80 mb-1 text-center drop-shadow-md">
          {label}
        </span>
      )}
      <div className="flex flex-wrap gap-1 justify-center items-center">
        {children}
      </div>
    </div>
  );
}
