import { Router } from "express";
import {
  deleteReview,
  getAllReviews,
  getReviewById,
  updateReview,
} from "../controllers/reviewController";
const router = Router();

router.get("/reviews", getAllReviews);
router.get("/review/:id", getReviewById);
router.put("/review/:id", updateReview);
router.delete("/review/:id", deleteReview);

export default router;
