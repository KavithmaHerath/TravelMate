
// Import the MySQL database connection.
const db = require("../config/db");

// Validate date values using the YYYY-MM-DD format.
// Empty or null dates are allowed.
const validDate = (value) => {
    if (value === null || value === undefined || value === "") {
        return true;
    }

    // Check whether the date follows the required format.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    // Convert the date into a JavaScript Date object.
    const date = new Date(`${value}T00:00:00Z`);

    // Check whether the date is valid and matches the original value.
    return !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value;
};

// Normalize destination IDs before using them in database queries.
// Removes duplicate IDs and validates that all IDs are positive integers.
const normalizeDestinationIds = (ids) => {
    // Return an empty array if no destination IDs are provided.
    if (ids === undefined) return [];

    // Ensure the provided destination IDs are in an array.
    if (!Array.isArray(ids)) return null;

    // Convert IDs to numbers and remove duplicates.
    const normalized = [...new Set(ids.map(Number))];

    // Check whether all destination IDs are valid positive integers.
    if (normalized.some(id =>
        !Number.isSafeInteger(id) || id <= 0
    )) {
        return null;
    }

    return normalized;
};

// Format itinerary database rows into structured itinerary objects.
// Combines multiple destination rows belonging to the same itinerary.
const formatItineraries = (rows) => {
    // Use a Map to group destination records by itinerary ID.
    const plans = new Map();

    // Process each database row.
    for (const row of rows) {

        // Create an itinerary object if it does not already exist.
        if (!plans.has(row.id)) {
            plans.set(row.id, {
                id: row.id,
                title: row.title,
                start_date: row.start_date,
                end_date: row.end_date,
                notes: row.notes,
                created_at: row.created_at,
                updated_at: row.updated_at,
                destinations: []
            });
        }

        // Add destination information to the corresponding itinerary.
        // A null destination ID means the itinerary has no destinations.
        if (row.destination_id !== null) {
            plans.get(row.id).destinations.push({
                id: row.destination_id,
                name: row.destination_name,
                location: row.destination_location,
                category: row.destination_category,
                image: row.destination_image
            });
        }
    }

    // Convert the Map values into an array of itinerary objects.
    return [...plans.values()];
};

// Reusable SQL query for retrieving itineraries and their destinations.
// LEFT JOIN ensures itineraries are returned even if they have no destinations.
const itineraryQuery = `
    SELECT
        i.id,
        i.title,
        i.start_date,
        i.end_date,
        i.notes,
        i.created_at,
        i.updated_at,
        d.id AS destination_id,
        d.name AS destination_name,
        d.location AS destination_location,
        d.category AS destination_category,
        d.image AS destination_image
    FROM itineraries i
    LEFT JOIN itinerary_destinations idt
        ON idt.itinerary_id = i.id
    LEFT JOIN destinations d
        ON d.id = idt.destination_id
`;

// GET all itineraries belonging to the logged-in user
// Retrieves all itineraries created by the authenticated user.
const getItineraries = async (req, res) => {
    try {
        // Retrieve the user's itineraries and their associated destinations.
        const [rows] = await db.query(
            `${itineraryQuery}
             WHERE i.user_id = ?
             ORDER BY i.created_at DESC, idt.sort_order ASC`,
            [req.user.id]
        );

        // Return the formatted itinerary data.
        res.json({
            success: true,
            data: formatItineraries(rows)
        });
    } catch (error) {
        // Log errors that occur while retrieving itineraries.
        console.error("Get itineraries error:", error.message);

        // Return an error response if retrieval fails.
        res.status(500).json({
            success: false,
            message: "Unable to load itineraries"
        });
    }
};

// GET one itinerary belonging to the logged-in user
// Retrieves a specific itinerary using its ID.
const getItineraryById = async (req, res) => {
    try {
        // Convert the itinerary ID from the URL into a number.
        const id = Number(req.params.id);

        // Validate that the itinerary ID is a positive safe integer.
        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid itinerary ID"
            });
        }

        // Retrieve the requested itinerary only if it belongs to the logged-in user.
        const [rows] = await db.query(
            `${itineraryQuery}
             WHERE i.user_id = ? AND i.id = ?
             ORDER BY idt.sort_order ASC`,
            [req.user.id, id]
        );

        // Return a not-found response if the itinerary does not exist
        // or does not belong to the authenticated user.
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Itinerary not found"
            });
        }

        // Format and return the requested itinerary.
        res.json({
            success: true,
            data: formatItineraries(rows)[0]
        });
    } catch (error) {
        // Log errors that occur while retrieving an itinerary.
        console.error("Get itinerary error:", error.message);

        // Return an error response if retrieval fails.
        res.status(500).json({
            success: false,
            message: "Unable to load itinerary"
        });
    }
};

// CREATE itinerary
// Creates a new itinerary and associates selected destinations with it.
const createItinerary = async (req, res) => {

    // Extract itinerary details from the request body.
    const { title, start_date, end_date, notes } = req.body;

    // Validate and normalize the selected destination IDs.
    const destinationIds = normalizeDestinationIds(
        req.body.destination_ids
    );

    // Ensure that the itinerary title is provided as non-empty text.
    if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            success: false,
            message: "Please enter an itinerary title"
        });
    }

    // Restrict itinerary titles to a maximum of 150 characters.
    if (title.trim().length > 150) {
        return res.status(400).json({
            success: false,
            message: "Title must be 150 characters or fewer"
        });
    }

    // Reject invalid destination ID values.
    if (destinationIds === null) {
        return res.status(400).json({
            success: false,
            message: "Destination IDs must be valid"
        });
    }

    // Validate the start and end dates.
    if (!validDate(start_date) || !validDate(end_date)) {
        return res.status(400).json({
            success: false,
            message: "Please provide valid dates in YYYY-MM-DD format"
        });
    }

    // Ensure the end date is not earlier than the start date.
    if (start_date && end_date && start_date > end_date) {
        return res.status(400).json({
            success: false,
            message: "End date cannot be before start date"
        });
    }

    // Ensure that notes are provided as text when included.
    if (notes !== undefined && notes !== null &&
        typeof notes !== "string") {
        return res.status(400).json({
            success: false,
            message: "Notes must be text"
        });
    }

    // Initialize the database connection variable.
    let connection;

    try {
        // Get a dedicated database connection for the transaction.
        connection = await db.getConnection();

        // Start a transaction to keep itinerary operations consistent.
        await connection.beginTransaction();

        // Verify that all selected destination IDs exist in the database.
        if (destinationIds.length > 0) {

            // Generate the required SQL placeholders dynamically.
            const placeholders = destinationIds.map(() => "?").join(",");

            const [found] = await connection.query(
                `SELECT id FROM destinations
                 WHERE id IN (${placeholders})`,
                destinationIds
            );

            // Roll back the transaction if any destination does not exist.
            if (found.length !== destinationIds.length) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "One or more destinations do not exist"
                });
            }
        }

        // Insert the new itinerary into the itineraries table.
        const [result] = await connection.query(
            `INSERT INTO itineraries
                (user_id, title, start_date, end_date, notes)
             VALUES (?, ?, ?, ?, ?)`,
            [
                req.user.id,
                title.trim(),
                start_date || null,
                end_date || null,
                notes || null
            ]
        );

        // Insert the selected destinations into the relationship table.
        // The index value maintains their selected order.
        for (let i = 0; i < destinationIds.length; i++) {
            await connection.query(
                `INSERT INTO itinerary_destinations
                    (itinerary_id, destination_id, sort_order)
                 VALUES (?, ?, ?)`,
                [result.insertId, destinationIds[i], i]
            );
        }

        // Commit the transaction after all database operations succeed.
        await connection.commit();

        // Return the newly created itinerary ID.
        res.status(201).json({
            success: true,
            message: "Itinerary created successfully",
            id: result.insertId
        });
    } catch (error) {
        // Roll back database changes if an error occurs.
        if (connection) await connection.rollback();

        // Log itinerary creation errors.
        console.error("Create itinerary error:", error.message);

        // Return an error response if creation fails.
        res.status(500).json({
            success: false,
            message: "Unable to create itinerary"
        });
    } finally {
        // Release the database connection after the operation finishes.
        if (connection) connection.release();
    }
};

// UPDATE itinerary
// Updates itinerary information and replaces its selected destinations.
const updateItinerary = async (req, res) => {

    // Get the itinerary ID and updated information from the request.
    const id = Number(req.params.id);
    const { title, start_date, end_date, notes } = req.body;

    // Validate and normalize the updated destination IDs.
    const destinationIds = normalizeDestinationIds(
        req.body.destination_ids
    );

    // Validate the itinerary ID.
    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid itinerary ID"
        });
    }

    // Validate the updated title and its maximum length.
    if (!title || typeof title !== "string" || !title.trim() ||
        title.trim().length > 150) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid title of up to 150 characters"
        });
    }

    // Reject invalid destination ID values.
    if (destinationIds === null) {
        return res.status(400).json({
            success: false,
            message: "Destination IDs must be valid"
        });
    }

    // Validate the itinerary dates and ensure the date order is correct.
    if (!validDate(start_date) || !validDate(end_date) ||
        (start_date && end_date && start_date > end_date)) {
        return res.status(400).json({
            success: false,
            message: "Please check your itinerary dates"
        });
    }

    // Ensure that notes are provided as text when included.
    if (notes !== undefined && notes !== null &&
        typeof notes !== "string") {
        return res.status(400).json({
            success: false,
            message: "Notes must be text"
        });
    }

    // Initialize the database connection variable.
    let connection;

    try {
        // Get a dedicated database connection.
        connection = await db.getConnection();

        // Start a transaction for the update operation.
        await connection.beginTransaction();

        // Check whether the itinerary exists and belongs to the logged-in user.
        const [existing] = await connection.query(
            "SELECT id FROM itineraries WHERE id = ? AND user_id = ?",
            [id, req.user.id]
        );

        // Stop the update if the itinerary does not belong to the user
        // or cannot be found.
        if (existing.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Itinerary not found"
            });
        }

        // Verify that all selected destinations exist.
        if (destinationIds.length > 0) {

            // Generate SQL placeholders for the destination IDs.
            const placeholders = destinationIds.map(() => "?").join(",");

            const [found] = await connection.query(
                `SELECT id FROM destinations
                 WHERE id IN (${placeholders})`,
                destinationIds
            );

            // Roll back if any selected destination is invalid.
            if (found.length !== destinationIds.length) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "One or more destinations do not exist"
                });
            }
        }

        // Update the main itinerary details in the database.
        await connection.query(
            `UPDATE itineraries
             SET title = ?, start_date = ?, end_date = ?, notes = ?
             WHERE id = ? AND user_id = ?`,
            [
                title.trim(),
                start_date || null,
                end_date || null,
                notes || null,
                id,
                req.user.id
            ]
        );

        // Remove the previous destination relationships.
        // The updated destination list will be inserted below.
        await connection.query(
            "DELETE FROM itinerary_destinations WHERE itinerary_id = ?",
            [id]
        );

        // Insert the newly selected destinations in their chosen order.
        for (let i = 0; i < destinationIds.length; i++) {
            await connection.query(
                `INSERT INTO itinerary_destinations
                    (itinerary_id, destination_id, sort_order)
                 VALUES (?, ?, ?)`,
                [id, destinationIds[i], i]
            );
        }

        // Commit all itinerary updates after successful database operations.
        await connection.commit();

        // Return the update success response.
        res.json({
            success: true,
            message: "Itinerary updated successfully"
        });
    } catch (error) {
        // Roll back all changes if an error occurs.
        if (connection) await connection.rollback();

        // Log itinerary update errors.
        console.error("Update itinerary error:", error.message);

        // Return an error response if updating fails.
        res.status(500).json({
            success: false,
            message: "Unable to update itinerary"
        });
    } finally {
        // Release the database connection after the operation finishes.
        if (connection) connection.release();
    }
};

// DELETE itinerary
// Deletes an itinerary belonging to the authenticated user.
const deleteItinerary = async (req, res) => {
    try {
        // Convert the itinerary ID from the URL into a number.
        const id = Number(req.params.id);

        // Validate that the itinerary ID is a positive safe integer.
        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid itinerary ID"
            });
        }

        // Delete the itinerary only if it belongs to the logged-in user.
        const [result] = await db.query(
            "DELETE FROM itineraries WHERE id = ? AND user_id = ?",
            [id, req.user.id]
        );

        // Check whether any itinerary was deleted.
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Itinerary not found"
            });
        }

        // Return a success response after deletion.
        res.json({
            success: true,
            message: "Itinerary deleted successfully"
        });
    } catch (error) {
        // Log itinerary deletion errors.
        console.error("Delete itinerary error:", error.message);

        // Return an error response if deletion fails.
        res.status(500).json({
            success: false,
            message: "Unable to delete itinerary"
        });
    }
};

// Export all itinerary controller functions
// so they can be connected to the application routes.
module.exports = {
    getItineraries,
    getItineraryById,
    createItinerary,
    updateItinerary,
    deleteItinerary
};
