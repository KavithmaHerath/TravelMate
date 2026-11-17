
// Import Express to create the itinerary routes.
const express = require("express");

// Create an Express router instance.
const router = express.Router();

// Import the authentication middleware.
// This ensures only logged-in users can access itinerary routes.
const { protect } = require("../middleware/authMiddleware");

// Import itinerary controller functions.
// These functions handle creating, retrieving, updating,
// and deleting user itineraries.
const {
    getItineraries,
    getItineraryById,
    createItinerary,
    updateItinerary,
    deleteItinerary
} = require("../controllers/itineraryController");

// Apply authentication middleware to all routes below.
// Every itinerary request must include a valid login token.
router.use(protect);

// GET: Retrieve all itineraries belonging to the logged-in user.
router.get("/", getItineraries);

// POST: Create a new itinerary.
router.post("/", createItinerary);

// GET: Retrieve a specific itinerary using its ID.
router.get("/:id", getItineraryById);

// PUT: Update an existing itinerary using its ID.
router.put("/:id", updateItinerary);

// DELETE: Delete an itinerary using its ID.
router.delete("/:id", deleteItinerary);

// Export the router so it can be registered in the main server file.
module.exports = router;
