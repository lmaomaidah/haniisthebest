import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FolderPlus, Check } from "lucide-react";
import { getCategoryColor, getCategoryBadgeStyle } from "@/lib/categoryColors";
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
    <div className="bg-card/60 backdrop-blur-sm border-2 border-accent/30 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-accent/20">
          <FolderPlus className="h-4 w-4 text-accent" />
        </div>
        <p className="text-base font-bold text-foreground font-['Schoolbell']">
          Which category should OC go to? 🏷️
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = selected.includes(cat.id);
            const color = getCategoryColor(cat.id);
            const style = getCategoryBadgeStyle(cat.id, isSelected);

            return (
              <button
                key={cat.id}
                onClick={() => toggle(cat.id)}
                className={`
                  inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold
                  border transition-all duration-200 cursor-pointer
                  ${isSelected ? "shadow-md scale-105 ring-1" : "hover:scale-102 hover:shadow-sm"}
                `}
                style={{
                  ...style,
                  ...(isSelected ? { ringColor: color.dot } : {}),
                }}
              >
                {isSelected ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color.dot }}
                  />
                )}
                {cat.name}
              </button>
            );
          })}
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
            className="h-9 text-sm border-2 border-accent/40 rounded-full px-3 focus:border-accent"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <Button size="sm" className="h-9 rounded-full px-4" onClick={handleCreate} disabled={creating}>
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-9 rounded-full"
            onClick={() => { setShowCreate(false); setNewName(""); }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-dashed border-accent/50 hover:bg-accent/10 rounded-full"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-3 w-3 mr-1" /> Create new category
        </Button>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-xs text-muted-foreground">Selected:</span>
          {selected.map(id => {
            const cat = categories.find(c => c.id === id);
            if (!cat) return null;
            const color = getCategoryColor(id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 text-xs font-medium"
                style={{ color: color.text }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color.dot }} />
                {cat.name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
