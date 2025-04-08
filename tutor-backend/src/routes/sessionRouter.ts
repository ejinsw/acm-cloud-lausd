import { Router } from "express";
import { createSession, deleteSession, getAllSessions, getSessionById, updateSession } from "../controllers/sessionController";
const router = Router();

router.get("/sessions", getAllSessions)
router.get("/session/:id", getSessionById)
router.post("/session", createSession)
router.put("/session/:id", updateSession)
router.delete("/session/:id", deleteSession)

export default router;
