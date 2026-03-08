import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Comment {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
  username?: string;
  replies?: Comment[];
}

export function useComments(contentType: string, contentId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!contentId) return;
    setLoading(true);

    const { data } = await supabase
      .from("comments")
      .select("*, profiles!comments_user_id_fkey(username)")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .order("created_at", { ascending: true });

    if (data) {
      const flat: Comment[] = (data as any[]).map((c) => ({
        ...c,
        username: c.profiles?.username || "Unknown",
        replies: [],
      }));

      // Build tree
      const map = new Map<string, Comment>();
      const roots: Comment[] = [];
      for (const c of flat) {
        map.set(c.id, c);
      }
      for (const c of flat) {
        if (c.parent_id && map.has(c.parent_id)) {
          map.get(c.parent_id)!.replies!.push(c);
        } else {
          roots.push(c);
        }
      }
      setComments(roots);
    }
    setLoading(false);
  }, [contentType, contentId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Realtime subscription
  useEffect(() => {
    if (!contentId) return;

    const channel = supabase
      .channel(`comments-${contentType}-${contentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `content_id=eq.${contentId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contentType, contentId, fetchComments]);

  const addComment = async (body: string, userId: string, parentId?: string) => {
    if (!contentId || !body.trim()) return;

    const { error } = await supabase.from("comments").insert({
      user_id: userId,
      content_type: contentType,
      content_id: contentId,
      parent_id: parentId || null,
      body: body.trim(),
    });

    if (error) throw error;
    // Realtime will handle refresh
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    if (error) throw error;
  };

  return { comments, loading, addComment, deleteComment, refetch: fetchComments };
}
