import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ArrowLeft, Lock, Unlock, Users, Calendar, Trash2, Edit2, Sparkles } from "lucide-react";
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

  useEffect(() => { logActivity("page_view", { page: "polls" }); fetchForms(); }, []);
  useEffect(() => { if (user) fetchEditorAssignments(); else setEditorFormIds(new Set()); }, [user]);

  const fetchForms = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("forms").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Error loading polls", description: error.message, variant: "destructive" });
    else setForms(data || []);
    setLoading(false);
  };

  const fetchEditorAssignments = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("form_editors").select("form_id").eq("user_id", user.id);
    if (!error) setEditorFormIds(new Set((data || []).map((r) => r.form_id)));
  };

  const createNewForm = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("forms").insert({ creator_id: user.id, title: "Untitled Poll" }).select().single();
    if (error) toast({ title: "Error creating poll", description: error.message, variant: "destructive" });
    else { logActivity("poll_created", { form_id: data.id }); navigate(`/polls/${data.id}/edit`); }
  };

  const deleteForm = async (formId: string) => {
    const { error } = await supabase.from("forms").delete().eq("id", formId);
    if (error) toast({ title: "Error deleting poll", description: error.message, variant: "destructive" });
    else { logActivity("poll_deleted", { form_id: formId }); setForms(forms.filter((f) => f.id !== formId)); toast({ title: "Poll deleted! 🗑️" }); }
  };

  const canEdit = (form: Form) => user?.id === form.creator_id || isAdmin || editorFormIds.has(form.id);
  const canDelete = (form: Form) => user?.id === form.creator_id || isAdmin;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <WhimsicalBackground />
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3"><UserMenu /><ThemeToggle /></div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/"><Button variant="outline" size="icon" className="rounded-full border-2 border-primary/50"><ArrowLeft className="h-5 w-5" /></Button></Link>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gradient font-['Luckiest_Guy'] tracking-wide">🗳️ Crowd Verdicts</h1>
              <p className="text-muted-foreground text-sm mt-1">{forms.length} polls created</p>
            </div>
          </div>
          <Button onClick={createNewForm} className="gradient-pink-blue text-white rounded-xl px-6 hover:scale-105 transition-transform">
            <Plus className="mr-2 h-4 w-4" /> New Poll
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary/40 animate-spin-slow" />
            <p className="text-xl text-muted-foreground">Loading the verdicts...</p>
          </div>
        ) : forms.length === 0 ? (
          <Card className="p-12 text-center bg-card/80 backdrop-blur-sm border-2 border-dashed border-primary/40 rounded-2xl">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">No polls yet!</h3>
            <p className="text-muted-foreground mb-6">Create your first crowd verdict and watch opinions clash.</p>
            <Button onClick={createNewForm} className="gradient-pink-blue text-white rounded-xl px-6"><Plus className="mr-2" /> Create First Poll</Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map((form) => (
              <Card
                key={form.id}
                className="group relative overflow-hidden bg-card/70 backdrop-blur-sm border border-border/40 rounded-xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Top gradient accent */}
                <div className={`h-1 w-full bg-gradient-to-r ${form.is_published ? 'from-primary to-secondary' : 'from-muted-foreground/30 to-muted-foreground/10'}`} />

                <div className="p-5">
                  {/* Status badges */}
                  <div className="flex gap-1.5 mb-3">
                    {form.is_published ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">LIVE</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">DRAFT</span>
                    )}
                    {form.results_revealed ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary/20 text-secondary border border-secondary/30 flex items-center gap-0.5"><Unlock className="h-2.5 w-2.5" /> REVEALED</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border flex items-center gap-0.5"><Lock className="h-2.5 w-2.5" /> LOCKED</span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">{form.title}</h3>
                  {form.description && <p className="text-muted-foreground text-xs mb-3 line-clamp-2">{form.description}</p>}

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-4">
                    <Calendar className="h-3 w-3" />
                    {new Date(form.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {form.is_published && (
                      <Link to={`/polls/${form.id}`}>
                        <Button size="sm" className="gradient-pink-blue text-white rounded-lg text-xs h-8 hover:scale-105 transition-transform">
                          <Users className="mr-1 h-3 w-3" /> Vote
                        </Button>
                      </Link>
                    )}
                    {canEdit(form) && (
                      <Link to={`/polls/${form.id}/edit`}>
                        <Button variant="outline" size="sm" className="rounded-lg text-xs h-8 border-border/60 hover:border-primary/50">
                          <Edit2 className="mr-1 h-3 w-3" /> Edit
                        </Button>
                      </Link>
                    )}
                    {canDelete(form) && (
                      <Button variant="ghost" size="sm" className="rounded-lg text-xs h-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10" onClick={() => deleteForm(form.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
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
