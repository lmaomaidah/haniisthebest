import { useDroppable } from "@dnd-kit/core";
import { DraggableImage } from "./DraggableImage";

interface ImageType {
  id: string;
  name: string;
  image_url: string | null;
}

interface ImagePoolProps {
  images: ImageType[];
}

export const ImagePool = ({ images }: ImagePoolProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: "pool" });

  return (
    <div
      className={`bg-card/70 dark:bg-card/50 backdrop-blur-sm border-2 border-dashed rounded-2xl p-5 transition-all duration-200 ${
        isOver
          ? "border-primary bg-primary/5 scale-[1.01] shadow-lg"
          : "border-muted-foreground/30 hover:border-muted-foreground/50"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-foreground font-['Schoolbell']">
          🎯 Unranked Pool
        </h3>
        <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full tabular-nums">
          {images.length} left
        </span>
      </div>
      <div
        ref={setNodeRef}
        className="flex flex-wrap gap-2.5 min-h-[88px] items-center"
      >
        {images.length === 0 ? (
          <p className="text-muted-foreground/50 text-sm italic text-center w-full">
            All classmates ranked! 🎉
          </p>
        ) : (
          images.map((image) => <DraggableImage key={image.id} image={image} />)
        )}
      </div>
    </div>
  );
};
