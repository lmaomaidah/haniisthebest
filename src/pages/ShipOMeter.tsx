import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLink } from "@/components/NavLink";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Sparkles, ArrowLeft } from "lucide-react";

interface ImageType {
  id: string;
  name: string;
  image_url: string | null;
}

interface TraitSlider {
  id: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
}

const defaultTraits: TraitSlider[] = [
  { id: "memes", leftLabel: "Sends cute stuff", rightLabel: "Sends cursed memes", value: 50 },
  { id: "conflict", leftLabel: "Argues for fun", rightLabel: "Conflict averse", value: 50 },
  { id: "food", leftLabel: "Shares food", rightLabel: "Steals food", value: 50 },
  { id: "vibe", leftLabel: "Completely feral", rightLabel: '"Mom" friend', value: 50 },
  { id: "emotional", leftLabel: "Shoulder to cry on", rightLabel: "Always crying", value: 50 },
  { id: "social", leftLabel: "Introvert", rightLabel: "Extrovert", value: 50 },
  { id: "communication", leftLabel: "Ghosts", rightLabel: "Overshares", value: 50 },
  { id: "friends", leftLabel: "Many friend circles", rightLabel: "Loner", value: 50 },
  { id: "affection", leftLabel: "Words of affirmation", rightLabel: "Acts of service", value: 50 },
  { id: "gossip", leftLabel: "Constant gossip", rightLabel: "Deep discussions", value: 50 },
  { id: "charisma", leftLabel: "Charismatic", rightLabel: "Awkward mess", value: 50 },
  { id: "nicknames", leftLabel: "No nicknames", rightLabel: "Nicknames for everyone", value: 50 },
];

const ShipOMeter = () => {
  const [images, setImages] = useState<ImageType[]>([]);
  const [person1, setPerson1] = useState<ImageType | null>(null);
  const [person2, setPerson2] = useState<ImageType | null>(null);
  const [person1Traits, setPerson1Traits] = useState<TraitSlider[]>(defaultTraits);
  const [person2Traits, setPerson2Traits] = useState<TraitSlider[]>(defaultTraits);
  const [compatibility, setCompatibility] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Meters
  const [physicalAffection, setPhysicalAffection] = useState([50, 50]);
  const [giftGiving, setGiftGiving] = useState([50, 50]);
  const [adventurousness, setAdventurousness] = useState([50, 50]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data } = await supabase.from("images").select("*").order("created_at", { ascending: false });
    if (data) setImages(data);
  };

  const calculateCompatibility = () => {
    let totalDiff = 0;
    let count = 0;

    // Calculate trait compatibility (closer values = higher compatibility)
    person1Traits.forEach((trait, i) => {
      const diff = Math.abs(trait.value - person2Traits[i].value);
      totalDiff += diff;
      count++;
    });

    // Add meter comparisons
    totalDiff += Math.abs(physicalAffection[0] - physicalAffection[1]);
    totalDiff += Math.abs(giftGiving[0] - giftGiving[1]);
    totalDiff += Math.abs(adventurousness[0] - adventurousness[1]);
    count += 3;

    // Convert to compatibility percentage (0 diff = 100%, 100 diff = 0%)
    const avgDiff = totalDiff / count;
    const compatPercent = Math.round(100 - avgDiff);
    
    setCompatibility(compatPercent);
    setShowResult(true);
  };

  const getCompatibilityMessage = (score: number) => {
    if (score >= 90) return { text: "SOULMATES! 💕", color: "text-pink-400" };
    if (score >= 75) return { text: "Power Couple Energy! ⚡", color: "text-primary" };
    if (score >= 60) return { text: "Cute Match! 🥰", color: "text-secondary" };
    if (score >= 45) return { text: "It's Complicated... 🤔", color: "text-yellow-400" };
    if (score >= 30) return { text: "Enemies to Lovers Arc? 😏", color: "text-orange-400" };
    return { text: "Chaos Ship! 🔥", color: "text-destructive" };
  };

  const updateTrait = (personNum: 1 | 2, traitId: string, value: number) => {
    const setter = personNum === 1 ? setPerson1Traits : setPerson2Traits;
    setter(prev => prev.map(t => t.id === traitId ? { ...t, value } : t));
  };

  const PersonCard = ({ person, setPerson, label }: { person: ImageType | null; setPerson: (p: ImageType | null) => void; label: string }) => (
    <div className="bg-card/50 backdrop-blur border-4 border-primary/30 rounded-3xl p-6 space-y-4">
      <h3 className="text-xl font-bold text-center text-primary">{label}</h3>
      
      {person ? (
        <div className="flex flex-col items-center gap-4">
          {person.image_url ? (
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-primary shadow-glow">
              <img src={person.image_url} alt={person.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl px-6 py-4 border-4 border-primary shadow-glow">
              <p className="text-lg font-bold text-primary-foreground">{person.name}</p>
            </div>
          )}
          <p className="text-xl font-bold">{person.name}</p>
          <Button variant="outline" size="sm" onClick={() => setPerson(null)}>
            Change
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {images.map(img => (
            <button
              key={img.id}
              onClick={() => setPerson(img)}
              className="p-2 rounded-xl hover:bg-primary/20 transition-colors"
            >
              {img.image_url ? (
                <img src={img.image_url} alt={img.name} className="w-12 h-12 rounded-lg object-cover mx-auto" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {img.name.slice(0, 2)}
                </div>
              )}
              <p className="text-xs mt-1 truncate">{img.name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const VerticalMeter = ({ label, values, setValues }: { label: string; values: number[]; setValues: (v: number[]) => void }) => (
    <div className="bg-card/30 rounded-2xl p-4 space-y-3">
      <p className="text-sm font-bold text-center">{label}</p>
      <div className="flex gap-4 justify-center">
        {[0, 1].map(i => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">P{i + 1}</span>
            <div className="h-32 w-8 bg-muted rounded-full overflow-hidden relative">
              <div 
                className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-secondary transition-all"
                style={{ height: `${values[i]}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={values[i]}
              onChange={(e) => {
                const newVals = [...values];
                newVals[i] = parseInt(e.target.value);
                setValues(newVals);
              }}
              className="w-8 h-24 appearance-none cursor-pointer [writing-mode:vertical-lr] [direction:rtl] accent-primary"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="container mx-auto max-w-6xl">
        {/* Navigation */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" className="rounded-2xl">
              <ArrowLeft className="mr-2 h-4 w-4" /> Home
            </Button>
          </Link>
          <NavLink to="/gallery">Gallery</NavLink>
          <NavLink to="/tier-list">Tier List</NavLink>
          <NavLink to="/ratings">Ratings</NavLink>
          <NavLink to="/venn-diagram">Venn</NavLink>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-7xl font-bold text-gradient animate-pulse-glow flex items-center justify-center gap-4">
            <Heart className="text-pink-400 animate-pulse" />
            Ship-O-Meter
            <Heart className="text-pink-400 animate-pulse" />
          </h1>
          <p className="text-xl text-muted-foreground mt-2">Find out if your ship is canon! 💕</p>
        </div>

        {/* Person Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <PersonCard person={person1} setPerson={setPerson1} label="Person 1 💜" />
          <PersonCard person={person2} setPerson={setPerson2} label="Person 2 💙" />
        </div>

        {person1 && person2 && (
          <>
            {/* Trait Sliders */}
            <div className="bg-card/30 backdrop-blur border-4 border-secondary/30 rounded-3xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-secondary">
                ✨ Personality Traits ✨
              </h2>
              
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                {defaultTraits.map((trait) => (
                  <div key={trait.id} className="space-y-4">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-primary">{trait.leftLabel}</span>
                      <span className="text-accent">{trait.rightLabel}</span>
                    </div>
                    
                    {/* Person 1 slider */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs w-6 text-pink-400">P1</span>
                      <Slider
                        value={[person1Traits.find(t => t.id === trait.id)?.value || 50]}
                        onValueChange={([v]) => updateTrait(1, trait.id, v)}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                    </div>
                    
                    {/* Person 2 slider */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs w-6 text-blue-400">P2</span>
                      <Slider
                        value={[person2Traits.find(t => t.id === trait.id)?.value || 50]}
                        onValueChange={([v]) => updateTrait(2, trait.id, v)}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meters */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              <VerticalMeter label="Physical Affection 🤗" values={physicalAffection} setValues={setPhysicalAffection} />
              <VerticalMeter label="Gift-Giving 🎁" values={giftGiving} setValues={setGiftGiving} />
              <VerticalMeter label="Adventurousness 🏔️" values={adventurousness} setValues={setAdventurousness} />
            </div>

            {/* Calculate Button */}
            <div className="text-center mb-10">
              <Button
                onClick={calculateCompatibility}
                size="lg"
                className="gradient-pink-blue text-white text-2xl px-12 py-8 rounded-3xl shadow-glow hover:scale-110 transition-transform"
              >
                <Sparkles className="mr-3 h-8 w-8" />
                Calculate Compatibility! 💕
              </Button>
            </div>

            {/* Result */}
            {showResult && compatibility !== null && (
              <div className="bg-card/50 backdrop-blur border-4 border-pink-400/50 rounded-3xl p-8 text-center animate-bounce-in">
                <h2 className="text-3xl font-bold mb-4">
                  {person1.name} x {person2.name}
                </h2>
                
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-8 border-muted" />
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-pink-400 transition-all duration-1000"
                    style={{ 
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(compatibility / 100 * 2 * Math.PI)}% ${50 - 50 * Math.cos(compatibility / 100 * 2 * Math.PI)}%, 50% 50%)`,
                      background: `conic-gradient(from 0deg, hsl(var(--primary)) ${compatibility}%, transparent ${compatibility}%)`
                    }}
                  />
                  <div className="absolute inset-4 rounded-full bg-card flex items-center justify-center">
                    <span className="text-5xl font-bold text-gradient">{compatibility}%</span>
                  </div>
                </div>

                <p className={`text-3xl font-bold ${getCompatibilityMessage(compatibility).color}`}>
                  {getCompatibilityMessage(compatibility).text}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShipOMeter;
