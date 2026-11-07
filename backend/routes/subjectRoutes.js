
import express from "express";

import {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
} from "../controllers/subjectController.js";

const router = express.Router();

// Create subject
router.post("/", createSubject);

// Get all subjects
router.get("/", getAllSubjects);

// Get subject by ID
router.get("/:id", getSubjectById);

// Update subject
router.put("/:id", updateSubject);

// Delete subject
router.delete("/:id", deleteSubject);

export default router;
