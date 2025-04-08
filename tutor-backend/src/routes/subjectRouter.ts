import { Router } from "express";
import {
    deleteSubject,
  getAllSubjects,
  getSubjectByName,
  updateSubject,
} from "../controllers/subjectController";
const router = Router();

router.get("/subjects", getAllSubjects);
router.get("/subject/:name", getSubjectByName);
router.put("/subject/:id", updateSubject);
router.delete("/subject/:id", deleteSubject);

export default router;
