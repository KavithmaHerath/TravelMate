
import React, { useEffect, useMemo, useState } from "react";
import { Search, MapPin, ArrowRight, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import "./Destinations.css";

// List of all 25 districts in Sri Lanka for the district filter
const districts = [
  "Colombo", "Gampaha", "Kalutara",
  "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota",
  "Jaffna", "Kilinochchi", "Mannar",
  "Mullaitivu", "Vavuniya",
  "Trincomalee", "Batticaloa", "Ampara",
  "Kurunegala", "Puttalam",
  "Anuradhapura", "Polonnaruwa",
  "Badulla", "Monaragala",
  "Ratnapura", "Kegalle"
];

// Available destination categories for filtering
const categories = ["Beach", "Nature", "Historical", "Adventure"];

// Base URL of the TravelMate backend API
const API_URL = "http://localhost:5000/api";

// Main component for displaying and filtering destinations
function Destinations() {

  // State variables for destination data and user-selected filters
  const [destinations, setDestinations] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // State variables for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch destination data from the backend when the component loads
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        // Set loading state and clear previous errors
        setLoading(true);
        setError("");

        // Send a request to retrieve all destinations
        const response = await fetch(`${API_URL}/destinations`);

        // Handle unsuccessful API responses
        if (!response.ok) {
          throw new Error("Unable to load destinations.");
        }

        // Convert the server response into JSON format
        const result = await response.json();

        // Store destinations depending on the API response structure
        setDestinations(
          Array.isArray(result) ? result :
          Array.isArray(result.data) ? result.data : []
        );
      } catch (err) {
        // Store an error message if fetching destinations fails
        setError(err.message || "Something went wrong.");
      } finally {
        // Stop the loading state after the request completes
        setLoading(false);
      }
    };

    // Execute the function to fetch destination data
    fetchDestinations();
  }, []);

  // Filter destinations based on search text, district, and category
  const filteredDestinations = useMemo(() => {
    return destinations.filter((destination) => {

      // Check whether the destination name or location matches the search
      const matchesSearch =
        destination.name?.toLowerCase().includes(search.toLowerCase()) ||
        destination.location?.toLowerCase().includes(search.toLowerCase());

      // Check whether the selected district matches the destination
      const matchesDistrict =
        !selectedDistrict ||
        destination.district === selectedDistrict;

      // Check whether the selected category matches the destination
      const matchesCategory =
        !selectedCategory ||
        destination.category === selectedCategory;

      // Return destinations that satisfy all selected filters
      return matchesSearch && matchesDistrict && matchesCategory;
    });

  // Recalculate filtered destinations when the data or filters change
  }, [destinations, search, selectedDistrict, selectedCategory]);

  // Clear all search and filter selections
  const clearFilters = () => {
    setSearch("");
    setSelectedDistrict("");
    setSelectedCategory("");
  };

  return (
    <div className="destinations-page">

      {/* Hero section introducing the destinations page */}
      <section className="destinations-hero">
        <span className="destinations-tag">DISCOVER SRI LANKA</span>
        <h1>Explore Beautiful Places</h1>
        <p>
          Discover amazing destinations across all 25 districts
          of Sri Lanka and plan your next adventure.
        </p>

        {/* Search bar for finding destinations by name or location */}
        <div className="destination-search">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search destinations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* Section containing district and category filters */}
      <section className="destination-filter-section">

        {/* Heading and icon for the filter section */}
        <div className="filter-heading">
          <div>
            <h2>Find Your Destination</h2>
            <p>Choose a district and explore its attractions.</p>
          </div>
          <SlidersHorizontal size={23} />
        </div>

        {/* Filter controls for selecting a district and category */}
        <div className="destination-filters">

          {/* District selection dropdown */}
          <div className="filter-control">
            <label htmlFor="district-filter">Select District</label>
            <select
              id="district-filter"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="">All 25 Districts</option>

              {/* Generate dropdown options from the districts array */}
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* Category selection dropdown */}
          <div className="filter-control">
            <label htmlFor="category-filter">Select Category</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>

              {/* Generate dropdown options from the categories array */}
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Button for resetting all filters */}
          <button
            className="clear-filter-btn"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        </div>
      </section>

      {/* Section displaying the filtered destination results */}
      <section className="destination-results">

        {/* Heading showing the selected district and result count */}
        <div className="destination-results-heading">
          <div>
            <h2>
              {selectedDistrict
                ? `${selectedDistrict} District`
                : "Popular Destinations"}
            </h2>
            <p>
              {filteredDestinations.length} destinations found
            </p>
          </div>
        </div>

        {/* Display different content depending on the current loading and result states */}
        {loading ? (
          // Show a loading message while destinations are being fetched
          <p className="destination-message">Loading destinations...</p>
        ) : error ? (
          // Show an error message if the API request fails
          <p className="destination-message error">{error}</p>
        ) : filteredDestinations.length === 0 ? (
          // Show an empty-state message when no destinations match the filters
          <div className="no-destinations">
            <MapPin size={40} />
            <h3>No destinations found</h3>
            <p>Try selecting another district or clearing your filters.</p>
            <button onClick={clearFilters}>Show All Destinations</button>
          </div>
        ) : (

          // Display destination cards when matching results are available
          <div className="destination-grid">
            {filteredDestinations.map((destination) => (
              <article
                className="destination-card"
                key={destination.id}
              >
                {/* Destination image and category label */}
                <div className="destination-image-wrapper">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    onError={(e) => {
                      // Display a fallback image if the original image fails to load
                      e.currentTarget.src =
                        "https://placehold.co/600x400?text=TravelMate";
                    }}
                  />

                  {/* Display the destination category */}
                  <span className="destination-category">
                    {destination.category}
                  </span>
                </div>

                {/* Destination information displayed below the image */}
                <div className="destination-card-content">
                  <h3>{destination.name}</h3>

                  {/* Display the destination district or location */}
                  <p className="destination-location">
                    <MapPin size={15} />
                    {destination.district || destination.location}
                  </p>

                  {/* Short description of the destination */}
                  <p className="destination-description">
                    {destination.description}
                  </p>

                  {/* Navigate to the selected destination's details page */}
                  <Link
                    to={`/destinations/${destination.id}`}
                    className="destination-details-link"
                  >
                    Explore Destination
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

        )}

      </section>
    </div>
  );
}

// Export the Destinations component for use in application routes
export default Destinations;
