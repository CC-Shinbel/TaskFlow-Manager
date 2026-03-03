import { useEffect, useState, useCallback } from "react";
import { projectService } from "../services/projectService";
import { Link } from "react-router-dom";
import CreateProjectModal from "../components/CreateProjectModal";

interface Project {
  id: number;
  name: string;
  description?: string;
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjects();
      setProjects(response.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="flex flex-col h-full p-8">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">
          Projects
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] text-white font-semibold transition"
        >
          + Create Project
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 text-sm text-[#b13535] bg-[#e29d9d]/20 p-4 rounded-xl border border-[#b13535]/30">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="flex items-center justify-center flex-1 text-white">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        /* EMPTY STATE */
        <div className="flex items-center justify-center flex-1">
          <div className="p-10 text-center text-white border shadow-xl backdrop-blur-xl bg-white/20 border-white/20 rounded-2xl">
            <h3 className="mb-2 text-xl font-semibold">
              No Projects Yet
            </h3>
            <p className="mb-6 text-sm opacity-80">
              Create your first project to start collaborating.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] text-white transition"
            >
              Create Project
            </button>
          </div>
        </div>
      ) : (
        /* PROJECT GRID */
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">

          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <div className="h-full p-6 text-white transition duration-300 border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl hover:scale-[1.02] hover:bg-white/40">

                <h3 className="mb-2 text-xl font-semibold">
                  {project.name}
                </h3>

                <p className="text-sm opacity-80">
                  {project.description || "No description"}
                </p>

              </div>
            </Link>
          ))}

        </div>
      )}

      {/* MODAL */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          loadProjects();
        }}
      />

    </div>
  );
};

export default ProjectsPage;