import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    ArrowLeft,
    MapPin,
    CalendarDays,
    Clock,
    Ticket,
    Lightbulb,
    Compass,
    Star,
    Map,
    Navigation,
    Send,
    Pencil,
    Trash2
} from "lucide-react";

import {
    getDestination,
    getDestinationReviews,
    createReview,
    updateReview,
    deleteReview,
    getToken,
    getSavedUser
} from "../services/api";

import "./DestinationDetails.css";


function DestinationDetails() {
    const { id } = useParams();

    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [reviews, setReviews] = useState([]);
    const [reviewSummary, setReviewSummary] = useState({
        total_reviews: 0,
        average_rating: 0
    });

    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");

    const [editingReviewId, setEditingReviewId] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [reviewMessage, setReviewMessage] = useState("");

    const isLoggedIn = Boolean(getToken());
    const currentUser = getSavedUser();


    // LOAD DESTINATION
    useEffect(() => {
        const fetchDestination = async () => {
            try {
                setLoading(true);
                setError("");

                const result = await getDestination(id);

                setDestination(
                    result.data ||
                    result.destination ||
                    result
                );

            } catch (err) {
                setError(
                    err.message || "Unable to load destination."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchDestination();

    }, [id]);


    // LOAD REVIEWS
    const fetchReviews = async () => {
        try {
            const result = await getDestinationReviews(id);

            setReviews(result.data || []);

            setReviewSummary(
                result.summary || {
                    total_reviews: 0,
                    average_rating: 0
                }
            );

        } catch (err) {
            setReviewError(err.message);
        }
    };


    useEffect(() => {
        fetchReviews();
    }, [id]);


    // CONVERT TEXT INTO LIST ITEMS
    const getList = (value) => {
        if (Array.isArray(value)) return value;

        if (typeof value === "string" && value.trim()) {
            return value
                .split(/\n|,/)
                .map((item) => item.trim())
                .filter(Boolean);
        }

        return [];
    };


    // RESET REVIEW FORM
    const resetReviewForm = () => {
        setRating(5);
        setReviewText("");
        setEditingReviewId(null);
        setReviewError("");
    };


    // SUBMIT OR UPDATE REVIEW
    const handleReviewSubmit = async (event) => {
        event.preventDefault();

        setReviewError("");
        setReviewMessage("");

        if (!isLoggedIn) {
            setReviewError("Please log in to submit a review.");
            return;
        }

        if (!reviewText.trim()) {
            setReviewError("Please write your review.");
            return;
        }

        try {
            setReviewLoading(true);

            const reviewData = {
                rating,
                review: reviewText
            };

            if (editingReviewId) {
                await updateReview(
                    editingReviewId,
                    reviewData
                );

                setReviewMessage(
                    "Your review was updated successfully."
                );

            } else {
                await createReview({
                    ...reviewData,
                    destination_id: Number(id)
                });

                setReviewMessage(
                    "Your review was submitted successfully."
                );
            }

            resetReviewForm();
            await fetchReviews();

        } catch (err) {
            setReviewError(err.message);

        } finally {
            setReviewLoading(false);
        }
    };


    // EDIT REVIEW
    const handleEditReview = (review) => {
        setEditingReviewId(review.id);
        setRating(review.rating);
        setReviewText(review.review);

        setReviewError("");
        setReviewMessage("");

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });
    };


    // DELETE REVIEW
    const handleDeleteReview = async (reviewId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this review?"
        );

        if (!confirmed) return;

        try {
            await deleteReview(reviewId);

            if (editingReviewId === reviewId) {
                resetReviewForm();
            }

            setReviewMessage(
                "Your review was deleted successfully."
            );

            await fetchReviews();

        } catch (err) {
            setReviewError(err.message);
        }
    };


    // LOADING
    if (loading) {
        return (
            <div className="destination-detail-message">
                Loading destination details...
            </div>
        );
    }


    // ERROR
    if (error || !destination) {
        return (
            <div className="destination-detail-message">
                <h2>Destination not found</h2>

                <p>
                    {error || "This destination could not be found."}
                </p>

                <Link
                    to="/destinations"
                    className="back-destinations"
                >
                    <ArrowLeft size={17} />
                    Back to Destinations
                </Link>
            </div>
        );
    }


    const thingsToDo = getList(destination.things_to_do);
    const travelTips = getList(destination.travel_tips);

    const mapDestination = encodeURIComponent(
        `${destination.name}, ${destination.location || ""}, Sri Lanka`
    );

    const mapUrl =
        `https://www.google.com/maps?q=${mapDestination}&output=embed`;

    const directionsUrl =
        `https://www.google.com/maps/dir/?api=1&destination=${mapDestination}`;


    return (
        <div className="destination-detail-page">

            <Link
                to="/destinations"
                className="back-destinations"
            >
                <ArrowLeft size={18} />
                Back to Destinations
            </Link>


            {/* DESTINATION HERO */}

            <section className="destination-detail-hero">

                <img
                    className="destination-detail-image"
                    src={destination.image}
                    alt={destination.name}
                    onError={(e) => {
                        e.currentTarget.src =
                            "https://placehold.co/1200x600?text=TravelMate";
                    }}
                />

                <div className="destination-detail-overlay">

                    <span className="detail-category">
                        {destination.category || "Destination"}
                    </span>

                    <h1>{destination.name}</h1>

                    <p>
                        <MapPin size={18} />
                        {destination.district || destination.location}
                    </p>

                </div>
            </section>


            <div className="destination-detail-content">

                {/* DESCRIPTION */}

                <section className="detail-section">

                    <h2>About This Destination</h2>

                    <p className="full-description">
                        {destination.description ||
                            "Discover the beauty and attractions of this destination in Sri Lanka."}
                    </p>

                </section>


                {/* INFORMATION CARDS */}

                <section className="detail-information-grid">

                    <article className="detail-info-card">

                        <CalendarDays size={25} />

                        <h3>Best Time to Visit</h3>

                        <p>
                            {destination.best_time_to_visit ||
                                "Information coming soon."}
                        </p>

                    </article>


                    <article className="detail-info-card">

                        <Clock size={25} />

                        <h3>Recommended Duration</h3>

                        <p>
                            {destination.recommended_duration ||
                                "Information coming soon."}
                        </p>

                    </article>


                    <article className="detail-info-card">

                        <Ticket size={25} />

                        <h3>Entry Fee</h3>

                        <p>
                            {destination.entry_fee ||
                                "Check locally before visiting."}
                        </p>

                    </article>

                </section>


                {/* THINGS TO DO */}

                <section className="detail-section">

                    <h2>
                        <Compass size={22} />
                        Things to Do
                    </h2>

                    {thingsToDo.length > 0 ? (
                        <ul className="detail-list">
                            {thingsToDo.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>More activities will be added soon.</p>
                    )}

                </section>


                {/* TRAVEL TIPS */}

                <section className="detail-section">

                    <h2>
                        <Lightbulb size={22} />
                        Travel Tips
                    </h2>

                    {travelTips.length > 0 ? (
                        <ul className="detail-list">
                            {travelTips.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>
                            Check local travel conditions before your visit.
                        </p>
                    )}

                </section>


                {/* INTERACTIVE MAP */}

                <section className="detail-section destination-map-section">

                    <h2>
                        <Map size={23} />
                        Explore on the Map
                    </h2>

                    <p>
                        Find {destination.name} on the map and view
                        directions for your journey.
                    </p>

                    <div className="destination-map-frame">

                        <iframe
                            title={`Map showing ${destination.name}`}
                            src={mapUrl}
                            width="100%"
                            height="400"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                        />

                    </div>

                    <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="directions-button"
                    >
                        <Navigation size={18} />
                        Get Directions
                    </a>

                </section>


                {/* REVIEWS */}

                <section className="detail-section reviews-section">

                    <h2>
                        <Star size={23} />
                        Visitor Reviews
                    </h2>


                    {/* REVIEW SUMMARY */}

                    <div className="review-summary">

                        <div className="review-average">

                            <strong>
                                {Number(
                                    reviewSummary.average_rating || 0
                                ).toFixed(1)}
                            </strong>

                            <div className="review-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={19}
                                        fill={
                                            star <= Math.round(
                                                reviewSummary.average_rating || 0
                                            )
                                                ? "#e7a33e"
                                                : "none"
                                        }
                                    />
                                ))}
                            </div>

                            <span>
                                {reviewSummary.total_reviews} reviews
                            </span>

                        </div>

                    </div>


                    {/* EXISTING REVIEWS */}

                    <div className="reviews-list">

                        {reviews.length > 0 ? (

                            reviews.map((review) => (

                                <article
                                    className="review-card"
                                    key={review.id}
                                >

                                    <div className="review-card-header">

                                        <div>

                                            <h3>{review.user_name}</h3>

                                            <div className="review-stars">

                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={16}
                                                        fill={
                                                            star <= review.rating
                                                                ? "#e7a33e"
                                                                : "none"
                                                        }
                                                    />
                                                ))}

                                            </div>

                                        </div>

                                        <span className="review-date">
                                            {new Date(
                                                review.created_at
                                            ).toLocaleDateString()}
                                        </span>

                                    </div>


                                    <p>{review.review}</p>


                                    {currentUser &&
                                        Number(currentUser.id) ===
                                        Number(review.user_id) && (

                                            <div className="review-actions">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEditReview(review)
                                                    }
                                                >
                                                    <Pencil size={15} />
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteReview(review.id)
                                                    }
                                                >
                                                    <Trash2 size={15} />
                                                    Delete
                                                </button>

                                            </div>
                                        )}

                                </article>

                            ))

                        ) : (

                            <p className="no-reviews">
                                No reviews yet. Be the first to share
                                your experience!
                            </p>

                        )}

                    </div>


                    {/* REVIEW FORM */}

                    <div className="review-form-container">

                        <h3>
                            {editingReviewId
                                ? "Edit Your Review"
                                : "Write a Review"}
                        </h3>


                        {!isLoggedIn ? (

                            <p className="review-login-message">
                                Please log in to share your experience.
                            </p>

                        ) : (

                            <form
                                className="review-form"
                                onSubmit={handleReviewSubmit}
                            >

                                <label>Your Rating</label>

                                <div className="rating-selector">

                                    {[1, 2, 3, 4, 5].map((star) => (

                                        <button
                                            type="button"
                                            key={star}
                                            className={
                                                star <= rating
                                                    ? "rating-star active"
                                                    : "rating-star"
                                            }
                                            onClick={() => setRating(star)}
                                            aria-label={`Rate ${star} out of 5`}
                                        >
                                            <Star
                                                size={28}
                                                fill={
                                                    star <= rating
                                                        ? "#e7a33e"
                                                        : "none"
                                                }
                                            />
                                        </button>

                                    ))}

                                </div>


                                <label htmlFor="destination-review">
                                    Your Review
                                </label>

                                <textarea
                                    id="destination-review"
                                    rows="5"
                                    maxLength="2000"
                                    placeholder="Share your experience of this destination..."
                                    value={reviewText}
                                    onChange={(e) =>
                                        setReviewText(e.target.value)
                                    }
                                    required
                                />


                                {reviewError && (
                                    <p className="review-error">
                                        {reviewError}
                                    </p>
                                )}

                                {reviewMessage && (
                                    <p className="review-success">
                                        {reviewMessage}
                                    </p>
                                )}


                                <div className="review-form-actions">

                                    <button
                                        type="submit"
                                        disabled={reviewLoading}
                                        className="submit-review-button"
                                    >
                                        <Send size={17} />

                                        {reviewLoading
                                            ? "Please wait..."
                                            : editingReviewId
                                                ? "Update Review"
                                                : "Submit Review"}
                                    </button>


                                    {editingReviewId && (

                                        <button
                                            type="button"
                                            className="cancel-review-button"
                                            onClick={resetReviewForm}
                                        >
                                            Cancel
                                        </button>

                                    )}

                                </div>

                            </form>

                        )}

                    </div>

                </section>


                {/* BOTTOM NAVIGATION */}

                <div className="detail-bottom-link">

                    <Link to="/destinations">
                        Explore More Destinations
                        <ArrowLeft size={17} />
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default DestinationDetails;