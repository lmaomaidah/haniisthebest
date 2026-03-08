import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useComments, type Comment } from "@/hooks/useComments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageCircle,
  Reply,
  Trash2,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface CommentSectionProps {
  contentType: string;
  contentId: string | undefined;
}

function SingleComment({
  comment,
  depth,
  onReply,
  onDelete,
  currentUserId,
  isAdmin,
}: {
  comment: Comment;
  depth: number;
  onReply: (parentId: string) => void;
  onDelete: (id: string) => void;
  currentUserId?: string;
  isAdmin: boolean;
}) {
  const [showReplies, setShowReplies] = useState(true);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const canDelete = currentUserId === comment.user_id || isAdmin;

  // Generate a stable avatar color from username
  const avatarHue =
    (comment.username || "")
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;

  return (
    <div
      className={`group ${depth > 0 ? "ml-6 md:ml-10" : ""}`}
      style={{ marginTop: depth > 0 ? "0.5rem" : "1rem" }}
    >
      {/* Comment bubble */}
      <div className="relative">
        {/* Thread line */}
        {depth > 0 && (
          <div
            className="absolute -left-5 top-0 bottom-0 w-px bg-border/50"
            style={{ left: "-1.25rem" }}
          />
        )}

        <div className="flex gap-3 items-start">
          {/* Avatar */}
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={comment.avatar_url || undefined} alt={comment.username} />
            <AvatarFallback
              style={{
                backgroundColor: `hsl(${avatarHue} 70% 55%)`,
              }}
            >
              {(comment.username || "?")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Body */}
          <div className="flex-1 min-w-0">
            <div className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-2xl rounded-tl-sm px-4 py-2.5 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-foreground font-['Schoolbell']">
                  {comment.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(comment.created_at), "MMM d, h:mm a")}
                </span>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                {comment.body}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 mt-1 ml-1">
              <button
                onClick={() => onReply(comment.id)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors px-2 py-0.5 rounded-full hover:bg-accent/10"
              >
                <Reply className="h-3 w-3" /> Reply
              </button>

              {canDelete && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-0.5 rounded-full hover:bg-destructive/10 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              )}

              {hasReplies && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded-full hover:bg-muted/30"
                >
                  {showReplies ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {comment.replies!.length}{" "}
                  {comment.replies!.length === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      {showReplies &&
        hasReplies &&
        comment.replies!.map((reply) => (
          <SingleComment
            key={reply.id}
            comment={reply}
            depth={depth + 1}
            onReply={onReply}
            onDelete={onDelete}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
          />
        ))}
    </div>
  );
}

export function CommentSection({ contentType, contentId }: CommentSectionProps) {
  const { user, isAdmin } = useAuth();
  const { comments, loading, addComment, deleteComment } = useComments(
    contentType,
    contentId
  );
  const [newBody, setNewBody] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (parentId?: string) => {
    if (!user) return;
    const body = parentId ? replyBody : newBody;
    if (!body.trim()) return;

    setSubmitting(true);
    try {
      await addComment(body, user.id, parentId);
      if (parentId) {
        setReplyBody("");
        setReplyingTo(null);
      } else {
        setNewBody("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id);
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(replyingTo === parentId ? null : parentId);
    setReplyBody("");
  };

  const totalCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  );

  if (!contentId) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-secondary/20">
          <MessageCircle className="h-4 w-4 text-secondary" />
        </div>
        <h3 className="text-lg font-bold text-foreground font-['Schoolbell']">
          Comments
        </h3>
        {totalCount > 0 && (
          <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
            {totalCount}
          </span>
        )}
      </div>

      {/* New comment input */}
       {user && (
         <div className="flex gap-3 items-start">
           <Avatar className="h-8 w-8 flex-shrink-0">
             <AvatarImage src={user.user_metadata?.avatar_url || undefined} alt={user.user_metadata?.username} />
             <AvatarFallback className="bg-primary text-primary-foreground">
               {(user.user_metadata?.username || "?")[0]?.toUpperCase() || "?"}
             </AvatarFallback>
           </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Write a comment… 💬"
              className="min-h-[60px] bg-card/50 border-border/50 rounded-2xl rounded-tl-sm resize-none text-sm"
              rows={2}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => handleSubmit()}
                disabled={!newBody.trim() || submitting}
                className="rounded-full px-4 gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                Post
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading comments…
          </p>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground italic">
            No comments yet. Be the first to say something! 💭
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => (
            <div key={comment.id}>
              <SingleComment
                comment={comment}
                depth={0}
                onReply={handleReply}
                onDelete={handleDelete}
                currentUserId={user?.id}
                isAdmin={isAdmin}
              />

              {/* Reply input */}
              {replyingTo === comment.id && user && (
                <div className="ml-14 mt-2 flex gap-2 items-start">
                  <Textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder={`Reply to ${comment.username}…`}
                    className="min-h-[50px] bg-card/50 border-border/50 rounded-xl resize-none text-sm flex-1"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleSubmit(comment.id)}
                      disabled={!replyBody.trim() || submitting}
                      className="rounded-full h-8 w-8 p-0"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyingTo(null)}
                      className="rounded-full h-8 w-8 p-0 text-muted-foreground"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
