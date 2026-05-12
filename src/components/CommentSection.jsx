import { useState, useRef } from "react";
import { comments as initialComments } from "../data/comments";
import { users } from "../data/users";

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

function renderCommentText(text) {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      const username = part.slice(1);
      const user = users.find((u) => u.username === username);
      if (user) {
        return (
          <span key={`mention-${i}-${username}`} className="mention">
            {part}
          </span>
        );
      }
    }
    return <span key={`text-${i}`}>{part}</span>;
  });
}

export default function CommentSection() {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const textareaRef = useRef(null);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleTextareaChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setNewComment(value);

    const textBeforeCursor = value.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf("@");

    if (atIndex !== -1) {
      const afterAt = textBeforeCursor.slice(atIndex + 1);
      if (!afterAt.includes(" ") && !afterAt.includes("\n")) {
        setMentionQuery(afterAt);
        setMentionStartIndex(atIndex);
        setShowMentionDropdown(true);
        return;
      }
    }

    setShowMentionDropdown(false);
    setMentionQuery("");
    setMentionStartIndex(-1);
  };

  const handleMentionSelect = (user) => {
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const before = newComment.slice(0, mentionStartIndex);
    const after = newComment.slice(cursorPos);
    const inserted = `@${user.username} `;
    const updatedValue = before + inserted + after;

    setNewComment(updatedValue);
    setShowMentionDropdown(false);
    setMentionQuery("");
    setMentionStartIndex(-1);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = before.length + inserted.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

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
    setShowMentionDropdown(false);
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
            <p className="comment-text">{renderCommentText(comment.text)}</p>
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
          <div className="mention-wrapper">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={handleTextareaChange}
              placeholder="Leave a comment... Type @ to mention a coworker"
              rows={3}
            />
            {showMentionDropdown && filteredUsers.length > 0 && (
              <ul className="mention-dropdown">
                {filteredUsers.map((user) => (
                  <li
                    key={user.id}
                    className="mention-dropdown-item"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleMentionSelect(user);
                    }}
                  >
                    <span
                      className="mention-dropdown-avatar"
                      style={{ background: user.avatarColor }}
                    >
                      {getInitials(user.name)}
                    </span>
                    <span className="mention-dropdown-name">{user.name}</span>
                    <span className="mention-dropdown-username">@{user.username}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
