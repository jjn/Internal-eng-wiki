import { useState } from "react";
import { comments as initialComments } from "../data/comments";

function timeAgo(dateString) {
  const now = new Date("2026-05-11T15:00:00Z");
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function CommentSection() {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: `c${Date.now()}`,
      userId: "u5",
      author: "Jordan Kim",
      avatarColor: "#ff9800",
      timestamp: new Date().toISOString(),
      text: newComment.trim(),
    };

    setComments([...comments, comment]);
    setNewComment("");
  };

  return (
    <section className="comments-section">
      <h2>Comments ({comments.length})</h2>

      {comments.map((comment) => (
        <div key={comment.id} className="comment">
          <div
            className="comment-avatar"
            style={{ background: comment.avatarColor }}
          >
            {getInitials(comment.author)}
          </div>
          <div className="comment-body">
            <div className="comment-header">
              <span className="comment-author">{comment.author}</span>
              <span className="comment-time">
                {timeAgo(comment.timestamp)}
              </span>
            </div>
            <p className="comment-text">{comment.text}</p>
          </div>
        </div>
      ))}

      <form className="new-comment-form" onSubmit={handleSubmit}>
        <div
          className="comment-avatar"
          style={{ background: "#ff9800" }}
        >
          JK
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Leave a comment..."
            rows={3}
          />
          <div>
            <button
              type="submit"
              className="btn-primary"
              disabled={!newComment.trim()}
            >
              Comment
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
