import { useState } from "react";
import { projectService } from "../services/projectService";

interface Props {
    onCreated: () => void;
    onClose: () => void;
}

const CreateProjectModal = ({ onCreated, onClose }: Props) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async () => {
        if (!name.trim()) return;

        await projectService.createProject({
            name,
            description
        });

        onCreated();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">

            <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-3xl shadow-2xl p-8 w-[400px] text-white">

                <h2 className="mb-6 text-2xl font-semibold">
                    Create Project
                </h2>

                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Project Name"
                    className="w-full px-4 py-2 mb-4 border rounded-xl bg-white/50 border-white/30"
                />

                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full px-4 py-2 mb-6 border rounded-xl bg-white/50 border-white/30"
                />

                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white/20 rounded-xl"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-[var(--clr-primary-a0)] rounded-xl"
                    >
                        Create
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateProjectModal;