
import express from "express";

import {
    getAllResults,
    getResultsByStudentId
} from "../controllers/resultController.js";

import {
    verifyToken,
    authorizeRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin and teacher can view all results
router.get(
    "/",
    verifyToken,
    authorizeRoles("admin", "teacher"),
    getAllResults
);

// Admin and teacher can view results by student ID
// Students can view only their own results
router.get(
    "/student/:id",
    verifyToken,
    authorizeRoles("admin", "teacher", "student"),
    getResultsByStudentId
);

export default router;
