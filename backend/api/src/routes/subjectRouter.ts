import express from "express";
import {
  createSubject,
  getSubject,
  updateSubject,
  deleteSubject,
  getSubjects,
} from "../controllers/subjectController";
import { authenticateToken, checkRole } from "../middleware/auth";

const router = express.Router();

// Protected routes
router.post("/subjects", authenticateToken, checkRole(["INSTRUCTOR"]), createSubject);
router.get("/subjects/:id", authenticateToken, getSubject);
router.put("/subjects/:id", authenticateToken, checkRole(["INSTRUCTOR"]), updateSubject);
router.delete("/subjects/:id", authenticateToken, checkRole(["INSTRUCTOR"]), deleteSubject);
router.get("/subjects", authenticateToken, getSubjects);

export default router;
