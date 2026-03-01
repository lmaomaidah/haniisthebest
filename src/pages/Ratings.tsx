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
  { min: 36, name: "✨ Certified Main L", color: "bg-neon-pink" },
  { min: 30, name: "🔥 Main Character Energy", color: "bg-neon-purple" },
  { min: 24, name: "💫 Top Scholar Gremlin", color: "bg-neon-blue" },
  { min: 18, name: "😎 Solid Vibe Check", color: "bg-neon-green" },
  { min: 12, name: "🤷 Mid-Level Menace", color: "bg-neon-yellow" },
  { min: 0, name: "💀 NPC Energy", color: "bg-neon-orange" },
];

const getBadge = (total: number) => {
  return badgeNames.find(badge => total >= badge.min) || badgeNames[badgeNames.length - 1];
};

const Ratings = () => {
  const [images, setImages] = useState<ImageWithRating[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageWithRating | null>(null);
  const [ratings, setRatings] = useState({
    sex_appeal: 5,
    character_design: 5,
    iq: 5,
    eq: 5,
  });
  const { toast } = useToast();
  const { logActivity } = useAuth();

  useEffect(() => {
    fetchImagesWithRatings();
  }, []);

  const fetchImagesWithRatings = async () => {
    const { data: imagesData, error: imagesError } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10000);

    if (imagesError) {
      toast({
        title: "Error loading images",
        description: imagesError.message,
        variant: "destructive",
      });
      return;
    }

    const { data: ratingsData, error: ratingsError } = await supabase
      .from('ratings')
      .select('*')
      .limit(10000);

    if (ratingsError) {
      toast({
        title: "Error loading ratings",
        description: ratingsError.message,
        variant: "destructive",
      });
      return;
    }

    // Get signed URLs for images
    const signedImages = await withSignedClassmateImageUrls(imagesData || []);

    const imagesWithRatings = signedImages.map(img => {
      const rating = ratingsData?.find(r => r.image_id === img.id);
      const total = rating
        ? (rating.sex_appeal || 0) + (rating.character_design || 0) + (rating.iq || 0) + (rating.eq || 0)
        : 0;
      return {
        ...img,
        rating,
        total,
      };
    });

    setImages(imagesWithRatings);
  };

  const handleSelectImage = (image: ImageWithRating) => {
    setSelectedImage(image);
    if (image.rating) {
      setRatings({
        sex_appeal: image.rating.sex_appeal || 5,
        character_design: image.rating.character_design || 5,
        iq: image.rating.iq || 5,
        eq: image.rating.eq || 5,
      });
    } else {
      setRatings({
        sex_appeal: 5,
        character_design: 5,
        iq: 5,
        eq: 5,
      });
    }
  };

  const saveRating = async () => {
    if (!selectedImage) return;

    try {
      if (selectedImage.rating) {
        // Update existing rating
        const { error } = await supabase
          .from('ratings')
          .update(ratings)
          .eq('id', selectedImage.rating.id);

        if (error) throw error;
      } else {
        // Create new rating
        const { error } = await supabase
          .from('ratings')
          .insert({
            image_id: selectedImage.id,
            ...ratings,
          });

        if (error) throw error;
      }

      await logActivity('rating_save', { imageName: selectedImage.name, total: ratings.sex_appeal + ratings.character_design + ratings.iq + ratings.eq });

      toast({
        title: "✨ Rating saved!",
        description: "Your judgment is FINAL! 💅",
      });

      fetchImagesWithRatings();
      setSelectedImage(null);
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetRatings = () => {
    setSelectedImage(null);
    setRatings({
      sex_appeal: 5,
      character_design: 5,
      iq: 5,
      eq: 5,
    });
    toast({
      title: "🔄 Selection cleared!",
      description: "Pick a new classmate to rate!",
    });
  };

  const sortedImages = [...images].sort((a, b) => b.total - a.total);

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <WhimsicalBackground />
      {/* Top Bar */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserMenu />
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-5xl md:text-7xl font-bold text-gradient animate-bounce-in drop-shadow-[0_0_30px_rgba(200,100,255,0.5)]">
            💀 Rate Regret
          </h1>
          <div className="flex gap-4">
            <Button onClick={resetRatings} variant="outline" className="border-4 border-destructive rounded-2xl bg-card/80 dark:bg-card/60 backdrop-blur-sm">
              <RotateCcw className="mr-2" />
              Reset
            </Button>
            <Link to="/">
              <Button variant="outline" size="lg" className="border-4 border-primary rounded-2xl bg-card/80 dark:bg-card/60 backdrop-blur-sm dark:shadow-[0_0_15px_rgba(255,100,150,0.3)]">
                <Home className="mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Rating Panel */}
          <div className="space-y-6">
            <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-4 border-secondary rounded-3xl p-8 shadow-bounce dark:shadow-[0_0_25px_rgba(100,200,255,0.3)]">
              <h2 className="text-3xl font-bold mb-6 text-center text-foreground">
                {selectedImage ? "Rate This L! 💀" : "Select an L to Destroy 👇"}
              </h2>

              {selectedImage && (
                <div className="space-y-6">
                  <div className="aspect-square rounded-3xl overflow-hidden border-4 border-primary dark:shadow-[0_0_20px_rgba(255,100,150,0.4)]">
                    {selectedImage.image_url ? (
                      <img
                        src={selectedImage.image_url}
                        alt={selectedImage.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-6xl font-bold text-primary-foreground">
                          {selectedImage.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-xl font-bold mb-2 block text-foreground">
                        😍 Sex Appeal: {ratings.sex_appeal}/10
                      </label>
                      <Slider
                        value={[ratings.sex_appeal]}
                        onValueChange={(value) => setRatings({ ...ratings, sex_appeal: value[0] })}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-xl font-bold mb-2 block text-foreground">
                        🎨 Character Design: {ratings.character_design}/10
                      </label>
                      <Slider
                        value={[ratings.character_design]}
                        onValueChange={(value) => setRatings({ ...ratings, character_design: value[0] })}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-xl font-bold mb-2 block text-foreground">
                        🧠 IQ: {ratings.iq}/10
                      </label>
                      <Slider
                        value={[ratings.iq]}
                        onValueChange={(value) => setRatings({ ...ratings, iq: value[0] })}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-xl font-bold mb-2 block text-foreground">
                        💖 EQ: {ratings.eq}/10
                      </label>
                      <Slider
                        value={[ratings.eq]}
                        onValueChange={(value) => setRatings({ ...ratings, eq: value[0] })}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-3xl font-bold mb-4 text-foreground">
                        Total: {ratings.sex_appeal + ratings.character_design + ratings.iq + ratings.eq}/40
                      </p>
                      <Badge className={`text-xl px-6 py-2 ${getBadge(ratings.sex_appeal + ratings.character_design + ratings.iq + ratings.eq).color} dark:shadow-[0_0_15px_rgba(255,100,150,0.5)]`}>
                        {getBadge(ratings.sex_appeal + ratings.character_design + ratings.iq + ratings.eq).name}
                      </Badge>
                    </div>

                    <Button
                      onClick={saveRating}
                      className="w-full gradient-pink-blue text-white text-xl py-6 rounded-2xl shadow-glow dark:shadow-[0_0_25px_rgba(255,100,150,0.5)]"
                    >
                      <Save className="mr-2" />
                      Save Rating
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rankings List */}
          <div className="space-y-6">
            <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-4 border-accent rounded-3xl p-8 shadow-bounce dark:shadow-[0_0_25px_rgba(255,200,100,0.3)]">
              <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center text-foreground">
                <TrendingUp className="mr-3" />
                Rankings 🏆
              </h2>

              {sortedImages.length === 0 ? (
                <p className="text-center text-xl text-muted-foreground dark:text-foreground/70">
                  No ratings yet! Start judging your classmates! 👀
                </p>
              ) : (
                <div className="space-y-4">
                  {sortedImages.map((image, index) => (
                    <div
                      key={image.id}
                      onClick={() => handleSelectImage(image)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-4 cursor-pointer transition-transform hover:scale-105 bg-background/50 dark:bg-background/30 ${
                        selectedImage?.id === image.id ? 'border-primary bg-muted dark:shadow-[0_0_15px_rgba(255,100,150,0.4)]' : 'border-border'
                      }`}
                    >
                      <div className="text-3xl font-bold w-12 text-center drop-shadow-[0_0_10px_rgba(255,200,100,0.6)]">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary">
                        {image.image_url ? (
                          <img
                            src={image.image_url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-lg font-bold text-primary-foreground">
                              {image.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg truncate text-foreground">{image.name}</p>
                        <p className="text-sm text-muted-foreground dark:text-foreground/60">Score: {image.total}/40</p>
                      </div>
                      <Badge className={`${getBadge(image.total).color} text-sm dark:shadow-[0_0_10px_rgba(255,100,150,0.4)]`}>
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
    </div>
  );
};

export default Ratings;
