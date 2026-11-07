import pool from "../config/db.js";

// Create Teacher Assignment
export const createTeacherAssignment = async (req, res) => {
    try {
        const {
            teacher_id,
            subject_id,
            section_id,
            semester_id
        } = req.body;

        if (!teacher_id || !subject_id || !section_id || !semester_id) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const result = await pool.query(
            `INSERT INTO teacher_assignments
            (teacher_id, subject_id, section_id, semester_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [teacher_id, subject_id, section_id, semester_id]
        );

        res.status(201).json({
            success: true,
            message: "Teacher assigned successfully.",
            assignment: result.rows[0]
        });

    } catch (error) {
        console.error("Create teacher assignment error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create teacher assignment."
        });
    }
};

// Get All Teacher Assignments
export const getAllTeacherAssignments = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                ta.*,
                t.teacher_code,
                t.first_name AS teacher_first_name,
                t.last_name AS teacher_last_name,
                s.subject_code,
                s.subject_name,
                cs.section_name,
                sem.semester_number
            FROM teacher_assignments ta
            JOIN teachers t ON ta.teacher_id = t.teacher_id
            JOIN subjects s ON ta.subject_id = s.subject_id
            JOIN class_sections cs ON ta.section_id = cs.section_id
            JOIN semesters sem ON ta.semester_id = sem.semester_id
            ORDER BY ta.assignment_id`
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            assignments: result.rows
        });

    } catch (error) {
        console.error("Get teacher assignments error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve teacher assignments."
        });
    }
};

// Get Teacher Assignment By ID
export const getTeacherAssignmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT * FROM teacher_assignments
             WHERE assignment_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Teacher assignment not found."
            });
        }

        res.status(200).json({
            success: true,
            assignment: result.rows[0]
        });

    } catch (error) {
        console.error("Get teacher assignment error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve teacher assignment."
        });
    }
};

// Update Teacher Assignment
export const updateTeacherAssignment = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            teacher_id,
            subject_id,
            section_id,
            semester_id
        } = req.body;

        if (!teacher_id || !subject_id || !section_id || !semester_id) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const result = await pool.query(
            `UPDATE teacher_assignments
             SET teacher_id = $1,
                 subject_id = $2,
                 section_id = $3,
                 semester_id = $4
             WHERE assignment_id = $5
             RETURNING *`,
            [teacher_id, subject_id, section_id, semester_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Teacher assignment not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Teacher assignment updated successfully.",
            assignment: result.rows[0]
        });

    } catch (error) {
        console.error("Update teacher assignment error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update teacher assignment."
        });
    }
};

// Delete Teacher Assignment
export const deleteTeacherAssignment = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM teacher_assignments
             WHERE assignment_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Teacher assignment not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Teacher assignment deleted successfully."
        });

    } catch (error) {
        console.error("Delete teacher assignment error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to delete teacher assignment."
        });
    }
};