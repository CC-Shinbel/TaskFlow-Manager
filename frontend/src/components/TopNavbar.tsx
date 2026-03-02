import { useAuth } from "../hooks/UseAuth";

const TopNavbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center justify-between h-16 px-8 border-b shadow-md backdrop-blur-xl bg-white/30 border-white/20">

      <h1 className="text-lg font-semibold text-white">
        TaskFlow Manager
      </h1>

      <div className="flex items-center gap-4">

        <span className="text-sm text-white opacity-80">
          {user?.name} ({user?.role})
        </span>

        <button
          onClick={logout}
          className="px-4 py-2 text-white transition rounded-xl bg-white/20 hover:bg-white/30"
        >
          Logout
        </button>

      </div>

    </div>
  );
};

export default TopNavbar;