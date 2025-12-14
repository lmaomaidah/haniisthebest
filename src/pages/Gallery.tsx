import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Trash2, Home, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";

interface ImageType {
  id: string;
  name: string;
  image_url: string | null;
  created_at: string;
}

const Gallery = () => {
  const [images, setImages] = useState<ImageType[]>([]);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { logActivity } = useAuth();

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

  const handleFileUpload = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your classmate!",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      let publicUrl = null;

      if (file) {
        // Validate file type
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: "Only PNG, JPG, and WebP are allowed!",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }

        // Upload to storage
        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('classmate-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl: url } } = supabase.storage
          .from('classmate-images')
          .getPublicUrl(fileName);

        publicUrl = url;
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('images')
        .insert({
          name: name.trim(),
          image_url: publicUrl,
        });

      if (dbError) throw dbError;

      await logActivity('image_upload', { name: name.trim(), hasImage: !!file });

      toast({
        title: file ? "✨ Upload successful!" : "✨ Classmate added!",
        description: file ? "Your classmate pic is now in the chaos zone! 🎉" : "Name added to the roster! 🎉",
      });

      setName("");
      setFile(null);
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

  const handleDelete = async (id: string, imageUrl: string | null) => {
    try {
      // Extract file name from URL and delete from storage if exists
      if (imageUrl) {
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
          await supabase.storage.from('classmate-images').remove([fileName]);
        }
      }

      // Delete from database
      const { error } = await supabase.from('images').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: "💥 Deleted!",
        description: "Removed from the chaos! 🗑️",
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
      {/* Top Bar */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserMenu />
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-gradient animate-bounce-in drop-shadow-[0_0_30px_rgba(255,100,150,0.5)]">
            📸 Classmate Gallery
          </h1>
          <Link to="/">
            <Button variant="outline" size="lg" className="border-4 border-primary rounded-2xl bg-card/80 dark:bg-card/60 backdrop-blur-sm dark:shadow-[0_0_15px_rgba(255,100,150,0.3)]">
              <Home className="mr-2" />
              Home
            </Button>
          </Link>
        </div>

        {/* Upload Section */}
        <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-4 border-secondary rounded-3xl p-8 mb-8 shadow-bounce dark:shadow-[0_0_25px_rgba(100,200,255,0.3)]">
          <h2 className="text-3xl font-bold mb-6 text-center text-foreground drop-shadow-[0_0_10px_rgba(100,200,255,0.4)]">📸 Add Classmates</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Name your classmate..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-4 border-accent rounded-2xl text-lg p-4 bg-background/80 dark:bg-background/50"
            />
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={uploading}
              className="border-4 border-accent rounded-2xl text-lg p-4 bg-background/80 dark:bg-background/50"
            />
            <Button
              onClick={handleFileUpload}
              disabled={uploading || !name.trim()}
              className="w-full gradient-pink-blue text-white text-xl px-8 py-6 rounded-2xl shadow-glow dark:shadow-[0_0_25px_rgba(255,100,150,0.5)]"
            >
              <Upload className="mr-2" />
              {uploading ? "Adding... ✨" : file ? "Upload with Photo 🚀" : "Add Name Only ✍️"}
            </Button>
          </div>
          <p className="text-center mt-4 text-muted-foreground dark:text-foreground/70 text-lg">
            Name is required! Photo is optional - just type a name if you prefer! 🎨
          </p>
        </div>

        {/* Gallery Grid */}
        {images.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="h-24 w-24 mx-auto mb-4 text-primary animate-spin-slow drop-shadow-[0_0_20px_rgba(255,100,150,0.8)]" />
            <p className="text-3xl font-bold text-muted-foreground dark:text-foreground/70">
              No classmates yet! Upload some pics to get started! 📸
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-4 border-primary rounded-3xl overflow-hidden shadow-bounce hover:scale-105 transition-transform animate-bounce-in dark:shadow-[0_0_20px_rgba(255,100,150,0.3)]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-square relative">
                  {image.image_url ? (
                    <img
                      src={image.image_url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-6xl font-bold text-primary-foreground drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                        {image.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <p className="font-bold text-lg truncate text-foreground">{image.name}</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(image.id, image.image_url)}
                    className="w-full rounded-xl dark:shadow-[0_0_15px_rgba(255,100,100,0.4)]"
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
