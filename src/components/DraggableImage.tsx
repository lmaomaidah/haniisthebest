import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface ImageType {
  id: string;
  name: string;
  image_url: string;
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
      className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-primary shadow-glow cursor-grab hover:scale-110 transition-transform active:cursor-grabbing"
    >
      <img
        src={image.image_url}
        alt={image.name}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
