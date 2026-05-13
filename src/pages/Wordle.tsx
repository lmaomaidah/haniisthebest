import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Loader2, Crown, X, Send, Sparkles, PartyPopper, Users, Clock, Hash, Trophy, Skull, Eraser, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/PageHeader";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ActiveRound {
  id: string;
  host_id: string;
  host_username: string | null;
  word_length: number;
  created_at: string;
}

interface Guess {
  id: string;
  user_id: string;
  guess: string;
  green_count: number;
  yellow_count: number;
  is_correct: boolean;
  created_at: string;
}

const INSULTS = [
  "That guess was so bad the alphabet asked to be unlinked from your name.",
  "A concussed pigeon pecking at the keyboard would be three rows ahead of you.",
  "Your brain just blue-screened and somehow your guess got worse.",
  "Genuinely, watching you play is the saddest thing to happen to language since emojis.",
  "The dictionary saw your guess and chose voluntary deletion.",
  "If stupidity were letters, you'd be solving this in one try.",
  "Mensa just sent you a cease and desist for impersonating a thinker.",
  "Your guesses are giving 'phonics class dropout with a vendetta.'",
  "I asked an AI to rate that guess. It crashed and apologised to me.",
  "GTA Hani invented this game and even he wouldn't waste a turn on you.",
  "You type like every key is a personal enemy and the word is the witness.",
  "At this rate the word will rot before you find it. Carbon-date your next guess.",
  "Your vocabulary is being sued by the Oxford English Dictionary for defamation.",
  "Toddlers eating fridge magnets are out-performing you in real time.",
  "I'd call that a guess but guesses imply thought was involved.",
  "Bro is speedrunning embarrassment with no glitches.",
  "Every wrong guess takes a year off my life and adds one to your sentence.",
  "Even the letters you got right are embarrassed to be associated with you.",
  "This isn't Wordle anymore, it's a public humiliation kink and you're the star.",
  "The word is right there. You are not.",
];

const BACKHANDED_COMPLIMENTS = [
  "You won. Statistically, even monkeys hit the keyboard right eventually.",
  "Congrats — you're the smartest person in a room of one.",
  "Impressive! For someone with your priors, this is basically a miracle.",
  "Wow, a win. I'd celebrate too if my standards were that low.",
  "You did it! Honestly, nobody had you on their bingo card.",
  "Genius level: 'finally remembered which way letters face.'",
  "Top of the leaderboard for now. Enjoy it before someone with a brain shows up.",
  "You cracked it. The bar was on the floor and you tripped over it the right way.",
  "Beautiful work, especially considering everyone expected you to choke.",
  "Victory! It's not the win we deserved but it's the win we got stuck with.",
];

const LOSER_MOCKERY = [
  "ROUND OVER. The word ran out of patience waiting for you.",
  "You were defeated by 26 letters in a sock. Reflect on that.",
  "Game's done. The word left the chat without leaving a forwarding address.",
  "You couldn't crack a word that a 6-year-old solved in two tries.",
  "L + ratio + you spell phonetically + the alphabet pities you.",
  "Round closed. Your dignity has filed for relocation.",
  "The host gave up watching you suffer. That's how bad it was.",
  "Statistically you guessed every wrong word in existence first. Achievement unlocked.",
];

const insultFor = (n: number) => INSULTS[(n * 7) % INSULTS.length];
const compliment = () => BACKHANDED_COMPLIMENTS[Math.floor(Math.random() * BACKHANDED_COMPLIMENTS.length)];
const mockery = () => LOSER_MOCKERY[Math.floor(Math.random() * LOSER_MOCKERY.length)];

// ---------- Sound effects (Web Audio API, no assets needed) ----------
let audioCtx: AudioContext | null = null;
const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioCtx;
};
const tone = (freq: number, dur: number, when: number, type: OscillatorType = "triangle", gain = 0.18) => {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + when);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + when + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(ctx.currentTime + when);
  osc.stop(ctx.currentTime + when + dur + 0.05);
};
const playFanfare = () => {
  // Triumphant ascending arpeggio
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, i * 0.12, "triangle", 0.22));
  tone(1319, 0.6, 0.55, "sawtooth", 0.18);
};
const playSadTrombone = () => {
  // Wah-wah-wah-waaah
  [440, 392, 349, 277].forEach((f, i) => tone(f, 0.35, i * 0.22, "sawtooth", 0.22));
};
const playClick = () => tone(220, 0.06, 0, "square", 0.08);

const Wordle = () => {
  const { user, isAdmin } = useAuth();
  const [round, setRound] = useState<ActiveRound | null>(null);
  const [endedRoundId, setEndedRoundId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [newWord, setNewWord] = useState("");
  const [guessInput, setGuessInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [victoryDismissed, setVictoryDismissed] = useState(false);
  const [defeatDismissed, setDefeatDismissed] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [letterState, setLetterState] = useState<Record<string, "ok" | "cut" | "removed">>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const winSoundFiredRef = useRef(false);
  const loseSoundFiredRef = useRef(false);

  const isHost = !!user && !!round && round.host_id === user.id;
  const activeRoundId = round?.id ?? endedRoundId;
  const lsKey = activeRoundId ? `wordle-letters-${activeRoundId}` : null;

  // Load letter state from localStorage per round
  useEffect(() => {
    if (!lsKey) return;
    try {
      const raw = localStorage.getItem(lsKey);
      setLetterState(raw ? JSON.parse(raw) : {});
    } catch {
      setLetterState({});
    }
  }, [lsKey]);

  const updateLetter = (letter: string, action: "cut" | "removed" | "ok") => {
    if (!soundOn) {} else playClick();
    setLetterState((prev) => {
      const next = { ...prev };
      if (action === "ok") delete next[letter];
      else next[letter] = action;
      if (lsKey) localStorage.setItem(lsKey, JSON.stringify(next));
      return next;
    });
  };

  const resetLetters = () => {
    setLetterState({});
    if (lsKey) localStorage.removeItem(lsKey);
  };

  const loadProfiles = async (ids: string[]) => {
    const missing = ids.filter((id) => !profiles[id]);
    if (!missing.length) return;
    const { data } = await supabase
      .from("profiles")
      .select("user_id,username")
      .in("user_id", missing);
    if (data) {
      setProfiles((p) => {
        const next = { ...p };
        data.forEach((r: any) => (next[r.user_id] = r.username));
        return next;
      });
    }
  };

  const fetchRound = async () => {
    const { data, error } = await supabase.rpc("get_active_wordle_round");
    if (error) {
      console.error(error);
      setRound(null);
      return null;
    }
    const r = (data?.[0] as ActiveRound) || null;
    setRound(r);
    return r;
  };

  const fetchGuesses = async (roundId: string) => {
    const { data } = await supabase
      .from("wordle_guesses")
      .select("*")
      .eq("round_id", roundId)
      .order("created_at", { ascending: true });
    if (data) {
      setGuesses(data as Guess[]);
      loadProfiles([...new Set(data.map((g: any) => g.user_id))]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await fetchRound();
      if (r) await fetchGuesses(r.id);
      setLoading(false);
    })();
  }, []);

  // Reset overlays when round changes
  useEffect(() => {
    setVictoryDismissed(false);
    setDefeatDismissed(false);
    winSoundFiredRef.current = false;
    loseSoundFiredRef.current = false;
    if (round) setEndedRoundId(null);
  }, [round?.id]);

  // Realtime
  useEffect(() => {
    if (!round) return;
    const currentRoundId = round.id;
    const ch = supabase
      .channel(`wordle-${currentRoundId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wordle_guesses", filter: `round_id=eq.${currentRoundId}` },
        (payload) => {
          const g = payload.new as Guess;
          setGuesses((prev) => (prev.some((x) => x.id === g.id) ? prev : [...prev, g]));
          loadProfiles([g.user_id]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "wordle_rounds", filter: `id=eq.${currentRoundId}` },
        async (payload) => {
          const updated = payload.new as { is_active: boolean };
          if (!updated.is_active) {
            // Remember it so loser overlay can show
            setEndedRoundId(currentRoundId);
          }
          await fetchRound();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [round?.id]);

  // Poll for new active round when none exists
  useEffect(() => {
    if (round) return;
    const i = setInterval(async () => {
      const r = await fetchRound();
      if (r) await fetchGuesses(r.id);
    }, 5000);
    return () => clearInterval(i);
  }, [round]);

  const myGuesses = useMemo(
    () => (user ? guesses.filter((g) => g.user_id === user.id) : []),
    [guesses, user]
  );

  const myWin = useMemo(() => myGuesses.find((g) => g.is_correct) || null, [myGuesses]);
  const winners = useMemo(() => guesses.filter((g) => g.is_correct), [guesses]);
  const uniquePlayers = useMemo(
    () => new Set(guesses.map((g) => g.user_id)).size,
    [guesses]
  );

  // Round ended without me winning → loser
  const showDefeatOverlay =
    !!endedRoundId && !round && !myWin && !defeatDismissed && myGuesses.length > 0;
  const showVictoryOverlay = !!myWin && !victoryDismissed;

  // Confetti + sound on win
  useEffect(() => {
    if (!showVictoryOverlay || winSoundFiredRef.current) return;
    winSoundFiredRef.current = true;
    if (soundOn) playFanfare();
    const fire = () => {
      confetti({
        particleCount: 80,
        spread: 90,
        startVelocity: 45,
        origin: { y: 0.6 },
        colors: ["#fbbf24", "#10b981", "#3b82f6", "#ec4899", "#a855f7"],
      });
    };
    fire();
    const t1 = setTimeout(fire, 400);
    const t2 = setTimeout(fire, 900);
    const interval = setInterval(() => {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x: Math.random(), y: Math.random() * 0.4 },
      });
    }, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(interval);
    };
  }, [showVictoryOverlay, soundOn]);

  // Sound on loss
  useEffect(() => {
    if (!showDefeatOverlay || loseSoundFiredRef.current) return;
    loseSoundFiredRef.current = true;
    if (soundOn) {
      playSadTrombone();
      setTimeout(() => soundOn && playSadTrombone(), 1500);
    }
  }, [showDefeatOverlay, soundOn]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    setStarting(true);
    const { error } = await supabase.rpc("start_wordle_round", { _word: newWord.trim() });
    setStarting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewWord("");
    toast.success("Round started! Players can now guess.");
    const r = await fetchRound();
    if (r) await fetchGuesses(r.id);
  };

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!round) return;
    const clean = guessInput.trim().toLowerCase();
    if (clean.length !== round.word_length) {
      toast.error(`Must be exactly ${round.word_length} letters.`);
      return;
    }
    if (!/^[a-z]+$/.test(clean)) {
      toast.error("Letters a–z only.");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.rpc("submit_wordle_guess", {
      _round_id: round.id,
      _guess: clean,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setGuessInput("");
    inputRef.current?.focus();
    const result = data?.[0];
    if (result?.is_correct) {
      toast.success("🎉 You cracked it!");
    } else if (result && result.guess_number >= 3) {
      toast(insultFor(result.guess_number), { icon: "🤡" });
    }
  };

  const handleEndRound = async () => {
    if (!round) return;
    if (!confirm("End this round? The word will be revealed to everyone.")) return;
    const { error } = await supabase.rpc("end_wordle_round", { _round_id: round.id });
    if (error) toast.error(error.message);
    else {
      toast.success("Round ended.");
      setEndedRoundId(round.id);
      await fetchRound();
    }
  };

  const roundAgeMin = round
    ? Math.max(0, Math.floor((Date.now() - new Date(round.created_at).getTime()) / 60000))
    : 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <WhimsicalBackground />
      <div className="container mx-auto px-4 relative z-10 pb-20">
        <PageHeader title="Wordle" />

        <div className="text-center mb-8 flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-gradient mb-3">
            Wordle
          </h1>
          <p className="text-sm md:text-base text-muted-foreground italic">
            Credit goes to GTA Hani for inventing this
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSoundOn((s) => !s)}
            className="mt-2"
          >
            {soundOn ? <Volume2 className="h-4 w-4 mr-1" /> : <VolumeX className="h-4 w-4 mr-1" />}
            Sound: {soundOn ? "on" : "off"}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !round ? (
          <Card className="max-w-xl mx-auto p-8 bg-card/80 backdrop-blur border-2 border-primary/30">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">No active round — be the host</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Pick a secret word (2–15 letters, a–z only). Everyone else guesses it — unlimited
              tries, but the more you flop, the meaner it gets.
            </p>
            <form onSubmit={handleStart} className="flex gap-2">
              <Input
                value={newWord}
                onChange={(e) => setNewWord(e.target.value.replace(/[^a-zA-Z]/g, ""))}
                placeholder="secret word…"
                maxLength={15}
                className="font-mono uppercase tracking-widest"
                autoFocus
              />
              <Button type="submit" disabled={starting || newWord.length < 2}>
                {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start round"}
              </Button>
            </form>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6 max-w-5xl mx-auto">
            {/* Main board */}
            <div className="space-y-4">
              {/* Status bar */}
              <Card className="p-5 bg-card/80 backdrop-blur border-2 border-primary/30">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-400" />
                    <span className="text-sm">
                      Host: <span className="font-semibold">{round.host_username || "?"}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Hash className="h-3 w-3" />
                    <Badge variant="outline" className="font-mono">
                      {round.word_length} letters
                    </Badge>
                    <Users className="h-3 w-3 ml-2" />
                    <span>{uniquePlayers} playing</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>{roundAgeMin}m</span>
                    <Trophy className="h-3 w-3 ml-2 text-emerald-400" />
                    <span>{winners.length} cracked</span>
                  </div>
                  {(isHost || isAdmin) && (
                    <Button size="sm" variant="destructive" onClick={handleEndRound}>
                      <X className="h-3 w-3 mr-1" /> End round
                    </Button>
                  )}
                </div>
              </Card>

              {/* Host panel */}
              {(isHost || isAdmin) && (
                <Card className="p-5 bg-amber-500/5 backdrop-blur border-2 border-amber-500/40">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="h-4 w-4 text-amber-400" />
                    <h3 className="text-sm uppercase tracking-widest text-amber-300/90 font-semibold">
                      Host panel
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Starting a new round will end the current one. The current word is hidden from
                    everyone (including you in the activity log) until the round ends.
                  </p>
                  <form onSubmit={handleStart} className="flex gap-2">
                    <Input
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value.replace(/[^a-zA-Z]/g, ""))}
                      placeholder="next secret word…"
                      maxLength={15}
                      className="font-mono uppercase tracking-widest"
                    />
                    <Button type="submit" disabled={starting || newWord.length < 2} variant="secondary">
                      {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Replace round"}
                    </Button>
                  </form>
                </Card>
              )}

              {/* Guess board + letter board */}
              <div className="grid md:grid-cols-[1fr_auto] gap-4">
                <Card className="p-6 bg-card/80 backdrop-blur border-2 border-border">
                  <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
                    Your guess history ({myGuesses.length})
                  </h3>

                  {isHost ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <Crown className="h-10 w-10 mx-auto mb-3 text-amber-400" />
                      <p className="font-semibold">You're the host this round.</p>
                      <p className="text-sm">Sit back and watch them suffer.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 mb-5">
                        {myGuesses.length === 0 && (
                          <div className="text-center py-6 text-muted-foreground text-sm">
                            No guesses yet. Take a swing.
                          </div>
                        )}
                        {myGuesses.map((g, idx) => (
                          <GuessRow
                            key={g.id}
                            guess={g}
                            length={round.word_length}
                            number={idx + 1}
                          />
                        ))}
                      </div>

                      {!myWin && (
                        <form onSubmit={handleGuess} className="flex gap-2">
                          <Input
                            ref={inputRef}
                            value={guessInput}
                            onChange={(e) =>
                              setGuessInput(
                                e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, round.word_length)
                              )
                            }
                            placeholder={`${round.word_length}-letter guess`}
                            maxLength={round.word_length}
                            className="font-mono uppercase tracking-[0.4em] text-center text-lg"
                            autoFocus
                          />
                          <Button
                            type="submit"
                            disabled={submitting || guessInput.length !== round.word_length}
                          >
                            {submitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-1" /> Guess
                              </>
                            )}
                          </Button>
                        </form>
                      )}

                      {!myWin && myGuesses.length >= 3 && (
                        <p className="text-xs italic text-rose-400/90 mt-3 text-center">
                          🤡 {insultFor(myGuesses.length)}
                        </p>
                      )}
                    </>
                  )}
                </Card>

                {/* Letter board */}
                {!isHost && (
                  <LetterBoard
                    state={letterState}
                    onUpdate={updateLetter}
                    onReset={resetLetters}
                  />
                )}
              </div>
            </div>

            {/* Live activity sidebar */}
            <Card className="p-5 bg-card/80 backdrop-blur border-2 border-border h-fit lg:sticky lg:top-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-accent" />
                <h3 className="text-sm uppercase tracking-widest text-muted-foreground">
                  Live activity
                </h3>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {[...guesses]
                    .reverse()
                    .slice(0, 30)
                    .map((g) => (
                      <motion.div
                        key={g.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex items-center justify-between gap-2 p-2 rounded-lg border ${
                          g.is_correct
                            ? "border-emerald-500/50 bg-emerald-500/10"
                            : "border-border/50 bg-background/40"
                        }`}
                      >
                        <div className="text-xs">
                          <div className="font-semibold truncate max-w-[120px]">
                            {profiles[g.user_id] || "…"}
                          </div>
                          <div className="font-mono uppercase tracking-widest text-muted-foreground">
                            {g.is_correct || isHost || isAdmin ? g.guess : "•".repeat(g.guess.length)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <CountChip count={g.green_count} variant="green" />
                          <CountChip count={g.yellow_count} variant="yellow" />
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
                {guesses.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No guesses yet across the room.
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Victory overlay */}
      <AnimatePresence>
        {showVictoryOverlay && myWin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="max-w-lg w-full"
            >
              <Card className="p-8 bg-gradient-to-br from-emerald-500/20 via-amber-500/10 to-primary/20 border-4 border-emerald-400 shadow-2xl">
                <div className="text-center">
                  <PartyPopper className="h-16 w-16 mx-auto text-amber-400 mb-3" />
                  <h2 className="text-4xl font-display font-bold text-gradient mb-2">
                    YOU CRACKED IT
                  </h2>
                  <p className="text-emerald-300 font-mono text-2xl uppercase tracking-[0.3em] my-4">
                    {myWin.guess}
                  </p>
                  <p className="text-base text-amber-200/90 italic mb-4 px-2">
                    "{compliment()}"
                  </p>
                  <p className="text-sm text-muted-foreground mb-5">
                    Solved in <span className="font-bold text-foreground">{myGuesses.length}</span>{" "}
                    {myGuesses.length === 1 ? "guess" : "guesses"}
                  </p>

                  <div className="bg-background/40 rounded-lg p-4 mb-5 max-h-60 overflow-y-auto">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Your saved guess history
                    </p>
                    <div className="space-y-1.5">
                      {myGuesses.map((g, i) => (
                        <div key={g.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-muted-foreground font-mono">#{i + 1}</span>
                          <span
                            className={`font-mono uppercase tracking-widest flex-1 text-left pl-3 ${
                              g.is_correct ? "text-emerald-300 font-bold" : "text-foreground/80"
                            }`}
                          >
                            {g.guess}
                          </span>
                          <CountChip count={g.green_count} variant="green" />
                          <CountChip count={g.yellow_count} variant="yellow" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button size="lg" onClick={() => setVictoryDismissed(true)} className="w-full">
                    Exit & keep watching the carnage
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Defeat overlay — loser horns + mockery */}
      <AnimatePresence>
        {showDefeatOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-rose-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden"
          >
            {/* Floating loser horns everywhere */}
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-5xl select-none pointer-events-none"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -80,
                  rotate: Math.random() * 360,
                  opacity: 0,
                }}
                animate={{
                  y: window.innerHeight + 80,
                  rotate: Math.random() * 720,
                  opacity: [0, 1, 1, 0.6],
                }}
                transition={{
                  duration: 3 + Math.random() * 3,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2,
                  ease: "linear",
                }}
              >
                📯
              </motion.div>
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={`L-${i}`}
                className="absolute text-7xl font-black text-rose-400/40 select-none pointer-events-none"
                style={{ fontFamily: "var(--font-display)" }}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  rotate: Math.random() * 60 - 30,
                  scale: 0,
                }}
                animate={{ scale: [0, 1.2, 1], opacity: [0, 0.6, 0.3] }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
              >
                L
              </motion.div>
            ))}

            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 16 }}
              className="max-w-lg w-full relative z-10"
            >
              <Card className="p-8 bg-gradient-to-br from-rose-900/80 via-rose-950/90 to-black border-4 border-rose-500 shadow-2xl">
                <div className="text-center">
                  <Skull className="h-20 w-20 mx-auto text-rose-400 mb-3 animate-pulse" />
                  <h2 className="text-5xl font-display font-bold text-rose-300 mb-3">
                    YOU LOSE
                  </h2>
                  <p className="text-rose-200 font-mono uppercase tracking-widest text-sm mb-5">
                    📯 honk honk loser 📯
                  </p>
                  <p className="text-base text-rose-100/90 italic mb-5 px-2">
                    "{mockery()}"
                  </p>

                  <div className="bg-black/40 rounded-lg p-4 mb-5 max-h-52 overflow-y-auto border border-rose-500/30">
                    <p className="text-xs uppercase tracking-widest text-rose-300/80 mb-2">
                      Your tragic guess history ({myGuesses.length} attempts of pure cope)
                    </p>
                    <div className="space-y-1.5">
                      {myGuesses.map((g, i) => (
                        <div key={g.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-rose-300/60 font-mono">#{i + 1}</span>
                          <span className="font-mono uppercase tracking-widest flex-1 text-left pl-3 text-rose-100/80">
                            {g.guess}
                          </span>
                          <CountChip count={g.green_count} variant="green" />
                          <CountChip count={g.yellow_count} variant="yellow" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={() => setDefeatDismissed(true)}
                    className="w-full"
                  >
                    Accept defeat & exit
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

const LetterBoard = ({
  state,
  onUpdate,
  onReset,
}: {
  state: Record<string, "ok" | "cut" | "removed">;
  onUpdate: (letter: string, action: "cut" | "removed" | "ok") => void;
  onReset: () => void;
}) => {
  return (
    <Card className="p-4 bg-card/80 backdrop-blur border-2 border-border w-full md:w-[180px] h-fit">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Letters
        </h3>
        <button
          onClick={onReset}
          title="Reset all"
          className="text-muted-foreground hover:text-foreground transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground/80 mb-3 leading-tight">
        Click to cut · Right-click or trash to remove
      </p>
      <div className="grid grid-cols-5 gap-1.5">
        {ALPHABET.map((l) => {
          const s = state[l];
          const isCut = s === "cut";
          const isRemoved = s === "removed";
          if (isRemoved) {
            return (
              <button
                key={l}
                onClick={() => onUpdate(l, "ok")}
                title="Restore"
                className="aspect-square rounded-md border border-dashed border-border/50 bg-background/20 text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition"
              >
                +
              </button>
            );
          }
          return (
            <button
              key={l}
              onClick={() => onUpdate(l, isCut ? "ok" : "cut")}
              onContextMenu={(e) => {
                e.preventDefault();
                onUpdate(l, "removed");
              }}
              title={isCut ? "Click to restore · Right-click to remove" : "Click to cut · Right-click to remove"}
              className={`relative aspect-square rounded-md border-2 font-mono font-bold uppercase text-sm flex items-center justify-center transition-all ${
                isCut
                  ? "bg-rose-500/10 border-rose-500/40 text-muted-foreground"
                  : "bg-background/60 border-border hover:border-primary/60 hover:bg-primary/10 text-foreground"
              }`}
            >
              {l}
              {isCut && (
                <span
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top right, transparent calc(50% - 1.5px), hsl(var(--destructive)) calc(50% - 1.5px), hsl(var(--destructive)) calc(50% + 1.5px), transparent calc(50% + 1.5px))",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={onReset}
        className="mt-3 w-full text-[10px] flex items-center justify-center gap-1 py-1.5 rounded-md bg-background/40 border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition"
      >
        <Eraser className="h-3 w-3" /> Reset board
      </button>
    </Card>
  );
};

const GuessRow = ({
  guess,
  length,
  number,
}: {
  guess: Guess;
  length: number;
  number: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3"
    >
      <div className="w-6 text-xs text-muted-foreground font-mono">#{number}</div>
      <div className="flex gap-1.5 flex-1">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 max-w-[44px] aspect-square rounded-md border-2 flex items-center justify-center font-mono text-lg font-bold uppercase ${
              guess.is_correct
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                : "bg-muted/40 border-border text-foreground"
            }`}
          >
            {guess.guess[i]}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <CountChip count={guess.green_count} variant="green" big />
        <CountChip count={guess.yellow_count} variant="yellow" big />
      </div>
    </motion.div>
  );
};

const CountChip = ({
  count,
  variant,
  big,
}: {
  count: number;
  variant: "green" | "yellow";
  big?: boolean;
}) => {
  const styles =
    variant === "green"
      ? "bg-emerald-500 text-emerald-950 border-emerald-300"
      : "bg-amber-400 text-amber-950 border-amber-200";
  return (
    <div
      className={`${
        big ? "h-9 w-9 text-base" : "h-6 w-6 text-xs"
      } rounded-full border-2 font-bold flex items-center justify-center shadow ${styles}`}
      title={variant === "green" ? "Correct letter & position" : "Correct letter, wrong position"}
    >
      {count}
    </div>
  );
};

export default Wordle;
