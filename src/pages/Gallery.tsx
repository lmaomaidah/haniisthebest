import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Trash2, Home, Sparkles, Search, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CategoryPicker } from "@/components/CategoryPicker";
import { useCategories, setImageCategories, fetchAllImageCategories } from "@/hooks/useCategories";
import { getCategoryColor } from "@/lib/categoryColors";

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
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { logActivity, user } = useAuth();
  const { categories, createCategory, renameCategory, deleteCategory } = useCategories();

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
      toast({ title: "Name required", description: "Please enter a name!", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      let publicUrl = null;
      if (file) {
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
          toast({ title: "Invalid file type", description: "Only PNG, JPG, and WebP!", variant: "destructive" });
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

      if (selectedUploadCategories.length > 0 && insertedImage) {
        await setImageCategories(insertedImage.id, selectedUploadCategories);
      }
      await logActivity("image_upload", { name: name.trim(), hasImage: !!file });

      toast({ title: file ? "✨ Upload successful!" : "✨ Classmate added!" });
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
        if (fileName) await supabase.storage.from("classmate-images").remove([fileName]);
      }
      const { error } = await supabase.from("images").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "💥 Deleted!" });
      fetchImages();
    } catch (error: any) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateCategory = async (catName: string) => {
    if (!user) return;
    try {
      const cat = await createCategory(catName, user.id);
      toast({ title: "Category created! 🏷️" });
      return cat;
    } catch (err: any) {
      toast({ title: "Couldn't create category", description: err.message, variant: "destructive" });
      return null;
    }
  };

  const handleRenameCategory = async (id: string, newName: string) => {
    try { await renameCategory(id, newName); toast({ title: "Category renamed! ✏️" }); }
    catch (err: any) { toast({ title: "Couldn't rename", description: err.message, variant: "destructive" }); }
  };

  const handleDeleteCategory = async (id: string) => {
    try { await deleteCategory(id); await loadCategoryMap(); toast({ title: "Category deleted! 🗑️" }); }
    catch (err: any) { toast({ title: "Couldn't delete", description: err.message, variant: "destructive" }); }
  };

  let filteredImages = filterCategories.length === 0
    ? images
    : images.filter((img) => {
        const imgCats = imageCategoryMap[img.id] || [];
        return filterCategories.some((fc) => imgCats.includes(fc));
      });

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredImages = filteredImages.filter((img) => img.name.toLowerCase().includes(q));
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <WhimsicalBackground />
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserMenu />
        <ThemeToggle />
      </div>

      <div className="container mx-auto relative z-10 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient font-['Luckiest_Guy'] tracking-wide">
              📸 Gallery
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{images.length} classmates in the roster</p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="rounded-xl border-2 border-primary/50 bg-card/80 backdrop-blur-sm">
              <Home className="mr-1.5 h-3.5 w-3.5" /> Home
            </Button>
          </Link>
        </div>

        {/* Upload Section - compact */}
        <div className="bg-card/70 dark:bg-card/50 backdrop-blur-sm border border-secondary/40 rounded-2xl p-5 mb-6">
          <h2 className="text-xl font-bold mb-4 text-foreground font-['Schoolbell']">📸 Add a Classmate</h2>
          <div className="space-y-3 max-w-2xl">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Name your classmate..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-2 border-accent/30 rounded-xl bg-background/60 flex-1"
              />
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={uploading}
                className="border-2 border-accent/30 rounded-xl bg-background/60 max-w-[200px]"
              />
            </div>
            <CategoryPicker
              categories={categories}
              selected={selectedUploadCategories}
              onChange={setSelectedUploadCategories}
              onCreateCategory={async (n) => {
                if (!user) return null;
                try {
                  const cat = await createCategory(n, user.id);
                  toast({ title: "Category created! 🏷️" });
                  return cat;
                } catch (err: any) {
                  toast({ title: "Couldn't create", description: err.message, variant: "destructive" });
                  return null;
                }
              }}
            />
            <Button
              onClick={handleFileUpload}
              disabled={uploading || !name.trim()}
              className="gradient-pink-blue text-white rounded-xl px-6"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Adding… ✨" : file ? "Upload with Photo 🚀" : "Add Name Only ✍️"}
            </Button>
          </div>
        </div>

        {/* Search + Category Filter */}
        <div className="space-y-3 mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classmates…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-border/50 bg-card/50 h-9"
            />
          </div>
          <CategoryFilter
            categories={categories}
            selected={filterCategories}
            onChange={setFilterCategories}
            allowCreate
            onCreateCategory={handleCreateCategory}
            allowEdit
            onRenameCategory={handleRenameCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </div>

        {/* Gallery Grid */}
        {filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary/40 animate-spin-slow" />
            <p className="text-xl text-muted-foreground">
              {searchQuery || filterCategories.length > 0 ? "No matches found" : "No classmates yet! Upload some to get started 📸"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredImages.map((image) => {
              const imgCats = imageCategoryMap[image.id] || [];
              return (
                <Link
                  key={image.id}
                  to={`/profiles/${image.id}`}
                  className="group bg-card/70 dark:bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden">
                    {image.image_url ? (
                      <img
                        src={image.image_url}
                        alt={image.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-3xl font-bold text-foreground/60">
                          {image.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <div className="flex items-center gap-1 text-white/80 text-xs">
                        <Eye className="h-3 w-3" /> View profile
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2.5 space-y-1.5">
                    <p className="font-semibold text-sm truncate text-foreground">{image.name}</p>
                    {imgCats.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {imgCats.slice(0, 3).map((catId) => {
                          const cat = categories.find((c) => c.id === catId);
                          if (!cat) return null;
                          const color = getCategoryColor(catId);
                          return (
                            <span
                              key={catId}
                              className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full border"
                              style={{
                                backgroundColor: color.bg,
                                borderColor: color.border,
                                color: color.text,
                              }}
                              onClick={(e) => e.preventDefault()}
                            >
                              <span className="h-1 w-1 rounded-full" style={{ backgroundColor: color.dot }} />
                              {cat.name}
                            </span>
                          );
                        })}
                        {imgCats.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{imgCats.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delete button (only show for own/admin) */}
                  <div className="px-2.5 pb-2.5" onClick={(e) => e.preventDefault()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(image.id, image.image_url);
                      }}
                      className="w-full h-7 text-xs text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="mr-1 h-3 w-3" /> Remove
                    </Button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
