import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Pencil, Check } from "lucide-react";

interface ImageType {
  id: string;
  name: string;
  image_url: string | null;
}

interface TierRowProps {
  tier: string;
  color: string;
  label: string;
  images: ImageType[];
  onRenameLabel?: (newLabel: string) => void;
}

function SortableImage({ image }: { image: ImageType }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group/img relative w-[72px] h-[72px] md:w-[88px] md:h-[88px] rounded-xl overflow-hidden border-2 border-foreground/20 shadow-md cursor-grab active:cursor-grabbing hover:scale-110 hover:border-primary hover:shadow-lg transition-all duration-200"
    >
      {image.image_url ? (
        <img
          src={image.image_url}
          alt={image.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center p-1">
          <p className="text-[10px] font-bold text-foreground text-center break-words leading-tight">
            {image.name}
          </p>
        </div>
      )}
      {/* Hover name tooltip */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1 py-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
        <p className="text-[9px] text-white text-center truncate font-medium">{image.name}</p>
      </div>
    </div>
  );
}

export const TierRow = ({ tier, color, label, images, onRenameLabel }: TierRowProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: tier });
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);

  const handleSave = () => {
    if (editValue.trim() && onRenameLabel) {
      onRenameLabel(editValue.trim());
    }
    setEditing(false);
  };

  return (
    <div
      className={`flex border-2 rounded-2xl overflow-hidden transition-all duration-200 ${
        isOver
          ? "scale-[1.02] shadow-lg ring-2 ring-primary/50"
          : "shadow-md hover:shadow-lg"
      }`}
    >
      {/* Tier label */}
      <div
        className={`${color} relative w-20 md:w-24 flex flex-col items-center justify-center gap-1 border-r-2 border-foreground/20 group/label cursor-pointer`}
        onClick={() => onRenameLabel && !editing && setEditing(true)}
      >
        {editing ? (
          <div className="flex flex-col items-center gap-1 px-1">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value.slice(0, 12))}
              className="h-7 w-16 text-center text-sm font-bold bg-white/20 border-white/40 text-white rounded-lg px-1"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
              onBlur={handleSave}
            />
          </div>
        ) : (
          <>
            <span className="text-3xl md:text-4xl font-black text-white drop-shadow-md tracking-tight">
              {label}
            </span>
            {onRenameLabel && (
              <Pencil className="h-3 w-3 text-white/50 opacity-0 group-hover/label:opacity-100 transition-opacity" />
            )}
          </>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 min-h-[88px] md:min-h-[104px] flex flex-wrap gap-2.5 items-center transition-colors ${
          isOver ? "bg-primary/10" : "bg-card/80 dark:bg-card/60"
        }`}
      >
        {images.length === 0 ? (
          <p className="text-muted-foreground/60 text-sm italic w-full text-center">
            Drop here ✦
          </p>
        ) : (
          <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
            {images.map((image) => (
              <SortableImage key={image.id} image={image} />
            ))}
          </SortableContext>
        )}
      </div>

      {/* Count badge */}
      {images.length > 0 && (
        <div className="flex items-center justify-center px-3 bg-card/60 border-l border-border/30">
          <span className="text-xs font-bold text-muted-foreground tabular-nums">
            {images.length}
          </span>
        </div>
      )}
    </div>
  );
};
