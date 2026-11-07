
import pool from "../config/db.js";

// Create a new subject
export const createSubject = async (req, res) => {
    try {
        const {
            subject_code,
            subject_name,
            description,
            is_active
        } = req.body;

        if (!subject_code || !subject_name) {
            return res.status(400).json({
                success: false,
                message: "Subject code and subject name are required."
            });
        }

        const result = await pool.query(
            `INSERT INTO subjects
            (subject_code, subject_name, description, is_active)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                subject_code.trim(),
                subject_name.trim(),
                description || null,
                is_active ?? true
            ]
        );

        res.status(201).json({
            success: true,
            message: "Subject created successfully.",
            subject: result.rows[0]
        });

    } catch (error) {
        console.error("Create subject error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Subject code already exists."
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create subject."
        });
    }
};

// Get all subjects
export const getAllSubjects = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM subjects
             ORDER BY subject_id ASC`
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            subjects: result.rows
        });

    } catch (error) {
        console.error("Get subjects error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve subjects."
        });
    }
};

// Get subject by ID
export const getSubjectById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM subjects WHERE subject_id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Subject not found."
            });
        }

        res.status(200).json({
            success: true,
            subject: result.rows[0]
        });

    } catch (error) {
        console.error("Get subject error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve subject."
        });
    }
};

// Update subject
export const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            subject_code,
            subject_name,
            description,
            is_active
        } = req.body;

        if (!subject_code || !subject_name) {
            return res.status(400).json({
                success: false,
                message: "Subject code and subject name are required."
            });
        }

        const result = await pool.query(
            `UPDATE subjects
             SET subject_code = $1,
                 subject_name = $2,
                 description = $3,
                 is_active = $4
             WHERE subject_id = $5
             RETURNING *`,
            [
                subject_code.trim(),
                subject_name.trim(),
                description || null,
                is_active ?? true,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Subject not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Subject updated successfully.",
            subject: result.rows[0]
        });

    } catch (error) {
        console.error("Update subject error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Subject code already exists."
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update subject."
        });
    }
};

// Delete subject
export const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM subjects WHERE subject_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Subject not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Subject deleted successfully."
        });

    } catch (error) {
        console.error("Delete subject error:", error.message);

        if (error.code === "23503") {
            return res.status(409).json({
                success: false,
                message: "Cannot delete this subject because it is being used by other records."
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to delete subject."
        });
    }
};
