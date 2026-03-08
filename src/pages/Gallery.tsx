import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Trash2, Sparkles, Search, Eye, ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
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
  const [showUpload, setShowUpload] = useState(false);
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
      setShowUpload(false);
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

      <div className="container mx-auto relative z-10 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient font-['Luckiest_Guy'] tracking-wide">
              📸 Gallery
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{images.length} classmates in the roster</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowUpload(!showUpload)}
              variant={showUpload ? "secondary" : "default"}
              size="sm"
              className="rounded-xl"
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" /> {showUpload ? 'Hide' : 'Add Classmate'}
            </Button>
            <Link to="/">
              <Button variant="outline" size="sm" className="rounded-xl border-2 border-primary/50 bg-card/80 backdrop-blur-sm">
                <Home className="mr-1.5 h-3.5 w-3.5" /> Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Collapsible Upload Section */}
        {showUpload && (
          <div className="bg-card/70 dark:bg-card/50 backdrop-blur-sm border border-secondary/40 rounded-2xl p-5 mb-6 animate-in slide-in-from-top-2 duration-300">
            <h2 className="text-lg font-bold mb-3 text-foreground font-['Schoolbell'] flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" /> Add a Classmate
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2 flex-1">
                <Input
                  type="text"
                  placeholder="Name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-2 border-accent/30 rounded-xl bg-background/60"
                />
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={uploading}
                  className="border-2 border-accent/30 rounded-xl bg-background/60 max-w-[180px]"
                />
              </div>
              <Button
                onClick={handleFileUpload}
                disabled={uploading || !name.trim()}
                className="gradient-pink-blue text-white rounded-xl px-6 whitespace-nowrap"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Adding…" : file ? "Upload 🚀" : "Add ✍️"}
              </Button>
            </div>
            <div className="mt-3">
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
            </div>
          </div>
        )}

        {/* Search + Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classmates…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-border/50 bg-card/50 h-9"
            />
          </div>
          <div className="flex-1 overflow-x-auto">
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
                <div key={image.id} className="group relative">
                  <Link
                    to={`/profiles/${image.id}`}
                    className="block bg-card/70 dark:bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1.5"
                  >
                    {/* Image with gradient overlay */}
                    <div className="aspect-[3/4] relative overflow-hidden">
                      {image.image_url ? (
                        <img
                          src={image.image_url}
                          alt={image.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                          <span className="text-4xl font-bold text-foreground/40 font-['Luckiest_Guy']">
                            {image.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                      )}

                      {/* Gradient overlay - always visible subtle, stronger on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                      {/* Name + badges overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="font-bold text-sm text-white drop-shadow-lg truncate mb-1.5">
                          {image.name}
                        </p>
                        {imgCats.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {imgCats.slice(0, 2).map((catId) => {
                              const cat = categories.find((c) => c.id === catId);
                              if (!cat) return null;
                              const color = getCategoryColor(catId);
                              return (
                                <span
                                  key={catId}
                                  className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border backdrop-blur-sm"
                                  style={{
                                    backgroundColor: color.bg,
                                    borderColor: color.border,
                                    color: color.text,
                                  }}
                                >
                                  <span className="h-1 w-1 rounded-full" style={{ backgroundColor: color.dot }} />
                                  {cat.name}
                                </span>
                              );
                            })}
                            {imgCats.length > 2 && (
                              <span className="text-[9px] text-white/60 self-center">+{imgCats.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* "View profile" hover label */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                          <Eye className="h-3 w-3" /> View Profile
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Delete button floating */}
                  <button
                    onClick={() => handleDelete(image.id, image.image_url)}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive shadow-md"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
