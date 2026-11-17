const db = require("../config/db");

// GET all destinations with optional search and filters
const getDestinations = async (req, res) => {
    try {
        const { search, category, province } = req.query;

        let sql = "SELECT * FROM destinations WHERE 1=1";
        const params = [];

        if (search) {
            sql += " AND (name LIKE ? OR description LIKE ? OR location LIKE ?)";
            const searchValue = `%${search}%`;
            params.push(searchValue, searchValue, searchValue);
        }

        if (category) {
            sql += " AND category = ?";
            params.push(category);
        }

        if (province) {
            sql += " AND province = ?";
            params.push(province);
        }

        sql += " ORDER BY id DESC";

        const [destinations] = await db.query(sql, params);

        res.status(200).json({
            success: true,
            count: destinations.length,
            data: destinations
        });
    } catch (error) {
        console.error("Get destinations error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to load destinations"
        });
    }
};

// GET one destination
const getDestinationById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid destination ID"
            });
        }

        const [destinations] = await db.query(
            "SELECT * FROM destinations WHERE id = ?",
            [id]
        );

        if (destinations.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Destination not found"
            });
        }

        res.status(200).json({
            success: true,
            data: destinations[0]
        });
    } catch (error) {
        console.error("Get destination error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to load destination"
        });
    }
};

module.exports = {
    getDestinations,
    getDestinationById
};