import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
  };
}

interface Props {
  projectId: number;
  taskId?: number;
}

const CommentsSection = ({ projectId, taskId }: Props) => {

  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // =========================
  // LOAD COMMENTS
  // =========================
  const loadComments = async () => {
    try {

      const response = await api.get("/comments", {
        params: {
          project_id: projectId,
          task_id: taskId
        }
      });

      setComments(response.data.data);

    } catch {
      toast.error("Failed to load comments");
    }
  };

  useEffect(() => {
    loadComments();
  }, [projectId, taskId]);

  // =========================
  // CREATE COMMENT
  // =========================
  const handleSubmit = async () => {

    if (!content.trim()) return;

    try {

      await api.post("/comments", {
        project_id: projectId,
        task_id: taskId,
        content
      });

      setContent("");
      loadComments();

    } catch {
      toast.error("Failed to add comment");
    }

  };

  // =========================
  // START EDIT
  // =========================
  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditingContent(comment.content);
  };

  // =========================
  // SAVE EDIT
  // =========================
  const saveEdit = async () => {

    if (!editingId) return;

    try {

      await api.put(`/comments/${editingId}`, {
        content: editingContent
      });

      setEditingId(null);
      setEditingContent("");
      loadComments();

      toast.success("Comment updated");

    } catch {
      toast.error("Failed to update comment");
    }

  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent("");
  };

  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <h3 className="mb-4 text-xl font-semibold">
        Comments
      </h3>

      {/* COMMENTS LIST */}
      <div className="flex-1 pr-1 mb-4 space-y-4 overflow-y-auto custom-scrollbar">

        {comments.length === 0 && (
          <p className="opacity-70">No comments yet.</p>
        )}

        {comments.map(comment => {

          const isEdited =
            comment.updated_at &&
            comment.updated_at !== comment.created_at;

          return (
            <div
              key={comment.id}
              className="p-4 bg-white/20 rounded-xl"
            >

              {/* HEADER */}
              <div className="flex items-center justify-between text-xs opacity-80">

                <div className="flex items-center gap-2">

                  <span className="font-semibold">
                    {comment.user?.name || "Unknown"}
                  </span>

                  <span>
                    • {new Date(comment.created_at).toLocaleString()}
                  </span>

                  {isEdited && (
                    <span className="italic opacity-60">
                      (edited)
                    </span>
                  )}

                </div>

                <button
                  onClick={() => startEdit(comment)}
                  className="text-xs opacity-60 hover:opacity-100"
                >
                  Edit
                </button>

              </div>

              {/* CONTENT */}
              <div className="mt-2">

                {editingId === comment.id ? (
                  <div className="flex gap-2">

                    <input
                      value={editingContent}
                      onChange={(e) =>
                        setEditingContent(e.target.value)
                      }
                      className="flex-1 px-3 py-2 text-black rounded-lg bg-white/70"
                    />

                    <button
                      onClick={saveEdit}
                      className="px-3 py-1 text-xs text-white bg-green-500 rounded-lg"
                    >
                      Save
                    </button>

                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 text-xs rounded-lg bg-white/30"
                    >
                      Cancel
                    </button>

                  </div>
                ) : (
                  <p className="text-sm opacity-90">
                    {comment.content}
                  </p>
                )}

              </div>

            </div>
          );
        })}

      </div>

      {/* INPUT */}
      <div className="flex gap-4">

        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-4 py-2 text-black border rounded-xl bg-white/70 border-white/30"
        />

        <button
          onClick={handleSubmit}
          className="px-6 py-2 rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] text-white font-semibold transition"
        >
          Send
        </button>

      </div>

    </div>
  );
};

export default CommentsSection;