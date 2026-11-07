
import pool from "../config/db.js";

// Create a new grade level
export const createGradeLevel = async (req, res) => {
    try {
        const { grade_name } = req.body;

        if (!grade_name || !grade_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Grade name is required."
            });
        }

        const result = await pool.query(
            `INSERT INTO grade_levels (grade_name)
             VALUES ($1)
             RETURNING *`,
            [grade_name.trim()]
        );

        return res.status(201).json({
            success: true,
            message: "Grade level created successfully.",
            gradeLevel: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This grade level already exists."
            });
        }

        console.error("Create grade level error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// Get all grade levels
export const getAllGradeLevels = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM grade_levels
             ORDER BY grade_level_id ASC`
        );

        return res.status(200).json({
            success: true,
            count: result.rowCount,
            gradeLevels: result.rows
        });

    } catch (error) {
        console.error("Get grade levels error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// Get grade level by ID
export const getGradeLevelById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM grade_levels WHERE grade_level_id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Grade level not found."
            });
        }

        return res.status(200).json({
            success: true,
            gradeLevel: result.rows[0]
        });

    } catch (error) {
        console.error("Get grade level error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// Update grade level
export const updateGradeLevel = async (req, res) => {
    try {
        const { id } = req.params;
        const { grade_name } = req.body;

        if (!grade_name || !grade_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Grade name is required."
            });
        }

        const result = await pool.query(
            `UPDATE grade_levels
             SET grade_name = $1
             WHERE grade_level_id = $2
             RETURNING *`,
            [grade_name.trim(), id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Grade level not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Grade level updated successfully.",
            gradeLevel: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This grade level already exists."
            });
        }

        console.error("Update grade level error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// Delete grade level
export const deleteGradeLevel = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM grade_levels
             WHERE grade_level_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Grade level not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Grade level deleted successfully."
        });

    } catch (error) {
        if (error.code === "23503") {
            return res.status(409).json({
                success: false,
                message: "Cannot delete this grade level because it is used by other records."
            });
        }

        console.error("Delete grade level error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};
