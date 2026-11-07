
import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import api from "../services/api";
import "./Subjects.css";

function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const emptyForm = {
        subject_code: "",
        subject_name: "",
        description: "",
        is_active: true
    };

    const [form, setForm] = useState(emptyForm);

    const fetchSubjects = async () => {
        try {
            const response = await api.get("/subjects");
            setSubjects(response.data.subjects || []);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load subjects.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
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
                await api.put(`/subjects/${editingId}`, form);
                setMessage("Subject updated successfully.");
            } else {
                await api.post("/subjects", form);
                setMessage("Subject created successfully.");
            }

            resetForm();
            await fetchSubjects();
        } catch (err) {
            setError(err.response?.data?.message || "Operation failed.");
        }
    };

    const handleEdit = (subject) => {
        setForm({
            subject_code: subject.subject_code || "",
            subject_name: subject.subject_name || "",
            description: subject.description || "",
            is_active: subject.is_active ?? true
        });

        setEditingId(subject.subject_id);
        setShowForm(true);
        setMessage("");
        setError("");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this subject?")) {
            return;
        }

        try {
            await api.delete(`/subjects/${id}`);
            setMessage("Subject deleted successfully.");
            await fetchSubjects();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete subject.");
        }
    };

    const filteredSubjects = subjects.filter((subject) =>
        `${subject.subject_code} ${subject.subject_name}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="subjects-page">
            <div className="page-heading">
                <div>
                    <h2>Subjects Management</h2>
                    <p>Manage school subjects and their information.</p>
                </div>

                <button
                    className="add-subject-btn"
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                >
                    <Plus size={18} /> Add Subject
                </button>
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            {showForm && (
                <div className="subject-form-card">
                    <div className="form-heading">
                        <h3>{editingId ? "Edit Subject" : "Add New Subject"}</h3>
                        <button onClick={resetForm} className="close-form-btn">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="subject-form-grid">
                            <div className="form-group">
                                <label>Subject Code *</label>
                                <input
                                    name="subject_code"
                                    value={form.subject_code}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Subject Name *</label>
                                <input
                                    name="subject_name"
                                    value={form.subject_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={form.is_active}
                                        onChange={handleChange}
                                    />
                                    Active Subject
                                </label>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-subject-btn">
                                {editingId ? "Update Subject" : "Save Subject"}
                            </button>

                            <button
                                type="button"
                                onClick={resetForm}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="subjects-table-card">
                <div className="table-toolbar">
                    <h3>All Subjects ({subjects.length})</h3>

                    <input
                        className="subject-search"
                        placeholder="Search subjects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <p>Loading subjects...</p>
                ) : (
                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Subject Code</th>
                                    <th>Subject Name</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredSubjects.map((subject) => (
                                    <tr key={subject.subject_id}>
                                        <td>{subject.subject_code}</td>
                                        <td>{subject.subject_name}</td>
                                        <td>{subject.description || "-"}</td>
                                        <td>
                                            <span className={
                                                subject.is_active ? "active-status" : "inactive-status"
                                            }>
                                                {subject.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="edit-action"
                                                onClick={() => handleEdit(subject)}
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                className="delete-action"
                                                onClick={() => handleDelete(subject.subject_id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {filteredSubjects.length === 0 && (
                                    <tr>
                                        <td colSpan="5">No subjects found.</td>
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

export default Subjects;
