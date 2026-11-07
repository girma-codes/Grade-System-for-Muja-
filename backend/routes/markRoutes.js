
import express from "express";

import {
    createMark,
    getAllMarks,
    getMarkById,
    updateMark,
    deleteMark
} from "../controllers/markController.js";

import {
    verifyToken,
    authorizeRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Only Admin and Teacher can manage marks
router.post(
    "/",
    verifyToken,
    authorizeRoles("admin", "teacher"),
    createMark
);

router.get(
    "/",
    verifyToken,
    authorizeRoles("admin", "teacher"),
    getAllMarks
);

router.get(
    "/:id",
    verifyToken,
    authorizeRoles("admin", "teacher"),
    getMarkById
);

router.put(
    "/:id",
    verifyToken,
    authorizeRoles("admin", "teacher"),
    updateMark
);

router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    deleteMark
);

export default router;
