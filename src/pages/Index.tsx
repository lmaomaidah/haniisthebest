import { Link } from "react-router-dom";
import { Sparkles, Star, Image, TrendingUp, Heart, Brain, Vote, Pin, Trophy } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import Marquee from "@/components/Marquee";
import { motion } from "framer-motion";

const navItems = [
  { to: "/gallery", icon: <Image className="h-5 w-5" />, label: "Upload Classmates" },
  { to: "/tier-list", icon: <Star className="h-5 w-5" />, label: "Tier List" },
  { to: "/classifications", icon: <Sparkles className="h-5 w-5" />, label: "Classify" },
  { to: "/ratings", icon: <TrendingUp className="h-5 w-5" />, label: "Rate & Rank" },
  { to: "/ship-o-meter", icon: <Heart className="h-5 w-5" />, label: "Ship-O-Meter" },
  { to: "/judgement-quiz", icon: <Brain className="h-5 w-5" />, label: "The Judgement" },
  { to: "/polls", icon: <Vote className="h-5 w-5" />, label: "Crowd Verdicts" },
  { to: "/profiles", icon: <Pin className="h-5 w-5" />, label: "Shrine Wall" },
  { to: "/leaderboard", icon: <Trophy className="h-5 w-5" />, label: "Leaderboard" },
];

const Index = () => {
  const count = navItems.length;
  const orbitRadiusPercent = 37;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Marquee />
      <WhimsicalBackground />

      <div className="container mx-auto px-4 relative z-10">
        <PageHeader title="" showHome={false} />

        <div className="text-center space-y-6 animate-fade-in py-8">
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

          {/* Circular Navigation */}
          <div className="pt-12 pb-8 flex justify-center">
            <div className="relative w-[360px] h-[360px] md:w-[440px] md:h-[440px]">
              {/* Center decoration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-3xl md:text-4xl">👑</span>
                </div>
              </div>

              {/* Orbit ring */}
              <div className="absolute inset-[15%] rounded-full border border-dashed border-primary/15" />

              {/* Nav items in circle */}
              {navItems.map((item, i) => {
                const angle = (i * 360) / count - 90;
                const radAngle = (angle * Math.PI) / 180;
                const xMobile = Math.cos(radAngle) * radiusMobile;
                const yMobile = Math.sin(radAngle) * radiusMobile;
                const xDesktop = Math.cos(radAngle) * radius;
                const yDesktop = Math.sin(radAngle) * radius;

                return (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06, type: "spring", stiffness: 200 }}
                    className="absolute"
                    style={
                      {
                        "--x-mobile": `${xMobile}px`,
                        "--y-mobile": `${yMobile}px`,
                        "--x-desktop": `${xDesktop}px`,
                        "--y-desktop": `${yDesktop}px`,
                        left: `calc(50% + var(--x-pos))`,
                        top: `calc(50% + var(--y-pos))`,
                        transform: "translate(-50%, -50%)",
                      } as React.CSSProperties
                    }
                  >
                    <Link to={item.to} className="group block">
                      <div className="relative flex flex-col items-center gap-1">
                        <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-card border border-border hover:border-primary/50 flex items-center justify-center shadow-md group-hover:shadow-[0_4px_20px_hsl(var(--primary)/0.2)] transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 active:scale-95">
                          <span className="text-primary">{item.icon}</span>
                        </div>
                        <span className="text-[10px] md:text-xs font-semibold text-foreground/80 whitespace-nowrap max-w-[80px] truncate text-center">
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}

              <style>{`
                .relative > .absolute {
                  --x-pos: var(--x-mobile);
                  --y-pos: var(--y-mobile);
                }
                @media (min-width: 768px) {
                  .relative > .absolute {
                    --x-pos: var(--x-desktop);
                    --y-pos: var(--y-desktop);
                  }
                }
              `}</style>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
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
