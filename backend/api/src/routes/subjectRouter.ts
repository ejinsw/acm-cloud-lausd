import express from 'express';
import {
  getSubjects,
} from '../controllers/subjectController';

const router = express.Router();

// Public legacy read-only wrapper.
router.get('/subjects', getSubjects);

export default router;
