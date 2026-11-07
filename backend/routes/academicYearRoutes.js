
import express from "express";

import {
    createAcademicYear,
    getAllAcademicYears,
    getAcademicYearById,
    updateAcademicYear,
    deleteAcademicYear
} from "../controllers/academicYearController.js";

const router = express.Router();

// Create academic year
router.post("/", createAcademicYear);

// Get all academic years
router.get("/", getAllAcademicYears);

// Get academic year by ID
router.get("/:id", getAcademicYearById);

// Update academic year
router.put("/:id", updateAcademicYear);

// Delete academic year
router.delete("/:id", deleteAcademicYear);

export default router;
