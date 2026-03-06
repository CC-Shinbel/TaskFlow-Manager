import { useEffect, useState } from "react";
import api from "../services/api";

interface Comment {
  id: number;
  content: string;
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

  const loadComments = async () => {

    const response = await api.get("/comments", {
      params: {
        project_id: projectId,
        task_id: taskId
      }
    });

    setComments(response.data.data);

  };

  useEffect(() => {
    loadComments();
  }, [projectId, taskId]);

  const handleSubmit = async () => {

    if (!content.trim()) return;

    await api.post("/comments", {
      project_id: projectId,
      task_id: taskId,
      content
    });

    setContent("");
    loadComments();

  };

  return (
    <div className="flex flex-col h-full">

      <h3 className="mb-4 text-xl font-semibold">
        Comments
      </h3>

      <div className="flex-1 mb-4 space-y-4 overflow-y-auto">

        {comments.map(comment => (
          <div
            key={comment.id}
            className="p-4 bg-white/20 rounded-xl"
          >

            <p className="text-sm font-semibold">
              {comment.user.name}
            </p>

            <p className="text-sm opacity-90">
              {comment.content}
            </p>

          </div>
        ))}

      </div>

      <div className="flex gap-4">

        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-4 py-2 border rounded-xl bg-white/50 border-white/30"
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