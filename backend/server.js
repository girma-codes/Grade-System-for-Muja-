
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";

import markRoutes from "./routes/markRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import academicYearRoutes from "./routes/academicYearRoutes.js";
import semesterRoutes from "./routes/semesterRoutes.js";
import gradeLevelRoutes from "./routes/gradeLevelRoutes.js";
import classSectionRoutes from "./routes/classSectionRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import teacherAssignmentRoutes from "./routes/teacherAssignmentRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Authentication API
app.use("/api/auth", authRoutes);

// Student API
app.use("/api/students", studentRoutes);

// Teacher API
app.use("/api/teachers", teacherRoutes);

// Academic Year API
app.use("/api/academic-years", academicYearRoutes);

// Semester API
app.use("/api/semesters", semesterRoutes);

// Grade Level API
app.use("/api/grade-levels", gradeLevelRoutes);

// Class Section API
app.use("/api/class-sections", classSectionRoutes);

// Subject API
app.use("/api/subjects", subjectRoutes);

// Enrollment API
app.use("/api/enrollments", enrollmentRoutes);

// Teacher Assignment API
app.use("/api/teacher-assignments", teacherAssignmentRoutes);

// Assessment API
app.use("/api/assessments", assessmentRoutes);

// Marks API
app.use("/api/marks", markRoutes);

// Student Results API
app.use("/api/results", resultRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Muja Preparatory School Grading System API is running!"
    });
});

// Database connection test
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT current_database()");

        res.json({
            message: "Database connected successfully",
            database: result.rows[0].current_database
        });
    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
