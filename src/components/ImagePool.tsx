import { useDroppable } from "@dnd-kit/core";
import { DraggableImage } from "./DraggableImage";

interface ImageType {
  id: string;
  name: string;
  image_url: string;
}

interface ImagePoolProps {
  images: ImageType[];
}

export const ImagePool = ({ images }: ImagePoolProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'pool',
  });

  return (
    <div className={`bg-card border-4 border-dashed border-muted-foreground rounded-3xl p-6 shadow-bounce ${isOver ? 'scale-105' : ''} transition-transform`}>
      <h3 className="text-2xl font-bold mb-4 text-center">🎯 Drag Classmates from Here!</h3>
      <div
        ref={setNodeRef}
        className="flex flex-wrap gap-4 min-h-32 items-center justify-center"
      >
        {images.length === 0 ? (
          <p className="text-muted-foreground text-xl italic text-center w-full">
            All classmates have been sorted! 🎉
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
