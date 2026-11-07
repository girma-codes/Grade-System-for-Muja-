import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    ClipboardList,
    FileText,
    LogOut
} from "lucide-react";

import "./AdminLayout.css";

function AdminLayout() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const menuItems = [
        { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
        { name: "Students", path: "/admin/students", icon: Users },
        { name: "Teachers", path: "/admin/teachers", icon: GraduationCap },
        { name: "Subjects", path: "/admin/subjects", icon: BookOpen },
        { name: "Assessments", path: "/admin/assessments", icon: ClipboardList },
        { name: "Results", path: "/admin/results", icon: FileText }
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <GraduationCap size={32} />
                    <div>
                        <h2>MUJA SCHOOL</h2>
                        <span>Grading System</span>
                    </div>
                </div>

                <nav className="sidebar-menu">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/admin"}
                                className={({ isActive }) =>
                                    isActive ? "menu-link active" : "menu-link"
                                }
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <button className="logout-button" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <h3>Admin Dashboard</h3>
                        <p>Muja Preparatory School</p>
                    </div>

                    <div className="admin-profile">
                        <div className="profile-avatar">
                            {user?.full_name?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <span>{user?.full_name || user?.username}</span>
                    </div>
                </header>

                <section className="admin-content">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}

export default AdminLayout;