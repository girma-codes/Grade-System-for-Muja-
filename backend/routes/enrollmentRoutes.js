
import express from "express";

import {
    createEnrollment,
    getAllEnrollments,
    getEnrollmentById,
    updateEnrollment,
    deleteEnrollment
} from "../controllers/enrollmentController.js";

const router = express.Router();

// Create enrollment
router.post("/", createEnrollment);

// Get all enrollments
router.get("/", getAllEnrollments);

// Get enrollment by ID
router.get("/:id", getEnrollmentById);

// Update enrollment
router.put("/:id", updateEnrollment);

// Delete enrollment
router.delete("/:id", deleteEnrollment);

export default router;
