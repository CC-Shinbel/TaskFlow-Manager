import { useEffect, useState } from "react";
import { commentService } from "../services/commentService";

interface Comment {
    id: string;
    content: string;
    user: {
        id: number;
        name: string;
    };
}

const CommentsSection = ({ projectId }: { projectId: number }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState("");

    const loadComments = async () => {
        const response = await commentService.getComments(projectId);
        setComments(response.data.data);
    };

    useEffect(() => {
        loadComments();
    }, []);

    const handleSubmit = async () => {
        if (!content.trim()) return;

        await commentService.createComment({
            project_id: projectId,
            content,
        });

        setContent("");
        loadComments();
    };

    return (
        <div className="mt-8">

            <h3 className="mb-4 text-xl font-semibold">
                Comments
            </h3>

            <div className="mb-4 space-y-4 overflow-y-auto max-h-96">

                {comments.map(comment => (
                    <div key={comment.id}
                        className="p-4 bg-white/20 rounded-xl">

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
                    className="flex-1 px-4 py-2 border rounded-xl bg-white/50 border-white/30 focus:outline-none"
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