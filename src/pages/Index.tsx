import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Image, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating emoji decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl animate-float">✨</div>
        <div className="absolute top-20 right-20 text-5xl animate-wiggle">🎨</div>
        <div className="absolute bottom-20 left-20 text-6xl animate-spin-slow">🌟</div>
        <div className="absolute bottom-10 right-10 text-5xl animate-float">🎪</div>
        <div className="absolute top-1/2 left-1/4 text-4xl animate-pulse-glow">💫</div>
        <div className="absolute top-1/3 right-1/3 text-5xl animate-wiggle">🎉</div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center space-y-8 animate-bounce-in">
          <h1 className="text-7xl md:text-9xl font-bold text-gradient animate-pulse-glow">
            Classmate Chaos Ranker
          </h1>
          <p className="text-3xl md:text-4xl font-bold text-foreground">
            The MOST chaotic way to rank your friends! 🎉✨
          </p>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Upload pics, make tier lists, rate on vibes, and unleash the DRAMA! 
            It's giving main character energy! 💅
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-6 justify-center pt-8">
            <Link to="/gallery">
              <Button 
                size="lg" 
                className="gradient-pink-blue text-white text-2xl px-8 py-8 rounded-3xl shadow-glow hover:scale-110 transition-transform animate-bounce-in"
              >
                <Image className="mr-3 h-8 w-8" />
                Upload Classmates 📸
              </Button>
            </Link>
            <Link to="/tier-list">
              <Button 
                size="lg"
                className="gradient-chaos text-white text-2xl px-8 py-8 rounded-3xl shadow-glow hover:scale-110 transition-transform animate-bounce-in"
                style={{ animationDelay: "0.1s" }}
              >
                <Star className="mr-3 h-8 w-8" />
                Make Tier List ⭐
              </Button>
            </Link>
            <Link to="/venn-diagram">
              <Button 
                size="lg"
                className="gradient-chaos text-white text-2xl px-8 py-8 rounded-3xl shadow-glow hover:scale-110 transition-transform animate-bounce-in"
                style={{ animationDelay: "0.15s" }}
              >
                <Sparkles className="mr-3 h-8 w-8" />
                Venn Diagram 🔮
              </Button>
            </Link>
            <Link to="/ratings">
              <Button 
                size="lg"
                className="bg-neon-green text-foreground text-2xl px-8 py-8 rounded-3xl shadow-glow hover:scale-110 transition-transform animate-bounce-in"
                style={{ animationDelay: "0.2s" }}
              >
                <TrendingUp className="mr-3 h-8 w-8" />
                Rate & Rank 🧠
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-card border-4 border-primary rounded-3xl p-8 shadow-bounce hover:scale-105 transition-transform">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-2xl font-bold mb-3 text-primary">Image Gallery</h3>
            <p className="text-lg">Upload all your classmate pics and manage them in one chaotic, colorful gallery!</p>
          </div>
          
          <div className="bg-card border-4 border-secondary rounded-3xl p-8 shadow-bounce hover:scale-105 transition-transform">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-2xl font-bold mb-3 text-secondary">Tier Lists</h3>
            <p className="text-lg">Drag and drop your friends into S, A, B, C, or D tier. No mercy! 😈</p>
          </div>
          
          <div className="bg-card border-4 border-accent rounded-3xl p-8 shadow-bounce hover:scale-105 transition-transform">
            <div className="text-6xl mb-4">🧠</div>
            <h3 className="text-2xl font-bold mb-3 text-accent">Rate Everything</h3>
            <p className="text-lg">Sex Appeal, Character Design, IQ, EQ - rate it all and see who's truly iconic! 💯</p>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="mt-20 text-center space-y-4">
          <p className="text-2xl font-bold gradient-rainbow p-4 rounded-3xl inline-block">
            ✨ Fully secure • Wildly fun • Zero drama (maybe) ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
