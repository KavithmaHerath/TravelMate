
/* Load environment variables from the .env file.
   This allows the application to access settings such as PORT and FRONTEND_URL. */
require("dotenv").config();

// Import Express to create and manage the backend server.
const express = require("express");

// Import CORS to control which frontend origins can access the backend.
const cors = require("cors");

// Import the MySQL database connection.
const db = require("./db");

// Import route files for authentication, destinations, itineraries and reviews.
const authRoutes = require("./routes/authRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Create the Express application.
const app = express();

// Set the server port using the environment variable.
// Use port 5000 if no PORT value is provided.
const PORT = process.env.PORT || 5000;

// Define the frontend addresses that are allowed to access the backend.
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
].filter(Boolean);

// Configure Cross-Origin Resource Sharing (CORS).
// Only requests from the allowed frontend addresses are accepted.
app.use(cors({
    origin: (origin, callback) => {

        // Allow requests without an origin and requests from approved origins.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Reject requests from origins that are not in the allowed list.
        return callback(new Error("Origin not allowed by CORS"));
    }
}));

// Enable Express to receive and process JSON request bodies.
app.use(express.json());

// --------------------------------------------------
// HOME ROUTE
// --------------------------------------------------

// Main API route used to check whether the backend server is running.
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to TravelMate Sri Lanka API"
    });
});

// --------------------------------------------------
// DATABASE HEALTH CHECK
// --------------------------------------------------

// Check whether the backend can successfully communicate with MySQL.
app.get("/api/health", async (req, res) => {
    try {

        // Execute a simple query to test the database connection.
        await db.query("SELECT 1");

        // Return a successful response when the database is available.
        res.status(200).json({
            success: true,
            message: "TravelMate API and MySQL connected",
            database: "connected"
        });

    } catch (error) {

        // Display the database error in the backend terminal.
        console.error("Health check error:", error.message);

        // Return an error response if the database connection fails.
        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

// Connect the authentication routes to the /api/auth URL.
app.use("/api/auth", authRoutes);

// Connect the destination routes to the /api/destinations URL.
app.use("/api/destinations", destinationRoutes);

// Connect the itinerary routes to the /api/itineraries URL.
app.use("/api/itineraries", itineraryRoutes);

// Connect the review routes to the /api/reviews URL.
app.use("/api/reviews", reviewRoutes);

// --------------------------------------------------
// 404 ERROR HANDLER
// --------------------------------------------------

// Handle requests made to API endpoints that do not exist.
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// --------------------------------------------------
// GENERAL ERROR HANDLER
// --------------------------------------------------

// Handle unexpected errors that occur while processing requests.
app.use((error, req, res, next) => {

    // Display the error message in the backend terminal.
    console.error("Server error:", error.message);

    // Send a general server error response to the client.
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

// --------------------------------------------------
// START BACKEND SERVER
// --------------------------------------------------

// Start the Express server and listen for incoming requests.
const server = app.listen(PORT, async () => {

    // Display backend startup information in the terminal.
    console.log("--------------------------------");
    console.log("TravelMate Backend Started");
    console.log(`Server: http://localhost:${PORT}`);
    console.log("--------------------------------");

    try {

        // Check the MySQL connection when the server starts.
        await db.query("SELECT 1");

        // Display a success message if MySQL is connected.
        console.log("MySQL Database Connected Successfully");

    } catch (error) {

        // Display an error if the database connection is unsuccessful.
        console.error("MySQL Connection Failed:", error.message);
    }
});

// --------------------------------------------------
// SERVER ERROR HANDLER
// --------------------------------------------------

// Listen for errors that occur while the server is running.
server.on("error", (error) => {

    // Check whether the selected port is already being used.
    if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use.`);
    } else {

        // Display any other server-related error.
        console.error("Server error:", error.message);
    }

    // Stop the application when the server cannot start correctly.
    process.exit(1);
});
