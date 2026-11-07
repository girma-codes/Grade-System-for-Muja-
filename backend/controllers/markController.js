
import pool from "../config/db.js";

// Check whether a teacher owns the assessment
const teacherOwnsAssessment = async (userId, assessmentId) => {
    const result = await pool.query(
        `SELECT 1
         FROM teachers t
         JOIN teacher_assignments ta
             ON t.teacher_id = ta.teacher_id
         JOIN assessments a
             ON ta.assignment_id = a.assignment_id
         WHERE t.user_id = $1
           AND a.assessment_id = $2`,
        [userId, assessmentId]
    );

    return result.rows.length > 0;
};

// Check whether a teacher owns a mark
const teacherOwnsMark = async (userId, markId) => {
    const result = await pool.query(
        `SELECT 1
         FROM marks m
         JOIN assessments a
             ON m.assessment_id = a.assessment_id
         JOIN teacher_assignments ta
             ON a.assignment_id = ta.assignment_id
         JOIN teachers t
             ON ta.teacher_id = t.teacher_id
         WHERE t.user_id = $1
           AND m.mark_id = $2`,
        [userId, markId]
    );

    return result.rows.length > 0;
};

// Check whether assessment and enrollment belong to the same section
const validateAssessmentEnrollment = async (
    assessmentId,
    enrollmentId
) => {
    const result = await pool.query(
        `SELECT 1
         FROM assessments a
         JOIN teacher_assignments ta
             ON a.assignment_id = ta.assignment_id
         JOIN enrollments e
             ON ta.section_id = e.section_id
         WHERE a.assessment_id = $1
           AND e.enrollment_id = $2`,
        [assessmentId, enrollmentId]
    );

    return result.rows.length > 0;
};

// Create Mark
export const createMark = async (req, res) => {
    try {
        const {
            assessment_id,
            enrollment_id,
            raw_score,
            remarks
        } = req.body;

        if (
            !assessment_id ||
            !enrollment_id ||
            raw_score === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided."
            });
        }

        if (
            !Number.isFinite(Number(raw_score)) ||
            Number(raw_score) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Raw score must be a valid number greater than or equal to zero."
            });
        }

        if (req.user.role === "teacher") {
            const allowed = await teacherOwnsAssessment(
                req.user.user_id,
                assessment_id
            );

            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    message: "You are not assigned to this assessment."
                });
            }
        }

        const validPair = await validateAssessmentEnrollment(
            assessment_id,
            enrollment_id
        );

        if (!validPair) {
            return res.status(400).json({
                success: false,
                message: "Assessment and enrollment do not belong to the same section."
            });
        }

        const result = await pool.query(
            `INSERT INTO marks
             (assessment_id, enrollment_id, raw_score, remarks)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                assessment_id,
                enrollment_id,
                raw_score,
                remarks || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Mark created successfully.",
            mark: result.rows[0]
        });

    } catch (error) {
        console.error("Create mark error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "A mark already exists for this student and assessment."
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create mark."
        });
    }
};

// Get All Marks
export const getAllMarks = async (req, res) => {
    try {
        let query = `
            SELECT
                m.*,
                a.assessment_name,
                a.assessment_type,
                a.max_score,
                a.weight_points,
                e.student_id,
                s.first_name,
                s.last_name
            FROM marks m
            JOIN assessments a
                ON m.assessment_id = a.assessment_id
            JOIN enrollments e
                ON m.enrollment_id = e.enrollment_id
            JOIN students s
                ON e.student_id = s.student_id
        `;

        const values = [];

        if (req.user.role === "teacher") {
            query += `
                JOIN teacher_assignments ta
                    ON a.assignment_id = ta.assignment_id
                JOIN teachers t
                    ON ta.teacher_id = t.teacher_id
                WHERE t.user_id = $1
            `;

            values.push(req.user.user_id);
        }

        query += " ORDER BY m.mark_id";

        const result = await pool.query(query, values);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            marks: result.rows
        });

    } catch (error) {
        console.error("Get marks error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve marks."
        });
    }
};

// Get Mark By ID
export const getMarkById = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role === "teacher") {
            const allowed = await teacherOwnsMark(
                req.user.user_id,
                id
            );

            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to view this mark."
                });
            }
        }

        const result = await pool.query(
            `SELECT * FROM marks
             WHERE mark_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Mark not found."
            });
        }

        res.status(200).json({
            success: true,
            mark: result.rows[0]
        });

    } catch (error) {
        console.error("Get mark error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve mark."
        });
    }
};

// Update Mark
export const updateMark = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            assessment_id,
            enrollment_id,
            raw_score,
            remarks
        } = req.body;

        if (
            !assessment_id ||
            !enrollment_id ||
            raw_score === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided."
            });
        }

        if (
            !Number.isFinite(Number(raw_score)) ||
            Number(raw_score) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Raw score must be a valid number greater than or equal to zero."
            });
        }

        if (req.user.role === "teacher") {
            const ownsOldMark = await teacherOwnsMark(
                req.user.user_id,
                id
            );

            const ownsNewAssessment = await teacherOwnsAssessment(
                req.user.user_id,
                assessment_id
            );

            if (!ownsOldMark || !ownsNewAssessment) {
                return res.status(403).json({
                    success: false,
                    message: "You cannot update this mark or use this assessment."
                });
            }
        }

        const validPair = await validateAssessmentEnrollment(
            assessment_id,
            enrollment_id
        );

        if (!validPair) {
            return res.status(400).json({
                success: false,
                message: "Assessment and enrollment do not belong to the same section."
            });
        }

        const result = await pool.query(
            `UPDATE marks
             SET assessment_id = $1,
                 enrollment_id = $2,
                 raw_score = $3,
                 remarks = $4
             WHERE mark_id = $5
             RETURNING *`,
            [
                assessment_id,
                enrollment_id,
                raw_score,
                remarks || null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Mark not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Mark updated successfully.",
            mark: result.rows[0]
        });

    } catch (error) {
        console.error("Update mark error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "A mark already exists for this student and assessment."
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update mark."
        });
    }
};

// Delete Mark (Admin only, enforced in routes)
export const deleteMark = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM marks
             WHERE mark_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Mark not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Mark deleted successfully."
        });

    } catch (error) {
        console.error("Delete mark error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to delete mark."
        });
    }
};
