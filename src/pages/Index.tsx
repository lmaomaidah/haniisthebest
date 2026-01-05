import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Image, TrendingUp, Heart, Brain, Vote } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserMenu />
        <ThemeToggle />
      </div>
      
      {/* Decorative rainbow swirl - top right */}
      <div className="absolute -top-20 -right-20 w-[600px] h-[600px] pointer-events-none opacity-60 dark:opacity-40">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <linearGradient id="rainbow1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(225, 80%, 55%)" />
              <stop offset="25%" stopColor="hsl(275, 70%, 55%)" />
              <stop offset="50%" stopColor="hsl(340, 85%, 58%)" />
              <stop offset="75%" stopColor="hsl(25, 95%, 55%)" />
              <stop offset="100%" stopColor="hsl(45, 100%, 55%)" />
            </linearGradient>
          </defs>
          <path
            d="M 350 50 Q 250 100 200 200 Q 150 300 50 350"
            stroke="url(#rainbow1)"
            strokeWidth="40"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 380 80 Q 280 130 230 230 Q 180 330 80 380"
            stroke="url(#rainbow1)"
            strokeWidth="25"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* Decorative rainbow swirl - bottom left */}
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] pointer-events-none opacity-50 dark:opacity-30 rotate-180">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <path
            d="M 350 50 Q 250 100 200 200 Q 150 300 50 350"
            stroke="url(#rainbow1)"
            strokeWidth="35"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-16 left-16 text-5xl animate-float">✨</div>
        <div className="absolute top-28 right-32 text-4xl animate-wiggle">🌙</div>
        <div className="absolute bottom-32 left-24 text-5xl animate-spin-slow">🌟</div>
        <div className="absolute bottom-16 right-20 text-4xl animate-float" style={{ animationDelay: '1s' }}>🎨</div>
        <div className="absolute top-1/2 left-[15%] text-3xl animate-pulse-glow">💫</div>
        <div className="absolute top-1/3 right-[25%] text-4xl animate-wiggle" style={{ animationDelay: '0.5s' }}>🌸</div>
        {/* Small decorative stars */}
        <div className="absolute top-[20%] left-[40%] w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
        <div className="absolute top-[60%] right-[35%] w-3 h-3 bg-secondary rounded-full animate-pulse-glow" style={{ animationDelay: '0.3s' }} />
        <div className="absolute bottom-[40%] left-[60%] w-2 h-2 bg-accent rounded-full animate-pulse-glow" style={{ animationDelay: '0.6s' }} />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center space-y-6 animate-bounce-in">
          {/* Subtitle */}
          <p className="text-lg md:text-xl font-medium text-foreground/80 tracking-wide uppercase">
            Welcome to the chaos
          </p>
          
          {/* Main Title - Retro style */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold text-gradient leading-tight">
            Pure
            <br />
            <span className="italic">Imagination</span>
          </h1>
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl text-foreground/90 max-w-xl mx-auto font-medium">
            by the minion
          </p>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The universe is a cruel, uncaring void. The key to being happy isn't a search for meaning; 
            it's to keep yourself busy with unimportant nonsense, and eventually you'll be dead.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center pt-10">
            <Link to="/gallery">
              <Button 
                size="lg" 
                className="bg-card hover:bg-card/80 text-foreground border-2 border-foreground/20 text-lg md:text-xl px-6 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Image className="mr-2 h-5 w-5" />
                Upload Classmates
              </Button>
            </Link>
            <Link to="/tier-list">
              <Button 
                size="lg" 
                className="gradient-chaos text-white text-lg md:text-xl px-6 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Star className="mr-2 h-5 w-5" />
                Make Tier List
              </Button>
            </Link>
            <Link to="/classifications">
              <Button 
                size="lg" 
                className="gradient-pink-blue text-white text-lg md:text-xl px-6 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Classify
              </Button>
            </Link>
            <Link to="/ratings">
              <Button 
                size="lg" 
                className="bg-lime-green hover:bg-lime-green/90 text-foreground text-lg md:text-xl px-6 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                Rate & Rank
              </Button>
            </Link>
            <Link to="/ship-o-meter">
              <Button 
                size="lg" 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg md:text-xl px-6 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Heart className="mr-2 h-5 w-5" />
                Ship-O-Meter
              </Button>
            </Link>
            <Link to="/judgement-quiz">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg md:text-xl px-6 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Brain className="mr-2 h-5 w-5" />
                The Judgement
              </Button>
            </Link>
            <Link to="/polls">
              <Button 
                size="lg" 
                className="bg-neon-purple hover:bg-neon-purple/90 text-white text-lg md:text-xl px-6 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Vote className="mr-2 h-5 w-5" />
                Crowd Verdicts
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-24">
          <div className="bg-card/90 dark:bg-card/70 backdrop-blur-sm border-2 border-primary/30 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="text-5xl mb-4">📸</div>
            <h3 className="text-2xl font-bold mb-3 text-primary">Image Gallery</h3>
            <p className="text-foreground/80 leading-relaxed">
              I come from poison. I have poison inside me, and I destroy everything I touch. That's my legacy.
            </p>
          </div>
          
          <div className="bg-card/90 dark:bg-card/70 backdrop-blur-sm border-2 border-secondary/30 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-2xl font-bold mb-3 text-secondary">Tier Lists</h3>
            <p className="text-foreground/80 leading-relaxed">
              I looooooove chocolate, but it will literally kill me!!!!!!
            </p>
          </div>
          
          <div className="bg-card/90 dark:bg-card/70 backdrop-blur-sm border-2 border-accent/30 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="text-5xl mb-4">🧠</div>
            <h3 className="text-2xl font-bold mb-3 text-accent">Rate Everything</h3>
            <p className="text-foreground/80 leading-relaxed">
              I don't understand how people live. It's amazing to me that people wake up every morning and say: "Yeah! Another day, let's do it!"
            </p>
          </div>
        </div>

        {/* Quote section */}
        <div className="mt-20 text-center">
          <div className="inline-block bg-card/80 dark:bg-card/60 backdrop-blur-sm rounded-full px-8 py-4 border border-border">
            <p className="text-lg font-medium text-foreground/90">
              ✨ Liquor before beer, never fear — don't do heroin ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
