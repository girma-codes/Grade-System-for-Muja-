
import pool from "../config/db.js";

// Get all student results
export const getAllResults = async (req, res) => {
    try {
        let query = `
            SELECT *
            FROM student_subject_results
        `;

        const values = [];

        // Teachers can view results only for their assignments
        if (req.user.role === "teacher") {
            query += `
                WHERE EXISTS (
                    SELECT 1
                    FROM teacher_assignments ta
                    JOIN teachers t
                        ON ta.teacher_id = t.teacher_id
                    WHERE t.user_id = $1
                      AND ta.assignment_id =
                          student_subject_results.assignment_id
                )
            `;

            values.push(req.user.user_id);
        }

        query += " ORDER BY student_id";

        const result = await pool.query(query, values);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            results: result.rows
        });

    } catch (error) {
        console.error("Get all results error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve student results."
        });
    }
};

// Get results by student ID
export const getResultsByStudentId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(String(id)) || Number(id) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID."
            });
        }

        // Students can access only their own results
        if (req.user.role === "student") {
            const student = await pool.query(
                `SELECT student_id
                 FROM students
                 WHERE user_id = $1`,
                [req.user.user_id]
            );

            if (student.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student profile not found."
                });
            }

            if (Number(student.rows[0].student_id) !== Number(id)) {
                return res.status(403).json({
                    success: false,
                    message: "You can only view your own results."
                });
            }
        }

        // Teachers must have an assignment for this student
        if (req.user.role === "teacher") {
            const teacherAccess = await pool.query(
                `SELECT 1
                 FROM student_subject_results r
                 JOIN teacher_assignments ta
                    ON r.assignment_id = ta.assignment_id
                 JOIN teachers t
                    ON ta.teacher_id = t.teacher_id
                 WHERE t.user_id = $1
                   AND r.student_id = $2
                 LIMIT 1`,
                [req.user.user_id, id]
            );

            if (teacherAccess.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "You can only view results for students in your assigned classes and subjects."
                });
            }
        }

        // Return only results the current user is allowed to access
        let query = `
            SELECT *
            FROM student_subject_results
            WHERE student_id = $1
        `;

        const values = [id];

        // Restrict teachers to their own assigned subjects
        if (req.user.role === "teacher") {
            query += `
                AND EXISTS (
                    SELECT 1
                    FROM teacher_assignments ta
                    JOIN teachers t
                        ON ta.teacher_id = t.teacher_id
                    WHERE t.user_id = $2
                      AND ta.assignment_id =
                          student_subject_results.assignment_id
                )
            `;

            values.push(req.user.user_id);
        }

        query += " ORDER BY assignment_id";

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student results not found."
            });
        }

        res.status(200).json({
            success: true,
            count: result.rows.length,
            results: result.rows
        });

    } catch (error) {
        console.error("Get student results error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve student results."
        });
    }
};
