import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Home, Save, TrendingUp, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import { withSignedClassmateImageUrls } from "@/lib/classmateImages";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useCategories, fetchAllImageCategories } from "@/hooks/useCategories";

interface ImageType {
  id: string;
  name: string;
  image_url: string | null;
}

interface RatingType {
  id: string;
  image_id: string;
  sex_appeal: number;
  character_design: number;
  iq: number;
  eq: number;
}

interface ImageWithRating extends ImageType {
  rating?: RatingType;
  total: number;
}

const badgeNames = [
  { min: 36, name: "✨ Certified Slay Queen/King", color: "bg-neon-pink" },
  { min: 30, name: "🔥 Main Character Energy", color: "bg-neon-purple" },
  { min: 24, name: "💫 Top Scholar Gremlin", color: "bg-neon-blue" },
  { min: 18, name: "😎 Solid Vibe Check", color: "bg-neon-green" },
  { min: 12, name: "🤷 Mid-Level Menace", color: "bg-neon-yellow" },
  { min: 0, name: "💀 NPC Energy", color: "bg-neon-orange" },
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

  useEffect(() => {
    fetchImagesWithRatings();
    loadCategoryMap();
  }, []);

  const loadCategoryMap = async () => {
    const map = await fetchAllImageCategories();
    setImageCategoryMap(map);
  };

  useEffect(() => {
    if (filterCategories.length === 0) {
      setImages(allImages);
    } else {
      setImages(allImages.filter((img) => {
        const cats = imageCategoryMap[img.id] || [];
        return filterCategories.some((fc) => cats.includes(fc));
      }));
    }
  }, [filterCategories, allImages, imageCategoryMap]);

  const fetchImagesWithRatings = async () => {
    const { data: imagesData, error: imagesError } = await supabase
      .from("images").select("*").order("created_at", { ascending: false }).limit(10000);
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
    if (image.rating) {
      setRatings({ sex_appeal: image.rating.sex_appeal || 5, character_design: image.rating.character_design || 5, iq: image.rating.iq || 5, eq: image.rating.eq || 5 });
    } else {
      setRatings({ sex_appeal: 5, character_design: 5, iq: 5, eq: 5 });
    }
  };

  const saveRating = async () => {
    if (!selectedImage) return;
    try {
      if (selectedImage.rating) {
        const { error } = await supabase.from("ratings").update(ratings).eq("id", selectedImage.rating.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ratings").insert({ image_id: selectedImage.id, ...ratings });
        if (error) throw error;
      }
      await logActivity("rating_save", { imageName: selectedImage.name, total: ratings.sex_appeal + ratings.character_design + ratings.iq + ratings.eq });
      toast({ title: "✨ Rating saved!", description: "Your judgment is FINAL! 💅" });
      fetchImagesWithRatings();
      setSelectedImage(null);
    } catch (error: any) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    }
  };

  const resetRatings = () => {
    setSelectedImage(null);
    setRatings({ sex_appeal: 5, character_design: 5, iq: 5, eq: 5 });
    toast({ title: "🔄 Selection cleared!", description: "Pick a new classmate to rate!" });
  };

  const handleCreateCategory = async (name: string) => {
    if (!user) return;
    try { await createCategory(name, user.id); toast({ title: "Category created! 🏷️" }); }
    catch (err: any) { toast({ title: "Couldn't create category", description: err.message, variant: "destructive" }); }
  };

  const handleRenameCategory = async (id: string, newName: string) => {
    try { await renameCategory(id, newName); toast({ title: "Category renamed! ✏️" }); }
    catch (err: any) { toast({ title: "Couldn't rename", description: err.message, variant: "destructive" }); }
  };

  const handleDeleteCategory = async (id: string) => {
    try { await deleteCategory(id); await loadCategoryMap(); toast({ title: "Category deleted! 🗑️" }); }
    catch (err: any) { toast({ title: "Couldn't delete", description: err.message, variant: "destructive" }); }
  };

  const sortedImages = [...images].sort((a, b) => b.total - a.total);

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <WhimsicalBackground />
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserMenu />
        <ThemeToggle />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-5xl md:text-7xl font-bold text-gradient animate-bounce-in">🧠 Rate & Rank</h1>
          <div className="flex gap-4">
            <Button onClick={resetRatings} variant="outline" className="border-4 border-destructive rounded-2xl bg-card/80 dark:bg-card/60 backdrop-blur-sm">
              <RotateCcw className="mr-2" /> Reset
            </Button>
            <Link to="/">
              <Button variant="outline" size="lg" className="border-4 border-primary rounded-2xl bg-card/80 dark:bg-card/60 backdrop-blur-sm">
                <Home className="mr-2" /> Home
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <CategoryFilter categories={categories} selected={filterCategories} onChange={setFilterCategories} allowCreate onCreateCategory={handleCreateCategory} allowEdit onRenameCategory={handleRenameCategory} onDeleteCategory={handleDeleteCategory} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Rating Panel */}
          <div className="space-y-6">
            <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-4 border-secondary rounded-3xl p-8 shadow-bounce">
              <h2 className="text-3xl font-bold mb-6 text-center text-foreground">
                {selectedImage ? "Rate This Classmate! 💯" : "Select a Classmate to Rate 👇"}
              </h2>
              {selectedImage && (
                <div className="space-y-6">
                  <div className="aspect-square rounded-3xl overflow-hidden border-4 border-primary">
                    {selectedImage.image_url ? (
                      <img src={selectedImage.image_url} alt={selectedImage.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-6xl font-bold text-primary-foreground">
                          {selectedImage.name.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    {[
                      { key: "sex_appeal" as const, label: "😍 Sex Appeal" },
                      { key: "character_design" as const, label: "🎨 Character Design" },
                      { key: "iq" as const, label: "🧠 IQ" },
                      { key: "eq" as const, label: "💖 EQ" },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="text-xl font-bold mb-2 block text-foreground">{label}: {ratings[key]}/10</label>
                        <Slider value={[ratings[key]]} onValueChange={(value) => setRatings({ ...ratings, [key]: value[0] })} max={10} step={1} className="w-full" />
                      </div>
                    ))}
                    <div className="text-center">
                      <p className="text-3xl font-bold mb-4 text-foreground">
                        Total: {ratings.sex_appeal + ratings.character_design + ratings.iq + ratings.eq}/40
                      </p>
                      <Badge className={`text-xl px-6 py-2 ${getBadge(ratings.sex_appeal + ratings.character_design + ratings.iq + ratings.eq).color}`}>
                        {getBadge(ratings.sex_appeal + ratings.character_design + ratings.iq + ratings.eq).name}
                      </Badge>
                    </div>
                    <Button onClick={saveRating} className="w-full gradient-pink-blue text-white text-xl py-6 rounded-2xl shadow-glow">
                      <Save className="mr-2" /> Save Rating
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rankings List */}
          <div className="space-y-6">
            <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-4 border-accent rounded-3xl p-8 shadow-bounce">
              <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center text-foreground">
                <TrendingUp className="mr-3" /> Rankings 🏆
              </h2>
              {sortedImages.length === 0 ? (
                <p className="text-center text-xl text-muted-foreground">No ratings yet! Start judging your classmates! 👀</p>
              ) : (
                <div className="space-y-4">
                  {sortedImages.map((image, index) => (
                    <div
                      key={image.id}
                      onClick={() => handleSelectImage(image)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-4 cursor-pointer transition-transform hover:scale-105 bg-background/50 dark:bg-background/30 ${
                        selectedImage?.id === image.id ? "border-primary bg-muted" : "border-border"
                      }`}
                    >
                      <div className="text-3xl font-bold w-12 text-center">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                      </div>
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary">
                        {image.image_url ? (
                          <img src={image.image_url} alt={image.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-lg font-bold text-primary-foreground">
                              {image.name.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg truncate text-foreground">{image.name}</p>
                        <p className="text-sm text-muted-foreground">Score: {image.total}/40</p>
                      </div>
                      <Badge className={`${getBadge(image.total).color} text-sm`}>{getBadge(image.total).name}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ratings;
