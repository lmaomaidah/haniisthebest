import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FolderPlus } from "lucide-react";
import type { Category } from "@/hooks/useCategories";

interface CategoryPickerProps {
  categories: Category[];
  selected: string[];
  onChange: (ids: string[]) => void;
  onCreateCategory?: (name: string) => Promise<Category | null | undefined>;
}

export function CategoryPicker({ categories, selected, onChange, onCreateCategory }: CategoryPickerProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim() || !onCreateCategory) return;
    setCreating(true);
    try {
      const cat = await onCreateCategory(newName.trim());
      if (cat) {
        onChange([...selected, cat.id]);
      }
      setNewName("");
      setShowCreate(false);
    } catch {
      // handled upstream
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FolderPlus className="h-5 w-5 text-accent" />
        <p className="text-base font-bold text-foreground">Which category should OC go to? 🏷️</p>
      </div>

      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={selected.includes(cat.id) ? "default" : "outline"}
              className={`cursor-pointer text-sm px-3 py-1.5 transition-all ${
                selected.includes(cat.id)
                  ? "ring-2 ring-primary/50 scale-105"
                  : "hover:bg-accent/20"
              }`}
              onClick={() => toggle(cat.id)}
            >
              {cat.name}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">No categories yet — create one below!</p>
      )}

      {showCreate ? (
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name…"
            className="h-9 text-sm border-2 border-accent/40 rounded-xl"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <Button size="sm" className="h-9 rounded-xl" onClick={handleCreate} disabled={creating}>
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-9"
            onClick={() => { setShowCreate(false); setNewName(""); }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-dashed border-accent/50 hover:bg-accent/10"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-3 w-3 mr-1" /> Create new category
        </Button>
      )}

      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Selected: {selected.map(id => categories.find(c => c.id === id)?.name).filter(Boolean).join(", ")}
        </p>
      )}
    </div>
  );
}
