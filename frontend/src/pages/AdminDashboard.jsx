import { useEffect, useState } from "react";
import {
    Users,
    GraduationCap,
    BookOpen,
    ClipboardList,
    RefreshCw
} from "lucide-react";

import api from "../services/api";

function AdminDashboard() {
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        subjects: 0,
        assessments: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getCount = (response, key) => {
        const data = response.data;

        if (Array.isArray(data)) return data.length;
        if (Array.isArray(data[key])) return data[key].length;
        if (typeof data.count === "number") return data.count;

        return 0;
    };

    const loadStatistics = async () => {
        try {
            setLoading(true);
            setError("");

            const [students, teachers, subjects, assessments] =
                await Promise.all([
                    api.get("/students"),
                    api.get("/teachers"),
                    api.get("/subjects"),
                    api.get("/assessments")
                ]);

            setStats({
                students: getCount(students, "students"),
                teachers: getCount(teachers, "teachers"),
                subjects: getCount(subjects, "subjects"),
                assessments: getCount(assessments, "assessments")
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load dashboard statistics."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStatistics();
    }, []);

    const cards = [
        {
            title: "Total Students",
            value: stats.students,
            icon: Users,
            color: "#2870c7"
        },
        {
            title: "Total Teachers",
            value: stats.teachers,
            icon: GraduationCap,
            color: "#159d78"
        },
        {
            title: "Total Subjects",
            value: stats.subjects,
            icon: BookOpen,
            color: "#e49b27"
        },
        {
            title: "Total Assessments",
            value: stats.assessments,
            icon: ClipboardList,
            color: "#8854c7"
        }
    ];

    return (
        <div className="dashboard-page">
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px"
            }}>
                <div>
                    <h1 style={{ color: "#102a43", marginBottom: "8px" }}>
                        Welcome to Admin Dashboard
                    </h1>
                    <p style={{ color: "#829ab1" }}>
                        Overview of Muja Preparatory School
                    </p>
                </div>

                <button
                    onClick={loadStatistics}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 15px",
                        border: "none",
                        borderRadius: "7px",
                        background: "#2870c7",
                        color: "white",
                        cursor: "pointer"
                    }}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {loading ? (
                <p>Loading dashboard statistics...</p>
            ) : error ? (
                <div style={{ color: "#c0392b" }}>
                    <p>{error}</p>
                    <p>Please check your backend server and try again.</p>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px"
                }}>
                    {cards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={card.title}
                                style={{
                                    background: "white",
                                    padding: "25px",
                                    borderRadius: "12px",
                                    boxShadow: "0 3px 12px #0000000a",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "18px"
                                }}
                            >
                                <div style={{
                                    width: "55px",
                                    height: "55px",
                                    borderRadius: "12px",
                                    background: `${card.color}18`,
                                    color: card.color,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <Icon size={28} />
                                </div>

                                <div>
                                    <p style={{
                                        color: "#829ab1",
                                        fontSize: "14px",
                                        marginBottom: "8px"
                                    }}>
                                        {card.title}
                                    </p>

                                    <h2 style={{
                                        color: "#102a43",
                                        fontSize: "28px"
                                    }}>
                                        {card.value}
                                    </h2>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;