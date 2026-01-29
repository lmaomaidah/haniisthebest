import { useDroppable } from "@dnd-kit/core";
import { DraggableImage } from "./DraggableImage";

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
          images.map(image => (
            <DraggableImage key={image.id} image={image} />
          ))
        )}
      </div>
    </div>
  );
};
