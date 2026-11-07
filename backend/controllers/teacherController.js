
import pool from "../config/db.js";

// Register a new teacher
export const createTeacher = async (req, res) => {
    try {
        const {
            user_id,
            teacher_code,
            first_name,
            last_name,
            gender,
            phone,
            qualification
        } = req.body;

        if (!teacher_code || !first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: "Teacher code, first name and last name are required."
            });
        }

        const query = `
            INSERT INTO teachers (
                user_id, teacher_code, first_name,
                last_name, gender, phone, qualification
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            user_id || null,
            teacher_code,
            first_name,
            last_name,
            gender || null,
            phone || null,
            qualification || null
        ];

        const result = await pool.query(query, values);

        return res.status(201).json({
            success: true,
            message: "Teacher registered successfully.",
            teacher: result.rows[0]
        });

    } catch (error) {
        console.error("Teacher registration error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Teacher code or linked user already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to register teacher."
        });
    }
};

// Get all teachers
export const getAllTeachers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM teachers
            ORDER BY teacher_id DESC
        `);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            teachers: result.rows
        });

    } catch (error) {
        console.error("Get teachers error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve teachers."
        });
    }
};

// Get teacher by ID
export const getTeacherById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM teachers WHERE teacher_id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found."
            });
        }

        return res.status(200).json({
            success: true,
            teacher: result.rows[0]
        });

    } catch (error) {
        console.error("Get teacher by ID error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve teacher."
        });
    }
};

// Update teacher
export const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            user_id,
            teacher_code,
            first_name,
            last_name,
            gender,
            phone,
            qualification
        } = req.body;

        if (!teacher_code || !first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: "Teacher code, first name and last name are required."
            });
        }

        const query = `
            UPDATE teachers
            SET user_id = $1,
                teacher_code = $2,
                first_name = $3,
                last_name = $4,
                gender = $5,
                phone = $6,
                qualification = $7
            WHERE teacher_id = $8
            RETURNING *
        `;

        const values = [
            user_id || null,
            teacher_code,
            first_name,
            last_name,
            gender || null,
            phone || null,
            qualification || null,
            id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Teacher updated successfully.",
            teacher: result.rows[0]
        });

    } catch (error) {
        console.error("Update teacher error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Teacher code or linked user already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update teacher."
        });
    }
};

// Delete teacher
export const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM teachers
             WHERE teacher_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Teacher deleted successfully."
        });

    } catch (error) {
        console.error("Delete teacher error:", error.message);

        if (error.code === "23503") {
            return res.status(409).json({
                success: false,
                message: "Cannot delete this teacher because related records exist."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to delete teacher."
        });
    }
};
