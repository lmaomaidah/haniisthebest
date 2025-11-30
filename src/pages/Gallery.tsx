import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Home, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface ImageType {
  id: string;
  name: string;
  image_url: string;
  created_at: string;
}

const Gallery = () => {
  const [images, setImages] = useState<ImageType[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading images",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setImages(data || []);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: "Only PNG, JPG, and WebP are allowed!",
            variant: "destructive",
          });
          continue;
        }

        // Upload to storage
        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('classmate-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('classmate-images')
          .getPublicUrl(fileName);

        // Save to database
        const { error: dbError } = await supabase
          .from('images')
          .insert({
            name: file.name,
            image_url: publicUrl,
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "✨ Upload successful!",
        description: "Your classmate pics are now in the chaos zone! 🎉",
      });

      fetchImages();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    try {
      // Extract file name from URL
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('classmate-images').remove([fileName]);
      }

      // Delete from database
      const { error } = await supabase.from('images').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: "💥 Deleted!",
        description: "Pic removed from the chaos! 🗑️",
      });

      fetchImages();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-gradient animate-bounce-in">
            📸 Classmate Gallery
          </h1>
          <Link to="/">
            <Button variant="outline" size="lg" className="border-4 border-primary rounded-2xl">
              <Home className="mr-2" />
              Home
            </Button>
          </Link>
        </div>

        {/* Upload Section */}
        <div className="bg-card border-4 border-secondary rounded-3xl p-8 mb-8 shadow-bounce">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <Input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileUpload}
              disabled={uploading}
              className="border-4 border-accent rounded-2xl text-lg p-4"
            />
            <Button
              disabled={uploading}
              className="gradient-pink-blue text-white text-xl px-8 py-6 rounded-2xl shadow-glow"
            >
              <Upload className="mr-2" />
              {uploading ? "Uploading... ✨" : "Upload Pics! 🚀"}
            </Button>
          </div>
          <p className="text-center mt-4 text-muted-foreground text-lg">
            PNG, JPG, or WebP only! Upload as many as you want! 🎨
          </p>
        </div>

        {/* Gallery Grid */}
        {images.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="h-24 w-24 mx-auto mb-4 text-primary animate-spin-slow" />
            <p className="text-3xl font-bold text-muted-foreground">
              No classmates yet! Upload some pics to get started! 📸
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="bg-card border-4 border-primary rounded-3xl overflow-hidden shadow-bounce hover:scale-105 transition-transform animate-bounce-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-square relative">
                  <img
                    src={image.image_url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <p className="font-bold text-lg truncate">{image.name}</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(image.id, image.image_url)}
                    className="w-full rounded-xl"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
