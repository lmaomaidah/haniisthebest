import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface ImageType {
  id: string;
  name: string;
  image_url: string | null;
}

interface DraggableImageProps {
  image: ImageType;
  small?: boolean;
}

export const DraggableImage = ({ image, small }: DraggableImageProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: image.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const sizeClass = small ? "w-12 h-12" : "w-24 h-24";
  const textSizeClass = small ? "text-[10px] min-w-[60px] max-w-[80px] px-2 py-1" : "text-sm min-w-[120px] max-w-[160px] px-4 py-3";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab hover:scale-110 transition-transform active:cursor-grabbing"
    >
      {image.image_url ? (
        <div className={`${sizeClass} rounded-xl overflow-hidden border-2 border-primary shadow-glow`}>
          <img
            src={image.image_url}
            alt={image.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="relative">
          {/* Speech bubble cloud */}
          <div className={`bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl ${textSizeClass} border-2 border-primary shadow-glow`}>
            <p className="font-bold text-primary-foreground text-center break-words leading-tight">
              {image.name}
            </p>
          </div>
          {/* Bubble tail */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary" />
          </div>
        </div>
      )}
    </div>
  );
};
