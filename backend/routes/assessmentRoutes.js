import express from "express";

import {
    createAssessment,
    getAllAssessments,
    getAssessmentById,
    updateAssessment,
    deleteAssessment
} from "../controllers/assessmentController.js";

import {
    verifyToken,
    authorizeRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin and Teacher can create assessments
router.post(
    "/",
    verifyToken,
    authorizeRoles("admin", "teacher"),
    createAssessment
);

// Admin and Teacher can view assessments
router.get(
    "/",
    verifyToken,
    authorizeRoles("admin", "teacher"),
    getAllAssessments
);

// Admin and Teacher can view assessment by ID
router.get(
    "/:id",
    verifyToken,
    authorizeRoles("admin", "teacher"),
    getAssessmentById
);

// Admin and Teacher can update assessments
router.put(
    "/:id",
    verifyToken,
    authorizeRoles("admin", "teacher"),
    updateAssessment
);

// Only Admin can delete assessments
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    deleteAssessment
);

export default router;