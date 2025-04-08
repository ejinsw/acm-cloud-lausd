import { Router } from "express";
import { deleteStudent, getStudentById, updateStudent, createStudent } from "../controllers/studentController";
const router = Router();

router.get("/student/:id", getStudentById);
router.post("/students", createStudent)
router.put("/student/:id", updateStudent);
router.delete("/student/:id", deleteStudent);


export default router;
