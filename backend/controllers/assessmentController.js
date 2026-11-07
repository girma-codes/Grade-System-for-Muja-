import pool from "../config/db.js";

// Check whether a teacher owns an assignment
const teacherOwnsAssignment = async (userId, assignmentId) => {
    const result = await pool.query(
        `SELECT 1
         FROM teacher_assignments ta
         JOIN teachers t ON ta.teacher_id = t.teacher_id
         WHERE t.user_id = $1
           AND ta.assignment_id = $2`,
        [userId, assignmentId]
    );

    return result.rows.length > 0;
};

// Check whether a teacher owns an assessment
const teacherOwnsAssessment = async (userId, assessmentId) => {
    const result = await pool.query(
        `SELECT 1
         FROM assessments a
         JOIN teacher_assignments ta
             ON a.assignment_id = ta.assignment_id
         JOIN teachers t
             ON ta.teacher_id = t.teacher_id
         WHERE t.user_id = $1
           AND a.assessment_id = $2`,
        [userId, assessmentId]
    );

    return result.rows.length > 0;
};

// Validate assessment ID
const isValidId = (id) => {
    return /^\d+$/.test(String(id)) && Number(id) > 0;
};

// Validate score and weight
const validScoreAndWeight = (maxScore, weightPoints) => {
    return (
        maxScore !== null &&
        weightPoints !== null &&
        maxScore !== "" &&
        weightPoints !== "" &&
        Number.isFinite(Number(maxScore)) &&
        Number.isFinite(Number(weightPoints)) &&
        Number(maxScore) > 0 &&
        Number(weightPoints) > 0
    );
};

// Create Assessment
export const createAssessment = async (req, res) => {
    try {
        const {
            assignment_id,
            assessment_name,
            assessment_type,
            max_score,
            weight_points,
            assessment_date
        } = req.body;

        if (
            !assignment_id ||
            !assessment_name ||
            !assessment_type ||
            max_score === undefined ||
            weight_points === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided."
            });
        }

        if (!isValidId(assignment_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assignment ID."
            });
        }

        if (!validScoreAndWeight(max_score, weight_points)) {
            return res.status(400).json({
                success: false,
                message: "Max score and weight points must be valid positive numbers."
            });
        }

        if (req.user.role === "teacher") {
            const ownsAssignment = await teacherOwnsAssignment(
                req.user.user_id,
                assignment_id
            );

            if (!ownsAssignment) {
                return res.status(403).json({
                    success: false,
                    message: "You can only create assessments for your own assignments."
                });
            }
        }

        const result = await pool.query(
            `INSERT INTO assessments
            (
                assignment_id,
                assessment_name,
                assessment_type,
                max_score,
                weight_points,
                assessment_date
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                assignment_id,
                assessment_name,
                assessment_type,
                max_score,
                weight_points,
                assessment_date || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Assessment created successfully.",
            assessment: result.rows[0]
        });

    } catch (error) {
        console.error("Create assessment error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create assessment."
        });
    }
};

// Get All Assessments
export const getAllAssessments = async (req, res) => {
    try {
        let query = `
            SELECT
                a.*,
                ta.teacher_id,
                ta.subject_id,
                ta.section_id,
                s.subject_name,
                cs.section_name
            FROM assessments a
            JOIN teacher_assignments ta
                ON a.assignment_id = ta.assignment_id
            JOIN subjects s
                ON ta.subject_id = s.subject_id
            JOIN class_sections cs
                ON ta.section_id = cs.section_id
        `;

        const values = [];

        if (req.user.role === "teacher") {
            query += `
                JOIN teachers t
                    ON ta.teacher_id = t.teacher_id
                WHERE t.user_id = $1
            `;
            values.push(req.user.user_id);
        }

        query += " ORDER BY a.assessment_id";

        const result = await pool.query(query, values);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            assessments: result.rows
        });

    } catch (error) {
        console.error("Get assessments error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve assessments."
        });
    }
};

// Get Assessment By ID
export const getAssessmentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment ID."
            });
        }

        if (req.user.role === "teacher") {
            const ownsAssessment = await teacherOwnsAssessment(
                req.user.user_id,
                id
            );

            if (!ownsAssessment) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to access this assessment."
                });
            }
        }

        const result = await pool.query(
            `SELECT * FROM assessments
             WHERE assessment_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found."
            });
        }

        res.status(200).json({
            success: true,
            assessment: result.rows[0]
        });

    } catch (error) {
        console.error("Get assessment error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve assessment."
        });
    }
};

// Update Assessment
export const updateAssessment = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            assignment_id,
            assessment_name,
            assessment_type,
            max_score,
            weight_points,
            assessment_date
        } = req.body;

        if (!isValidId(id) || !isValidId(assignment_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment or assignment ID."
            });
        }

        if (
            !assessment_name ||
            !assessment_type ||
            max_score === undefined ||
            weight_points === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided."
            });
        }

        if (!validScoreAndWeight(max_score, weight_points)) {
            return res.status(400).json({
                success: false,
                message: "Max score and weight points must be valid positive numbers."
            });
        }

        if (req.user.role === "teacher") {
            const ownsOldAssessment = await teacherOwnsAssessment(
                req.user.user_id,
                id
            );

            if (!ownsOldAssessment) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to update this assessment."
                });
            }

            const ownsNewAssignment = await teacherOwnsAssignment(
                req.user.user_id,
                assignment_id
            );

            if (!ownsNewAssignment) {
                return res.status(403).json({
                    success: false,
                    message: "You can only assign assessments to your own assignments."
                });
            }
        }

        const result = await pool.query(
            `UPDATE assessments
             SET assignment_id = $1,
                 assessment_name = $2,
                 assessment_type = $3,
                 max_score = $4,
                 weight_points = $5,
                 assessment_date = $6
             WHERE assessment_id = $7
             RETURNING *`,
            [
                assignment_id,
                assessment_name,
                assessment_type,
                max_score,
                weight_points,
                assessment_date || null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Assessment updated successfully.",
            assessment: result.rows[0]
        });

    } catch (error) {
        console.error("Update assessment error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update assessment."
        });
    }
};

// Delete Assessment
export const deleteAssessment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment ID."
            });
        }

        const result = await pool.query(
            `DELETE FROM assessments
             WHERE assessment_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Assessment deleted successfully."
        });

    } catch (error) {
        console.error("Delete assessment error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to delete assessment."
        });
    }
};