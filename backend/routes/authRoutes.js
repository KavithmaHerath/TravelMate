
// Import Express to create API routes.
const express = require("express");

// Create a new Express router.
const router = express.Router();

// Import authentication controller functions.
const {
    register,
    login,
    getMe
} = require("../controllers/authController");

// Import authentication middleware to protect private routes.
const { protect } = require("../middleware/authMiddleware");

// POST route for registering a new user.
router.post("/register", register);

// POST route for logging in an existing user.
router.post("/login", login);

// GET route for retrieving the currently logged-in user's information.
// The protect middleware ensures that only authenticated users can access it.
router.get("/me", protect, getMe);

// Export the router so it can be connected to the main Express application.
module.exports = router;
