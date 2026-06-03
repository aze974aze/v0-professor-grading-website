"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth-modal";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Trash2, Ban } from "lucide-react";
import { addComment, deleteComment, banUser } from "@/app/actions/professor";
import type { Comment } from "@/lib/db/schema";

interface CommentSectionProps {
  professorId: number;
  initialComments: Comment[];
}

function CommentCard({
  comment,
  isAdmin,
  onDelete,
  onBanUser,
}: {
  comment: Comment;
  isAdmin: boolean;
  onDelete: () => void;
  onBanUser: () => void;
}) {
  const initials = comment.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex gap-4 rounded-lg border border-border bg-card/50 p-4">
      <Avatar className="h-10 w-10 shrink-0">
        {comment.userImage && (
          <AvatarImage src={comment.userImage} alt={comment.userName} />
        )}
        <AvatarFallback className="bg-primary/10 text-primary text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{comment.userName}</span>
            <span className="text-xs text-muted-foreground">
              {comment.createdAt &&
                formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
            </span>
          </div>
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Admin actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete comment
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete
                        this comment.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive gap-2"
                    >
                      <Ban className="h-4 w-4" />
                      Ban user
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ban user?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will ban {comment.userName} from commenting. They
                        will not be able to post new comments until unbanned.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onBanUser}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Ban User
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p className="mt-1 text-sm text-foreground/90 leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

export function CommentSection({
  professorId,
  initialComments,
}: CommentSectionProps) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [content, setContent] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!isAuthenticated || !user || !content.trim()) return;

    startTransition(async () => {
      try {
        const newComment = await addComment({
          professorId,
          content: content.trim(),
        });
        if (newComment) {
          setComments((prev) => [newComment, ...prev]);
          setContent("");
        }
      } catch (error) {
        console.error("Failed to add comment:", error);
      }
    });
  };

  const handleDeleteComment = (commentId: number) => {
    startTransition(async () => {
      try {
        await deleteComment(commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    });
  };

  const handleBanUser = (userId: string, userName: string) => {
    startTransition(async () => {
      try {
        await banUser(userId, `Banned by admin for inappropriate comment`);
        // Optionally show a toast notification
      } catch (error) {
        console.error("Failed to ban user:", error);
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Comments</CardTitle>
          <p className="text-sm text-muted-foreground">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
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
              disabled={!isAuthenticated || isPending}
              className="min-h-24 resize-none"
            />
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Posting as {user?.name}
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isPending}
                  size="sm"
                >
                  {isPending ? "Posting..." : "Post Comment"}
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
          {comments.length > 0 ? (
            <div className="space-y-3 pt-4 border-t border-border">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  isAdmin={isAdmin}
                  onDelete={() => handleDeleteComment(comment.id)}
                  onBanUser={() => handleBanUser(comment.userId, comment.userName)}
                />
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

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
}
