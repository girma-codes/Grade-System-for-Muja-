
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Assessments.css";

const initialForm = {
    assignment_id: "1",
    assessment_name: "",
    assessment_type: "assignment",
    max_score: "",
    weight_points: "",
    assessment_date: ""
};

function Assessments() {
    const [assessments, setAssessments] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchAssessments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/assessments");
            setAssessments(response.data.assessments || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load assessments."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssessments();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setForm(initialForm);
        setEditingId(null);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            Number(form.assignment_id) <= 0 ||
            Number(form.max_score) <= 0 ||
            Number(form.weight_points) <= 0
        ) {
            setError("Assignment ID, maximum score and weight must be positive numbers.");
            return;
        }

        const payload = {
            assignment_id: Number(form.assignment_id),
            assessment_name: form.assessment_name.trim(),
            assessment_type: form.assessment_type,
            max_score: Number(form.max_score),
            weight_points: Number(form.weight_points),
            assessment_date: form.assessment_date || null
        };

        try {
            setSaving(true);

            if (editingId) {
                await api.put(`/assessments/${editingId}`, payload);
                setSuccess("Assessment updated successfully.");
            } else {
                await api.post("/assessments", payload);
                setSuccess("Assessment created successfully.");
            }

            resetForm();
            await fetchAssessments();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save assessment."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (assessment) => {
        setEditingId(assessment.assessment_id);

        setForm({
            assignment_id: String(assessment.assignment_id),
            assessment_name: assessment.assessment_name || "",
            assessment_type: assessment.assessment_type || "assignment",
            max_score: String(assessment.max_score ?? ""),
            weight_points: String(assessment.weight_points ?? ""),
            assessment_date: assessment.assessment_date
                ? String(assessment.assessment_date).slice(0, 10)
                : ""
        });

        setError("");
        setSuccess("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this assessment? This action cannot be undone."
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await api.delete(`/assessments/${id}`);
            setSuccess("Assessment deleted successfully.");
            await fetchAssessments();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete assessment."
            );
        }
    };

    return (
        <div className="assessments-page">
            <div className="assessments-heading">
                <div>
                    <h1>Assessments Management</h1>
                    <p>Create, view and manage student assessments.</p>
                </div>

                <button
                    className="assessment-refresh-btn"
                    onClick={fetchAssessments}
                    type="button"
                >
                    Refresh
                </button>
            </div>

            {error && <div className="assessment-alert error">{error}</div>}
            {success && <div className="assessment-alert success">{success}</div>}

            <div className="assessment-form-card">
                <h2>{editingId ? "Edit Assessment" : "Add New Assessment"}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="assessment-form-grid">
                        <div className="assessment-field">
                            <label>Teacher Assignment ID</label>
                            <input
                                type="number"
                                name="assignment_id"
                                min="1"
                                value={form.assignment_id}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="assessment-field">
                            <label>Assessment Name</label>
                            <input
                                type="text"
                                name="assessment_name"
                                placeholder="Example: First Quiz"
                                value={form.assessment_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="assessment-field">
                            <label>Assessment Type</label>
                            <select
                                name="assessment_type"
                                value={form.assessment_type}
                                onChange={handleChange}
                                required
                            >
                                <option value="assignment">Assignment</option>
                                <option value="quiz">Quiz</option>
                                <option value="midterm">Midterm</option>
                                <option value="final_exam">Final Exam</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="assessment-field">
                            <label>Maximum Score</label>
                            <input
                                type="number"
                                name="max_score"
                                min="0.01"
                                step="0.01"
                                placeholder="Example: 10"
                                value={form.max_score}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="assessment-field">
                            <label>Weight Points</label>
                            <input
                                type="number"
                                name="weight_points"
                                min="0.01"
                                step="0.01"
                                placeholder="Example: 10"
                                value={form.weight_points}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="assessment-field">
                            <label>Assessment Date</label>
                            <input
                                type="date"
                                name="assessment_date"
                                value={form.assessment_date}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="assessment-form-actions">
                        <button
                            type="submit"
                            className="assessment-submit-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Update Assessment"
                                    : "Create Assessment"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="assessment-cancel-btn"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="assessment-table-card">
                <h2>Assessment List</h2>

                {loading ? (
                    <p className="assessment-message">Loading assessments...</p>
                ) : assessments.length === 0 ? (
                    <p className="assessment-message">No assessments found.</p>
                ) : (
                    <div className="assessment-table-wrapper">
                        <table className="assessment-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Subject</th>
                                    <th>Section</th>
                                    <th>Max Score</th>
                                    <th>Weight</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {assessments.map((assessment) => (
                                    <tr key={assessment.assessment_id}>
                                        <td>{assessment.assessment_id}</td>
                                        <td>{assessment.assessment_name}</td>
                                        <td>
                                            {assessment.assessment_type?.replace("_", " ")}
                                        </td>
                                        <td>{assessment.subject_name || "-"}</td>
                                        <td>{assessment.section_name || "-"}</td>
                                        <td>{assessment.max_score}</td>
                                        <td>{assessment.weight_points}</td>
                                        <td>
                                            {assessment.assessment_date
                                                ? String(assessment.assessment_date).slice(0, 10)
                                                : "-"}
                                        </td>
                                        <td>
                                            <div className="assessment-actions">
                                                <button
                                                    type="button"
                                                    className="assessment-edit-btn"
                                                    onClick={() => handleEdit(assessment)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="assessment-delete-btn"
                                                    onClick={() => handleDelete(assessment.assessment_id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Assessments;
