import { Badge } from "@/components/ui/badge";
import type { Category } from "@/hooks/useCategories";

interface CategoryPickerProps {
  categories: Category[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function CategoryPicker({ categories, selected, onChange }: CategoryPickerProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  if (categories.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Categories (optional)</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={selected.includes(cat.id) ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => toggle(cat.id)}
          >
            {cat.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
