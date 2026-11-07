
import express from "express";

import {
    createClassSection,
    getAllClassSections,
    getClassSectionById,
    updateClassSection,
    deleteClassSection
} from "../controllers/classSectionController.js";

const router = express.Router();

router.post("/", createClassSection);
router.get("/", getAllClassSections);
router.get("/:id", getClassSectionById);
router.put("/:id", updateClassSection);
router.delete("/:id", deleteClassSection);

export default router;
