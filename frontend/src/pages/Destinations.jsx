
import React, { useEffect, useMemo, useState } from "react";
import { Search, MapPin, ArrowRight, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import "./Destinations.css";

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

const categories = ["Beach", "Nature", "Historical", "Adventure"];

const API_URL = "http://localhost:5000/api";

function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/destinations`);

        if (!response.ok) {
          throw new Error("Unable to load destinations.");
        }

        const result = await response.json();

        setDestinations(
          Array.isArray(result) ? result :
          Array.isArray(result.data) ? result.data : []
        );
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const filteredDestinations = useMemo(() => {
    return destinations.filter((destination) => {
      const matchesSearch =
        destination.name?.toLowerCase().includes(search.toLowerCase()) ||
        destination.location?.toLowerCase().includes(search.toLowerCase());

      const matchesDistrict =
        !selectedDistrict ||
        destination.district === selectedDistrict;

      const matchesCategory =
        !selectedCategory ||
        destination.category === selectedCategory;

      return matchesSearch && matchesDistrict && matchesCategory;
    });
  }, [destinations, search, selectedDistrict, selectedCategory]);

  const clearFilters = () => {
    setSearch("");
    setSelectedDistrict("");
    setSelectedCategory("");
  };

  return (
    <div className="destinations-page">

      <section className="destinations-hero">
        <span className="destinations-tag">DISCOVER SRI LANKA</span>
        <h1>Explore Beautiful Places</h1>
        <p>
          Discover amazing destinations across all 25 districts
          of Sri Lanka and plan your next adventure.
        </p>

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

      <section className="destination-filter-section">

        <div className="filter-heading">
          <div>
            <h2>Find Your Destination</h2>
            <p>Choose a district and explore its attractions.</p>
          </div>
          <SlidersHorizontal size={23} />
        </div>

        <div className="destination-filters">

          <div className="filter-control">
            <label htmlFor="district-filter">Select District</label>
            <select
              id="district-filter"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="">All 25 Districts</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-control">
            <label htmlFor="category-filter">Select Category</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <button
            className="clear-filter-btn"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        </div>
      </section>

      <section className="destination-results">

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

        {loading ? (
          <p className="destination-message">Loading destinations...</p>
        ) : error ? (
          <p className="destination-message error">{error}</p>
        ) : filteredDestinations.length === 0 ? (
          <div className="no-destinations">
            <MapPin size={40} />
            <h3>No destinations found</h3>
            <p>Try selecting another district or clearing your filters.</p>
            <button onClick={clearFilters}>Show All Destinations</button>
          </div>
        ) : (

          <div className="destination-grid">
            {filteredDestinations.map((destination) => (
              <article
                className="destination-card"
                key={destination.id}
              >
                <div className="destination-image-wrapper">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/600x400?text=TravelMate";
                    }}
                  />

                  <span className="destination-category">
                    {destination.category}
                  </span>
                </div>

                <div className="destination-card-content">
                  <h3>{destination.name}</h3>

                  <p className="destination-location">
                    <MapPin size={15} />
                    {destination.district || destination.location}
                  </p>

                  <p className="destination-description">
                    {destination.description}
                  </p>

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

export default Destinations;
