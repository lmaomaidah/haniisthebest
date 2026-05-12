import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Crown, X, Send, Sparkles, PartyPopper, Users, Clock, Hash, Trophy } from "lucide-react";
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

const insultFor = (n: number) => INSULTS[(n * 7) % INSULTS.length];

const Wordle = () => {
  const { user, isAdmin } = useAuth();
  const [round, setRound] = useState<ActiveRound | null>(null);
  const [loading, setLoading] = useState(true);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [newWord, setNewWord] = useState("");
  const [guessInput, setGuessInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [victoryDismissed, setVictoryDismissed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isHost = !!user && !!round && round.host_id === user.id;

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

  // Reset victory dismiss when round changes
  useEffect(() => {
    setVictoryDismissed(false);
  }, [round?.id]);

  // Realtime
  useEffect(() => {
    if (!round) return;
    const ch = supabase
      .channel(`wordle-${round.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wordle_guesses", filter: `round_id=eq.${round.id}` },
        (payload) => {
          const g = payload.new as Guess;
          setGuesses((prev) => (prev.some((x) => x.id === g.id) ? prev : [...prev, g]));
          loadProfiles([g.user_id]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "wordle_rounds", filter: `id=eq.${round.id}` },
        async () => {
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
      await fetchRound();
    }
  };

  const roundAgeMin = round
    ? Math.max(0, Math.floor((Date.now() - new Date(round.created_at).getTime()) / 60000))
    : 0;

  const showVictoryOverlay = !!myWin && !victoryDismissed;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <WhimsicalBackground />
      <div className="container mx-auto px-4 relative z-10 pb-20">
        <PageHeader title="Wordle" />

        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-gradient mb-3">
            Wordle
          </h1>
          <p className="text-sm md:text-base text-muted-foreground italic">
            Credit goes to GTA Hani for inventing this
          </p>
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

              {/* Host panel — always visible to host/admin during round */}
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

              {/* Guess board */}
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

      {/* Persistent victory overlay — lingers until user dismisses */}
      <AnimatePresence>
        {showVictoryOverlay && round && myWin && (
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
                  <p className="text-sm text-muted-foreground mb-5">
                    Solved in <span className="font-bold text-foreground">{myGuesses.length}</span>{" "}
                    {myGuesses.length === 1 ? "guess" : "guesses"} ·{" "}
                    {winners.findIndex((w) => w.user_id === user?.id) + 1}
                    {ordinal(winners.findIndex((w) => w.user_id === user?.id) + 1)} to crack it
                  </p>

                  <div className="bg-background/40 rounded-lg p-4 mb-5 max-h-60 overflow-y-auto">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Your saved guess history
                    </p>
                    <div className="space-y-1.5">
                      {myGuesses.map((g, i) => (
                        <div
                          key={g.id}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
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

                  <Button
                    size="lg"
                    onClick={() => setVictoryDismissed(true)}
                    className="w-full"
                  >
                    Exit & keep watching the carnage
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

const ordinal = (n: number) => {
  if (n <= 0) return "";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
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
