import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Trash2, Home, Sparkles, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CategoryPicker } from "@/components/CategoryPicker";
import { useCategories, setImageCategories, fetchAllImageCategories } from "@/hooks/useCategories";

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
  const [selectedUploadCategories, setSelectedUploadCategories] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [imageCategoryMap, setImageCategoryMap] = useState<Record<string, string[]>>({});
  const { toast } = useToast();
  const { logActivity, user } = useAuth();
  const { categories, createCategory } = useCategories();

  useEffect(() => {
    fetchImages();
    loadCategoryMap();
  }, []);

  const loadCategoryMap = async () => {
    const map = await fetchAllImageCategories();
    setImageCategoryMap(map);
  };

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from("images")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading images", description: error.message, variant: "destructive" });
    } else {
      const imagesWithSignedUrls = await Promise.all(
        (data || []).map(async (image) => {
          if (image.image_url) {
            const fileName = image.image_url.split("/").pop();
            if (fileName) {
              const { data: signedData } = await supabase.storage
                .from("classmate-images")
                .createSignedUrl(fileName, 3600);
              return { ...image, image_url: signedData?.signedUrl || null };
            }
          }
          return image;
        })
      );
      setImages(imagesWithSignedUrls);
    }
  };

  const handleFileUpload = async () => {
    if (!name.trim()) {
      toast({ title: "Name required", description: "Please enter a name for your classmate!", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      let publicUrl = null;

      if (file) {
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
          toast({ title: "Invalid file type", description: "Only PNG, JPG, and WebP are allowed!", variant: "destructive" });
          setUploading(false);
          return;
        }

        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("classmate-images").upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl: url } } = supabase.storage.from("classmate-images").getPublicUrl(fileName);
        publicUrl = url;
      }

      const { data: insertedImage, error: dbError } = await supabase
        .from("images")
        .insert({ name: name.trim(), image_url: publicUrl })
        .select()
        .single();

      if (dbError) throw dbError;

      // Assign categories
      if (selectedUploadCategories.length > 0 && insertedImage) {
        await setImageCategories(insertedImage.id, selectedUploadCategories);
      }

      await logActivity("image_upload", { name: name.trim(), hasImage: !!file, categories: selectedUploadCategories });

      toast({
        title: file ? "✨ Upload successful!" : "✨ Classmate added!",
        description: file ? "Your classmate pic is now in the chaos zone! 🎉" : "Name added to the roster! 🎉",
      });

      setName("");
      setFile(null);
      setSelectedUploadCategories([]);
      fetchImages();
      loadCategoryMap();
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string | null) => {
    try {
      if (imageUrl) {
        const fileName = imageUrl.split("/").pop();
        if (fileName) {
          await supabase.storage.from("classmate-images").remove([fileName]);
        }
      }
      const { error } = await supabase.from("images").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "💥 Deleted!", description: "Removed from the chaos! 🗑️" });
      fetchImages();
    } catch (error: any) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateCategory = async (catName: string) => {
    if (!user) return;
    try {
      await createCategory(catName, user.id);
      toast({ title: "Category created! 🏷️" });
    } catch (err: any) {
      toast({ title: "Couldn't create category", description: err.message, variant: "destructive" });
    }
  };

  const filteredImages = filterCategories.length === 0
    ? images
    : images.filter((img) => {
        const imgCats = imageCategoryMap[img.id] || [];
        return filterCategories.some((fc) => imgCats.includes(fc));
      });

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <WhimsicalBackground />
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserMenu />
        <ThemeToggle />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-gradient animate-bounce-in drop-shadow-[0_0_30px_rgba(255,100,150,0.5)]">
            📸 Classmate Gallery
          </h1>
          <Link to="/">
            <Button variant="outline" size="lg" className="border-4 border-primary rounded-2xl bg-card/80 dark:bg-card/60 backdrop-blur-sm">
              <Home className="mr-2" /> Home
            </Button>
          </Link>
        </div>

        {/* Upload Section */}
        <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-4 border-secondary rounded-3xl p-8 mb-8 shadow-bounce">
          <h2 className="text-3xl font-bold mb-6 text-center text-foreground">📸 Add Classmates</h2>
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
            <CategoryPicker
              categories={categories}
              selected={selectedUploadCategories}
              onChange={setSelectedUploadCategories}
            />
            <Button
              onClick={handleFileUpload}
              disabled={uploading || !name.trim()}
              className="w-full gradient-pink-blue text-white text-xl px-8 py-6 rounded-2xl shadow-glow"
            >
              <Upload className="mr-2" />
              {uploading ? "Adding... ✨" : file ? "Upload with Photo 🚀" : "Add Name Only ✍️"}
            </Button>
          </div>
          <p className="text-center mt-4 text-muted-foreground text-lg">
            Name is required! Photo is optional - just type a name if you prefer! 🎨
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-6">
            <CategoryFilter
              categories={categories}
              selected={filterCategories}
              onChange={setFilterCategories}
              allowCreate
              onCreateCategory={handleCreateCategory}
            />
          </div>
        )}

        {/* Gallery Grid */}
        {filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="h-24 w-24 mx-auto mb-4 text-primary animate-spin-slow" />
            <p className="text-3xl font-bold text-muted-foreground">
              {filterCategories.length > 0 ? "No classmates in this category!" : "No classmates yet! Upload some pics to get started! 📸"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-4 border-primary rounded-3xl overflow-hidden shadow-bounce hover:scale-105 transition-transform animate-bounce-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-square relative">
                  {image.image_url ? (
                    <img src={image.image_url} alt={image.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-6xl font-bold text-primary-foreground">
                        {image.name.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <p className="font-bold text-lg truncate text-foreground">{image.name}</p>
                  {(imageCategoryMap[image.id] || []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(imageCategoryMap[image.id] || []).map((catId) => {
                        const cat = categories.find((c) => c.id === catId);
                        return cat ? (
                          <span key={catId} className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                            {cat.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(image.id, image.image_url)}
                    className="w-full rounded-xl"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
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
