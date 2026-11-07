
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Create the first Admin account only once
export const setupAdmin = async (req, res) => {
    try {
        const { full_name, username, email, password } = req.body;

        if (!full_name || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
        }

        const existingUsers = await pool.query(
            "SELECT COUNT(*) FROM users"
        );

        if (Number(existingUsers.rows[0].count) > 0) {
            return res.status(403).json({
                success: false,
                message: "Admin setup is already completed."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO users
             (full_name, username, email, password_hash, role, is_active)
             VALUES ($1, $2, $3, $4, 'admin', true)
             RETURNING user_id, full_name, username, email, role`,
            [full_name, username, email, passwordHash]
        );

        return res.status(201).json({
            success: true,
            message: "Admin account created successfully.",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Admin setup error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to create admin account."
        });
    }
};


// Login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });
        }

        const result = await pool.query(
            `SELECT * FROM users WHERE username = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured.");
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Login failed."
        });
    }
};


// Get current logged-in user
export const getCurrentUser = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT user_id, full_name, username, email, role, is_active, created_at
             FROM users
             WHERE user_id = $1`,
            [req.user.user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.status(200).json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Get current user error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user information."
        });
    }
};


// Admin creates Student or Teacher account
export const createUser = async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            full_name,
            username,
            email,
            password,
            role,
            profile_code
        } = req.body;

        if (!full_name || !username || !password || !role || !profile_code) {
            return res.status(400).json({
                success: false,
                message: "Full name, username, password, role and profile code are required."
            });
        }

        if (!["student", "teacher"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be student or teacher."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
        }

        const table = role === "student" ? "students" : "teachers";
        const codeColumn = role === "student" ? "student_code" : "teacher_code";

        await client.query("BEGIN");

        const profileResult = await client.query(
            `SELECT * FROM ${table}
             WHERE ${codeColumn} = $1
             FOR UPDATE`,
            [profile_code]
        );

        if (profileResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: `${role} profile not found.`
            });
        }

        const profile = profileResult.rows[0];

        if (profile.user_id !== null) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                success: false,
                message: "This profile already has a login account."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const userResult = await client.query(
            `INSERT INTO users
             (full_name, username, email, password_hash, role, is_active)
             VALUES ($1, $2, $3, $4, $5, true)
             RETURNING user_id, full_name, username, email, role, is_active`,
            [
                full_name,
                username,
                email || null,
                passwordHash,
                role
            ]
        );

        const newUser = userResult.rows[0];

        await client.query(
            `UPDATE ${table}
             SET user_id = $1
             WHERE ${codeColumn} = $2`,
            [newUser.user_id, profile_code]
        );

        await client.query("COMMIT");

        return res.status(201).json({
            success: true,
            message: `${role} account created and linked successfully.`,
            user: newUser
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Create user error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Username or email already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create user account."
        });

    } finally {
        client.release();
    }
};
