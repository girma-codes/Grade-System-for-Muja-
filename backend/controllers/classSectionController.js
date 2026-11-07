
import pool from "../config/db.js";

// Create a new class section
export const createClassSection = async (req, res) => {
    try {
        const {
            grade_level_id,
            academic_year_id,
            section_name
        } = req.body;

        if (
            !grade_level_id ||
            !academic_year_id ||
            !section_name ||
            !section_name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Grade level, academic year, and section name are required."
            });
        }

        const result = await pool.query(
            `INSERT INTO class_sections
                (grade_level_id, academic_year_id, section_name)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [
                grade_level_id,
                academic_year_id,
                section_name.trim()
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Class section created successfully.",
            classSection: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23503") {
            return res.status(400).json({
                success: false,
                message: "Invalid grade level ID or academic year ID."
            });
        }

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This class section already exists."
            });
        }

        console.error("Create class section error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// Get all class sections
export const getAllClassSections = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *
             FROM class_sections
             ORDER BY section_id ASC`
        );

        return res.status(200).json({
            success: true,
            count: result.rowCount,
            classSections: result.rows
        });

    } catch (error) {
        console.error("Get class sections error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// Get class section by ID
export const getClassSectionById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM class_sections
             WHERE section_id = $1`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Class section not found."
            });
        }

        return res.status(200).json({
            success: true,
            classSection: result.rows[0]
        });

    } catch (error) {
        console.error("Get class section error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// Update class section
export const updateClassSection = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            grade_level_id,
            academic_year_id,
            section_name
        } = req.body;

        if (
            !grade_level_id ||
            !academic_year_id ||
            !section_name ||
            !section_name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Grade level, academic year, and section name are required."
            });
        }

        const result = await pool.query(
            `UPDATE class_sections
             SET grade_level_id = $1,
                 academic_year_id = $2,
                 section_name = $3
             WHERE section_id = $4
             RETURNING *`,
            [
                grade_level_id,
                academic_year_id,
                section_name.trim(),
                id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Class section not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Class section updated successfully.",
            classSection: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23503") {
            return res.status(400).json({
                success: false,
                message: "Invalid grade level ID or academic year ID."
            });
        }

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This class section already exists."
            });
        }

        console.error("Update class section error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// Delete class section
export const deleteClassSection = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM class_sections
             WHERE section_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Class section not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Class section deleted successfully."
        });

    } catch (error) {
        if (error.code === "23503") {
            return res.status(409).json({
                success: false,
                message: "Cannot delete this class section because it is used by other records."
            });
        }

        console.error("Delete class section error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};
