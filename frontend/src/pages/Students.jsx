import { useEffect, useState } from "react";
import {
    Plus, Search, RefreshCw, Users, X, Pencil, Trash2
} from "lucide-react";

import api from "../services/api";

const emptyForm = {
    student_code: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    guardian_name: "",
    guardian_phone: ""
};

function Students() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState(emptyForm);

    const loadStudents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/students");
            setStudents(response.data.students || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load students."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEdit = (student) => {
        setEditingId(student.student_id);

        setFormData({
            student_code: student.student_code || "",
            first_name: student.first_name || "",
            middle_name: student.middle_name || "",
            last_name: student.last_name || "",
            gender: student.gender || "",
            date_of_birth: student.date_of_birth
                ? String(student.date_of_birth).slice(0, 10)
                : "",
            guardian_name: student.guardian_name || "",
            guardian_phone: student.guardian_phone || ""
        });

        setShowForm(true);
        setError("");
        setSuccess("");

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            let response;

            if (editingId) {
                response = await api.put(
                    `/students/${editingId}`,
                    formData
                );
            } else {
                response = await api.post("/students", formData);
            }

            setSuccess(
                response.data.message ||
                "Student saved successfully."
            );

            setFormData(emptyForm);
            setEditingId(null);
            setShowForm(false);

            await loadStudents();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save student."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (student) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${student.first_name} ${student.last_name}?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            const response = await api.delete(
                `/students/${student.student_id}`
            );

            setSuccess(
                response.data.message ||
                "Student deleted successfully."
            );

            await loadStudents();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete student."
            );
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData(emptyForm);
        setError("");
    };

    const filteredStudents = students.filter((student) => {
        const searchText = search.toLowerCase();

        return (
            student.student_code?.toLowerCase().includes(searchText) ||
            student.first_name?.toLowerCase().includes(searchText) ||
            student.middle_name?.toLowerCase().includes(searchText) ||
            student.last_name?.toLowerCase().includes(searchText)
        );
    });

    const inputStyle = {
        width: "100%",
        padding: "12px",
        border: "1px solid #d9e2ec",
        borderRadius: "7px",
        fontSize: "14px",
        outline: "none"
    };

    return (
        <div>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
                marginBottom: "25px"
            }}>
                <div>
                    <h1 style={{ color: "#102a43" }}>
                        Students Management
                    </h1>
                    <p style={{ color: "#829ab1", marginTop: "7px" }}>
                        Register and manage school students.
                    </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={loadStudents}
                        style={{
                            padding: "11px 14px",
                            border: "1px solid #d9e2ec",
                            borderRadius: "7px",
                            background: "white",
                            cursor: "pointer"
                        }}
                    >
                        <RefreshCw size={17} />
                    </button>

                    <button
                        onClick={() => {
                            if (showForm) {
                                closeForm();
                            } else {
                                setShowForm(true);
                                setSuccess("");
                                setError("");
                            }
                        }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "11px 16px",
                            border: "none",
                            borderRadius: "7px",
                            background: "#2870c7",
                            color: "white",
                            cursor: "pointer"
                        }}
                    >
                        {showForm ? <X size={18} /> : <Plus size={18} />}
                        {showForm ? "Close Form" : "Add Student"}
                    </button>
                </div>
            </div>

            {error && (
                <p style={{
                    background: "#fdecea",
                    color: "#c0392b",
                    padding: "12px",
                    borderRadius: "7px",
                    marginBottom: "15px"
                }}>
                    {error}
                </p>
            )}

            {success && (
                <p style={{
                    background: "#e8f7ef",
                    color: "#18794e",
                    padding: "12px",
                    borderRadius: "7px",
                    marginBottom: "15px"
                }}>
                    {success}
                </p>
            )}

            {showForm && (
                <div style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    marginBottom: "25px",
                    boxShadow: "0 3px 12px #0000000a"
                }}>
                    <h2 style={{
                        color: "#102a43",
                        marginBottom: "20px"
                    }}>
                        {editingId ? "Edit Student" : "Register New Student"}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "18px"
                        }}>
                            {[
                                ["student_code", "Student Code", true],
                                ["first_name", "First Name", true],
                                ["middle_name", "Middle Name", false],
                                ["last_name", "Last Name", true],
                                ["guardian_name", "Guardian Name", false],
                                ["guardian_phone", "Guardian Phone", false]
                            ].map(([name, label, required]) => (
                                <div key={name}>
                                    <label style={{
                                        display: "block",
                                        marginBottom: "7px",
                                        color: "#334e68",
                                        fontSize: "14px"
                                    }}>
                                        {label}
                                    </label>

                                    <input
                                        name={name}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        required={required}
                                        style={inputStyle}
                                        placeholder={`Enter ${label.toLowerCase()}`}
                                    />
                                </div>
                            ))}

                            <div>
                                <label style={{
                                    display: "block",
                                    marginBottom: "7px",
                                    color: "#334e68",
                                    fontSize: "14px"
                                }}>
                                    Gender
                                </label>

                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: "block",
                                    marginBottom: "7px",
                                    color: "#334e68",
                                    fontSize: "14px"
                                }}>
                                    Date of Birth
                                </label>

                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                marginTop: "22px",
                                padding: "12px 25px",
                                background: "#159d78",
                                color: "white",
                                border: "none",
                                borderRadius: "7px",
                                cursor: "pointer"
                            }}
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Update Student"
                                    : "Register Student"}
                        </button>
                    </form>
                </div>
            )}

            <div style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 3px 12px #0000000a"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "15px",
                    marginBottom: "20px"
                }}>
                    <h2 style={{ color: "#102a43", fontSize: "18px" }}>
                        <Users size={20} style={{ verticalAlign: "middle" }} />{" "}
                        Student List ({filteredStudents.length})
                    </h2>

                    <div style={{ position: "relative", width: "260px" }}>
                        <Search
                            size={18}
                            style={{
                                position: "absolute",
                                left: "12px",
                                top: "12px",
                                color: "#829ab1"
                            }}
                        />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search students..."
                            style={{
                                ...inputStyle,
                                paddingLeft: "38px"
                            }}
                        />
                    </div>
                </div>

                {loading ? (
                    <p>Loading students...</p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            textAlign: "left",
                            minWidth: "850px"
                        }}>
                            <thead>
                                <tr style={{ background: "#f4f7fb" }}>
                                    {[
                                        "Student Code",
                                        "First Name",
                                        "Middle Name",
                                        "Last Name",
                                        "Gender",
                                        "Guardian Phone",
                                        "Actions"
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            style={{
                                                padding: "14px",
                                                color: "#486581",
                                                fontSize: "13px"
                                            }}
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStudents.map((student) => (
                                    <tr
                                        key={student.student_id}
                                        style={{
                                            borderBottom: "1px solid #edf2f7"
                                        }}
                                    >
                                        <td style={{ padding: "14px" }}>
                                            {student.student_code}
                                        </td>
                                        <td style={{ padding: "14px" }}>
                                            {student.first_name}
                                        </td>
                                        <td style={{ padding: "14px" }}>
                                            {student.middle_name || "-"}
                                        </td>
                                        <td style={{ padding: "14px" }}>
                                            {student.last_name}
                                        </td>
                                        <td style={{ padding: "14px" }}>
                                            {student.gender || "-"}
                                        </td>
                                        <td style={{ padding: "14px" }}>
                                            {student.guardian_phone || "-"}
                                        </td>

                                        <td style={{
                                            padding: "14px",
                                            whiteSpace: "nowrap"
                                        }}>
                                            <button
                                                onClick={() => handleEdit(student)}
                                                title="Edit student"
                                                style={{
                                                    padding: "8px",
                                                    marginRight: "8px",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    background: "#e8f1fc",
                                                    color: "#2870c7",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                <Pencil size={17} />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(student)}
                                                title="Delete student"
                                                style={{
                                                    padding: "8px",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    background: "#fdecea",
                                                    color: "#c0392b",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            style={{
                                                padding: "25px",
                                                textAlign: "center",
                                                color: "#829ab1"
                                            }}
                                        >
                                            No students found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Students;