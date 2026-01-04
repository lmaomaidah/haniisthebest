import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Users, TrendingDown, Sparkles } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Question {
  id: string;
  title: string;
  question_order: number;
  options: Option[];
}

interface Option {
  id: string;
  option_text: string;
  option_order: number;
}

interface PollResultsProps {
  formId: string;
  questions: Question[];
}

interface ResultData {
  name: string;
  value: number;
  percentage: number;
  isWinner: boolean;
}

const COLORS = [
  "hsl(330, 85%, 62%)", // neon-pink
  "hsl(200, 90%, 60%)", // electric-blue
  "hsl(98, 70%, 55%)",  // lime-green
  "hsl(45, 100%, 60%)", // sunshine-yellow
  "hsl(265, 80%, 66%)", // hot-purple
  "hsl(25, 95%, 60%)",  // tangerine
];

const VERDICT_MESSAGES = [
  "The crowd has spoken.",
  "Consensus achieved. Dissent noted.",
  "The verdict is in.",
  "Democracy in action.",
  "The people have decided.",
];

export const PollResults = ({ formId, questions }: PollResultsProps) => {
  const [results, setResults] = useState<Record<string, ResultData[]>>({});
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [formId, questions]);

  const fetchResults = async () => {
    setLoading(true);
    const newResults: Record<string, ResultData[]> = {};

    for (const q of questions) {
      const { data: responses } = await supabase
        .from("form_responses")
        .select("option_id")
        .eq("question_id", q.id);

      const counts: Record<string, number> = {};
      q.options.forEach((o) => (counts[o.id] = 0));

      (responses || []).forEach((r) => {
        if (counts[r.option_id] !== undefined) {
          counts[r.option_id]++;
        }
      });

      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const maxVotes = Math.max(...Object.values(counts));

      const resultData: ResultData[] = q.options.map((o) => ({
        name: o.option_text,
        value: counts[o.id],
        percentage: total > 0 ? Math.round((counts[o.id] / total) * 100) : 0,
        isWinner: counts[o.id] === maxVotes && maxVotes > 0,
      }));

      newResults[q.id] = resultData;
    }

    setResults(newResults);
    setLoading(false);

    // Trigger reveal animation
    setTimeout(() => setRevealed(true), 300);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl animate-spin-slow">🎰</div>
        <p className="text-xl mt-4 text-muted-foreground">Tallying the votes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Reveal Banner */}
      <div
        className={`text-center py-8 transition-all duration-1000 ${
          revealed ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
        }`}
      >
        <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full gradient-chaos text-white shadow-glow animate-pulse-glow">
          <Sparkles className="h-6 w-6" />
          <span className="text-2xl font-display">Final Verdict</span>
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="mt-4 text-muted-foreground italic text-lg">
          {VERDICT_MESSAGES[Math.floor(Math.random() * VERDICT_MESSAGES.length)]}
        </p>
      </div>

      {/* Results Cards */}
      {questions.map((q, qIdx) => {
        const questionResults = results[q.id] || [];
        const totalVotes = questionResults.reduce((a, b) => a + b.value, 0);
        const winner = questionResults.find((r) => r.isWinner);

        return (
          <Card
            key={q.id}
            className={`bg-card/80 backdrop-blur-sm border-4 border-secondary/30 rounded-3xl p-8 transition-all duration-700 ${
              revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: `${qIdx * 150}ms` }}
          >
            {/* Question Header */}
            <div className="flex items-start gap-4 mb-6">
              <span className="w-12 h-12 rounded-full gradient-chaos text-white text-xl font-display flex items-center justify-center">
                {qIdx + 1}
              </span>
              <div className="flex-1">
                <h3 className="text-2xl font-display text-foreground">{q.title}</h3>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4" /> {totalVotes} votes
                </p>
              </div>
            </div>

            {/* Chart + Results */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={questionResults}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      animationBegin={qIdx * 200}
                      animationDuration={1000}
                    >
                      {questionResults.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke={entry.isWinner ? "hsl(45, 100%, 60%)" : "transparent"}
                          strokeWidth={entry.isWinner ? 4 : 0}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as ResultData;
                          return (
                            <div className="bg-popover text-popover-foreground p-3 rounded-xl shadow-lg border-2">
                              <p className="font-bold">{data.name}</p>
                              <p>
                                {data.value} votes ({data.percentage}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Results List */}
              <div className="space-y-3">
                {questionResults.map((r, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      r.isWinner
                        ? "border-yellow-400 bg-yellow-400/10 shadow-[0_0_20px_rgba(255,200,0,0.3)]"
                        : "border-border bg-card/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="font-medium">{r.name}</span>
                        {r.isWinner ? (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 text-xs font-bold">
                            <Trophy className="h-3 w-3" /> Winner
                          </span>
                        ) : (
                          r.value > 0 && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                              <TrendingDown className="h-3 w-3" /> Minority
                            </span>
                          )
                        )}
                      </div>
                      <span className="font-bold text-lg">{r.percentage}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: revealed ? `${r.percentage}%` : "0%",
                          backgroundColor: COLORS[idx % COLORS.length],
                          transitionDelay: `${qIdx * 200 + idx * 100}ms`,
                        }}
                      />
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {r.value} vote{r.value !== 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
