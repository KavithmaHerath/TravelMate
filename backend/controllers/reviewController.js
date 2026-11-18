const db = require("../config/db");

// GET REVIEWS FOR A DESTINATION
const getDestinationReviews = async (req, res) => {
    try {
        const destinationId = Number(req.params.destinationId);

        if (!Number.isSafeInteger(destinationId) || destinationId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid destination ID"
            });
        }

        const [reviews] = await db.query(
            `SELECT
                destination_reviews.id,
                destination_reviews.user_id,
                destination_reviews.destination_id,
                destination_reviews.rating,
                destination_reviews.review,
                destination_reviews.created_at,
                destination_reviews.updated_at,
                users.name AS user_name
             FROM destination_reviews
             INNER JOIN users
                ON destination_reviews.user_id = users.id
             WHERE destination_reviews.destination_id = ?
             ORDER BY destination_reviews.created_at DESC`,
            [destinationId]
        );

        const [summary] = await db.query(
            `SELECT
                COUNT(*) AS total_reviews,
                COALESCE(AVG(rating), 0) AS average_rating
             FROM destination_reviews
             WHERE destination_id = ?`,
            [destinationId]
        );

        res.status(200).json({
            success: true,
            data: reviews,
            summary: summary[0]
        });

    } catch (error) {
        console.error("Get reviews error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to load reviews"
        });
    }
};


// CREATE A REVIEW
const createReview = async (req, res) => {
    try {
        const destinationId = Number(req.body.destination_id);
        const rating = Number(req.body.rating);
        const review = req.body.review;

        if (
            !Number.isSafeInteger(destinationId) ||
            destinationId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid destination"
            });
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        if (
            typeof review !== "string" ||
            !review.trim() ||
            review.trim().length > 2000
        ) {
            return res.status(400).json({
                success: false,
                message: "Review must contain between 1 and 2000 characters"
            });
        }

        const [destinations] = await db.query(
            "SELECT id FROM destinations WHERE id = ?",
            [destinationId]
        );

        if (destinations.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Destination not found"
            });
        }

        const [existingReviews] = await db.query(
            `SELECT id FROM destination_reviews
             WHERE user_id = ? AND destination_id = ?`,
            [req.user.id, destinationId]
        );

        if (existingReviews.length > 0) {
            return res.status(409).json({
                success: false,
                message: "You have already reviewed this destination. You can edit your existing review."
            });
        }

        const [result] = await db.query(
            `INSERT INTO destination_reviews
                (user_id, destination_id, rating, review)
             VALUES (?, ?, ?, ?)`,
            [
                req.user.id,
                destinationId,
                rating,
                review.trim()
            ]
        );

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            reviewId: result.insertId
        });

    } catch (error) {
        console.error("Create review error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to submit review"
        });
    }
};


// UPDATE YOUR OWN REVIEW
const updateReview = async (req, res) => {
    try {
        const reviewId = Number(req.params.id);
        const rating = Number(req.body.rating);
        const review = req.body.review;

        if (!Number.isSafeInteger(reviewId) || reviewId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        if (
            typeof review !== "string" ||
            !review.trim() ||
            review.trim().length > 2000
        ) {
            return res.status(400).json({
                success: false,
                message: "Review must contain between 1 and 2000 characters"
            });
        }

        const [result] = await db.query(
            `UPDATE destination_reviews
             SET rating = ?, review = ?
             WHERE id = ? AND user_id = ?`,
            [
                rating,
                review.trim(),
                reviewId,
                req.user.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Review not found or you do not have permission to edit it"
            });
        }

        res.status(200).json({
            success: true,
            message: "Review updated successfully"
        });

    } catch (error) {
        console.error("Update review error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to update review"
        });
    }
};


// DELETE YOUR OWN REVIEW
const deleteReview = async (req, res) => {
    try {
        const reviewId = Number(req.params.id);

        if (!Number.isSafeInteger(reviewId) || reviewId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
        }

        const [result] = await db.query(
            `DELETE FROM destination_reviews
             WHERE id = ? AND user_id = ?`,
            [reviewId, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Review not found or you do not have permission to delete it"
            });
        }

        res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error) {
        console.error("Delete review error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to delete review"
        });
    }
};


module.exports = {
    getDestinationReviews,
    createReview,
    updateReview,
    deleteReview
};