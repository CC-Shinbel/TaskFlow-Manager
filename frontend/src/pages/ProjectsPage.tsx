import { useEffect, useState, useCallback } from "react";
import { projectService } from "../services/projectService";
import { Link } from "react-router-dom";
import CreateProjectModal from "../components/CreateProjectModal";
import EditProjectModal from "../components/EditProjectModal";

interface Project {
  id: number;
  name: string;
  description?: string;
}

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
);

const ProjectsPage = () => {
  const [projects, setProjects]           = useState<Project[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen]   = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjects();
      setProjects(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleEditClick = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();   // stops the <Link> from navigating
    e.stopPropagation();
    setEditingProject(project);
  };

  return (
    <div className="flex flex-col h-full p-8">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <button
          onClick={() => setIsCreateOpen(true)}
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
            <h3 className="mb-2 text-xl font-semibold">No Projects Yet</h3>
            <p className="mb-6 text-sm opacity-80">
              Create your first project to start collaborating.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
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
              <div className="relative h-full p-6 text-white transition duration-300 border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl hover:scale-[1.02] hover:bg-white/40">

                {/* Edit button — sits in the top-right corner of the card */}
                <button
                  onClick={(e) => handleEditClick(e, project)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/20 transition"
                  aria-label={`Edit ${project.name}`}
                >
                  <EditIcon />
                </button>

                <h3 className="pr-8 mb-2 text-xl font-semibold">
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

      {/* CREATE MODAL */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          setIsCreateOpen(false);
          loadProjects();
        }}
      />

      {/* EDIT MODAL */}
      <EditProjectModal
        isOpen={editingProject !== null}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onUpdated={() => {
          setEditingProject(null);
          loadProjects();
        }}
      />

    </div>
  );
};

export default ProjectsPage;