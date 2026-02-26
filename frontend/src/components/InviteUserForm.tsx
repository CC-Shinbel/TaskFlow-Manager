import { useState } from "react";
import { projectService } from "../services/projectService";

interface Props {
    projectId: number;
    onInvited: () => void;
}

const InviteUserForm = ({ projectId, onInvited }: Props) => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [loading, setLoading] = useState(false);

    const handleInvite = async () => {
        if (!email.trim()) return;

        try {
            setLoading(true);

            await projectService.inviteUser(projectId, email, role);

            setEmail("");
            setRole("member");
            onInvited();
        } catch (error) {
            console.error(error + ": Invite failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 mt-6 md:flex-row">

            <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Invite by email"
                className="flex-1 px-4 py-2 text-black border rounded-xl bg-white/50 border-white/30"
            />

            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-4 py-2 text-black border rounded-xl bg-white/50 border-white/30"
            >
                <option value="member">Member</option>
                <option value="collaborator">Collaborator</option>
                <option value="co_owner">Co-owner</option>
            </select>

            <button
                onClick={handleInvite}
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] text-white transition"
            >
                {loading ? "Inviting..." : "Invite"}
            </button>

        </div>
    );
};

export default InviteUserForm;