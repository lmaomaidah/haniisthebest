import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Lock, Check, Trophy, Users, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PollResults } from "@/components/polls/PollResults";

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

interface Form {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  results_revealed: boolean;
  results_revealed_at: string | null;
  creator_id: string;
}

interface Vote {
  question_id: string;
  option_id: string;
}

const PollVote = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin, logActivity } = useAuth();

  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [myVotes, setMyVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const canSeeResults = form?.results_revealed || user?.id === form?.creator_id || isAdmin;

  useEffect(() => {
    if (id) {
      fetchPoll();
      logActivity("poll_view", { form_id: id });
    }
  }, [id]);

  const fetchPoll = async () => {
    if (!id) return;
    setLoading(true);

    // Fetch form
    const { data: formData, error: formError } = await supabase
      .from("forms")
      .select("*")
      .eq("id", id)
      .single();

    if (formError || !formData) {
      toast({ title: "Poll not found", variant: "destructive" });
      setLoading(false);
      return;
    }

    setForm(formData);

    // Fetch questions with options
    const { data: questionsData } = await supabase
      .from("form_questions")
      .select("*, form_options(*)")
      .eq("form_id", id)
      .order("question_order");

    const mappedQuestions: Question[] = (questionsData || []).map((q: any) => ({
      id: q.id,
      title: q.title,
      question_order: q.question_order,
      options: (q.form_options || [])
        .sort((a: any, b: any) => a.option_order - b.option_order)
        .map((o: any) => ({
          id: o.id,
          option_text: o.option_text,
          option_order: o.option_order,
        })),
    }));

    setQuestions(mappedQuestions);

    // Check if user has already voted
    if (user) {
      const questionIds = mappedQuestions.map((q) => q.id);
      if (questionIds.length > 0) {
        const { data: existingVotes } = await supabase
          .from("form_responses")
          .select("question_id, option_id")
          .eq("user_id", user.id)
          .in("question_id", questionIds);

        if (existingVotes && existingVotes.length > 0) {
          setMyVotes(existingVotes);
          setVotes(existingVotes);
          setHasVoted(true);
        }
      }
    }

    setLoading(false);
  };

  const selectOption = (questionId: string, optionId: string) => {
    if (hasVoted) return;

    setVotes((prev) => {
      const filtered = prev.filter((v) => v.question_id !== questionId);
      return [...filtered, { question_id: questionId, option_id: optionId }];
    });
  };

  const submitVotes = async () => {
    if (!user || votes.length === 0) return;
    setSubmitting(true);

    const inserts = votes.map((v) => ({
      question_id: v.question_id,
      option_id: v.option_id,
      user_id: user.id,
    }));

    const { error } = await supabase.from("form_responses").insert(inserts);

    if (error) {
      toast({ title: "Error submitting votes", description: error.message, variant: "destructive" });
    } else {
      setHasVoted(true);
      setMyVotes(votes);
      logActivity("poll_voted", { form_id: id, votes_count: votes.length });
      toast({ title: "Votes submitted! 🎉", description: "Your voice has been heard." });
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl animate-spin-slow mb-4">🗳️</div>
          <p className="text-xl text-muted-foreground">Loading the verdict...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">🤷</div>
          <p>Poll not found</p>
          <Link to="/polls">
            <Button className="mt-4">Back to Polls</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      {/* Top Bar */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserMenu />
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/polls">
            <Button variant="outline" size="icon" className="rounded-full border-2 border-primary">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Poll Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-display text-gradient drop-shadow-[0_0_30px_rgba(255,100,150,0.5)] mb-4">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{form.description}</p>
          )}

          {/* Status */}
          <div className="flex justify-center gap-4 mt-6">
            {hasVoted && (
              <span className="px-4 py-2 rounded-full bg-lime-green text-foreground font-bold flex items-center gap-2">
                <Check className="h-4 w-4" /> You've voted!
              </span>
            )}
            {!canSeeResults && (
              <span className="px-4 py-2 rounded-full bg-muted text-muted-foreground font-bold flex items-center gap-2">
                <Lock className="h-4 w-4" /> Results locked
              </span>
            )}
          </div>
        </div>

        {/* Show Results or Voting */}
        {canSeeResults && hasVoted ? (
          <PollResults formId={id!} questions={questions} />
        ) : (
          <>
            {/* Voting Cards */}
            <div className="space-y-8">
              {questions.map((q, qIdx) => {
                const selectedOption = votes.find((v) => v.question_id === q.id)?.option_id;

                return (
                  <Card
                    key={q.id}
                    className="bg-card/80 backdrop-blur-sm border-4 border-secondary/30 rounded-3xl p-8 hover:border-secondary transition-colors"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <span className="w-12 h-12 rounded-full gradient-chaos text-white text-xl font-display flex items-center justify-center">
                        {qIdx + 1}
                      </span>
                      <h3 className="text-2xl font-display text-foreground flex-1">{q.title}</h3>
                    </div>

                    <div className="grid gap-3">
                      {q.options.map((o, oIdx) => {
                        const isSelected = selectedOption === o.id;
                        const isMyVote = myVotes.find((v) => v.question_id === q.id)?.option_id === o.id;

                        return (
                          <button
                            key={o.id}
                            onClick={() => selectOption(q.id, o.id)}
                            disabled={hasVoted}
                            className={`w-full text-left p-4 rounded-2xl border-4 transition-all ${
                              isSelected || isMyVote
                                ? "border-primary bg-primary/20 shadow-glow"
                                : "border-border bg-card/50 hover:border-primary/50 hover:bg-primary/5"
                            } ${hasVoted ? "cursor-default" : "cursor-pointer hover:scale-[1.02]"}`}
                          >
                            <div className="flex items-center gap-4">
                              <span
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                  isSelected || isMyVote
                                    ? "gradient-pink-blue text-white"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="text-lg font-medium">{o.option_text}</span>
                              {(isSelected || isMyVote) && (
                                <Check className="ml-auto h-6 w-6 text-primary" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Submit Button */}
            {!hasVoted && (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border">
                <div className="container mx-auto max-w-4xl flex items-center justify-between">
                  <p className="text-muted-foreground">
                    {votes.length} of {questions.length} questions answered
                  </p>
                  <Button
                    onClick={submitVotes}
                    disabled={votes.length !== questions.length || submitting}
                    size="lg"
                    className="gradient-chaos text-white rounded-2xl px-8 py-6 text-lg shadow-glow hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    {submitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Sparkles className="mr-2" /> Cast Your Vote
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PollVote;
