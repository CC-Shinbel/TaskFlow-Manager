import { useEffect, useState } from "react";
import { projectService } from "../services/projectService";

interface Props {
  isOpen: boolean;
  onCreated: () => void;
  onClose: () => void;
}

const CreateProjectModal = ({
  isOpen,
  onCreated,
  onClose,
}: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await projectService.createProject({
        name,
        description,
      });

      setName("");
      setDescription("");

      onCreated();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to create project."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg p-8 text-white border shadow-2xl backdrop-blur-xl bg-white/30 border-white/20 rounded-3xl">

        <h2 className="mb-6 text-2xl font-semibold">
          Create Project
        </h2>

        {error && (
          <div className="mb-4 text-sm text-[#b13535] bg-[#e29d9d]/20 p-3 rounded-lg border border-[#b13535]/30">
            {error}
          </div>
        )}

        <div className="space-y-5">

          <div>
            <label className="block mb-2 text-sm">
              Project Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className="w-full px-4 py-3 border rounded-xl bg-white/50 border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm">
              Description (optional)
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              className="w-full px-4 py-3 border rounded-xl bg-white/50 border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
            />
          </div>

        </div>

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 text-white transition rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] text-white font-semibold transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default CreateProjectModal;