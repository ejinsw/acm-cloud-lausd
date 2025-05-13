import { Router } from "express";
import {
  deleteReview,
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
} from "../controllers/reviewController";
const router = Router();

router.get("/reviews", getAllReviews);
router.get("/review/:id", getReviewById);
router.post("/reviews", createReview)
router.put("/review/:id", updateReview);
router.delete("/review/:id", deleteReview);

export default router;
