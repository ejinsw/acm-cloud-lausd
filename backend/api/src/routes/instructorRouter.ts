import { Router } from "express";
import {
    deleteInstructor,
  getAllInstructors,
  getInstructorById,
  updateInstructor,
  createInstructor
} from "../controllers/instructorController";
const router = Router();


router.get("/instructors", getAllInstructors);
router.get("/instructor/:id", getInstructorById);
router.post("/instructors", createInstructor);
router.put("/instructor/:id", updateInstructor);
router.delete("/instructor/:id", deleteInstructor);

export default router;
