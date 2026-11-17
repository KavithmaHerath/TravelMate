
// Load environment variables from the .env file.
require("dotenv").config();

// Import required packages and database configuration.
const express = require("express");
const cors = require("cors");
const db = require("./db");

// Import application route files.
const authRoutes = require("./routes/authRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");

// Initialize the Express application.
const app = express();

// Set the server port from the environment variable.
// Use port 5000 if no PORT value is provided.
const PORT = process.env.PORT || 5000;

// Define the frontend origins allowed to access the backend.
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
].filter(Boolean);

// Configure CORS to control which frontend origins can access the API.
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

// Enable JSON request body parsing.
app.use(express.json());

// Home route
// Provides a welcome message when the backend root URL is accessed.
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to TravelMate Sri Lanka API"
    });
});

// Database health check
// Checks whether the backend can communicate with the MySQL database.
app.get("/api/health", async (req, res) => {
    try {
        // Execute a simple query to test the database connection.
        await db.query("SELECT 1");

        // Return a successful response if the database is reachable.
        res.status(200).json({
            success: true,
            message: "TravelMate API and MySQL connected",
            database: "connected"
        });
    } catch (error) {
        // Log the database error and return a server error response.
        console.error("Health check error:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

// API routes
// Connect each route file to its corresponding API endpoint.
app.use("/api/auth", authRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/itineraries", itineraryRoutes);

// 404 handler
// Handles requests made to API endpoints that do not exist.
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// Error handler
// Handles errors passed through Express middleware.
app.use((error, req, res, next) => {
    console.error("Server error:", error.message);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

// Start server
// Start listening for incoming requests on the configured port.
const server = app.listen(PORT, async () => {
    console.log("--------------------------------");
    console.log("TravelMate Backend Started");
    console.log(`Server: http://localhost:${PORT}`);
    console.log("--------------------------------");

    try {
        // Check the MySQL connection when the server starts.
        await db.query("SELECT 1");
        console.log("MySQL Database Connected Successfully");
    } catch (error) {
        // Report database connection errors in the console.
        console.error("MySQL Connection Failed:", error.message);
    }
});

// Handle server errors
// Detect common server startup errors, including ports already in use.
server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use.`);
    } else {
        console.error("Server error:", error.message);
    }

    // Stop the process if the server cannot start.
    process.exit(1);
});
