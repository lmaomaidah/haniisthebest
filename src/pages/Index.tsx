import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Image, TrendingUp, Heart, Brain, Vote, Pin } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import Marquee from "@/components/Marquee";

const navItems = [
  { to: "/gallery", icon: <Image className="h-6 w-6" />, label: "Upload Classmates", gradient: "from-card to-card/80 border-foreground/20", textClass: "text-foreground" },
  { to: "/tier-list", icon: <Star className="h-6 w-6" />, label: "Make Tier List", gradient: "from-primary to-secondary", textClass: "text-primary-foreground" },
  { to: "/classifications", icon: <Sparkles className="h-6 w-6" />, label: "Classify", gradient: "from-secondary to-accent", textClass: "text-primary-foreground" },
  { to: "/ratings", icon: <TrendingUp className="h-6 w-6" />, label: "Rate & Rank", gradient: "from-accent to-primary", textClass: "text-primary-foreground" },
  { to: "/ship-o-meter", icon: <Heart className="h-6 w-6" />, label: "Ship-O-Meter", gradient: "from-secondary to-primary", textClass: "text-primary-foreground" },
  { to: "/judgement-quiz", icon: <Brain className="h-6 w-6" />, label: "The Judgement", gradient: "from-accent to-secondary", textClass: "text-primary-foreground" },
  { to: "/polls", icon: <Vote className="h-6 w-6" />, label: "Crowd Verdicts", gradient: "from-primary to-accent", textClass: "text-primary-foreground" },
  { to: "/profiles", icon: <Pin className="h-6 w-6" />, label: "Shrine Wall", gradient: "from-secondary to-accent", textClass: "text-primary-foreground" },
];

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Marquee />
      <WhimsicalBackground />

      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserMenu />
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center space-y-6 animate-fade-in">
          <p className="text-lg md:text-xl font-medium text-foreground/70 tracking-widest uppercase">
            Welcome to the chaos
          </p>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold leading-tight">
            <span className="text-gradient">Kingstop{"\n"}Fanclub</span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground/80 font-medium">by the minion</p>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The universe is a cruel, uncaring void. The key to being happy isn't a search for meaning;
            it's to keep yourself busy with unimportant nonsense, and eventually you'll be dead.
          </p>

          {/* Navigation Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className="group">
                <div className={`relative bg-gradient-to-br ${item.gradient} rounded-2xl p-5 border border-border/30 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.25)] active:scale-95`}>
                  {/* Shimmer on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <div className="relative flex flex-col items-center gap-3 text-center">
                    <div className="h-12 w-12 rounded-xl bg-background/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <span className={`font-bold text-sm ${item.textClass}`}>{item.label}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-24">
          {[
            { emoji: "📸", title: "Image Gallery", desc: "I come from poison. I have poison inside me, and I destroy everything I touch. That's my legacy.", border: "border-primary/40", titleColor: "text-primary" },
            { emoji: "⭐", title: "Tier Lists", desc: "I looooooove chocolate, but it will literally kill me!!!!!!", border: "border-secondary/40", titleColor: "text-secondary" },
            { emoji: "🧠", title: "Rate Everything", desc: "I don't understand how people live. It's amazing to me that people wake up every morning and say: \"Yeah! Another day, let's do it!\"", border: "border-accent/40", titleColor: "text-accent" },
          ].map((card) => (
            <div key={card.title} className={`group bg-card/80 backdrop-blur-sm border-2 ${card.border} rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300`}>
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{card.emoji}</div>
              <h3 className={`text-2xl font-bold mb-3 ${card.titleColor}`}>{card.title}</h3>
              <p className="text-foreground/70 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="inline-block bg-card/70 backdrop-blur-sm rounded-full px-8 py-4 border border-border hover:border-primary/50 transition-colors duration-300">
            <p className="text-lg font-medium text-foreground/80">
              ✨ Liquor before beer, never fear — don't do heroin ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
