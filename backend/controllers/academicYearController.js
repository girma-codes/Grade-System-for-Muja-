
import pool from "../config/db.js";

// Create academic year
export const createAcademicYear = async (req, res) => {
    try {
        const { year_name, start_date, end_date, is_current } = req.body;

        if (!year_name || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: "Year name, start date and end date are required."
            });
        }

        if (new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date."
            });
        }

        const query = `
            INSERT INTO academic_years (
                year_name, start_date, end_date, is_current
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const values = [
            year_name,
            start_date,
            end_date,
            is_current ?? false
        ];

        const result = await pool.query(query, values);

        return res.status(201).json({
            success: true,
            message: "Academic year created successfully.",
            academicYear: result.rows[0]
        });

    } catch (error) {
        console.error("Create academic year error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to create academic year."
        });
    }
};

// Get all academic years
export const getAllAcademicYears = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM academic_years
            ORDER BY start_date DESC
        `);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            academicYears: result.rows
        });

    } catch (error) {
        console.error("Get academic years error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve academic years."
        });
    }
};

// Get academic year by ID
export const getAcademicYearById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM academic_years WHERE academic_year_id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Academic year not found."
            });
        }

        return res.status(200).json({
            success: true,
            academicYear: result.rows[0]
        });

    } catch (error) {
        console.error("Get academic year error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve academic year."
        });
    }
};

// Update academic year
export const updateAcademicYear = async (req, res) => {
    try {
        const { id } = req.params;
        const { year_name, start_date, end_date, is_current } = req.body;

        if (!year_name || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: "Year name, start date and end date are required."
            });
        }

        if (new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date."
            });
        }

        const query = `
            UPDATE academic_years
            SET year_name = $1,
                start_date = $2,
                end_date = $3,
                is_current = $4
            WHERE academic_year_id = $5
            RETURNING *
        `;

        const values = [
            year_name,
            start_date,
            end_date,
            is_current ?? false,
            id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Academic year not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Academic year updated successfully.",
            academicYear: result.rows[0]
        });

    } catch (error) {
        console.error("Update academic year error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to update academic year."
        });
    }
};

// Delete academic year
export const deleteAcademicYear = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM academic_years
             WHERE academic_year_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Academic year not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Academic year deleted successfully."
        });

    } catch (error) {
        console.error("Delete academic year error:", error.message);

        if (error.code === "23503") {
            return res.status(409).json({
                success: false,
                message: "Cannot delete this academic year because related records exist."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to delete academic year."
        });
    }
};
