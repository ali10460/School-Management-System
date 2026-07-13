import express from "express";
import {
  getUsers,
  getUserStats,
  getUserById,
  deleteUser,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();
router.get("/", protect, authorize("admin"), getUsers);

router.get("/stats", protect, authorize("admin"), getUserStats);

router.get("/:id", protect, getUserById);

router.delete("/:id", protect, authorize("admin"), deleteUser);

export default router;
