
// Import the MySQL database connection.
const db = require("../config/db");

// GET all destinations with optional search and filters
// Retrieves destinations from the database based on the query parameters.
const getDestinations = async (req, res) => {
    try {
        // Get search, category, and province filters from the URL query.
        const { search, category, province } = req.query;

        // Start the SQL query by selecting all destinations.
        // WHERE 1=1 allows additional conditions to be added dynamically.
        let sql = "SELECT * FROM destinations WHERE 1=1";
        const params = [];

        // If a search term is provided, search destination names,
        // descriptions, and locations.
        if (search) {
            sql += " AND (name LIKE ? OR description LIKE ? OR location LIKE ?)";
            const searchValue = `%${search}%`;

            // Add the search value for all three search conditions.
            params.push(searchValue, searchValue, searchValue);
        }

        // Filter destinations by category if a category is provided.
        if (category) {
            sql += " AND category = ?";
            params.push(category);
        }

        // Filter destinations by province if a province is provided.
        if (province) {
            sql += " AND province = ?";
            params.push(province);
        }

        // Sort destinations by ID in descending order.
        // This displays the most recently added records first.
        sql += " ORDER BY id DESC";

        // Execute the SQL query with the collected parameters.
        const [destinations] = await db.query(sql, params);

        // Return the retrieved destinations and total result count.
        res.status(200).json({
            success: true,
            count: destinations.length,
            data: destinations
        });
    } catch (error) {
        // Log errors that occur while retrieving destinations.
        console.error("Get destinations error:", error.message);

        // Return an error response if the database query fails.
        res.status(500).json({
            success: false,
            message: "Unable to load destinations"
        });
    }
};

// GET one destination
// Retrieves a specific destination using its database ID.
const getDestinationById = async (req, res) => {
    try {
        // Get the destination ID from the URL parameters.
        const { id } = req.params;

        // Validate that the destination ID contains only digits.
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid destination ID"
            });
        }

        // Retrieve the destination matching the provided ID.
        const [destinations] = await db.query(
            "SELECT * FROM destinations WHERE id = ?",
            [id]
        );

        // Return a not-found response if no matching destination exists.
        if (destinations.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Destination not found"
            });
        }

        // Return the requested destination information.
        res.status(200).json({
            success: true,
            data: destinations[0]
        });
    } catch (error) {
        // Log errors that occur while retrieving a destination.
        console.error("Get destination error:", error.message);

        // Return an error response if the database query fails.
        res.status(500).json({
            success: false,
            message: "Unable to load destination"
        });
    }
};

// Export destination controller functions
// so they can be connected to the application routes.
module.exports = {
    getDestinations,
    getDestinationById
};
