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
  [imageId: string]: string;
}

const CIRCLE_COLORS = [
  "rgba(255, 100, 150, 0.45)",
  "rgba(100, 200, 255, 0.45)",
  "rgba(150, 255, 100, 0.45)",
  "rgba(255, 200, 100, 0.45)",
  "rgba(200, 100, 255, 0.45)",
  "rgba(255, 150, 200, 0.45)",
  "rgba(100, 255, 200, 0.45)",
  "rgba(200, 255, 100, 0.45)",
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

  // Calculate dynamic circle size based on max content
  const getCircleSize = () => {
    let maxInAnyZone = 0;
    circles.forEach(c => {
      maxInAnyZone = Math.max(maxInAnyZone, getImagesInZone(c.id).length);
    });
    // Base size + aggressive growth per item
    const baseSize = 220;
    const growth = Math.max(0, maxInAnyZone - 1) * 50;
    return Math.min(600, baseSize + growth);
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
          <h3 className="text-xl font-bold mb-4">➕ Add Circle</h3>
          <div className="flex gap-2 flex-wrap items-center">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Circle label..."
              className="border-2 border-primary max-w-xs"
              onKeyDown={(e) => e.key === 'Enter' && addCircle()}
            />
            <Button onClick={addCircle} className="gap-2">
              <Plus className="w-4 h-4" /> Add Circle
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
            <div id="venn-board" className="relative mt-8 mx-auto overflow-visible">
              <VennDiagram
                circles={circles}
                getImagesInZone={getImagesInZone}
                circleSize={getCircleSize()}
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
  getImagesInZone,
  circleSize
}: { 
  circles: Circle[];
  getImagesInZone: (zoneId: string) => ImageType[];
  circleSize: number;
}) {
  if (circles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Add circles to start creating your Venn diagram
      </div>
    );
  }

  if (circles.length === 1) {
    return <SingleCircle circle={circles[0]} getImagesInZone={getImagesInZone} size={circleSize} />;
  }

  if (circles.length === 2) {
    return <TwoCircles circles={circles} getImagesInZone={getImagesInZone} size={circleSize} />;
  }

  if (circles.length === 3) {
    return <ThreeCircles circles={circles} getImagesInZone={getImagesInZone} size={circleSize} />;
  }

  // 4+ circles: linear overlapping arrangement
  return <ManyCircles circles={circles} getImagesInZone={getImagesInZone} size={circleSize} />;
}

function SingleCircle({ circle, getImagesInZone, size }: { circle: Circle; getImagesInZone: (id: string) => ImageType[]; size: number }) {
  const images = getImagesInZone(circle.id);
  const dynamicSize = Math.max(size, 180 + images.length * 35);
  
  return (
    <div className="flex items-center justify-center py-8">
      <DropZone
        id={circle.id}
        label={circle.label}
        color={circle.color}
        size={dynamicSize}
      >
        {images.map(img => (
          <DraggableImage key={img.id} image={img} small />
        ))}
      </DropZone>
    </div>
  );
}

function TwoCircles({ circles, getImagesInZone, size }: { circles: Circle[]; getImagesInZone: (id: string) => ImageType[]; size: number }) {
  const [c1, c2] = circles;
  const overlapId = `overlap-${c1.id}-${c2.id}`;
  
  const c1Images = getImagesInZone(c1.id);
  const c2Images = getImagesInZone(c2.id);
  const overlapImages = getImagesInZone(overlapId);
  
  const c1Size = Math.max(size, 180 + c1Images.length * 35);
  const c2Size = Math.max(size, 180 + c2Images.length * 35);
  const maxSize = Math.max(c1Size, c2Size);
  const overlapSize = Math.max(maxSize * 0.45, 120 + overlapImages.length * 35);
  const overlap = maxSize * 0.35;

  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative flex items-center" style={{ gap: `-${overlap}px` }}>
        <DropZone id={c1.id} label={c1.label} color={c1.color} size={c1Size}>
          {c1Images.map(img => (
            <DraggableImage key={img.id} image={img} small />
          ))}
        </DropZone>
        
        {/* Overlap zone */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <DropZone
            id={overlapId}
            label="Both"
            color="rgba(220, 180, 255, 0.6)"
            size={overlapSize}
            isOverlap
          >
            {overlapImages.map(img => (
              <DraggableImage key={img.id} image={img} small />
            ))}
          </DropZone>
        </div>
        
        <DropZone id={c2.id} label={c2.label} color={c2.color} size={c2Size}>
          {c2Images.map(img => (
            <DraggableImage key={img.id} image={img} small />
          ))}
        </DropZone>
      </div>
    </div>
  );
}

function ThreeCircles({ circles, getImagesInZone, size }: { circles: Circle[]; getImagesInZone: (id: string) => ImageType[]; size: number }) {
  const [c1, c2, c3] = circles;
  const overlap12 = `overlap-${c1.id}-${c2.id}`;
  const overlap23 = `overlap-${c2.id}-${c3.id}`;
  const overlap13 = `overlap-${c1.id}-${c3.id}`;
  const centerId = `center-${c1.id}-${c2.id}-${c3.id}`;
  
  // Dynamic sizes based on content
  const c1Images = getImagesInZone(c1.id);
  const c2Images = getImagesInZone(c2.id);
  const c3Images = getImagesInZone(c3.id);
  const maxImages = Math.max(c1Images.length, c2Images.length, c3Images.length);
  const dynamicSize = Math.max(size, 200 + maxImages * 40);
  
  const overlapSize = Math.max(dynamicSize * 0.4, 100 + Math.max(
    getImagesInZone(overlap12).length,
    getImagesInZone(overlap13).length,
    getImagesInZone(overlap23).length
  ) * 30);
  const centerSize = Math.max(dynamicSize * 0.35, 90 + getImagesInZone(centerId).length * 30);
  const containerHeight = dynamicSize * 1.6;

  return (
    <div className="relative mx-auto py-8" style={{ height: containerHeight, width: dynamicSize * 2.2 }}>
      {/* Top Circle */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0">
        <DropZone id={c1.id} label={c1.label} color={c1.color} size={dynamicSize}>
          {c1Images.map(img => (
            <DraggableImage key={img.id} image={img} small />
          ))}
        </DropZone>
      </div>

      {/* Bottom Left Circle */}
      <div className="absolute left-0" style={{ top: dynamicSize * 0.55 }}>
        <DropZone id={c2.id} label={c2.label} color={c2.color} size={dynamicSize}>
          {c2Images.map(img => (
            <DraggableImage key={img.id} image={img} small />
          ))}
        </DropZone>
      </div>

      {/* Bottom Right Circle */}
      <div className="absolute right-0" style={{ top: dynamicSize * 0.55 }}>
        <DropZone id={c3.id} label={c3.label} color={c3.color} size={dynamicSize}>
          {c3Images.map(img => (
            <DraggableImage key={img.id} image={img} small />
          ))}
        </DropZone>
      </div>

      {/* Overlap 1-2 */}
      <div className="absolute z-10" style={{ left: dynamicSize * 0.4, top: dynamicSize * 0.5 }}>
        <DropZone id={overlap12} label="" color="rgba(200, 150, 200, 0.6)" size={overlapSize} isOverlap>
          {getImagesInZone(overlap12).map(img => (
            <DraggableImage key={img.id} image={img} small />
          ))}
        </DropZone>
      </div>

      {/* Overlap 1-3 */}
      <div className="absolute z-10" style={{ right: dynamicSize * 0.4, top: dynamicSize * 0.5 }}>
        <DropZone id={overlap13} label="" color="rgba(200, 200, 150, 0.6)" size={overlapSize} isOverlap>
          {getImagesInZone(overlap13).map(img => (
            <DraggableImage key={img.id} image={img} small />
          ))}
        </DropZone>
      </div>

      {/* Overlap 2-3 */}
      <div className="absolute z-10 left-1/2 -translate-x-1/2" style={{ top: dynamicSize * 1.1 }}>
        <DropZone id={overlap23} label="" color="rgba(150, 200, 200, 0.6)" size={overlapSize} isOverlap>
          {getImagesInZone(overlap23).map(img => (
            <DraggableImage key={img.id} image={img} small />
          ))}
        </DropZone>
      </div>

      {/* Center (all three) */}
      <div className="absolute z-20 left-1/2 -translate-x-1/2" style={{ top: dynamicSize * 0.7 }}>
        <DropZone id={centerId} label="All" color="rgba(255, 255, 255, 0.7)" size={centerSize} isOverlap>
          {getImagesInZone(centerId).map(img => (
            <DraggableImage key={img.id} image={img} small />
          ))}
        </DropZone>
      </div>
    </div>
  );
}

function ManyCircles({ circles, getImagesInZone, size }: { circles: Circle[]; getImagesInZone: (id: string) => ImageType[]; size: number }) {
  // Calculate dynamic size based on max content in any circle
  const maxImages = Math.max(...circles.map(c => getImagesInZone(c.id).length));
  const dynamicSize = Math.max(size, 200 + maxImages * 40);
  
  const overlap = dynamicSize * 0.3;
  const spacing = dynamicSize - overlap;
  
  // Generate overlap zones between adjacent circles
  const overlaps: { id: string; index: number }[] = [];
  for (let i = 0; i < circles.length - 1; i++) {
    overlaps.push({
      id: `overlap-${circles[i].id}-${circles[i + 1].id}`,
      index: i,
    });
  }

  return (
    <div className="py-8 overflow-x-auto">
      <div className="relative flex items-center" style={{ width: spacing * circles.length + overlap }}>
        {circles.map((circle, idx) => (
          <div
            key={circle.id}
            className="absolute"
            style={{ left: idx * spacing }}
          >
            <DropZone id={circle.id} label={circle.label} color={circle.color} size={dynamicSize}>
              {getImagesInZone(circle.id).map(img => (
                <DraggableImage key={img.id} image={img} small />
              ))}
            </DropZone>
          </div>
        ))}
        
        {/* Overlap zones between adjacent circles */}
        {overlaps.map(({ id, index }) => {
          const overlapImages = getImagesInZone(id);
          const overlapSize = Math.max(dynamicSize * 0.45, 100 + overlapImages.length * 30);
          return (
            <div
              key={id}
              className="absolute z-10"
              style={{ 
                left: (index + 0.5) * spacing + dynamicSize / 2 - overlapSize / 2,
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              <DropZone 
                id={id} 
                label={`${circles[index].label.slice(0, 8)} + ${circles[index + 1].label.slice(0, 8)}`}
                color="rgba(220, 180, 255, 0.65)" 
                size={overlapSize}
                isOverlap
              >
                {overlapImages.map(img => (
                  <DraggableImage key={img.id} image={img} small />
                ))}
              </DropZone>
            </div>
          );
        })}
      </div>
      
      {/* Container height spacer */}
      <div style={{ height: dynamicSize + 40 }} />
    </div>
  );
}

function DropZone({ 
  id, 
  label, 
  color, 
  size,
  isOverlap,
  children 
}: { 
  id: string; 
  label: string;
  color: string;
  size: number;
  isOverlap?: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-full flex flex-col items-center justify-center p-3 transition-all border-4 ${
        isOver ? 'scale-105 border-primary shadow-xl ring-4 ring-primary/40' : 'border-foreground/20'
      } ${isOverlap ? 'border-dashed' : ''}`}
      style={{
        backgroundColor: color,
        backdropFilter: 'blur(4px)',
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
      }}
    >
      {label && (
        <span className="font-bold text-xs md:text-sm text-foreground/90 mb-1 text-center drop-shadow-md truncate max-w-[90%]">
          {label}
        </span>
      )}
      <div className="flex flex-wrap gap-1 justify-center items-center overflow-auto max-h-[85%] max-w-[90%]">
        {children}
      </div>
    </div>
  );
}
