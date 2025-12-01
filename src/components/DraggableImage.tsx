import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface ImageType {
  id: string;
  name: string;
  image_url: string | null;
}

interface DraggableImageProps {
  image: ImageType;
}

export const DraggableImage = ({ image }: DraggableImageProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: image.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab hover:scale-110 transition-transform active:cursor-grabbing"
    >
      {image.image_url ? (
        <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-primary shadow-glow">
          <img
            src={image.image_url}
            alt={image.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="relative">
          {/* Speech bubble cloud */}
          <div className="bg-gradient-to-br from-primary via-secondary to-accent rounded-[2rem] px-4 py-3 border-4 border-primary shadow-glow min-w-[120px] max-w-[160px]">
            <p className="text-sm font-bold text-primary-foreground text-center break-words leading-tight">
              {image.name}
            </p>
          </div>
          {/* Bubble tail */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-primary" />
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-accent absolute top-0 left-1/2 transform -translate-x-1/2" />
          </div>
        </div>
      )}
    </div>
  );
};
