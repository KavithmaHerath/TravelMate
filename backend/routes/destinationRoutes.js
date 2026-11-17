
// Import Express to create the destination routes.
const express = require("express");

// Create an Express router to manage destination-related endpoints.
const router = express.Router();

// Import destination controller functions.
// These functions handle the logic for retrieving destinations.
const {
    getDestinations,
    getDestinationById
} = require("../controllers/destinationController");

// GET /
// Retrieve all destinations, including any supported search or filter results.
router.get("/", getDestinations);

// GET /:id
// Retrieve a specific destination using its ID.
router.get("/:id", getDestinationById);

// Export the router so it can be registered in the main server file.
module.exports = router;
