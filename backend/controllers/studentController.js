
import pool from "../config/db.js";

// Register a new student
export const createStudent = async (req, res) => {
    try {
        const {
            student_code,
            first_name,
            middle_name,
            last_name,
            gender,
            date_of_birth,
            guardian_name,
            guardian_phone
        } = req.body;

        if (!student_code || !first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: "Student code, first name and last name are required."
            });
        }

        const query = `
            INSERT INTO students (
                student_code, first_name, middle_name, last_name,
                gender, date_of_birth, guardian_name, guardian_phone
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const values = [
            student_code, first_name, middle_name || null,
            last_name, gender || null, date_of_birth || null,
            guardian_name || null, guardian_phone || null
        ];

        const result = await pool.query(query, values);

        return res.status(201).json({
            success: true,
            message: "Student registered successfully.",
            student: result.rows[0]
        });

    } catch (error) {
        console.error("Student registration error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Student code already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to register student."
        });
    }
};

// Get all students
export const getAllStudents = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM students
            ORDER BY student_id DESC
        `);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            students: result.rows
        });

    } catch (error) {
        console.error("Get students error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve students."
        });
    }
};

// Get student by ID
export const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM students WHERE student_id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            student: result.rows[0]
        });

    } catch (error) {
        console.error("Get student by ID error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve student."
        });
    }
};

// Update student
export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            student_code, first_name, middle_name, last_name,
            gender, date_of_birth, guardian_name, guardian_phone
        } = req.body;

        if (!student_code || !first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: "Student code, first name and last name are required."
            });
        }

        const query = `
            UPDATE students
            SET student_code = $1,
                first_name = $2,
                middle_name = $3,
                last_name = $4,
                gender = $5,
                date_of_birth = $6,
                guardian_name = $7,
                guardian_phone = $8
            WHERE student_id = $9
            RETURNING *
        `;

        const values = [
            student_code, first_name, middle_name || null,
            last_name, gender || null, date_of_birth || null,
            guardian_name || null, guardian_phone || null, id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student updated successfully.",
            student: result.rows[0]
        });

    } catch (error) {
        console.error("Update student error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Student code already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update student."
        });
    }
};

// Delete student
export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM students
             WHERE student_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student deleted successfully."
        });

    } catch (error) {
        console.error("Delete student error:", error.message);

        if (error.code === "23503") {
            return res.status(409).json({
                success: false,
                message: "Cannot delete this student because related records exist."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to delete student."
        });
    }
};
