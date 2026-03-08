import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Tag } from "lucide-react";
import type { Category } from "@/hooks/useCategories";

interface CategoryFilterProps {
  categories: Category[];
  selected: string[];
  onChange: (ids: string[]) => void;
  /** If true, shows a "create new" input */
  allowCreate?: boolean;
  onCreateCategory?: (name: string) => Promise<void>;
}

export function CategoryFilter({
  categories,
  selected,
  onChange,
  allowCreate = false,
  onCreateCategory,
}: CategoryFilterProps) {
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
      await onCreateCategory(newName.trim());
      setNewName("");
      setShowCreate(false);
    } catch {
      // handled upstream
    } finally {
      setCreating(false);
    }
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
          <Badge
            key={cat.id}
            variant={selected.includes(cat.id) ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => toggle(cat.id)}
          >
            {cat.name}
            {selected.includes(cat.id) && <X className="ml-1 h-3 w-3" />}
          </Badge>
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
