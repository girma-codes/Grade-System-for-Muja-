
import express from "express";

import {
    createGradeLevel,
    getAllGradeLevels,
    getGradeLevelById,
    updateGradeLevel,
    deleteGradeLevel
} from "../controllers/gradeLevelController.js";

const router = express.Router();

router.post("/", createGradeLevel);
router.get("/", getAllGradeLevels);
router.get("/:id", getGradeLevelById);
router.put("/:id", updateGradeLevel);
router.delete("/:id", deleteGradeLevel);

export default router;
