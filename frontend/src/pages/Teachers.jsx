import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import api from "../services/api";
import "./Teachers.css";

function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const emptyForm = {
        teacher_code: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        gender: "",
        phone: "",
        email: "",
        qualification: "",
        specialization: ""
    };

    const [form, setForm] = useState(emptyForm);

    const fetchTeachers = async () => {
        try {
            const response = await api.get("/teachers");
            setTeachers(response.data.teachers || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load teachers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            if (editingId) {
                await api.put(`/teachers/${editingId}`, form);
                setMessage("Teacher updated successfully.");
            } else {
                await api.post("/teachers", form);
                setMessage("Teacher created successfully.");
            }

            resetForm();
            await fetchTeachers();
        } catch (err) {
            setError(err.response?.data?.message || "Operation failed.");
        }
    };

    const handleEdit = (teacher) => {
        setForm({
            teacher_code: teacher.teacher_code || "",
            first_name: teacher.first_name || "",
            middle_name: teacher.middle_name || "",
            last_name: teacher.last_name || "",
            gender: teacher.gender || "",
            phone: teacher.phone || "",
            email: teacher.email || "",
            qualification: teacher.qualification || "",
            specialization: teacher.specialization || ""
        });

        setEditingId(teacher.teacher_id);
        setShowForm(true);
        setMessage("");
        setError("");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this teacher?")) {
            return;
        }

        try {
            await api.delete(`/teachers/${id}`);
            setMessage("Teacher deleted successfully.");
            await fetchTeachers();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete teacher.");
        }
    };

    const filteredTeachers = teachers.filter((teacher) =>
        `${teacher.teacher_code} ${teacher.first_name} ${teacher.last_name}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="teachers-page">
            <div className="page-heading">
                <div>
                    <h2>Teachers Management</h2>
                    <p>Manage school teachers and their information.</p>
                </div>

                <button
                    className="add-teacher-btn"
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                >
                    <Plus size={18} /> Add Teacher
                </button>
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            {showForm && (
                <div className="teacher-form-card">
                    <div className="form-heading">
                        <h3>{editingId ? "Edit Teacher" : "Add New Teacher"}</h3>
                        <button onClick={resetForm} className="close-form-btn">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="teacher-form-grid">
                            {[
                                ["teacher_code", "Teacher Code"],
                                ["first_name", "First Name"],
                                ["middle_name", "Middle Name"],
                                ["last_name", "Last Name"],
                                ["phone", "Phone"],
                                ["email", "Email"],
                                ["qualification", "Qualification"],
                                ["specialization", "Specialization"]
                            ].map(([name, label]) => (
                                <div className="form-group" key={name}>
                                    <label>{label}</label>
                                    <input
                                        name={name}
                                        value={form[name]}
                                        onChange={handleChange}
                                        required={["teacher_code", "first_name", "last_name"].includes(name)}
                                        type={name === "email" ? "email" : "text"}
                                    />
                                </div>
                            ))}

                            <div className="form-group">
                                <label>Gender</label>
                                <select
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-teacher-btn">
                                {editingId ? "Update Teacher" : "Save Teacher"}
                            </button>
                            <button type="button" onClick={resetForm} className="cancel-btn">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="teachers-table-card">
                <div className="table-toolbar">
                    <h3>All Teachers ({teachers.length})</h3>
                    <input
                        className="teacher-search"
                        placeholder="Search teachers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <p>Loading teachers...</p>
                ) : (
                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Teacher Code</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredTeachers.map((teacher) => (
                                    <tr key={teacher.teacher_id}>
                                        <td>{teacher.teacher_code}</td>
                                        <td>{teacher.first_name}</td>
                                        <td>{teacher.last_name}</td>
                                        <td>{teacher.phone || "-"}</td>
                                        <td>{teacher.email || "-"}</td>
                                        <td>
                                            <button
                                                className="edit-action"
                                                onClick={() => handleEdit(teacher)}
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                className="delete-action"
                                                onClick={() => handleDelete(teacher.teacher_id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {filteredTeachers.length === 0 && (
                                    <tr>
                                        <td colSpan="6">No teachers found.</td>
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

export default Teachers;