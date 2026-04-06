import { useState, useEffect } from "react";
import { projectService } from "../services/projectService";

interface Project {
  id: number;
  name: string;
  description?: string;
}

interface Props {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onUpdated: () => void;
}

const EditProjectModal = ({ isOpen, project, onClose, onUpdated }: Props) => {
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Sync fields whenever a different project is opened
  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description ?? "");
      setError(null);
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const isDirty =
    name.trim() !== project.name ||
    (description.trim() || "") !== (project.description ?? "");

  const handleSubmit = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Project name is required.");
      return;
    }

    if (!isDirty) {
      onClose();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await projectService.updateProject(project.id, {
        name: trimmedName,
        description: description.trim() || undefined,
      });
      onUpdated();
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 403) {
        setError("You don't have permission to edit this project.");
      } else {
        setError(err.response?.data?.message ?? "Failed to update project.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md p-6 text-white border shadow-2xl bg-white/20 backdrop-blur-xl border-white/20 rounded-2xl">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Edit Project</h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none transition text-white/60 hover:text-white"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-[#b13535] bg-[#e29d9d]/20 p-3 rounded-xl border border-[#b13535]/30">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-white/80">
            Project Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={255}
            placeholder="Enter project name"
            className="w-full px-4 py-2 text-white placeholder-white/40 border rounded-xl bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium text-white/80">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={5000}
            placeholder="Optional description"
            className="w-full px-4 py-2 text-white placeholder-white/40 border rounded-xl bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)] resize-none"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 font-medium transition border rounded-xl border-white/20 hover:bg-white/10 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="px-5 py-2 font-semibold transition rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditProjectModal;