import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Save, TrendingUp, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import { withSignedClassmateImageUrls } from "@/lib/classmateImages";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useCategories, fetchAllImageCategories } from "@/hooks/useCategories";

interface ImageType { id: string; name: string; image_url: string | null; }
interface RatingType { id: string; image_id: string; sex_appeal: number; character_design: number; iq: number; eq: number; }
interface ImageWithRating extends ImageType { rating?: RatingType; total: number; }

const badgeNames = [
  { min: 36, name: "✨ Certified Slay Queen/King", color: "bg-primary/20 text-primary border-primary/40" },
  { min: 30, name: "🔥 Main Character Energy", color: "bg-secondary/20 text-secondary border-secondary/40" },
  { min: 24, name: "💫 Top Scholar Gremlin", color: "bg-accent/20 text-accent border-accent/40" },
  { min: 18, name: "😎 Solid Vibe Check", color: "bg-primary/15 text-primary/80 border-primary/30" },
  { min: 12, name: "🤷 Mid-Level Menace", color: "bg-muted text-muted-foreground border-border" },
  { min: 0, name: "💀 NPC Energy", color: "bg-destructive/15 text-destructive border-destructive/30" },
];

const getBadge = (total: number) => badgeNames.find((badge) => total >= badge.min) || badgeNames[badgeNames.length - 1];

const Ratings = () => {
  const [allImages, setAllImages] = useState<ImageWithRating[]>([]);
  const [images, setImages] = useState<ImageWithRating[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageWithRating | null>(null);
  const [ratings, setRatings] = useState({ sex_appeal: 5, character_design: 5, iq: 5, eq: 5 });
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [imageCategoryMap, setImageCategoryMap] = useState<Record<string, string[]>>({});
  const { toast } = useToast();
  const { logActivity, user } = useAuth();
  const { categories, createCategory, renameCategory, deleteCategory } = useCategories();

  useEffect(() => { fetchImagesWithRatings(); loadCategoryMap(); }, []);

  const loadCategoryMap = async () => { const map = await fetchAllImageCategories(); setImageCategoryMap(map); };

  useEffect(() => {
    if (filterCategories.length === 0) setImages(allImages);
    else setImages(allImages.filter((img) => { const cats = imageCategoryMap[img.id] || []; return filterCategories.some((fc) => cats.includes(fc)); }));
  }, [filterCategories, allImages, imageCategoryMap]);

  const fetchImagesWithRatings = async () => {
    const { data: imagesData, error: imagesError } = await supabase.from("images").select("*").order("created_at", { ascending: false }).limit(10000);
    if (imagesError) { toast({ title: "Error loading images", description: imagesError.message, variant: "destructive" }); return; }
    const { data: ratingsData, error: ratingsError } = await supabase.from("ratings").select("*").limit(10000);
    if (ratingsError) { toast({ title: "Error loading ratings", description: ratingsError.message, variant: "destructive" }); return; }
    const signedImages = await withSignedClassmateImageUrls(imagesData || []);
    const imagesWithRatings = signedImages.map((img) => {
      const rating = ratingsData?.find((r) => r.image_id === img.id);
      const total = rating ? (rating.sex_appeal || 0) + (rating.character_design || 0) + (rating.iq || 0) + (rating.eq || 0) : 0;
      return { ...img, rating, total };
    });
    setAllImages(imagesWithRatings);
    setImages(imagesWithRatings);
  };

  const handleSelectImage = (image: ImageWithRating) => {
    setSelectedImage(image);
    if (image.rating) setRatings({ sex_appeal: image.rating.sex_appeal || 5, character_design: image.rating.character_design || 5, iq: image.rating.iq || 5, eq: image.rating.eq || 5 });
    else setRatings({ sex_appeal: 5, character_design: 5, iq: 5, eq: 5 });
  };

  const saveRating = async () => {
    if (!selectedImage) return;
    try {
      if (selectedImage.rating) { const { error } = await supabase.from("ratings").update(ratings).eq("id", selectedImage.rating.id); if (error) throw error; }
      else { const { error } = await supabase.from("ratings").insert({ image_id: selectedImage.id, ...ratings }); if (error) throw error; }
      await logActivity("rating_save", { imageName: selectedImage.name, total: ratings.sex_appeal + ratings.character_design + ratings.iq + ratings.eq });
      toast({ title: "✨ Rating saved!", description: "Your judgment is FINAL! 💅" });
      fetchImagesWithRatings();
      setSelectedImage(null);
    } catch (error: any) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); }
  };

  const resetRatings = () => { setSelectedImage(null); setRatings({ sex_appeal: 5, character_design: 5, iq: 5, eq: 5 }); };

  const handleCreateCategory = async (name: string) => { if (!user) return; try { await createCategory(name, user.id); toast({ title: "Category created! 🏷️" }); } catch (err: any) { toast({ title: "Couldn't create category", description: err.message, variant: "destructive" }); } };
  const handleRenameCategory = async (id: string, newName: string) => { try { await renameCategory(id, newName); } catch {} };
  const handleDeleteCategory = async (id: string) => { try { await deleteCategory(id); await loadCategoryMap(); } catch {} };

  const sortedImages = [...images].sort((a, b) => b.total - a.total);
  const totalScore = ratings.sex_appeal + ratings.character_design + ratings.iq + ratings.eq;

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <WhimsicalBackground />
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3"><UserMenu /><ThemeToggle /></div>

      <div className="container mx-auto relative z-10 max-w-6xl">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient font-['Luckiest_Guy'] tracking-wide">🧠 Rate & Rank</h1>
            <p className="text-muted-foreground text-sm mt-1">Judge your classmates with precision</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={resetRatings} variant="outline" size="sm" className="rounded-xl border-2 border-destructive/50"><RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset</Button>
            <Link to="/"><Button variant="outline" size="sm" className="rounded-xl border-2 border-primary/50"><Home className="mr-1.5 h-3.5 w-3.5" /> Home</Button></Link>
          </div>
        </div>

        <div className="mb-6">
          <CategoryFilter categories={categories} selected={filterCategories} onChange={setFilterCategories} allowCreate onCreateCategory={handleCreateCategory} allowEdit onRenameCategory={handleRenameCategory} onDeleteCategory={handleDeleteCategory} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Rating Panel */}
          <div className="bg-card/70 backdrop-blur-sm border border-secondary/40 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center text-foreground font-['Schoolbell']">
              {selectedImage ? `Rating: ${selectedImage.name} 💯` : "Select a Classmate to Rate 👇"}
            </h2>
            {selectedImage && (
              <div className="space-y-5 animate-fade-in">
                <div className="aspect-square max-w-[200px] mx-auto rounded-2xl overflow-hidden border-2 border-primary/40 shadow-lg">
                  {selectedImage.image_url ? (
                    <img src={selectedImage.image_url} alt={selectedImage.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                      <span className="text-4xl font-bold text-foreground/50">{selectedImage.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {[
                    { key: "sex_appeal" as const, label: "😍 Sex Appeal", color: "text-secondary" },
                    { key: "character_design" as const, label: "🎨 Character Design", color: "text-primary" },
                    { key: "iq" as const, label: "🧠 IQ", color: "text-accent" },
                    { key: "eq" as const, label: "💖 EQ", color: "text-secondary" },
                  ].map(({ key, label, color }) => (
                    <div key={key} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-foreground">{label}</label>
                        <span className={`text-lg font-black tabular-nums ${color}`}>{ratings[key]}</span>
                      </div>
                      <Slider value={[ratings[key]]} onValueChange={(value) => setRatings({ ...ratings, [key]: value[0] })} max={10} step={1} />
                    </div>
                  ))}
                  <div className="text-center pt-2 space-y-3">
                    <div className="inline-flex items-center gap-3 bg-muted/30 rounded-xl px-5 py-3">
                      <span className="text-2xl font-black text-gradient tabular-nums">{totalScore}/40</span>
                    </div>
                    <div>
                      <Badge className={`text-sm px-4 py-1.5 border ${getBadge(totalScore).color}`}>{getBadge(totalScore).name}</Badge>
                    </div>
                    <Button onClick={saveRating} className="w-full gradient-pink-blue text-white text-lg py-5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                      <Save className="mr-2 h-4 w-4" /> Save Rating
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rankings */}
          <div className="bg-card/70 backdrop-blur-sm border border-accent/40 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center text-foreground font-['Schoolbell'] flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" /> Rankings 🏆
            </h2>
            {sortedImages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No ratings yet! Start judging 👀</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {sortedImages.map((image, index) => (
                  <div
                    key={image.id}
                    onClick={() => handleSelectImage(image)}
                    className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:-translate-x-1 hover:shadow-md ${
                      selectedImage?.id === image.id
                        ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.15)]"
                        : "border-border/50 bg-background/30 hover:border-primary/40"
                    }`}
                  >
                    <div className="text-xl font-bold w-8 text-center flex-shrink-0">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : <span className="text-sm text-muted-foreground">#{index + 1}</span>}
                    </div>
                    <div className="w-11 h-11 rounded-lg overflow-hidden border border-primary/30 flex-shrink-0 group-hover:scale-105 transition-transform">
                      {image.image_url ? (
                        <img src={image.image_url} alt={image.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                          <span className="text-xs font-bold text-foreground/50">{image.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate text-foreground">{image.name}</p>
                      <p className="text-xs text-muted-foreground">{image.total}/40</p>
                    </div>
                    <Badge className={`text-[10px] px-2 py-0.5 border whitespace-nowrap ${getBadge(image.total).color}`}>
                      {getBadge(image.total).name}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ratings;
