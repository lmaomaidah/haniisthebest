import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Tag, Pencil, Trash2, Check } from "lucide-react";
import type { Category } from "@/hooks/useCategories";

interface CategoryFilterProps {
  categories: Category[];
  selected: string[];
  onChange: (ids: string[]) => void;
  /** If true, shows a "create new" input */
  allowCreate?: boolean;
  onCreateCategory?: (name: string) => Promise<any>;
  /** If true, shows edit/delete controls on categories */
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
    } catch {
      // handled upstream
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDeleteCategory) return;
    try {
      await onDeleteCategory(id);
      // Remove from selected if it was selected
      if (selected.includes(id)) {
        onChange(selected.filter((s) => s !== id));
      }
    } catch {
      // handled upstream
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filter by category:</span>

        <Badge
          variant={selected.length === 0 ? "default" : "outline"}
          className="cursor-pointer text-xs"
          onClick={() => onChange([])}
        >
          All
        </Badge>

        {categories.map((cat) => (
          <div key={cat.id} className="inline-flex items-center gap-0.5">
            {editingId === cat.id ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-6 w-24 text-xs px-1"
                  onKeyDown={(e) => e.key === "Enter" && handleRename(cat.id)}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleRename(cat.id)}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => { setEditingId(null); setEditName(""); }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <Badge
                  variant={selected.includes(cat.id) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggle(cat.id)}
                >
                  {cat.name}
                  {selected.includes(cat.id) && <X className="ml-1 h-3 w-3" />}
                </Badge>
                {allowEdit && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => startEdit(cat)}
                    >
                      <Pencil className="h-2.5 w-2.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        ))}

        {allowCreate && !showCreate && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-3 w-3 mr-1" /> New
          </Button>
        )}
      </div>

      {allowCreate && showCreate && (
        <div className="flex gap-2 max-w-xs">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name…"
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button size="sm" className="h-8" onClick={handleCreate} disabled={creating}>
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={() => {
              setShowCreate(false);
              setNewName("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
