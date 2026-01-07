import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Brain } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import WhimsicalBackground from "@/components/WhimsicalBackground";
type Category = "niche" | "weird" | "performative";

interface Question {
  id: number;
  section: string;
  question: string;
  options: {
    text: string;
    scores: Record<Category, number>;
  }[];
}

const questions: Question[] = [
  // SECTION I — POLITICS
  {
    id: 1,
    section: "POLITICS",
    question: "How do you engage with politics most often? Be honest, we'll know if you're lying.",
    options: [
      { text: "I read long-form pieces and think about them alone like a hermit", scores: { niche: 2, weird: 1, performative: 0 } },
      { text: "I argue with myself more than others (concerning behavior)", scores: { niche: 1, weird: 2, performative: 0 } },
      { text: "I share takes when they feel urgent or clever (main character moment)", scores: { niche: 0, weird: 1, performative: 2 } },
      { text: "I repost things that already say it well (zero original thoughts)", scores: { niche: 0, weird: 0, performative: 2 } },
    ],
  },
  {
    id: 2,
    section: "POLITICS",
    question: "When a political issue trends online, you:",
    options: [
      { text: "Avoid it until the noise dies down (coward or genius?)", scores: { niche: 2, weird: 1, performative: 0 } },
      { text: "Read opposing sides out of spite (unhinged scholar)", scores: { niche: 1, weird: 2, performative: 0 } },
      { text: "Feel oddly energized (you're part of the problem)", scores: { niche: 0, weird: 2, performative: 1 } },
      { text: "Feel obligated to post something (desperate for validation)", scores: { niche: 0, weird: 0, performative: 2 } },
    ],
  },
  {
    id: 3,
    section: "POLITICS",
    question: "Which statement feels closest to you? Don't overthink it, pick your poison.",
    options: [
      { text: "Politics is something I study (nerd alert)", scores: { niche: 2, weird: 0, performative: 0 } },
      { text: "Politics is something I endure (valid honestly)", scores: { niche: 1, weird: 2, performative: 0 } },
      { text: "Politics is part of my identity (red flag)", scores: { niche: 0, weird: 1, performative: 2 } },
      { text: "Politics is content (you're cooked)", scores: { niche: 0, weird: 0, performative: 2 } },
    ],
  },
  {
    id: 4,
    section: "POLITICS",
    question: "Your political opinions are mostly shaped by:",
    options: [
      { text: "Books / essays / history (touch grass maybe?)", scores: { niche: 2, weird: 1, performative: 0 } },
      { text: "Lived experience (at least it's real)", scores: { niche: 1, weird: 2, performative: 0 } },
      { text: "People I admire online (parasocial politics 💀)", scores: { niche: 0, weird: 1, performative: 2 } },
      { text: "Whatever I encountered most recently (goldfish brain)", scores: { niche: 0, weird: 0, performative: 2 } },
    ],
  },
  // SECTION II — ART & TASTE
  {
    id: 5,
    section: "ART & TASTE",
    question: "You say you like a piece of art because:",
    options: [
      { text: "It altered how I think or feel (pretentious but we'll allow it)", scores: { niche: 2, weird: 1, performative: 0 } },
      { text: "It disturbed me in a useful way (seek help)", scores: { niche: 1, weird: 2, performative: 0 } },
      { text: "It represents something important (surface level)", scores: { niche: 0, weird: 1, performative: 2 } },
      { text: "It looks good and says the right things (you're a brand)", scores: { niche: 0, weird: 0, performative: 2 } },
    ],
  },
  {
    id: 6,
    section: "ART & TASTE",
    question: "Someone dislikes your favorite artist. You:",
    options: [
      { text: "Shrug — taste isn't universal (emotionally mature, suspicious)", scores: { niche: 2, weird: 0, performative: 0 } },
      { text: "Get secretly annoyed (normal tbh)", scores: { niche: 1, weird: 2, performative: 0 } },
      { text: "Try to explain why they're wrong (insufferable)", scores: { niche: 0, weird: 1, performative: 2 } },
      { text: "Assume they don't 'get it' (ego protection mode)", scores: { niche: 0, weird: 1, performative: 2 } },
    ],
  },
  {
    id: 7,
    section: "ART & TASTE",
    question: "Choose one sentence you believe. This will expose you.",
    options: [
      { text: "Art doesn't owe anyone accessibility (gatekeeping era)", scores: { niche: 2, weird: 1, performative: 0 } },
      { text: "Art should provoke, even alienate (edgelord energy)", scores: { niche: 1, weird: 2, performative: 0 } },
      { text: "Art should communicate clearly (you like Marvel movies)", scores: { niche: 0, weird: 0, performative: 2 } },
      { text: "Art should reflect the moment (trend chaser)", scores: { niche: 0, weird: 1, performative: 2 } },
    ],
  },
  {
    id: 8,
    section: "ART & TASTE",
    question: "How do you usually discover art?",
    options: [
      { text: "Accidentally, through obsession (chaos method)", scores: { niche: 1, weird: 2, performative: 0 } },
      { text: "Through recommendations I trust deeply (you have friends?)", scores: { niche: 2, weird: 1, performative: 0 } },
      { text: "Through discourse (you wait for permission)", scores: { niche: 0, weird: 0, performative: 2 } },
      { text: "Through algorithms (the machine owns you)", scores: { niche: 0, weird: 1, performative: 2 } },
    ],
  },
  // SECTION III — INTERESTS & IDENTITY
  {
    id: 9,
    section: "INTERESTS & IDENTITY",
    question: "Your interests tend to be:",
    options: [
      { text: "Narrow but deep (autism coded, affectionate)", scores: { niche: 2, weird: 1, performative: 0 } },
      { text: "Inconsistent but intense (commitment issues)", scores: { niche: 1, weird: 2, performative: 0 } },
      { text: "Broad and current (you're everyone and no one)", scores: { niche: 0, weird: 0, performative: 2 } },
      { text: "Whatever I'm surrounded by (NPC behavior)", scores: { niche: 0, weird: 0, performative: 2 } },
    ],
  },
  {
    id: 10,
    section: "INTERESTS & IDENTITY",
    question: "If your interests suddenly stopped being 'interesting' to others:",
    options: [
      { text: "Nothing changes (secure, rare)", scores: { niche: 2, weird: 1, performative: 0 } },
      { text: "I'd feel oddly relieved (hipster tendencies)", scores: { niche: 1, weird: 2, performative: 0 } },
      { text: "I'd feel uncomfortable (validation dependent)", scores: { niche: 0, weird: 1, performative: 2 } },
      { text: "I'd replace them (terrifying honesty)", scores: { niche: 0, weird: 0, performative: 2 } },
    ],
  },
  {
    id: 11,
    section: "INTERESTS & IDENTITY",
    question: "Be honest. How often do you explain your interests before anyone asks?",
    options: [
      { text: "Almost never (mysterious or boring?)", scores: { niche: 2, weird: 0, performative: 0 } },
      { text: "Sometimes, if misunderstood (defensive)", scores: { niche: 1, weird: 2, performative: 0 } },
      { text: "Often, to clarify (you're insecure about it)", scores: { niche: 0, weird: 1, performative: 2 } },
      { text: "Constantly, to control perception (PR manager of yourself)", scores: { niche: 0, weird: 0, performative: 2 } },
    ],
  },
  {
    id: 12,
    section: "INTERESTS & IDENTITY",
    question: "Why do you think people find you interesting? (If they even do)",
    options: [
      { text: "They don't, and that's fine (humble or lying)", scores: { niche: 2, weird: 1, performative: 0 } },
      { text: "I have unusual perspectives (delusional but ok)", scores: { niche: 1, weird: 2, performative: 0 } },
      { text: "I articulate things well (rehearsed personality)", scores: { niche: 0, weird: 1, performative: 2 } },
      { text: "I curate myself carefully (you're a product)", scores: { niche: 0, weird: 0, performative: 2 } },
    ],
  },
  // SECTION IV — SELF-AWARENESS
  {
    id: 13,
    section: "SELF-AWARENESS",
    question: "When you consume something 'problematic,' you:",
    options: [
      { text: "Sit with the discomfort privately (growth maybe)", scores: { niche: 2, weird: 1, performative: 0 } },
      { text: "Analyze it critically (still consuming it tho)", scores: { niche: 1, weird: 2, performative: 0 } },
      { text: "Publicly contextualize it (covering your tracks)", scores: { niche: 0, weird: 1, performative: 2 } },
      { text: "Avoid it entirely or signal distance (coward behavior)", scores: { niche: 0, weird: 0, performative: 2 } },
    ],
  },
  {
    id: 14,
    section: "SELF-AWARENESS",
    question: "Your online presence feels like:",
    options: [
      { text: "A byproduct (barely there)", scores: { niche: 2, weird: 0, performative: 0 } },
      { text: "A diary with witnesses (vulnerable but cringe)", scores: { niche: 1, weird: 2, performative: 0 } },
      { text: "A statement (you think you matter)", scores: { niche: 0, weird: 1, performative: 2 } },
      { text: "A performance space (at least you admit it)", scores: { niche: 0, weird: 0, performative: 2 } },
    ],
  },
  {
    id: 15,
    section: "SELF-AWARENESS",
    question: "Which scares you more? This is the final nail in your coffin.",
    options: [
      { text: "Being misunderstood (you're already weird)", scores: { niche: 1, weird: 2, performative: 0 } },
      { text: "Being predictable (control freak)", scores: { niche: 2, weird: 1, performative: 0 } },
      { text: "Being irrelevant (desperate)", scores: { niche: 0, weird: 0, performative: 2 } },
      { text: "Being sincere (emotional coward)", scores: { niche: 0, weird: 1, performative: 2 } },
    ],
  },
];

const resultTexts = {
  niche: {
    title: "NICHE",
    description: "You are motivated by internal coherence rather than recognition. Your interests persist even when they inconvenience you. You are not easy to market, and that's the point. Honestly? You're probably insufferable to talk to at parties, but at least you're real. The algorithm has given up on you and frankly that's iconic.",
    emoji: "🎭",
  },
  weird: {
    title: "WEIRD",
    description: "Your taste is sincere, unstable, and unconcerned with approval. You follow curiosity into places most people would abandon early. You are not trying to be anything — which makes you difficult to place. You're the friend everyone describes as 'a lot' but keeps around anyway because you're genuinely entertaining. Seek therapy though.",
    emoji: "👁️",
  },
  performative: {
    title: "PERFORMATIVE",
    description: "Your interests exist in dialogue with an audience. You understand optics, timing, and cultural language fluently. This is not shallow — but it is intentional. You're basically a content creator who doesn't post. Your personality is a group project and the group is the internet. At least you're self-aware enough to take this quiz.",
    emoji: "✨",
  },
};

export default function JudgementQuiz() {
  const { logActivity } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<Category, number>>({
    niche: 0,
    weird: 0,
    performative: 0,
  });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [started, setStarted] = useState(false);

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const option = questions[currentQuestion].options[selectedOption];
    setScores((prev) => ({
      niche: prev.niche + option.scores.niche,
      weird: prev.weird + option.scores.weird,
      performative: prev.performative + option.scores.performative,
    }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScores({ niche: 0, weird: 0, performative: 0 });
    setSelectedOption(null);
    setShowResults(false);
    setStarted(false);
  };

  const calculatePercentages = () => {
    const total = scores.niche + scores.weird + scores.performative;
    if (total === 0) return { niche: 33, weird: 33, performative: 34 };

    const nichePercent = Math.round((scores.niche / total) * 100);
    const weirdPercent = Math.round((scores.weird / total) * 100);
    const performativePercent = 100 - nichePercent - weirdPercent;

    return { niche: nichePercent, weird: weirdPercent, performative: performativePercent };
  };

  const getHighestCategory = (): Category => {
    const percentages = calculatePercentages();
    if (percentages.niche >= percentages.weird && percentages.niche >= percentages.performative) return "niche";
    if (percentages.weird >= percentages.niche && percentages.weird >= percentages.performative) return "weird";
    return "performative";
  };

  useEffect(() => {
    if (!showResults) return;
    const highestCategory = getHighestCategory();
    void logActivity('quiz_complete', { result: highestCategory });
  }, [showResults, scores, logActivity]);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (!started) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden">
        <WhimsicalBackground />
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        <div className="max-w-2xl mx-auto pt-16 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="text-center space-y-8 animate-bounce-in">
            <div className="text-8xl">🔮</div>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient">THE JUDGEMENT</h1>
            <p className="text-xl text-muted-foreground">A quiz that will see through your carefully curated personality</p>

            <div className="bg-card border-2 border-primary/30 rounded-3xl p-8 text-left space-y-4">
              <h2 className="text-2xl font-bold text-primary">What this will expose:</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">NICHE</strong> — You're weird but in a way that requires a bibliography</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span><strong className="text-foreground">WEIRD</strong> — You're weird but in a way that makes people uncomfortable</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong className="text-foreground">PERFORMATIVE</strong> — You're weird but only when someone's watching</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground italic">15 questions. No take-backs. We're not responsible for the existential crisis that follows.</p>

            <Button
              onClick={() => setStarted(true)}
              size="lg"
              className="gradient-pink-blue text-white text-xl px-12 py-6 rounded-3xl shadow-glow hover:scale-110 transition-transform"
            >
              <Brain className="mr-2 h-6 w-6" />
              Judge Me 💀
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentages = calculatePercentages();
    const highestCategory = getHighestCategory();
    const result = resultTexts[highestCategory];

    return (
      <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden">
        <WhimsicalBackground />
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        <div className="max-w-2xl mx-auto pt-8 relative z-10">
          <div className="text-center space-y-8 animate-bounce-in">
            <div className="text-8xl">{result.emoji}</div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">Your Cultural Profile</h1>

            <div className="bg-card border-2 border-primary/30 rounded-3xl p-8 space-y-6">
              {/* Score bars */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">NICHE</span>
                  <span className="text-2xl font-bold text-primary">{percentages.niche}%</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${percentages.niche}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-secondary">WEIRD</span>
                  <span className="text-2xl font-bold text-secondary">{percentages.weird}%</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary transition-all duration-1000" style={{ width: `${percentages.weird}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-accent">PERFORMATIVE</span>
                  <span className="text-2xl font-bold text-accent">{percentages.performative}%</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${percentages.performative}%` }} />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <p className="text-sm text-muted-foreground mb-2">FINAL JUDGMENT:</p>
                <h2 className="text-4xl font-bold text-gradient mb-4">{result.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{result.description}</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleRestart}
                size="lg"
                className="gradient-chaos text-white px-8 py-4 rounded-2xl hover:scale-105 transition-transform"
              >
                Retake Quiz
              </Button>
              <Link to="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 rounded-2xl hover:scale-105 transition-transform"
                >
                  Back Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden">
      <WhimsicalBackground />
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl mx-auto pt-8 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          Flee
        </Link>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span className="text-primary font-bold">{question.section}</span>
            <span>{currentQuestion + 1} / {questions.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <div className="space-y-6 animate-bounce-in" key={currentQuestion}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] ${
                  selectedOption === index
                    ? "border-primary bg-primary/20 text-foreground"
                    : "border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={selectedOption === null}
            size="lg"
            className="w-full gradient-pink-blue text-white py-6 rounded-2xl shadow-glow hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {currentQuestion === questions.length - 1 ? "See Your Judgement" : "Next"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
