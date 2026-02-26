import { useState } from "react";
import { projectService } from "../services/projectService";

interface Member {
    id: number;
    name: string;
    role: string;
}

interface Props {
    projectId: number;
    members: Member[];
    currentUserRole: string;
    refresh: () => void;
}

const ProjectMembersPanel = ({
    projectId,
    members,
    currentUserRole,
    refresh
}: Props) => {

    const [email, setEmail] = useState("");

    const canManage =
        currentUserRole === "owner" ||
        currentUserRole === "co_owner";

    const handleInvite = async () => {
        await projectService.inviteUser(projectId, email, "member");
        setEmail("");
        refresh();
    };

    const changeRole = async (userId: number, role: string) => {
        await fetch(`/api/projects/${projectId}/members/${userId}/role`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ role })
        });
        refresh();
    };

    const removeUser = async (userId: number) => {
        await fetch(`/api/projects/${projectId}/members/${userId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        });
        refresh();
    };

    return (
        <div className="p-6 mt-8 text-white border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl">

            <h3 className="mb-4 text-lg font-semibold">
                Members
            </h3>

            <div className="mb-6 space-y-3">
                {members.map(member => (
                    <div key={member.id}
                        className="flex items-center justify-between p-3 bg-white/10 rounded-xl">

                        <span>
                            {member.name} ({member.role})
                        </span>

                        {canManage && member.role !== "owner" && (
                            <div className="flex gap-2">

                                <select
                                    value={member.role}
                                    onChange={(e) =>
                                        changeRole(member.id, e.target.value)
                                    }
                                    className="px-2 text-black rounded-lg bg-white/50"
                                >
                                    <option value="member">Member</option>
                                    <option value="collaborator">Collaborator</option>
                                    <option value="co_owner">Co-owner</option>
                                </select>

                                <button
                                    onClick={() => removeUser(member.id)}
                                    className="text-red-400"
                                >
                                    Remove
                                </button>

                            </div>
                        )}

                    </div>
                ))}
            </div>

            {canManage && (
                <div className="flex gap-4">
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Invite by email"
                        className="flex-1 px-4 py-2 border rounded-xl bg-white/50 border-white/30"
                    />
                    <button
                        onClick={handleInvite}
                        className="px-4 py-2 bg-[var(--clr-primary-a0)] rounded-xl"
                    >
                        Invite
                    </button>
                </div>
            )}

        </div>
    );
};

export default ProjectMembersPanel;