const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    getDestinationReviews,
    createReview,
    updateReview,
    deleteReview
} = require("../controllers/reviewController");

// Public: anyone can view destination reviews.
router.get("/:destinationId", getDestinationReviews);

// Protected: users must be logged in to create, edit or delete reviews.
router.post("/", protect, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;