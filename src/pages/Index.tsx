import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Image, TrendingUp, Heart, Brain, Vote, Pin } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import Marquee from "@/components/Marquee";

const Index = () => {
  return <div className="min-h-screen relative overflow-hidden">
      {/* Scrolling marquee ticker */}
      <Marquee />
      
      {/* Whimsical background with swirls, clouds, and stars */}
      <WhimsicalBackground />

      {/* Top Bar */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserMenu />
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center space-y-6 animate-bounce-in">
          {/* Subtitle */}
          <p className="text-lg md:text-xl font-medium text-foreground/70 tracking-widest uppercase">
            Welcome to the chaos
          </p>
          
          {/* Main Title - Retro style like reference */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold leading-tight">
            <span className="text-gradient">Kingstop
Fanclub
          </span>
            <br />
            
          </h1>
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl text-foreground/80 font-medium">
            by the minion
          </p>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The universe is a cruel, uncaring void. The key to being happy isn't a search for meaning; 
            it's to keep yourself busy with unimportant nonsense, and eventually you'll be dead.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center pt-10">
            <Link to="/gallery">
              <Button size="lg" className="bg-card hover:bg-card/80 text-foreground border-2 border-foreground/20 text-lg md:text-xl px-6 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <Image className="mr-2 h-5 w-5" />
                Upload Classmates
              </Button>
            </Link>
            <Link to="/tier-list">
              <Button size="lg" className="gradient-chaos text-card-foreground text-lg md:text-xl px-6 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <Star className="mr-2 h-5 w-5" />
                Make Tier List
              </Button>
            </Link>
            <Link to="/classifications">
              <Button size="lg" className="gradient-pink-blue text-card-foreground text-lg md:text-xl px-6 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <Sparkles className="mr-2 h-5 w-5" />
                Classify
              </Button>
            </Link>
            <Link to="/ratings">
              <Button size="lg" className="bg-lime-green hover:bg-lime-green/90 text-background text-lg md:text-xl px-6 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <TrendingUp className="mr-2 h-5 w-5" />
                Rate & Rank
              </Button>
            </Link>
            <Link to="/ship-o-meter">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg md:text-xl px-6 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <Heart className="mr-2 h-5 w-5" />
                Ship-O-Meter
              </Button>
            </Link>
            <Link to="/judgement-quiz">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg md:text-xl px-6 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <Brain className="mr-2 h-5 w-5" />
                The Judgement
              </Button>
            </Link>
            <Link to="/polls">
              <Button size="lg" className="bg-neon-purple hover:bg-neon-purple/90 text-foreground text-lg md:text-xl px-6 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <Vote className="mr-2 h-5 w-5" />
                Crowd Verdicts
              </Button>
            </Link>
            <Link to="/profiles">
              <Button size="lg" className="bg-cloud-pink hover:bg-cloud-pink/90 text-foreground text-lg md:text-xl px-6 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <Pin className="mr-2 h-5 w-5" />
                Shrine Wall
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-24">
          <div className="bg-card/80 backdrop-blur-sm border-2 border-primary/40 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="text-5xl mb-4">📸</div>
            <h3 className="text-2xl font-bold mb-3 text-primary">Image Gallery</h3>
            <p className="text-foreground/70 leading-relaxed">
              I come from poison. I have poison inside me, and I destroy everything I touch. That's my legacy.
            </p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm border-2 border-secondary/40 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-2xl font-bold mb-3 text-secondary">Tier Lists</h3>
            <p className="text-foreground/70 leading-relaxed">
              I looooooove chocolate, but it will literally kill me!!!!!!
            </p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm border-2 border-accent/40 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="text-5xl mb-4">🧠</div>
            <h3 className="text-2xl font-bold mb-3 text-accent">Rate Everything</h3>
            <p className="text-foreground/70 leading-relaxed">
              I don't understand how people live. It's amazing to me that people wake up every morning and say: "Yeah! Another day, let's do it!"
            </p>
          </div>
        </div>

        {/* Quote section */}
        <div className="mt-20 text-center">
          <div className="inline-block bg-card/70 backdrop-blur-sm rounded-full px-8 py-4 border border-border">
            <p className="text-lg font-medium text-foreground/80">
              ✨ Liquor before beer, never fear — don't do heroin ✨
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default Index;