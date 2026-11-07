
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Results.css";

function Results() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const fetchResults = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/results");
            setResults(response.data.results || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load student results."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    const filteredResults = results.filter((result) => {
        const searchText = search.toLowerCase();

        return (
            String(result.student_code || "").toLowerCase().includes(searchText) ||
            String(result.first_name || "").toLowerCase().includes(searchText) ||
            String(result.last_name || "").toLowerCase().includes(searchText) ||
            String(result.subject_name || "").toLowerCase().includes(searchText) ||
            String(result.section_name || "").toLowerCase().includes(searchText)
        );
    });

    const getGradeClass = (grade) => {
        if (!grade) return "grade-default";

        if (grade === "F") return "grade-fail";

        if (grade === "A+" || grade === "A") return "grade-excellent";

        return "grade-normal";
    };

    return (
        <div className="results-page">
            <div className="results-heading">
                <div>
                    <h1>Student Results</h1>
                    <p>View student academic performance and grades.</p>
                </div>

                <button
                    type="button"
                    className="results-refresh-btn"
                    onClick={fetchResults}
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="results-alert">
                    {error}
                </div>
            )}

            <div className="results-summary">
                <div className="results-stat-card">
                    <h3>Total Results</h3>
                    <p>{results.length}</p>
                </div>

                <div className="results-stat-card">
                    <h3>Students</h3>
                    <p>
                        {new Set(results.map((item) => item.student_id)).size}
                    </p>
                </div>

                <div className="results-stat-card">
                    <h3>Subjects</h3>
                    <p>
                        {new Set(results.map((item) => item.subject_name)).size}
                    </p>
                </div>
            </div>

            <div className="results-table-card">
                <div className="results-table-heading">
                    <h2>Results List</h2>

                    <input
                        type="text"
                        placeholder="Search student, code, subject..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <p className="results-message">Loading results...</p>
                ) : filteredResults.length === 0 ? (
                    <p className="results-message">
                        No results found.
                    </p>
                ) : (
                    <div className="results-table-wrapper">
                        <table className="results-table">
                            <thead>
                                <tr>
                                    <th>Student Code</th>
                                    <th>Student Name</th>
                                    <th>Grade</th>
                                    <th>Section</th>
                                    <th>Subject</th>
                                    <th>Academic Year</th>
                                    <th>Semester</th>
                                    <th>Total Mark</th>
                                    <th>Entered Weight</th>
                                    <th>Letter Grade</th>
                                    <th>Grade Point</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredResults.map((result, index) => (
                                    <tr key={`${result.student_id}-${result.assignment_id}-${index}`}>
                                        <td>{result.student_code}</td>

                                        <td>
                                            {result.first_name} {result.last_name}
                                        </td>

                                        <td>{result.grade_name || "-"}</td>
                                        <td>{result.section_name || "-"}</td>
                                        <td>{result.subject_name || "-"}</td>
                                        <td>{result.year_name || "-"}</td>
                                        <td>{result.semester_number || "-"}</td>

                                        <td>
                                            {Number(result.total_mark || 0).toFixed(2)}
                                        </td>

                                        <td>
                                            {Number(result.entered_weight || 0).toFixed(2)}
                                        </td>

                                        <td>
                                            <span className={`result-grade ${getGradeClass(result.letter_grade)}`}>
                                                {result.letter_grade || "-"}
                                            </span>
                                        </td>

                                        <td>{result.grade_point ?? "-"}</td>

                                        <td>
                                            <span className="result-status">
                                                {result.result_status || "-"}
                                            </span>
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

export default Results;
