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
  <div className="grid grid-cols-1 gap-3 mt-6 sm:grid-cols-[1fr_140px_auto]">

    <input
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Invite by email"
      className="h-10 px-4 text-sm text-black border rounded-xl bg-white/70 border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
    />

    <select
      value={role}
      onChange={(e) => setRole(e.target.value)}
      className="h-10 px-3 text-sm text-black border rounded-xl bg-white/70 border-white/30"
    >
      <option value="member">Member</option>
      <option value="collaborator">Collaborator</option>
      <option value="co_owner">Co-owner</option>
    </select>

    <button
      onClick={handleInvite}
      disabled={loading}
      className="h-10 px-5 text-sm font-semibold text-white transition rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] disabled:opacity-50"
    >
      {loading ? "Inviting..." : "Invite"}
    </button>

  </div>
);
};

export default InviteUserForm;