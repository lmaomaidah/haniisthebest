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

interface Column {
  id: string;
  label: string;
}

interface Placements {
  [imageId: string]: string; // columnId
}

export default function Classifications() {
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageType[]>([]);
  const [columns, setColumns] = useState<Column[]>([
    { id: 'col-1', label: 'Category 1' },
    { id: 'col-2', label: 'Category 2' },
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
      if (data.circles) setColumns(data.circles as unknown as Column[]);
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
            circles: columns as any,
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
            circles: columns as any,
            placements: placements as any,
          });

        if (error) throw error;
      }

      toast.success("💾 Classifications saved!");
    } catch (error) {
      console.error('Error saving:', error);
      toast.error("Failed to save classifications");
    }
  };

  const exportClassifications = async () => {
    const element = document.getElementById('classifications-board');
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

  const addColumn = () => {
    if (!newLabel.trim()) {
      toast.error("Please enter a label");
      return;
    }

    const newColumn: Column = {
      id: `col-${Date.now()}`,
      label: newLabel,
    };

    setColumns([...columns, newColumn]);
    setNewLabel("");
    toast.success(`✨ Added ${newLabel}!`);
  };

  const removeColumn = (id: string) => {
    setColumns(columns.filter(c => c.id !== id));
    // Remove placements for this column
    setPlacements(prev => {
      const newPlacements = { ...prev };
      Object.keys(newPlacements).forEach(key => {
        if (newPlacements[key] === id) {
          delete newPlacements[key];
        }
      });
      return newPlacements;
    });
    toast.success("🗑️ Column removed!");
  };

  const updateColumnLabel = (id: string, label: string) => {
    setColumns(columns.map(c => c.id === id ? { ...c, label } : c));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      // Remove from classification
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

  const getImagesInColumn = (columnId: string) => {
    return images.filter(img => placements[img.id] === columnId);
  };

  const getUnplacedImages = () => {
    return images.filter(img => !placements[img.id]);
  };

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
          📊 Classmate Classifications 📊
        </h1>

        {/* Add Column Section */}
        <div className="bg-card rounded-3xl p-6 border-4 border-primary shadow-bounce mb-6">
          <h3 className="text-xl font-bold mb-4">➕ Add New Category</h3>
          <div className="flex gap-2 flex-wrap">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Category name..."
              className="border-2 border-primary max-w-xs"
              onKeyDown={(e) => e.key === 'Enter' && addColumn()}
            />
            <Button onClick={addColumn} className="gap-2">
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </div>
        </div>

        {/* Unplaced Images */}
        <div className="bg-card rounded-3xl p-6 border-4 border-secondary shadow-bounce mb-6">
          <h3 className="text-2xl font-bold mb-4">🎯 Available Classmates</h3>
          <p className="text-muted-foreground mb-4 text-sm">Drag classmates into categories below</p>
          <DndContext onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
            <div className="flex flex-wrap gap-4 min-h-[80px]">
              {getUnplacedImages().map(img => (
                <DraggableImage key={img.id} image={img} />
              ))}
              {getUnplacedImages().length === 0 && (
                <p className="text-muted-foreground italic">All classmates categorized! 🎉</p>
              )}
            </div>

            {/* Classification Columns */}
            <div id="classifications-board" className="grid gap-4 mt-6" style={{ gridTemplateColumns: `repeat(${Math.min(columns.length, 4)}, minmax(200px, 1fr))` }}>
              {columns.map(column => (
                <DropColumn
                  key={column.id}
                  column={column}
                  onLabelChange={updateColumnLabel}
                  onRemove={removeColumn}
                >
                  {getImagesInColumn(column.id).map(img => (
                    <DraggableImage key={img.id} image={img} />
                  ))}
                </DropColumn>
              ))}
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

function DropColumn({ 
  column, 
  onLabelChange, 
  onRemove, 
  children 
}: { 
  column: Column; 
  onLabelChange: (id: string, label: string) => void;
  onRemove: (id: string) => void;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border-4 p-4 transition-all min-h-[200px] ${
        isOver ? 'bg-primary/20 scale-[1.02] border-primary shadow-lg' : 'bg-muted/30 border-muted-foreground/30'
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Input
          value={column.label}
          onChange={(e) => onLabelChange(column.id, e.target.value)}
          className="font-bold text-center border-2 border-primary/50 bg-transparent"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(column.id)}
          className="text-destructive hover:bg-destructive/20 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {children}
      </div>
    </div>
  );
}
