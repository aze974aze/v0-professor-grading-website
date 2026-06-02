"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useData, Comment } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth-modal";
import { formatDistanceToNow } from "date-fns";

interface CommentSectionProps {
  professorId: string;
}

function CommentCard({ comment }: { comment: Comment }) {
  const initials = comment.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex gap-4 rounded-lg border border-border bg-card/50 p-4">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{comment.userName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="mt-1 text-sm text-foreground/90 leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

export function CommentSection({ professorId }: CommentSectionProps) {
  const { comments, addComment } = useData();
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  const professorComments = comments
    .filter((c) => c.professorId === professorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSubmit = () => {
    if (!isAuthenticated || !user || !content.trim()) return;

    addComment({
      professorId,
      userId: user.id,
      userName: user.name,
      content: content.trim(),
    });

    setContent("");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Comments</CardTitle>
          <p className="text-sm text-muted-foreground">
            {professorComments.length} {professorComments.length === 1 ? "comment" : "comments"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comment Form */}
          <div className="space-y-3">
            <Textarea
              placeholder={
                isAuthenticated
                  ? "Share your experience with this professor..."
                  : "Sign in to leave a comment..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!isAuthenticated}
              className="min-h-24 resize-none"
            />
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Posting as {user?.name}
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim()}
                  size="sm"
                >
                  Post Comment
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowAuthModal(true)}
                variant="outline"
                className="w-full"
              >
                Sign in to comment
              </Button>
            )}
          </div>

          {/* Comments List */}
          {professorComments.length > 0 ? (
            <div className="space-y-3 pt-4 border-t border-border">
              {professorComments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>No comments yet.</p>
              <p className="text-sm">Be the first to share your experience!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </>
  );
}
