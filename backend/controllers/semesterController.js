
import pool from "../config/db.js";

// Create semester
export const createSemester = async (req, res) => {
    try {
        const {
            academic_year_id,
            semester_number,
            start_date,
            end_date
        } = req.body;

        if (
            !academic_year_id ||
            !semester_number ||
            !start_date ||
            !end_date
        ) {
            return res.status(400).json({
                success: false,
                message: "Academic year ID, semester number, start date and end date are required."
            });
        }

        if (![1, 2].includes(Number(semester_number))) {
            return res.status(400).json({
                success: false,
                message: "Semester number must be 1 or 2."
            });
        }

        if (
            !Number.isFinite(Date.parse(start_date)) ||
            !Number.isFinite(Date.parse(end_date)) ||
            new Date(start_date) >= new Date(end_date)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid dates. End date must be after start date."
            });
        }

        const query = `
            INSERT INTO semesters (
                academic_year_id,
                semester_number,
                start_date,
                end_date
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const values = [
            academic_year_id,
            semester_number,
            start_date,
            end_date
        ];

        const result = await pool.query(query, values);

        return res.status(201).json({
            success: true,
            message: "Semester created successfully.",
            semester: result.rows[0]
        });

    } catch (error) {
        console.error("Create semester error:", error.message);

        if (error.code === "23503") {
            return res.status(400).json({
                success: false,
                message: "Academic year does not exist."
            });
        }

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This semester already exists for the academic year."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create semester."
        });
    }
};

// Get all semesters
export const getAllSemesters = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                s.*,
                a.year_name
            FROM semesters s
            INNER JOIN academic_years a
                ON s.academic_year_id = a.academic_year_id
            ORDER BY a.start_date DESC, s.semester_number ASC
        `);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            semesters: result.rows
        });

    } catch (error) {
        console.error("Get semesters error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve semesters."
        });
    }
};

// Get semester by ID
export const getSemesterById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                s.*,
                a.year_name
             FROM semesters s
             INNER JOIN academic_years a
                ON s.academic_year_id = a.academic_year_id
             WHERE s.semester_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Semester not found."
            });
        }

        return res.status(200).json({
            success: true,
            semester: result.rows[0]
        });

    } catch (error) {
        console.error("Get semester by ID error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve semester."
        });
    }
};

// Update semester
export const updateSemester = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            academic_year_id,
            semester_number,
            start_date,
            end_date
        } = req.body;

        if (
            !academic_year_id ||
            !semester_number ||
            !start_date ||
            !end_date
        ) {
            return res.status(400).json({
                success: false,
                message: "Academic year ID, semester number, start date and end date are required."
            });
        }

        if (![1, 2].includes(Number(semester_number))) {
            return res.status(400).json({
                success: false,
                message: "Semester number must be 1 or 2."
            });
        }

        if (
            !Number.isFinite(Date.parse(start_date)) ||
            !Number.isFinite(Date.parse(end_date)) ||
            new Date(start_date) >= new Date(end_date)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid dates. End date must be after start date."
            });
        }

        const query = `
            UPDATE semesters
            SET academic_year_id = $1,
                semester_number = $2,
                start_date = $3,
                end_date = $4
            WHERE semester_id = $5
            RETURNING *
        `;

        const values = [
            academic_year_id,
            semester_number,
            start_date,
            end_date,
            id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Semester not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Semester updated successfully.",
            semester: result.rows[0]
        });

    } catch (error) {
        console.error("Update semester error:", error.message);

        if (error.code === "23503") {
            return res.status(400).json({
                success: false,
                message: "Academic year does not exist."
            });
        }

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This semester already exists for the academic year."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update semester."
        });
    }
};

// Delete semester
export const deleteSemester = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM semesters
             WHERE semester_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Semester not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Semester deleted successfully."
        });

    } catch (error) {
        console.error("Delete semester error:", error.message);

        if (error.code === "23503") {
            return res.status(409).json({
                success: false,
                message: "Cannot delete this semester because related records exist."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to delete semester."
        });
    }
};
