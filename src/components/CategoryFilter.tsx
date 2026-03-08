import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Tag, Pencil, Trash2, Check, Sparkles } from "lucide-react";
import { getCategoryColor, getCategoryBadgeStyle } from "@/lib/categoryColors";
import type { Category } from "@/hooks/useCategories";

interface CategoryFilterProps {
  categories: Category[];
  selected: string[];
  onChange: (ids: string[]) => void;
  allowCreate?: boolean;
  onCreateCategory?: (name: string) => Promise<any>;
  allowEdit?: boolean;
  onRenameCategory?: (id: string, newName: string) => Promise<void>;
  onDeleteCategory?: (id: string) => Promise<void>;
}

export function CategoryFilter({
  categories,
  selected,
  onChange,
  allowCreate = false,
  onCreateCategory,
  allowEdit = false,
  onRenameCategory,
  onDeleteCategory,
}: CategoryFilterProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

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
      await onCreateCategory(newName.trim());
      setNewName("");
      setShowCreate(false);
    } catch {
      // handled upstream
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (id: string) => {
    if (!editName.trim() || !onRenameCategory) return;
    try {
      await onRenameCategory(id, editName.trim());
      setEditingId(null);
      setEditName("");
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!onDeleteCategory) return;
    try {
      await onDeleteCategory(id);
      if (selected.includes(id)) {
        onChange(selected.filter((s) => s !== id));
      }
    } catch {}
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-accent/20">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <span className="text-sm font-bold text-foreground font-['Schoolbell']">Categories</span>
        {selected.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {/* All pill */}
        <button
          onClick={() => onChange([])}
          className={`
            inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold
            border transition-all duration-200 cursor-pointer
            ${selected.length === 0
              ? "bg-foreground/90 text-background border-foreground/80 shadow-md scale-105"
              : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
            }
          `}
        >
          <Tag className="h-3 w-3" />
          All
        </button>

        {categories.map((cat) => {
          const isSelected = selected.includes(cat.id);
          const color = getCategoryColor(cat.id);
          const style = getCategoryBadgeStyle(cat.id, isSelected);

          return (
            <div key={cat.id} className="inline-flex items-center gap-0.5 group">
              {editingId === cat.id ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-7 w-28 text-xs px-2 rounded-full border-2"
                    style={{ borderColor: color.dot }}
                    onKeyDown={(e) => e.key === "Enter" && handleRename(cat.id)}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={() => handleRename(cat.id)}
                  >
                    <Check className="h-3 w-3 text-lime-green" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={() => { setEditingId(null); setEditName(""); }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => toggle(cat.id)}
                    className={`
                      inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold
                      border transition-all duration-200 cursor-pointer
                      ${isSelected ? "shadow-md scale-105 ring-1" : "hover:scale-102 hover:shadow-sm"}
                    `}
                    style={{
                      ...style,
                      ...(isSelected ? { ringColor: color.dot } : {}),
                    }}
                  >
                    {/* Color dot */}
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color.dot }}
                    />
                    {cat.name}
                    {isSelected && <X className="h-3 w-3 ml-0.5 opacity-70" />}
                  </button>

                  {/* Edit controls - show on hover */}
                  {allowEdit && (
                    <div className="hidden group-hover:flex items-center gap-0.5 ml-0.5">
                      <button
                        className="h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        onClick={() => startEdit(cat)}
                      >
                        <Pencil className="h-2.5 w-2.5" />
                      </button>
                      <button
                        className="h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => handleDelete(cat.id)}
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* Create button */}
        {allowCreate && !showCreate && (
          <button
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium
              border border-dashed border-muted-foreground/40 text-muted-foreground
              hover:border-accent hover:text-accent hover:bg-accent/10 transition-all duration-200"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-3 w-3" /> New
          </button>
        )}
      </div>

      {/* Create form */}
      {allowCreate && showCreate && (
        <div className="flex gap-2 max-w-xs">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name…"
            className="h-8 text-sm rounded-full px-3 border-2 border-accent/40 focus:border-accent"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <Button size="sm" className="h-8 rounded-full px-4" onClick={handleCreate} disabled={creating}>
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 rounded-full"
            onClick={() => { setShowCreate(false); setNewName(""); }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
