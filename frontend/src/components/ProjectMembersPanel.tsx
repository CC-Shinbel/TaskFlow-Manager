import { useState } from "react";
import api from "../services/api";
import InviteUserForm from "./InviteUserForm";

interface Member {
  id: number;
  name: string;
  role: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  members: Member[];
  currentUserRole: string;
  refresh: () => void;
}

const ProjectMembersPanel = ({
  isOpen,
  onClose,
  projectId,
  members,
  currentUserRole,
  refresh
}: Props) => {

  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);

  if (!isOpen) return null;

  const canManage =
    currentUserRole === "owner" ||
    currentUserRole === "co_owner";

  const changeRole = async (userId: number, role: string) => {
    try {

      setLoadingUserId(userId);

      await api.put(`/projects/${projectId}/members/${userId}/role`, {
        role
      });

      refresh();

    } catch (error) {
      console.error("Failed to update role", error);
      alert("Failed to update role");
    } finally {
      setLoadingUserId(null);
    }
  };

  const removeUser = async (userId: number) => {
    try {

      const confirmRemove = window.confirm(
        "Remove this user from the project?"
      );

      if (!confirmRemove) return;

      setLoadingUserId(userId);

      await api.delete(`/projects/${projectId}/members/${userId}`);

      refresh();

    } catch (error) {
      console.error("Failed to remove user", error);
      alert("Failed to remove user");
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">

      <div className="w-[600px] max-h-[85vh] overflow-y-auto p-8 text-white border shadow-2xl backdrop-blur-xl bg-white/30 border-white/20 rounded-3xl">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">

          <h2 className="text-xl font-semibold">
            Manage Project Members
          </h2>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] text-white font-semibold transition"
          >
            Close
          </button>

        </div>

        {/* INVITE USER */}
        {canManage && (
          <div className="mb-8">

            <h3 className="mb-3 text-sm font-semibold opacity-80">
              Invite Member
            </h3>

            <InviteUserForm
              projectId={projectId}
              onInvited={refresh}
            />

          </div>
        )}

        {/* MEMBER LIST */}
        <div className="space-y-3">

          <h3 className="mb-3 text-sm font-semibold opacity-80">
            Current Members
          </h3>

          {members.length === 0 ? (

            <p className="text-sm opacity-70">
              No members yet.
            </p>

          ) : (

            members.map(member => (

              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-white/10 rounded-xl"
              >

                <span>
                  {member.name} ({member.role})
                </span>

                {canManage && member.role !== "owner" && (

                  <div className="flex gap-2">

                    <select
                      disabled={loadingUserId === member.id}
                      value={member.role}
                      onChange={(e) =>
                        changeRole(member.id, e.target.value)
                      }
                      className="px-2 py-1 text-sm text-black rounded-lg bg-white/70"
                    >
                      <option value="member">Member</option>
                      <option value="collaborator">Collaborator</option>
                      <option value="co_owner">Co-owner</option>
                    </select>

                    <button
                      disabled={loadingUserId === member.id}
                      onClick={() => removeUser(member.id)}
                      className="px-2 text-sm text-red-400 hover:text-red-500 disabled:opacity-40"
                    >
                      Remove
                    </button>

                  </div>

                )}

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );
};

export default ProjectMembersPanel;