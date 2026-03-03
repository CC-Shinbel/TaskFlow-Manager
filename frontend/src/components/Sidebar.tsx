import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import { useState } from "react";

const Sidebar = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`h-full backdrop-blur-xl bg-white/20 border-r border-white/20 shadow-xl transition-all duration-300 
      ${collapsed ? "w-20" : "w-64"} 
      hidden lg:flex flex-col justify-between`}
    >

      {/* TOP SECTION */}
      <div>

        <div className="flex items-center justify-between p-6 text-white">
          {!collapsed && (
            <h2 className="text-xl font-bold tracking-wide">
              TaskFlow
            </h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white transition hover:opacity-70"
          >
            ☰
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-4 mt-6">

          <NavItem to="/dashboard" label="Dashboard" collapsed={collapsed} />
          <NavItem to="/tasks" label="Tasks" collapsed={collapsed} />
          <NavItem to="/projects" label="Projects" collapsed={collapsed} />

          {user?.role === "admin" && (
            <>
              <div className="my-4 border-t border-white/20" />
              <NavItem to="/admin" label="Admin Panel" collapsed={collapsed} />
            </>
          )}

        </nav>
      </div>

      {/* BOTTOM USER INFO */}
      <div className="p-6 text-sm text-white border-t border-white/20">

        {!collapsed ? (
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="capitalize opacity-70">{user?.role}</p>
          </div>
        ) : (
          <div className="text-xs text-center opacity-70">
            {user?.name?.charAt(0)}
          </div>
        )}

      </div>
    </div>
  );
};

interface NavItemProps {
  to: string;
  label: string;
  collapsed: boolean;
}

const NavItem = ({ to, label, collapsed }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-4 py-3 rounded-xl text-white transition duration-300 
        flex items-center
        ${isActive
          ? "bg-white/30 shadow-md"
          : "hover:bg-white/20"}`
      }
    >
      {!collapsed && label}
    </NavLink>
  );
};

export default Sidebar;