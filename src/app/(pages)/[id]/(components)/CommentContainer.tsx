"use client"

import { useEffect, useState, useCallback } from "react"
import { IComment } from "@/interfaces"
import AddCommentForm from "./AddCommentForm"
import { HiArrowLeft } from "react-icons/hi2"

interface CommentContainerProps {
  photoId: string;
  toggleShowPhoto: () => void;
}

const CommentContainer = ({ photoId, toggleShowPhoto }: CommentContainerProps) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/comments?photoId=${photoId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch comments");
      }

      const { comments } = await res.json();
      setComments(comments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch comments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [photoId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleReply = (commentId: string) => {
    setReplyTo(commentId);
    setShowForm(true);
  };

  const handleVote = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) {
        throw new Error("Failed to vote");
      }

      await fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const getCommentStatus = (comment: IComment) => {
    if (!comment.isOriginalRequest) return null;
    
    switch (comment.originalRequestStatus) {
      case 'pending':
        return <span className="text-yellow-600">Pending</span>;
      case 'approved':
        return <span className="text-green-600">Approved</span>;
      case 'rejected':
        return <span className="text-red-600">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-stone-900">
      <div className="p-4 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center">
        <button
          onClick={toggleShowPhoto}
          className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
          aria-label="Back to photo"
        >
          <HiArrowLeft className="text-xl" />
        </button>
        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">Comments</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-stone-600 dark:bg-stone-500 rounded-md hover:bg-stone-700 dark:hover:bg-stone-600 transition-colors duration-200"
        >
          Add Comment
        </button>
      </div>

      {showForm ? (
        <div className="p-4">
          <AddCommentForm
            photoId={photoId}
            setShowForm={() => {
              setShowForm(false);
              setReplyTo(null);
              fetchComments();
            }}
            replyTo={replyTo || undefined}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-600 dark:border-stone-200"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 dark:text-red-400 text-center">{error}</div>
          ) : comments.length === 0 ? (
            <div className="text-stone-500 dark:text-stone-400 text-center">No comments yet</div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="bg-stone-50 dark:bg-stone-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-stone-800 dark:text-stone-200">{comment.username}</h3>
                    <p className="text-stone-600 dark:text-stone-300 mt-1">{comment.text}</p>
                    {getCommentStatus(comment)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVote(comment._id)}
                      className="text-stone-500 dark:text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                    >
                      ↑ {comment.vote}
                    </button>
                    <button
                      onClick={() => handleReply(comment._id)}
                      className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommentContainer;
