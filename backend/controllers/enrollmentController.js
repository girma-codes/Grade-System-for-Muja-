
import pool from "../config/db.js";

// Create a new enrollment
export const createEnrollment = async (req, res) => {
    try {
        const {
            student_id,
            section_id,
            enrollment_date,
            status
        } = req.body;

        if (!student_id || !section_id) {
            return res.status(400).json({
                success: false,
                message: "Student ID and Section ID are required."
            });
        }

        const result = await pool.query(
            `INSERT INTO enrollments
            (student_id, section_id, enrollment_date, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                student_id,
                section_id,
                enrollment_date || null,
                status || "Active"
            ]
        );

        res.status(201).json({
            success: true,
            message: "Student enrolled successfully.",
            enrollment: result.rows[0]
        });

    } catch (error) {
        console.error("Create enrollment error:", error.message);

        if (error.code === "23503") {
            return res.status(400).json({
                success: false,
                message: "Student ID or Section ID does not exist."
            });
        }

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This enrollment already exists."
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create enrollment."
        });
    }
};

// Get all enrollments
export const getAllEnrollments = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                e.*,
                s.student_code,
                s.first_name,
                s.last_name,
                cs.section_name
             FROM enrollments e
             INNER JOIN students s
                ON e.student_id = s.student_id
             INNER JOIN class_sections cs
                ON e.section_id = cs.section_id
             ORDER BY e.enrollment_id ASC`
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            enrollments: result.rows
        });

    } catch (error) {
        console.error("Get enrollments error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve enrollments."
        });
    }
};

// Get enrollment by ID
export const getEnrollmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                e.*,
                s.student_code,
                s.first_name,
                s.last_name,
                cs.section_name
             FROM enrollments e
             INNER JOIN students s
                ON e.student_id = s.student_id
             INNER JOIN class_sections cs
                ON e.section_id = cs.section_id
             WHERE e.enrollment_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Enrollment not found."
            });
        }

        res.status(200).json({
            success: true,
            enrollment: result.rows[0]
        });

    } catch (error) {
        console.error("Get enrollment error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve enrollment."
        });
    }
};

// Update enrollment
export const updateEnrollment = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            student_id,
            section_id,
            enrollment_date,
            status
        } = req.body;

        if (!student_id || !section_id) {
            return res.status(400).json({
                success: false,
                message: "Student ID and Section ID are required."
            });
        }

        const result = await pool.query(
            `UPDATE enrollments
             SET student_id = $1,
                 section_id = $2,
                 enrollment_date = $3,
                 status = $4
             WHERE enrollment_id = $5
             RETURNING *`,
            [
                student_id,
                section_id,
                enrollment_date || null,
                status || "Active",
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Enrollment not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Enrollment updated successfully.",
            enrollment: result.rows[0]
        });

    } catch (error) {
        console.error("Update enrollment error:", error.message);

        if (error.code === "23503") {
            return res.status(400).json({
                success: false,
                message: "Student ID or Section ID does not exist."
            });
        }

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This enrollment already exists."
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update enrollment."
        });
    }
};

// Delete enrollment
export const deleteEnrollment = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM enrollments
             WHERE enrollment_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Enrollment not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Enrollment deleted successfully."
        });

    } catch (error) {
        console.error("Delete enrollment error:", error.message);

        if (error.code === "23503") {
            return res.status(409).json({
                success: false,
                message: "Cannot delete this enrollment because it is being used by other records."
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to delete enrollment."
        });
    }
};
