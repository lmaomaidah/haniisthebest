import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Image, TrendingUp, Heart, Brain, Vote } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";

const Index = () => {
  return <div className="min-h-screen relative overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserMenu />
        <ThemeToggle />
      </div>
      
      {/* Floating emoji decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl animate-float drop-shadow-[0_0_20px_rgba(255,100,150,0.8)]">✨</div>
        <div className="absolute top-20 right-20 text-5xl animate-wiggle drop-shadow-[0_0_20px_rgba(100,200,255,0.8)]">🎨</div>
        <div className="absolute bottom-20 left-20 text-6xl animate-spin-slow drop-shadow-[0_0_20px_rgba(150,255,100,0.8)]">🌟</div>
        <div className="absolute bottom-10 right-10 text-5xl animate-float drop-shadow-[0_0_20px_rgba(255,200,100,0.8)]">🎪</div>
        <div className="absolute top-1/2 left-1/4 text-4xl animate-pulse-glow drop-shadow-[0_0_25px_rgba(200,100,255,0.9)]">💫</div>
        <div className="absolute top-1/3 right-1/3 text-5xl animate-wiggle drop-shadow-[0_0_20px_rgba(255,150,200,0.8)]">🎉</div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center space-y-8 animate-bounce-in">
          <h1 className="text-7xl md:text-9xl font-bold text-gradient animate-pulse-glow drop-shadow-[0_0_30px_rgba(255,100,150,0.5)]">I be Stirring Shi Up</h1>
          <p className="text-3xl md:text-4xl font-bold text-foreground drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">by the minion</p>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto dark:text-foreground/80">The universe is a cruel, uncaring void. The key to being happy isn't a search for meaning; it's to keep yourself busy with unimportant nonsense, and eventually you'll be dead.</p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-6 justify-center pt-8">
            <Link to="/gallery">
              <Button size="lg" className="gradient-pink-blue text-white text-2xl px-8 py-8 rounded-3xl shadow-glow hover:scale-110 transition-transform animate-bounce-in dark:shadow-[0_0_30px_rgba(255,100,150,0.6)]">
                <Image className="mr-3 h-8 w-8" />
                Upload Classmates 📸
              </Button>
            </Link>
            <Link to="/tier-list">
              <Button size="lg" className="gradient-chaos text-white text-2xl px-8 py-8 rounded-3xl shadow-glow hover:scale-110 transition-transform animate-bounce-in dark:shadow-[0_0_30px_rgba(200,100,255,0.6)]" style={{
              animationDelay: "0.1s"
            }}>
                <Star className="mr-3 h-8 w-8" />
                Make Tier List ⭐
              </Button>
            </Link>
            <Link to="/classifications">
              <Button size="lg" className="gradient-chaos text-white text-2xl px-8 py-8 rounded-3xl shadow-glow hover:scale-110 transition-transform animate-bounce-in dark:shadow-[0_0_30px_rgba(100,200,255,0.6)]" style={{
              animationDelay: "0.15s"
            }}>
                <Sparkles className="mr-3 h-8 w-8" />
                Classify 📊
              </Button>
            </Link>
            <Link to="/ratings">
              <Button size="lg" style={{
              animationDelay: "0.2s"
            }} className="bg-lime-green text-2xl px-8 py-8 rounded-3xl shadow-glow hover:scale-110 transition-transform animate-bounce-in dark:shadow-[0_0_30px_rgba(150,255,100,0.6)] text-gray-900">
                <TrendingUp className="mr-3 h-8 w-8" />
                Rate & Rank 🧠
              </Button>
            </Link>
            <Link to="/ship-o-meter">
              <Button size="lg" className="gradient-pink-blue text-white text-2xl px-8 py-8 rounded-3xl shadow-glow hover:scale-110 transition-transform animate-bounce-in dark:shadow-[0_0_30px_rgba(255,100,150,0.6)]" style={{
              animationDelay: "0.25s"
            }}>
                <Heart className="mr-3 h-8 w-8" />
                Ship-O-Meter 💕
              </Button>
            </Link>
            <Link to="/judgement-quiz">
              <Button size="lg" style={{
              animationDelay: "0.3s"
            }} className="bg-lime-green text-2xl px-8 py-8 rounded-3xl shadow-glow hover:scale-110 transition-transform animate-bounce-in dark:shadow-[0_0_30px_rgba(150,255,100,0.6)] text-gray-900">
                <Brain className="mr-3 h-8 w-8" />
                The Judgement 🔮
              </Button>
            </Link>
            <Link to="/polls">
              <Button size="lg" style={{
              animationDelay: "0.35s"
            }} className="gradient-chaos text-white text-2xl px-8 py-8 rounded-3xl shadow-glow hover:scale-110 transition-transform animate-bounce-in dark:shadow-[0_0_30px_rgba(255,150,100,0.6)]">
                <Vote className="mr-3 h-8 w-8" />
                Crowd Verdicts 🗳️
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-4 border-primary rounded-3xl p-8 shadow-bounce hover:scale-105 transition-transform dark:shadow-[0_0_25px_rgba(255,100,150,0.3)]">
            <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(255,100,150,0.8)]">📸</div>
            <h3 className="text-2xl font-bold mb-3 text-primary dark:drop-shadow-[0_0_10px_rgba(255,100,150,0.6)]">Image Gallery</h3>
            <p className="text-lg text-foreground/90">I come from poison. I have poison inside me, and I destroy everything I touch. That's my legacy.</p>
          </div>
          
          <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-4 border-secondary rounded-3xl p-8 shadow-bounce hover:scale-105 transition-transform dark:shadow-[0_0_25px_rgba(100,200,255,0.3)]">
            <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(100,200,255,0.8)]">⭐</div>
            <h3 className="text-2xl font-bold mb-3 text-secondary dark:drop-shadow-[0_0_10px_rgba(100,200,255,0.6)]">Tier Lists</h3>
            <p className="text-lg text-foreground/90">I looooooove chocolate, but it will literally kill me!!!!!!</p>
          </div>
          
          <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-4 rounded-3xl p-8 shadow-bounce hover:scale-105 transition-transform dark:shadow-[0_0_25px_rgba(255,200,100,0.3)] border-pink-700">
            <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(255,200,100,0.8)]">🧠</div>
            <h3 className="text-2xl font-bold mb-3 text-accent dark:drop-shadow-[0_0_10px_rgba(255,200,100,0.6)]">Rate Everything</h3>
            <p className="text-lg text-foreground/90">I don't understand how people live. It's amazing to me that people wake up every morning and say: "Yeah! Another day, let's do it!"</p>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="mt-20 text-center space-y-4">
          <p className="text-2xl font-bold gradient-rainbow bg-clip-text p-4 rounded-3xl inline-block dark:drop-shadow-[0_0_20px_rgba(255,100,150,0.5)] text-gray-900 bg-neon-blue">
            Liquor before beer, never fear- don’t do heroin
          </p>
        </div>
      </div>
    </div>;
};
export default Index;