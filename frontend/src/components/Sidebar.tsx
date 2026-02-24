import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import { useState } from "react";

const Sidebar = () => {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div
            className={`h-screen backdrop-blur-xl bg-white/20 border-r border-white/20 shadow-xl transition-all duration-300 
      ${collapsed ? "w-20" : "w-64"} 
      hidden lg:flex flex-col justify-between`}
        >
            {/* TOP SECTION */}
            <div>
                <div className="p-6 flex justify-between items-center text-white">
                    {!collapsed && (
                        <h2 className="text-xl font-bold">
                            TaskFlow
                        </h2>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-white hover:opacity-70"
                    >
                        ☰
                    </button>
                </div>

                <nav className="flex flex-col gap-2 px-4 mt-6">

                    <NavItem to="/dashboard" label="Dashboard" collapsed={collapsed} />
                    <NavItem to="/tasks" label="Tasks" collapsed={collapsed} />
                    <NavItem to="/tasks/create" label="Create Task" collapsed={collapsed} />

                    {user?.role === "admin" && (
                        <NavItem to="/admin" label="Admin Panel" collapsed={collapsed} />
                    )}

                </nav>
            </div>

            {/* BOTTOM SECTION */}
            <div className="p-6 text-white text-sm">
                {!collapsed && (
                    <div>
                        <p>{user?.name}</p>
                        <p className="opacity-70">{user?.role}</p>
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
        ${isActive ? "bg-white/30" : "hover:bg-white/20"}`
            }
        >
            {!collapsed && label}
        </NavLink>
    );
};

export default Sidebar;