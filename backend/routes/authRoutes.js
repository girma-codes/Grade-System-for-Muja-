
import express from "express";

import {
    setupAdmin,
    login,
    getCurrentUser,
    createUser
} from "../controllers/authController.js";

import {
    verifyToken,
    authorizeRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/setup-admin", setupAdmin);
router.post("/login", login);

// Protected route
router.get("/me", verifyToken, getCurrentUser);

// Admin-only test route
router.get(
    "/admin-test",
    verifyToken,
    authorizeRoles("admin"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Admin! Authorization successful."
        });
    }
);

// Admin-only user creation route
router.post(
    "/users",
    verifyToken,
    authorizeRoles("admin"),
    createUser
);

export default router;
