import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ArrowLeft, Lock, Unlock, Users, Calendar, Trash2, Edit2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import WhimsicalBackground from "@/components/WhimsicalBackground";

interface Form {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  results_revealed: boolean;
  results_revealed_at: string | null;
  created_at: string;
  creator_id: string;
}

const Polls = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logActivity } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorFormIds, setEditorFormIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    logActivity("page_view", { page: "polls" });
    fetchForms();
  }, []);

  useEffect(() => {
    if (user) fetchEditorAssignments();
    else setEditorFormIds(new Set());
  }, [user]);

  const fetchForms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading polls", description: error.message, variant: "destructive" });
    } else {
      setForms(data || []);
    }
    setLoading(false);
  };

  const fetchEditorAssignments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("form_editors")
      .select("form_id")
      .eq("user_id", user.id);

    if (error) return;
    setEditorFormIds(new Set((data || []).map((r) => r.form_id)));
  };

  const createNewForm = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("forms")
      .insert({ creator_id: user.id, title: "Untitled Poll" })
      .select()
      .single();

    if (error) {
      toast({ title: "Error creating poll", description: error.message, variant: "destructive" });
    } else {
      logActivity("poll_created", { form_id: data.id });
      navigate(`/polls/${data.id}/edit`);
    }
  };

  const deleteForm = async (formId: string) => {
    const { error } = await supabase.from("forms").delete().eq("id", formId);
    if (error) {
      toast({ title: "Error deleting poll", description: error.message, variant: "destructive" });
    } else {
      logActivity("poll_deleted", { form_id: formId });
      setForms(forms.filter((f) => f.id !== formId));
      toast({ title: "Poll deleted! 🗑️" });
    }
  };

  const canEdit = (form: Form) => user?.id === form.creator_id || isAdmin || editorFormIds.has(form.id);
  const canDelete = (form: Form) => user?.id === form.creator_id || isAdmin;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <WhimsicalBackground />
      {/* Top Bar */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserMenu />
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="icon" className="rounded-full border-2 border-primary">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-5xl md:text-7xl font-display text-gradient drop-shadow-[0_0_30px_rgba(255,100,150,0.5)]">
            Crowd Verdicts 🗳️
          </h1>
        </div>

        {/* Create Button */}
        <div className="mb-8">
          <Button
            onClick={createNewForm}
            size="lg"
            className="gradient-chaos text-white text-xl px-8 py-6 rounded-3xl shadow-glow hover:scale-105 transition-transform"
          >
            <Plus className="mr-2 h-6 w-6" />
            Create New Poll ✨
          </Button>
        </div>

        {/* Forms Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl animate-spin-slow">🎡</div>
            <p className="text-xl mt-4 text-muted-foreground">Loading the verdicts...</p>
          </div>
        ) : forms.length === 0 ? (
          <Card className="p-12 text-center bg-card/80 backdrop-blur-sm border-4 border-dashed border-primary/50 rounded-3xl">
            <div className="text-8xl mb-4">📝</div>
            <h3 className="text-2xl font-display mb-2">No polls yet!</h3>
            <p className="text-muted-foreground mb-6">Create your first crowd verdict and watch opinions clash.</p>
            <Button onClick={createNewForm} className="gradient-pink-blue text-white rounded-2xl px-6 py-3">
              <Plus className="mr-2" /> Create First Poll
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card
                key={form.id}
                className="group relative overflow-hidden bg-card/80 backdrop-blur-sm border-4 border-primary/30 rounded-3xl p-6 hover:border-primary transition-all hover:shadow-glow hover:scale-[1.02]"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {form.is_published ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-green text-foreground">
                      LIVE
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground">
                      DRAFT
                    </span>
                  )}
                  {form.results_revealed ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary text-secondary-foreground flex items-center gap-1">
                      <Unlock className="h-3 w-3" /> REVEALED
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground flex items-center gap-1">
                      <Lock className="h-3 w-3" /> LOCKED
                    </span>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-display text-foreground mt-8 mb-2 line-clamp-2">
                  {form.title}
                </h3>
                {form.description && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{form.description}</p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(form.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {form.is_published && (
                    <Link to={`/polls/${form.id}`}>
                      <Button className="gradient-pink-blue text-white rounded-2xl text-sm">
                        <Users className="mr-1 h-4 w-4" /> Vote Now
                      </Button>
                    </Link>
                  )}
                  {canEdit(form) && (
                    <Link to={`/polls/${form.id}/edit`}>
                      <Button variant="outline" className="rounded-2xl text-sm border-2">
                        <Edit2 className="mr-1 h-4 w-4" /> Edit
                      </Button>
                    </Link>
                  )}
                  {canDelete(form) && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="rounded-2xl"
                      onClick={() => deleteForm(form.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Polls;
