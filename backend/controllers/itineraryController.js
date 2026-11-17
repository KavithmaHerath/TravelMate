
const db = require("../config/db");

const validDate = (value) => {
    if (value === null || value === undefined || value === "") {
        return true;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00Z`);

    return !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value;
};

const normalizeDestinationIds = (ids) => {
    if (ids === undefined) return [];

    if (!Array.isArray(ids)) return null;

    const normalized = [...new Set(ids.map(Number))];

    if (normalized.some(id =>
        !Number.isSafeInteger(id) || id <= 0
    )) {
        return null;
    }

    return normalized;
};

const formatItineraries = (rows) => {
    const plans = new Map();

    for (const row of rows) {
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

    return [...plans.values()];
};

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
const getItineraries = async (req, res) => {
    try {
        const [rows] = await db.query(
            `${itineraryQuery}
             WHERE i.user_id = ?
             ORDER BY i.created_at DESC, idt.sort_order ASC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: formatItineraries(rows)
        });
    } catch (error) {
        console.error("Get itineraries error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to load itineraries"
        });
    }
};

// GET one itinerary belonging to the logged-in user
const getItineraryById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid itinerary ID"
            });
        }

        const [rows] = await db.query(
            `${itineraryQuery}
             WHERE i.user_id = ? AND i.id = ?
             ORDER BY idt.sort_order ASC`,
            [req.user.id, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Itinerary not found"
            });
        }

        res.json({
            success: true,
            data: formatItineraries(rows)[0]
        });
    } catch (error) {
        console.error("Get itinerary error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to load itinerary"
        });
    }
};

// CREATE itinerary
const createItinerary = async (req, res) => {
    const { title, start_date, end_date, notes } = req.body;
    const destinationIds = normalizeDestinationIds(
        req.body.destination_ids
    );

    if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            success: false,
            message: "Please enter an itinerary title"
        });
    }

    if (title.trim().length > 150) {
        return res.status(400).json({
            success: false,
            message: "Title must be 150 characters or fewer"
        });
    }

    if (destinationIds === null) {
        return res.status(400).json({
            success: false,
            message: "Destination IDs must be valid"
        });
    }

    if (!validDate(start_date) || !validDate(end_date)) {
        return res.status(400).json({
            success: false,
            message: "Please provide valid dates in YYYY-MM-DD format"
        });
    }

    if (start_date && end_date && start_date > end_date) {
        return res.status(400).json({
            success: false,
            message: "End date cannot be before start date"
        });
    }

    if (notes !== undefined && notes !== null &&
        typeof notes !== "string") {
        return res.status(400).json({
            success: false,
            message: "Notes must be text"
        });
    }

    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        if (destinationIds.length > 0) {
            const placeholders = destinationIds.map(() => "?").join(",");

            const [found] = await connection.query(
                `SELECT id FROM destinations
                 WHERE id IN (${placeholders})`,
                destinationIds
            );

            if (found.length !== destinationIds.length) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "One or more destinations do not exist"
                });
            }
        }

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

        for (let i = 0; i < destinationIds.length; i++) {
            await connection.query(
                `INSERT INTO itinerary_destinations
                    (itinerary_id, destination_id, sort_order)
                 VALUES (?, ?, ?)`,
                [result.insertId, destinationIds[i], i]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Itinerary created successfully",
            id: result.insertId
        });
    } catch (error) {
        if (connection) await connection.rollback();

        console.error("Create itinerary error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to create itinerary"
        });
    } finally {
        if (connection) connection.release();
    }
};

// UPDATE itinerary
const updateItinerary = async (req, res) => {
    const id = Number(req.params.id);
    const { title, start_date, end_date, notes } = req.body;
    const destinationIds = normalizeDestinationIds(
        req.body.destination_ids
    );

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid itinerary ID"
        });
    }

    if (!title || typeof title !== "string" || !title.trim() ||
        title.trim().length > 150) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid title of up to 150 characters"
        });
    }

    if (destinationIds === null) {
        return res.status(400).json({
            success: false,
            message: "Destination IDs must be valid"
        });
    }

    if (!validDate(start_date) || !validDate(end_date) ||
        (start_date && end_date && start_date > end_date)) {
        return res.status(400).json({
            success: false,
            message: "Please check your itinerary dates"
        });
    }

    if (notes !== undefined && notes !== null &&
        typeof notes !== "string") {
        return res.status(400).json({
            success: false,
            message: "Notes must be text"
        });
    }

    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [existing] = await connection.query(
            "SELECT id FROM itineraries WHERE id = ? AND user_id = ?",
            [id, req.user.id]
        );

        if (existing.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Itinerary not found"
            });
        }

        if (destinationIds.length > 0) {
            const placeholders = destinationIds.map(() => "?").join(",");

            const [found] = await connection.query(
                `SELECT id FROM destinations
                 WHERE id IN (${placeholders})`,
                destinationIds
            );

            if (found.length !== destinationIds.length) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "One or more destinations do not exist"
                });
            }
        }

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

        await connection.query(
            "DELETE FROM itinerary_destinations WHERE itinerary_id = ?",
            [id]
        );

        for (let i = 0; i < destinationIds.length; i++) {
            await connection.query(
                `INSERT INTO itinerary_destinations
                    (itinerary_id, destination_id, sort_order)
                 VALUES (?, ?, ?)`,
                [id, destinationIds[i], i]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: "Itinerary updated successfully"
        });
    } catch (error) {
        if (connection) await connection.rollback();

        console.error("Update itinerary error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to update itinerary"
        });
    } finally {
        if (connection) connection.release();
    }
};

// DELETE itinerary
const deleteItinerary = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid itinerary ID"
            });
        }

        const [result] = await db.query(
            "DELETE FROM itineraries WHERE id = ? AND user_id = ?",
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Itinerary not found"
            });
        }

        res.json({
            success: true,
            message: "Itinerary deleted successfully"
        });
    } catch (error) {
        console.error("Delete itinerary error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to delete itinerary"
        });
    }
};

module.exports = {
    getItineraries,
    getItineraryById,
    createItinerary,
    updateItinerary,
    deleteItinerary
};
