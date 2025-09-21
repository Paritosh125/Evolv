import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../App";

export default function Navbar() {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navLinkClass = ({ isActive }) =>
        `relative px-2 py-1 transition-colors duration-300 ${isActive
            ? "text-cyan-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-cyan-400 after:rounded-full"
            : "text-gray-300 hover:text-cyan-300"
        }`;

    return (
        <header className="bg-black backdrop-blur-md border-b border-cyan-500/20 sticky top-0 z-40 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
                {/* Logo */}
                <NavLink to="/dashboard" className="flex items-center gap-2 group">
                    <span className="text-2xl">⚔️</span>
                    <span className="text-2xl font-extrabold tracking-wide text-cyan-400 group-hover:text-cyan-300 transition">
                        Evolv
                    </span>
                </NavLink>

                {/* Nav links */}
                <nav className="flex items-center gap-6 text-sm font-medium">
                    <NavLink to="/dashboard" className={navLinkClass}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/badges" className={navLinkClass}>
                        Badges
                    </NavLink>
                    <NavLink to="/leaderboard" className={navLinkClass}>
                        Leaderboard
                    </NavLink>
                    <NavLink to="/profile" className={navLinkClass}>
                        Profile
                    </NavLink>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="ml-4 px-4 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium shadow-md hover:shadow-red-500/50 transition"
                    >
                        Logout
                    </button>
                </nav>
            </div>
        </header>
    );
}
