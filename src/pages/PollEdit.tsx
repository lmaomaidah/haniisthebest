import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Trash2, Save, Eye, Lock, Unlock, Sparkles, GripVertical, UserPlus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import WhimsicalBackground from "@/components/WhimsicalBackground";

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
  creator_id: string;
}

interface Editor {
  id: string;
  user_id: string;
  username?: string;
}

const PollEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logActivity } = useAuth();

  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (id) {
      fetchForm();
      logActivity("poll_edit_view", { form_id: id });
    }
  }, [id]);

  const fetchForm = async () => {
    if (!id) return;

    const { data: formData, error: formError } = await supabase
      .from("forms")
      .select("*")
      .eq("id", id)
      .single();

    if (formError) {
      toast({ title: "Error loading poll", description: formError.message, variant: "destructive" });
      navigate("/polls");
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
  };

  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = setTimeout(() => saveForm(), 2000);
    setAutoSaveTimer(timer);
  }, [autoSaveTimer]);

  const saveForm = async () => {
    if (!form || !id) return;
    setSaving(true);

    // Update form
    await supabase.from("forms").update({
      title: form.title,
      description: form.description,
      is_published: form.is_published,
      results_revealed: form.results_revealed,
      results_revealed_at: form.results_revealed ? new Date().toISOString() : null,
    }).eq("id", id);

    // Update questions and options
    for (const q of questions) {
      await supabase.from("form_questions").upsert({
        id: q.id,
        form_id: id,
        title: q.title,
        question_order: q.question_order,
      });

      for (const o of q.options) {
        await supabase.from("form_options").upsert({
          id: o.id,
          question_id: q.id,
          option_text: o.option_text,
          option_order: o.option_order,
        });
      }
    }

    setSaving(false);
    toast({ title: "Saved! ✨", duration: 1500 });
  };

  const updateFormField = (field: keyof Form, value: any) => {
    if (!form) return;
    setForm({ ...form, [field]: value });
    triggerAutoSave();
  };

  const addQuestion = async () => {
    if (!id) return;
    const newOrder = questions.length;
    
    const { data, error } = await supabase
      .from("form_questions")
      .insert({ form_id: id, title: "New Question", question_order: newOrder })
      .select()
      .single();

    if (data) {
      setQuestions([...questions, { ...data, options: [] }]);
    }
  };

  const updateQuestion = (qId: string, title: string) => {
    setQuestions(questions.map((q) => (q.id === qId ? { ...q, title } : q)));
    triggerAutoSave();
  };

  const deleteQuestion = async (qId: string) => {
    await supabase.from("form_questions").delete().eq("id", qId);
    setQuestions(questions.filter((q) => q.id !== qId));
    toast({ title: "Question deleted 🗑️" });
  };

  const addOption = async (qId: string) => {
    const question = questions.find((q) => q.id === qId);
    if (!question) return;

    const newOrder = question.options.length;
    const { data } = await supabase
      .from("form_options")
      .insert({ question_id: qId, option_text: "New Option", option_order: newOrder })
      .select()
      .single();

    if (data) {
      setQuestions(
        questions.map((q) =>
          q.id === qId ? { ...q, options: [...q.options, data] } : q
        )
      );
    }
  };

  const updateOption = (qId: string, oId: string, text: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((o) => (o.id === oId ? { ...o, option_text: text } : o)),
            }
          : q
      )
    );
    triggerAutoSave();
  };

  const deleteOption = async (qId: string, oId: string) => {
    await supabase.from("form_options").delete().eq("id", oId);
    setQuestions(
      questions.map((q) =>
        q.id === qId ? { ...q, options: q.options.filter((o) => o.id !== oId) } : q
      )
    );
  };

  const toggleReveal = async () => {
    if (!form) return;
    const newVal = !form.results_revealed;
    setForm({ ...form, results_revealed: newVal });
    
    await supabase.from("forms").update({
      results_revealed: newVal,
      results_revealed_at: newVal ? new Date().toISOString() : null,
    }).eq("id", form.id);

    logActivity(newVal ? "poll_results_revealed" : "poll_results_hidden", { form_id: form.id });
    toast({ title: newVal ? "Results revealed! 🎉" : "Results hidden 🔒" });
  };

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-6xl animate-spin-slow">🎡</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      <WhimsicalBackground />
      {/* Top Bar */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserMenu />
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/polls">
            <Button variant="outline" size="icon" className="rounded-full border-2 border-primary">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-display text-gradient">
            Edit Poll ✏️
          </h1>
          <div className="ml-auto flex gap-2">
            {saving && <span className="text-sm text-muted-foreground animate-pulse">Saving...</span>}
            <Button onClick={saveForm} className="gradient-pink-blue text-white rounded-2xl">
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </div>
        </div>

        {/* Form Details */}
        <Card className="bg-card/80 backdrop-blur-sm border-4 border-primary/30 rounded-3xl p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-muted-foreground mb-2 block">Poll Title</label>
              <Input
                value={form.title}
                onChange={(e) => updateFormField("title", e.target.value)}
                className="text-2xl font-display border-2 rounded-2xl"
                placeholder="What's the big question?"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-muted-foreground mb-2 block">Description (optional)</label>
              <Textarea
                value={form.description || ""}
                onChange={(e) => updateFormField("description", e.target.value)}
                className="border-2 rounded-2xl"
                placeholder="Set the stage for your audience..."
                rows={3}
              />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-6 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.is_published}
                  onCheckedChange={(v) => updateFormField("is_published", v)}
                />
                <span className="font-bold">{form.is_published ? "🟢 Published" : "📝 Draft"}</span>
              </div>

              <Button
                onClick={toggleReveal}
                variant={form.results_revealed ? "default" : "outline"}
                className={`rounded-2xl border-2 transition-all ${
                  form.results_revealed
                    ? "gradient-chaos text-white animate-pulse-glow"
                    : "hover:bg-secondary/20"
                }`}
              >
                {form.results_revealed ? (
                  <>
                    <Unlock className="mr-2 h-4 w-4" /> Results Revealed ✨
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" /> Reveal Results
                  </>
                )}
              </Button>

              {form.is_published && (
                <Link to={`/polls/${form.id}`}>
                  <Button variant="outline" className="rounded-2xl border-2">
                    <Eye className="mr-2 h-4 w-4" /> Preview
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>

        {/* Questions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display text-foreground">Questions</h2>
            <Button onClick={addQuestion} className="bg-lime-green text-foreground rounded-2xl">
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>

          {questions.length === 0 ? (
            <Card className="p-8 text-center bg-card/60 border-4 border-dashed border-muted rounded-3xl">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">No questions yet. Add your first question!</p>
            </Card>
          ) : (
            questions.map((q, qIdx) => (
              <Card
                key={q.id}
                className="bg-card/80 backdrop-blur-sm border-4 border-secondary/30 rounded-3xl p-6 hover:border-secondary transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="h-5 w-5" />
                    <span className="text-2xl font-display">{qIdx + 1}</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <Input
                      value={q.title}
                      onChange={(e) => updateQuestion(q.id, e.target.value)}
                      className="text-xl font-bold border-2 rounded-2xl"
                      placeholder="Enter your question..."
                    />

                    {/* Options */}
                    <div className="space-y-2 pl-4 border-l-4 border-accent/30">
                      {q.options.map((o, oIdx) => (
                        <div key={o.id} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-bold">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <Input
                            value={o.option_text}
                            onChange={(e) => updateOption(q.id, o.id, e.target.value)}
                            className="flex-1 border-2 rounded-xl"
                            placeholder="Option text..."
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => deleteOption(q.id, o.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-2 border-dashed"
                        onClick={() => addOption(q.id)}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add Option
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => deleteQuestion(q.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PollEdit;
