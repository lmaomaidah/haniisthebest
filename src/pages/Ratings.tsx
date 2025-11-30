import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Home, Save, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ImageType {
  id: string;
  name: string;
  image_url: string;
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

  useEffect(() => {
    fetchImagesWithRatings();
  }, []);

  const fetchImagesWithRatings = async () => {
    const { data: imagesData, error: imagesError } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false });

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
      .select('*');

    if (ratingsError) {
      toast({
        title: "Error loading ratings",
        description: ratingsError.message,
        variant: "destructive",
      });
      return;
    }

    const imagesWithRatings = (imagesData || []).map(img => {
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

  const sortedImages = [...images].sort((a, b) => b.total - a.total);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-5xl md:text-7xl font-bold text-gradient animate-bounce-in">
            🧠 Rate & Rank
          </h1>
          <Link to="/">
            <Button variant="outline" size="lg" className="border-4 border-primary rounded-2xl">
              <Home className="mr-2" />
              Home
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Rating Panel */}
          <div className="space-y-6">
            <div className="bg-card border-4 border-secondary rounded-3xl p-8 shadow-bounce">
              <h2 className="text-3xl font-bold mb-6 text-center">
                {selectedImage ? "Rate This Classmate! 💯" : "Select a Classmate to Rate 👇"}
              </h2>

              {selectedImage && (
                <div className="space-y-6">
                  <div className="aspect-square rounded-3xl overflow-hidden border-4 border-primary">
                    <img
                      src={selectedImage.image_url}
                      alt={selectedImage.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-xl font-bold mb-2 block">
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
                      <label className="text-xl font-bold mb-2 block">
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
                      <label className="text-xl font-bold mb-2 block">
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
                      <label className="text-xl font-bold mb-2 block">
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
                      <p className="text-3xl font-bold mb-4">
                        Total: {ratings.sex_appeal + ratings.character_design + ratings.iq + ratings.eq}/40
                      </p>
                      <Badge className={`text-xl px-6 py-2 ${getBadge(ratings.sex_appeal + ratings.character_design + ratings.iq + ratings.eq).color}`}>
                        {getBadge(ratings.sex_appeal + ratings.character_design + ratings.iq + ratings.eq).name}
                      </Badge>
                    </div>

                    <Button
                      onClick={saveRating}
                      className="w-full gradient-pink-blue text-white text-xl py-6 rounded-2xl shadow-glow"
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
            <div className="bg-card border-4 border-accent rounded-3xl p-8 shadow-bounce">
              <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center">
                <TrendingUp className="mr-3" />
                Rankings 🏆
              </h2>

              {sortedImages.length === 0 ? (
                <p className="text-center text-xl text-muted-foreground">
                  No ratings yet! Start judging your classmates! 👀
                </p>
              ) : (
                <div className="space-y-4">
                  {sortedImages.map((image, index) => (
                    <div
                      key={image.id}
                      onClick={() => handleSelectImage(image)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-4 cursor-pointer transition-transform hover:scale-105 ${
                        selectedImage?.id === image.id ? 'border-primary bg-muted' : 'border-border'
                      }`}
                    >
                      <div className="text-3xl font-bold w-12 text-center">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary">
                        <img
                          src={image.image_url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg truncate">{image.name}</p>
                        <p className="text-sm text-muted-foreground">Score: {image.total}/40</p>
                      </div>
                      <Badge className={`${getBadge(image.total).color} text-sm`}>
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
