import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ImageType {
  id: string;
  name: string;
  image_url: string | null;
}

interface TierRowProps {
  tier: string;
  color: string;
  images: ImageType[];
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
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-4 border-primary shadow-bounce cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
    >
      {image.image_url ? (
        <img
          src={image.image_url}
          alt={image.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-card flex items-center justify-center p-1">
          <p className="text-xs font-bold text-foreground text-center break-words leading-tight">
            {image.name}
          </p>
        </div>
      )}
    </div>
  );
}

export const TierRow = ({ tier, color, images }: TierRowProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: tier,
  });

  return (
    <div className={`flex border-4 rounded-3xl overflow-hidden shadow-bounce ${isOver ? 'scale-105' : ''} transition-transform`}>
      <div className={`${color} text-white font-bold text-5xl w-24 flex items-center justify-center border-r-4 border-foreground`}>
        {tier}
      </div>
      <div
        ref={setNodeRef}
        className="flex-1 bg-card p-4 min-h-32 flex flex-wrap gap-4 items-center"
      >
        {images.length === 0 ? (
          <p className="text-muted-foreground text-xl italic w-full text-center">
            Drop classmates here! 👇
          </p>
        ) : (
          <SortableContext items={images.map(i => i.id)} strategy={rectSortingStrategy}>
            {images.map(image => (
              <SortableImage key={image.id} image={image} />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
};
