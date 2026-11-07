import express from "express";

import {
    createTeacherAssignment,
    getAllTeacherAssignments,
    getTeacherAssignmentById,
    updateTeacherAssignment,
    deleteTeacherAssignment
} from "../controllers/teacherAssignmentController.js";

const router = express.Router();

// Create assignment
router.post("/", createTeacherAssignment);

// Get all assignments
router.get("/", getAllTeacherAssignments);

// Get assignment by ID
router.get("/:id", getTeacherAssignmentById);

// Update assignment
router.put("/:id", updateTeacherAssignment);

// Delete assignment
router.delete("/:id", deleteTeacherAssignment);

export default router;