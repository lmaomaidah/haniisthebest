import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Trash2, Save, Eye, Lock, Unlock, Sparkles, GripVertical, UserPlus, X, Link as LinkIcon, Copy, RefreshCw, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  invite_token?: string;
  invite_enabled?: boolean;
}

interface Editor {
  id: string;
  user_id: string;
  username?: string;
}

const AVATAR_COLORS = [
  "bg-pink-500",
  "bg-purple-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-teal-500",
];

const getAvatarColor = (username: string) => {
  const hash = username.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const PollEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, logActivity } = useAuth();

  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Collaboration state
  const [editors, setEditors] = useState<Editor[]>([]);
  const [newEditorUsername, setNewEditorUsername] = useState("");
  const [addingEditor, setAddingEditor] = useState(false);
  const [showCollabPanel, setShowCollabPanel] = useState(false);

  // Realtime presence
  const { onlineUsers } = useRealtimePresence({
    channelName: id ? `poll-edit:${id}` : "",
    userId: user?.id,
    username: profile?.username,
  });

  // Handle invite token from URL
  useEffect(() => {
    const inviteToken = searchParams.get('invite');
    if (inviteToken && user && id) {
      handleInviteToken(inviteToken);
    }
  }, [searchParams, user, id]);

  const handleInviteToken = async (token: string) => {
    if (!user || !id) return;

    // Check if the form exists with this invite token and invite is enabled
    const { data: formData, error: formError } = await supabase
      .from("forms")
      .select("id, creator_id, invite_token, invite_enabled")
      .eq("id", id)
      .eq("invite_token", token)
      .eq("invite_enabled", true)
      .single();

    if (formError || !formData) {
      toast({ title: "Invalid invite link", description: "This invite link is invalid or has been revoked.", variant: "destructive" });
      return;
    }

    // Check if already creator
    if (formData.creator_id === user.id) {
      toast({ title: "You're the creator!", description: "You already have full access to this poll." });
      return;
    }

    // Check if already an editor
    const { data: existingEditor } = await supabase
      .from("form_editors")
      .select("id")
      .eq("form_id", id)
      .eq("user_id", user.id)
      .single();

    if (existingEditor) {
      toast({ title: "Already a collaborator", description: "You already have edit access to this poll." });
      return;
    }

    // Add as editor
    const { error } = await supabase
      .from("form_editors")
      .insert({ form_id: id, user_id: user.id });

    if (error) {
      toast({ title: "Error joining", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "You're now a collaborator! 🎉", description: "You can now edit this poll." });
      logActivity("poll_joined_via_invite", { form_id: id });
      fetchEditors();
      // Remove invite token from URL
      navigate(`/polls/${id}/edit`, { replace: true });
    }
  };

  useEffect(() => {
    if (id) {
      fetchForm();
      fetchEditors();
      logActivity("poll_edit_view", { form_id: id });
    }
  }, [id]);

  const fetchEditors = async () => {
    if (!id) return;
    
    const { data: editorsData } = await supabase
      .from("form_editors")
      .select("id, user_id")
      .eq("form_id", id);
    
    if (editorsData && editorsData.length > 0) {
      const userIds = editorsData.map(e => e.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);
      
      const editorsWithUsernames = editorsData.map(e => ({
        ...e,
        username: profiles?.find(p => p.user_id === e.user_id)?.username || "Unknown"
      }));
      
      setEditors(editorsWithUsernames);
    } else {
      setEditors([]);
    }
  };

  const addEditor = async () => {
    if (!id || !newEditorUsername.trim()) return;
    setAddingEditor(true);
    
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, username")
      .eq("username", newEditorUsername.trim())
      .single();
    
    if (profileError || !profileData) {
      toast({ title: "User not found", description: "No user with that username exists.", variant: "destructive" });
      setAddingEditor(false);
      return;
    }
    
    if (editors.some(e => e.user_id === profileData.user_id)) {
      toast({ title: "Already an editor", description: "This user is already a collaborator.", variant: "destructive" });
      setAddingEditor(false);
      return;
    }
    
    if (form?.creator_id === profileData.user_id) {
      toast({ title: "That's the creator!", description: "The creator already has full access.", variant: "destructive" });
      setAddingEditor(false);
      return;
    }
    
    const { data, error } = await supabase
      .from("form_editors")
      .insert({ form_id: id, user_id: profileData.user_id })
      .select()
      .single();
    
    if (error) {
      toast({ title: "Error adding editor", description: error.message, variant: "destructive" });
    } else if (data) {
      setEditors([...editors, { ...data, username: profileData.username }]);
      setNewEditorUsername("");
      toast({ title: "Collaborator added! 🎉", description: `${profileData.username} can now edit this poll.` });
      logActivity("poll_editor_added", { form_id: id, editor_user_id: profileData.user_id });
    }
    
    setAddingEditor(false);
  };

  const removeEditor = async (editorId: string, editorUsername?: string) => {
    const { error } = await supabase
      .from("form_editors")
      .delete()
      .eq("id", editorId);
    
    if (error) {
      toast({ title: "Error removing editor", description: error.message, variant: "destructive" });
    } else {
      setEditors(editors.filter(e => e.id !== editorId));
      toast({ title: "Collaborator removed", description: `${editorUsername || "User"} can no longer edit this poll.` });
    }
  };

  const toggleInviteLink = async () => {
    if (!form || !id) return;
    
    const newEnabled = !form.invite_enabled;
    const { error } = await supabase
      .from("forms")
      .update({ invite_enabled: newEnabled })
      .eq("id", id);

    if (error) {
      toast({ title: "Error updating invite settings", description: error.message, variant: "destructive" });
    } else {
      setForm({ ...form, invite_enabled: newEnabled });
      toast({ title: newEnabled ? "Invite link enabled! 🔗" : "Invite link disabled 🔒" });
    }
  };

  const regenerateInviteToken = async () => {
    if (!form || !id) return;
    
    const { data, error } = await supabase
      .from("forms")
      .update({ invite_token: crypto.randomUUID() })
      .eq("id", id)
      .select("invite_token")
      .single();

    if (error) {
      toast({ title: "Error regenerating link", description: error.message, variant: "destructive" });
    } else if (data) {
      setForm({ ...form, invite_token: data.invite_token });
      toast({ title: "Invite link regenerated! 🔄", description: "Previous links are now invalid." });
    }
  };

  const copyInviteLink = () => {
    if (!form?.invite_token) return;
    const inviteUrl = `${window.location.origin}/polls/${id}/edit?invite=${form.invite_token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({ title: "Link copied! 📋", description: "Share this link with collaborators." });
  };

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

    await supabase.from("forms").update({
      title: form.title,
      description: form.description,
      is_published: form.is_published,
      results_revealed: form.results_revealed,
      results_revealed_at: form.results_revealed ? new Date().toISOString() : null,
    }).eq("id", id);

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

  const isCreator = user?.id === form?.creator_id;

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
      
      {/* Realtime presence indicator */}
      {onlineUsers.length > 0 && (
        <div className="fixed bottom-6 left-6 z-50 bg-card/90 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Editing now:</span>
            <TooltipProvider>
              <div className="flex -space-x-2">
                {onlineUsers.slice(0, 5).map((u) => (
                  <Tooltip key={u.id}>
                    <TooltipTrigger>
                      <Avatar className={`h-7 w-7 border-2 border-card ${getAvatarColor(u.username)}`}>
                        <AvatarFallback className="text-white text-xs font-bold">
                          {u.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>@{u.username}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {onlineUsers.length > 5 && (
                  <Avatar className="h-7 w-7 border-2 border-card bg-muted">
                    <AvatarFallback className="text-xs font-bold">
                      +{onlineUsers.length - 5}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </TooltipProvider>
          </div>
        </div>
      )}

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

              {/* Collaboration Toggle - Only for creators */}
              {isCreator && (
                <Button
                  onClick={() => setShowCollabPanel(!showCollabPanel)}
                  variant={showCollabPanel ? "default" : "outline"}
                  className="rounded-2xl border-2"
                >
                  <UserPlus className="mr-2 h-4 w-4" /> 
                  Collaborators {editors.length > 0 && `(${editors.length})`}
                </Button>
              )}
            </div>

            {/* Collaboration Panel */}
            {showCollabPanel && isCreator && (
              <div className="mt-4 pt-4 border-t border-border space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Invite by Username
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={newEditorUsername}
                      onChange={(e) => setNewEditorUsername(e.target.value)}
                      placeholder="Enter username..."
                      className="flex-1 border-2 rounded-xl"
                      onKeyDown={(e) => e.key === "Enter" && addEditor()}
                    />
                    <Button 
                      onClick={addEditor} 
                      disabled={addingEditor || !newEditorUsername.trim()}
                      className="bg-lime-green text-foreground rounded-xl"
                    >
                      {addingEditor ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </div>

                {/* Invite Link Section */}
                <div className="p-4 bg-secondary/10 rounded-2xl border-2 border-secondary/30">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-secondary" />
                    Invite by Link
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Anyone with this link can become a collaborator.
                  </p>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <Switch
                      checked={form.invite_enabled || false}
                      onCheckedChange={toggleInviteLink}
                    />
                    <span className="font-medium">
                      {form.invite_enabled ? "🔗 Link Active" : "🔒 Link Disabled"}
                    </span>
                  </div>

                  {form.invite_enabled && (
                    <div className="flex gap-2">
                      <Button
                        onClick={copyInviteLink}
                        variant="outline"
                        className="flex-1 rounded-xl border-2"
                      >
                        <Copy className="mr-2 h-4 w-4" /> Copy Link
                      </Button>
                      <Button
                        onClick={regenerateInviteToken}
                        variant="outline"
                        className="rounded-xl border-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Current Editors */}
                <div>
                  <h4 className="font-bold text-sm text-muted-foreground mb-2">Current Collaborators</h4>
                  {editors.length > 0 ? (
                    <div className="space-y-2">
                      {editors.map((editor) => (
                        <div
                          key={editor.id}
                          className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl border-2 border-secondary/30"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className={`h-8 w-8 ${getAvatarColor(editor.username || "")}`}>
                              <AvatarFallback className="text-white text-xs font-bold">
                                {(editor.username || "U").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">@{editor.username}</span>
                            {onlineUsers.some(u => u.id === editor.user_id) && (
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Online now" />
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => removeEditor(editor.id, editor.username)}
                          >
                            <X className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No collaborators yet. Add someone by username or share the invite link!
                    </p>
                  )}
                </div>
              </div>
            )}
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
