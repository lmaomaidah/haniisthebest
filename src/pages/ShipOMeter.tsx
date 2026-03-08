import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Heart,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Flame,
  MessageCircle,
  Shield,
  Compass,
} from "lucide-react";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import { withSignedClassmateImageUrls } from "@/lib/classmateImages";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useCategories, fetchAllImageCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { CommentSection } from "@/components/CommentSection";

interface ImageType {
  id: string;
  name: string;
  image_url: string | null;
}

type AffinityStyle = "similar" | "complement" | "balanced";
type DimensionKey = "chemistry" | "communication" | "stability" | "adventure";

interface TraitDefinition {
  id: string;
  leftLabel: string;
  rightLabel: string;
  weight: number;
  affinity: AffinityStyle;
  dimension: DimensionKey;
}

interface TraitSlider extends TraitDefinition {
  value: number;
}

interface CompatibilityAnalysis {
  overall: number;
  breakdown: Record<DimensionKey, number>;
  strengths: string[];
  challenges: string[];
}

const traitDefinitions: TraitDefinition[] = [
  {
    id: "memes",
    leftLabel: "Sends cute stuff",
    rightLabel: "Sends cursed memes",
    weight: 0.9,
    affinity: "complement",
    dimension: "chemistry",
  },
  {
    id: "conflict",
    leftLabel: "Argues for fun",
    rightLabel: "Conflict averse",
    weight: 1,
    affinity: "balanced",
    dimension: "communication",
  },
  {
    id: "food",
    leftLabel: "Shares food",
    rightLabel: "Steals food",
    weight: 0.8,
    affinity: "similar",
    dimension: "stability",
  },
  {
    id: "vibe",
    leftLabel: "Completely feral",
    rightLabel: '"Mom" friend',
    weight: 1.1,
    affinity: "complement",
    dimension: "adventure",
  },
  {
    id: "emotional",
    leftLabel: "Shoulder to cry on",
    rightLabel: "Always crying",
    weight: 1.1,
    affinity: "balanced",
    dimension: "stability",
  },
  {
    id: "social",
    leftLabel: "Introvert",
    rightLabel: "Extrovert",
    weight: 1,
    affinity: "complement",
    dimension: "adventure",
  },
  {
    id: "communication",
    leftLabel: "Ghosts",
    rightLabel: "Overshares",
    weight: 1.2,
    affinity: "balanced",
    dimension: "communication",
  },
  {
    id: "friends",
    leftLabel: "Many friend circles",
    rightLabel: "Loner",
    weight: 0.9,
    affinity: "complement",
    dimension: "stability",
  },
  {
    id: "affection",
    leftLabel: "Words of affirmation",
    rightLabel: "Acts of service",
    weight: 1,
    affinity: "complement",
    dimension: "chemistry",
  },
  {
    id: "gossip",
    leftLabel: "Constant gossip",
    rightLabel: "Deep discussions",
    weight: 0.9,
    affinity: "similar",
    dimension: "communication",
  },
  {
    id: "charisma",
    leftLabel: "Charismatic",
    rightLabel: "Awkward mess",
    weight: 1.1,
    affinity: "similar",
    dimension: "chemistry",
  },
  {
    id: "nicknames",
    leftLabel: "No nicknames",
    rightLabel: "Nicknames for everyone",
    weight: 0.8,
    affinity: "complement",
    dimension: "chemistry",
  },
];

const dimensionLabels: Record<DimensionKey, string> = {
  chemistry: "Chemistry",
  communication: "Communication",
  stability: "Stability",
  adventure: "Adventure",
};

const createDefaultTraits = (): TraitSlider[] =>
  traitDefinitions.map((trait) => ({ ...trait, value: 50 }));

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

const weightedAverage = (items: Array<{ score: number; weight: number }>) => {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return 0;
  const weightedSum = items.reduce((sum, item) => sum + item.score * item.weight, 0);
  return weightedSum / totalWeight;
};

const getTraitValue = (traits: TraitSlider[], traitId: string): number =>
  traits.find((trait) => trait.id === traitId)?.value ?? 50;

const getTraitPairScore = (trait: TraitDefinition, value1: number, value2: number) => {
  const diff = Math.abs(value1 - value2);

  if (trait.affinity === "similar") {
    return clamp(100 - diff, 0, 100);
  }

  if (trait.affinity === "complement") {
    const idealComplementGap = 35;
    return clamp(100 - Math.abs(diff - idealComplementGap) * 2, 0, 100);
  }

  const syncScore = 100 - diff;
  const centerDistance = (Math.abs(value1 - 50) + Math.abs(value2 - 50)) / 2;
  const centerScore = 100 - centerDistance * 2;
  return clamp(syncScore * 0.55 + centerScore * 0.45, 0, 100);
};

const getMeterScore = (values: number[], targetIntensity: number) => {
  const syncScore = 100 - Math.abs(values[0] - values[1]);
  const combinedIntensity = (values[0] + values[1]) / 2;
  const intensityScore = 100 - Math.abs(combinedIntensity - targetIntensity) * 2;
  return clamp(Math.round(syncScore * 0.68 + intensityScore * 0.32), 0, 100);
};

const buildCompatibilityAnalysis = (
  person1Traits: TraitSlider[],
  person2Traits: TraitSlider[],
  physicalAffection: number[],
  giftGiving: number[],
  adventurousness: number[]
): CompatibilityAnalysis => {
  const byDimension: Record<DimensionKey, Array<{ score: number; weight: number }>> = {
    chemistry: [],
    communication: [],
    stability: [],
    adventure: [],
  };

  traitDefinitions.forEach((trait) => {
    const value1 = getTraitValue(person1Traits, trait.id);
    const value2 = getTraitValue(person2Traits, trait.id);
    const score = getTraitPairScore(trait, value1, value2);

    byDimension[trait.dimension].push({ score, weight: trait.weight });
  });

  byDimension.chemistry.push({
    score: getMeterScore(physicalAffection, 72),
    weight: 1.35,
  });
  byDimension.chemistry.push({
    score: getMeterScore(giftGiving, 58),
    weight: 0.75,
  });
  byDimension.adventure.push({
    score: getMeterScore(adventurousness, 64),
    weight: 1.3,
  });
  byDimension.stability.push({
    score: getMeterScore(giftGiving, 48),
    weight: 0.7,
  });

  const chemistry = Math.round(weightedAverage(byDimension.chemistry));
  const communication = Math.round(weightedAverage(byDimension.communication));
  const stability = Math.round(weightedAverage(byDimension.stability));
  const adventure = Math.round(weightedAverage(byDimension.adventure));

  const breakdown = {
    chemistry,
    communication,
    stability,
    adventure,
  };

  const values = Object.values(breakdown);
  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));
  const standardDeviation = Math.sqrt(variance);
  const consistencyBonus = clamp(100 - standardDeviation * 2.2, 35, 100);

  const weightedCore =
    chemistry * 0.34 + communication * 0.24 + stability * 0.23 + adventure * 0.19;

  const overall = clamp(
    Math.round(weightedCore * 0.9 + consistencyBonus * 0.1),
    0,
    100
  );

  const rankedDimensions = (Object.entries(breakdown) as Array<[DimensionKey, number]>).sort(
    (a, b) => b[1] - a[1]
  );

  const strengths = rankedDimensions
    .slice(0, 2)
    .map(([key]) => dimensionLabels[key]);

  const challenges = rankedDimensions
    .slice(-2)
    .reverse()
    .map(([key]) => dimensionLabels[key]);

  return { overall, breakdown, strengths, challenges };
};

const getCompatibilityMessage = (score: number) => {
  if (score >= 90) {
    return {
      title: "Legendary Pair",
      subtitle: "This is elite chemistry with almost no weak lanes.",
      toneClass: "text-primary",
    };
  }

  if (score >= 75) {
    return {
      title: "Power Couple Energy",
      subtitle: "Great flow, strong communication, and very high upside.",
      toneClass: "text-accent",
    };
  }

  if (score >= 60) {
    return {
      title: "Solid Match",
      subtitle: "Strong baseline with a couple of dimensions to refine.",
      toneClass: "text-foreground",
    };
  }

  if (score >= 45) {
    return {
      title: "Work In Progress",
      subtitle: "Some alignment exists, but core habits still clash.",
      toneClass: "text-muted-foreground",
    };
  }

  return {
    title: "Chaotic Orbit",
    subtitle: "High friction. You’d need serious effort to stabilize this.",
    toneClass: "text-destructive",
  };
};

const ShipOMeter = () => {
  const { logActivity, user } = useAuth();
  const { toast } = useToast();
  const [allImages, setAllImages] = useState<ImageType[]>([]);
  const [images, setImages] = useState<ImageType[]>([]);
  const [person1, setPerson1] = useState<ImageType | null>(null);
  const [person2, setPerson2] = useState<ImageType | null>(null);
  const [person1Traits, setPerson1Traits] = useState<TraitSlider[]>(createDefaultTraits);
  const [person2Traits, setPerson2Traits] = useState<TraitSlider[]>(createDefaultTraits);
  const [compatibility, setCompatibility] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<CompatibilityAnalysis | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [imageCategoryMap, setImageCategoryMap] = useState<Record<string, string[]>>({});
  const { categories, createCategory, renameCategory, deleteCategory } = useCategories();

  const [physicalAffection, setPhysicalAffection] = useState([50, 50]);
  const [giftGiving, setGiftGiving] = useState([50, 50]);
  const [adventurousness, setAdventurousness] = useState([50, 50]);

  useEffect(() => {
    void fetchImages();
    void loadCategoryMap();
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

  const fetchImages = async () => {
    const { data } = await supabase
      .from("images")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10000);

    if (data) {
      const signedImages = await withSignedClassmateImageUrls(data);
      setAllImages(signedImages);
      setImages(signedImages);
    }
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

  const resetShipOMeter = () => {
    setPerson1(null);
    setPerson2(null);
    setPerson1Traits(createDefaultTraits());
    setPerson2Traits(createDefaultTraits());
    setPhysicalAffection([50, 50]);
    setGiftGiving([50, 50]);
    setAdventurousness([50, 50]);
    setCompatibility(null);
    setAnalysis(null);
    setShowResult(false);
  };

  const calculateCompatibility = () => {
    if (!person1 || !person2) return;

    const result = buildCompatibilityAnalysis(
      person1Traits,
      person2Traits,
      physicalAffection,
      giftGiving,
      adventurousness
    );

    setCompatibility(result.overall);
    setAnalysis(result);
    setShowResult(true);

    void logActivity("ship_calculate", {
      person1: person1.name,
      person2: person2.name,
      score: result.overall,
      breakdown: result.breakdown,
      strengths: result.strengths,
      challenges: result.challenges,
    });
  };

  const updateTrait = (personNum: 1 | 2, traitId: string, value: number) => {
    const setter = personNum === 1 ? setPerson1Traits : setPerson2Traits;
    setter((prev) => prev.map((trait) => (trait.id === traitId ? { ...trait, value } : trait)));
  };

  const PersonCard = ({
    person,
    setPerson,
    label,
  }: {
    person: ImageType | null;
    setPerson: (person: ImageType | null) => void;
    label: string;
  }) => (
    <section className="bg-card/65 backdrop-blur border border-primary/25 rounded-3xl p-6 space-y-4 shadow-md">
      <h3 className="text-lg font-semibold text-center text-foreground">{label}</h3>

      {person ? (
        <div className="flex flex-col items-center gap-4">
          {person.image_url ? (
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-glow">
              <img
                src={person.image_url}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="rounded-2xl px-6 py-4 border-2 border-primary/40 bg-primary/20">
              <p className="text-lg font-bold text-primary">{person.name}</p>
            </div>
          )}

          <p className="text-xl font-bold text-foreground">{person.name}</p>
          <Button variant="outline" size="sm" onClick={() => setPerson(null)}>
            Change
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
          {images.map((image) => (
            <button
              key={image.id}
              onClick={() => setPerson(image)}
              className="p-2 rounded-xl hover:bg-primary/15 transition-colors"
            >
              {image.image_url ? (
                <img
                  src={image.image_url}
                  alt={image.name}
                  className="w-12 h-12 rounded-lg object-cover mx-auto"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary mx-auto">
                  {image.name.slice(0, 2)}
                </div>
              )}
              <p className="text-xs mt-1 truncate text-foreground">{image.name}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );

  const VerticalMeter = ({
    label,
    values,
    setValues,
  }: {
    label: string;
    values: number[];
    setValues: (values: number[]) => void;
  }) => (
    <div className="bg-card/55 border border-border rounded-2xl p-4 space-y-3">
      <p className="text-sm font-semibold text-center text-foreground">{label}</p>
      <div className="flex gap-4 justify-center">
        {[0, 1].map((index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">P{index + 1}</span>
            <div className="h-32 w-8 bg-muted rounded-full overflow-hidden relative border border-border/60">
              <div
                className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-accent transition-all"
                style={{ height: `${values[index]}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={values[index]}
              onChange={(event) => {
                const next = [...values];
                next[index] = Number(event.target.value);
                setValues(next);
              }}
              className="w-8 h-24 appearance-none cursor-pointer [writing-mode:vertical-lr] [direction:rtl] accent-primary"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const message = compatibility !== null ? getCompatibilityMessage(compatibility) : null;

  return (
    <div className="min-h-screen py-8 px-4 relative">
      <WhimsicalBackground />

      <div className="container mx-auto max-w-6xl relative z-10">
        <PageHeader
          title="💕 Ship-O-Meter"
          subtitle="Advanced compatibility engine with personality vectors and dimension analysis."
          actions={
            <Button onClick={resetShipOMeter} variant="outline" size="sm" className="rounded-xl border-2 border-destructive/50">
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
            </Button>
          }
        />

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <PersonCard person={person1} setPerson={setPerson1} label="Person 1" />
          <PersonCard person={person2} setPerson={setPerson2} label="Person 2" />
        </div>

        {person1 && person2 && (
          <>
            <section className="backdrop-blur border border-secondary/30 rounded-3xl p-6 mb-8 bg-card/60">
              <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
                Personality Vector Map
              </h2>

              <div className="grid md:grid-cols-2 gap-5">
                {traitDefinitions.map((trait) => {
                  const p1Value = getTraitValue(person1Traits, trait.id);
                  const p2Value = getTraitValue(person2Traits, trait.id);

                  return (
                    <div key={trait.id} className="space-y-3 rounded-2xl border border-border/70 p-4 bg-background/35">
                      <div className="flex justify-between text-xs md:text-sm font-medium gap-2">
                        <span className="text-primary">{trait.leftLabel}</span>
                        <span className="text-accent text-right">{trait.rightLabel}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] w-7 text-muted-foreground">P1</span>
                        <Slider
                          value={[p1Value]}
                          onValueChange={([value]) => updateTrait(1, trait.id, value)}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-[11px] w-8 text-right text-foreground">{p1Value}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] w-7 text-muted-foreground">P2</span>
                        <Slider
                          value={[p2Value]}
                          onValueChange={([value]) => updateTrait(2, trait.id, value)}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-[11px] w-8 text-right text-foreground">{p2Value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <VerticalMeter
                label="Physical Affection"
                values={physicalAffection}
                setValues={setPhysicalAffection}
              />
              <VerticalMeter label="Gift Giving" values={giftGiving} setValues={setGiftGiving} />
              <VerticalMeter
                label="Adventurousness"
                values={adventurousness}
                setValues={setAdventurousness}
              />
            </section>

            <div className="text-center mb-10">
              <Button
                onClick={calculateCompatibility}
                size="lg"
                className="rounded-3xl px-10 py-7 text-lg bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground shadow-glow hover:opacity-90"
              >
                <Sparkles className="mr-3 h-6 w-6" />
                Calculate Advanced Compatibility
              </Button>
            </div>

            {showResult && compatibility !== null && analysis && message && (
              <section className="bg-card/65 backdrop-blur border border-primary/35 rounded-3xl p-6 md:p-8 animate-bounce-in">
                <h2 className="text-3xl font-bold text-center mb-2 text-foreground">
                  {person1.name} × {person2.name}
                </h2>

                <p className={`text-center text-lg md:text-xl font-semibold mb-6 ${message.toneClass}`}>
                  {message.title}
                </p>

                <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
                  <div className="mx-auto">
                    <div className="relative h-52 w-52">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(hsl(var(--primary)) ${compatibility}%, hsl(var(--muted)) ${compatibility}% 100%)`,
                        }}
                      />
                      <div className="absolute inset-4 rounded-full bg-card border border-border flex items-center justify-center flex-col">
                        <span className="text-5xl font-bold text-gradient">{compatibility}%</span>
                        <span className="text-xs text-muted-foreground mt-1">Overall score</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <p className="text-sm md:text-base text-muted-foreground">{message.subtitle}</p>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="inline-flex items-center gap-2"><Flame className="h-4 w-4 text-primary" /> Chemistry</span>
                          <span>{analysis.breakdown.chemistry}</span>
                        </div>
                        <Progress value={analysis.breakdown.chemistry} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary" /> Communication</span>
                          <span>{analysis.breakdown.communication}</span>
                        </div>
                        <Progress value={analysis.breakdown.communication} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="inline-flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Stability</span>
                          <span>{analysis.breakdown.stability}</span>
                        </div>
                        <Progress value={analysis.breakdown.stability} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="inline-flex items-center gap-2"><Compass className="h-4 w-4 text-primary" /> Adventure</span>
                          <span>{analysis.breakdown.adventure}</span>
                        </div>
                        <Progress value={analysis.breakdown.adventure} className="h-2" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 pt-2">
                      <div className="rounded-xl border border-primary/25 bg-primary/10 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Top strengths</p>
                        <p className="font-semibold text-foreground mt-1">
                          {analysis.strengths.join(" • ")}
                        </p>
                      </div>

                      <div className="rounded-xl border border-border bg-background/35 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Watch-outs</p>
                        <p className="font-semibold text-foreground mt-1">
                          {analysis.challenges.join(" • ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Comments on ship results */}
            {showResult && person1 && person2 && (
              <div className="mt-8 bg-card/60 backdrop-blur-sm border-2 border-border/40 rounded-3xl p-6">
                <CommentSection
                  contentType="ship"
                  contentId={`${[person1.id, person2.id].sort().join("-")}`}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShipOMeter;
