import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/UseAuth";

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

interface PaginatedComments {
  data: Comment[];
  current_page: number;
  last_page: number;
}

interface Props {
  projectId?: number;
  taskId?: number;
}

const CommentsSection = ({ projectId, taskId }: Props) => {

  const { user } = useAuth(); // ✅ current user

  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // =========================
  // BUILD PARAMS
  // =========================
  const buildParams = (pageNumber = 1) => {
    const params: any = {
      page: pageNumber
    };

    if (projectId) params.project_id = projectId;
    if (taskId) params.task_id = taskId;

    return params;
  };

  // =========================
  // LOAD COMMENTS
  // =========================
  const loadComments = async (pageNumber = 1) => {
    try {
      const response = await api.get("/comments", {
        params: buildParams(pageNumber)
      });

      const resData: PaginatedComments = response.data.data;

      setComments(resData.data);
      setPage(resData.current_page);
      setLastPage(resData.last_page);

    } catch {
      toast.error("Failed to load comments");
    }
  };

  useEffect(() => {
    loadComments(1);
  }, [projectId, taskId]);

  // =========================
  // CREATE COMMENT
  // =========================
  const handleSubmit = async () => {

    if (!content.trim()) return;

    try {

      const payload: any = {
        content
      };

      if (taskId) payload.task_id = taskId;
      if (projectId) payload.project_id = projectId;

      await api.post("/comments", payload);

      setContent("");
      loadComments(1);

    } catch (err: any) {
      console.error(err.response?.data);
      toast.error("Failed to add comment");
    }

  };

  // =========================
  // EDIT
  // =========================
  const startEdit = (comment: Comment) => {

    // ✅ safety check
    if (user?.id !== comment.user?.id) {
      toast.error("You can only edit your own comments");
      return;
    }

    setEditingId(comment.id);
    setEditingContent(comment.content);
  };

  const saveEdit = async () => {

    if (!editingId) return;

    if (!editingContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {

      await api.put(`/comments/${editingId}`, {
        content: editingContent
      });

      setEditingId(null);
      setEditingContent("");

      loadComments(page);

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

          const isOwner = user?.id === comment.user?.id;

          return (
            <div
              key={comment.id}
              className="p-4 bg-white/20 rounded-xl group" // ✅ group for hover
            >

              {/* HEADER */}
              <div className="flex items-center justify-between text-xs opacity-80">

                <div className="flex items-center gap-2">

                  <span className="font-semibold">
                    {comment.user?.name || "Unknown"}
                    {isOwner && (
                      <span className="ml-1 italic opacity-60">(You)</span>
                    )}
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

                {/* ✅ EDIT BUTTON (OWNER ONLY + HOVER) */}
                {isOwner && (
                  <button
                    onClick={() => startEdit(comment)}
                    className="text-xs transition opacity-0 group-hover:opacity-100"
                  >
                    Edit
                  </button>
                )}

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

      {/* PAGINATION */}
      <div className="flex items-center justify-between mb-4">

        <button
          disabled={page === 1}
          onClick={() => loadComments(page - 1)}
          className="px-4 py-2 text-sm rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-40"
        >
          Previous
        </button>

        <span className="text-sm opacity-80">
          Page {page} of {lastPage}
        </span>

        <button
          disabled={page === lastPage}
          onClick={() => loadComments(page + 1)}
          className="px-4 py-2 text-sm rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-40"
        >
          Next
        </button>

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