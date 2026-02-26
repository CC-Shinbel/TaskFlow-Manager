import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { projectService } from "../services/projectService";
import CommentsSection from "../components/CommentsSection";

interface Project {
    id: number;
    name: string;
    description?: string;
}

const ProjectDetailsPage = () => {
    const { id } = useParams();
    const [project, setProject] = useState<Project | null>(null);

    const loadProject = async () => {
        const response = await projectService.getProject(Number(id));
        setProject(response.data.data);
    };

    useEffect(() => {
        loadProject();
    }, [id]);

    if (!project) return null;

    return (
        <div className="p-10 min-h-screen bg-gradient-to-br from-[var(--clr-primary-a10)] via-[var(--clr-primary-a20)] to-[var(--clr-primary-a40)]">

            <div className="p-8 text-white border shadow-2xl backdrop-blur-xl bg-white/30 border-white/20 rounded-3xl">

                <h1 className="mb-2 text-3xl font-bold">
                    {project.name}
                </h1>

                <p className="mb-8 opacity-80">
                    {project.description}
                </p>

                <CommentsSection projectId={project.id} />

            </div>

        </div>
    );
};

export default ProjectDetailsPage;