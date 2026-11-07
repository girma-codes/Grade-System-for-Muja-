import express from "express";

import {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent
} from "../controllers/studentController.js";

import {
    verifyToken,
    authorizeRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Only Admin can manage student records
router.post(
    "/",
    verifyToken,
    authorizeRoles("admin"),
    createStudent
);

router.get(
    "/",
    verifyToken,
    authorizeRoles("admin"),
    getAllStudents
);

router.get(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    getStudentById
);

router.put(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    updateStudent
);

router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    deleteStudent
);

export default router;