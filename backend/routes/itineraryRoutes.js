
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    getItineraries,
    getItineraryById,
    createItinerary,
    updateItinerary,
    deleteItinerary
} = require("../controllers/itineraryController");

router.use(protect);

router.get("/", getItineraries);
router.post("/", createItinerary);
router.get("/:id", getItineraryById);
router.put("/:id", updateItinerary);
router.delete("/:id", deleteItinerary);

module.exports = router;
