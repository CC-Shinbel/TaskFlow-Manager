import { useEffect, useState } from "react";
import { projectService } from "../services/projectService";
import { Link } from "react-router-dom";

interface Project {
    id: number;
    name: string;
    description?: string;
}

const ProjectsPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);

    const loadProjects = async () => {
        const response = await projectService.getProjects();
        setProjects(response.data.data);
    };
    //BUG: Rerender issue; will affect loading performance
    useEffect(() => {
        loadProjects();
    }, []);



    return (
        <div className="p-10 min-h-screen bg-gradient-to-br from-[var(--clr-primary-a10)] via-[var(--clr-primary-a20)] to-[var(--clr-primary-a40)]">

            <h1 className="mb-8 text-3xl font-bold text-white">
                Projects
            </h1>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">

                {projects.map(project => (
                    <Link key={project.id} to={`/projects/${project.id}`}>
                        <div className="p-6 text-white transition duration-300 border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl hover:scale-105">

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
        </div>
    );
};

export default ProjectsPage;