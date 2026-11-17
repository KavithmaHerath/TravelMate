
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Clock,
  Ticket,
  Lightbulb,
  Compass
} from "lucide-react";
import "./DestinationDetails.css";

// Base URL of the TravelMate backend API
const API_URL = "http://localhost:5000/api";

// Component for displaying complete information about a selected destination
function DestinationDetails() {
  // Get the destination ID from the URL parameters
  const { id } = useParams();

  // Store destination information, loading status, and error messages
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch destination details whenever the destination ID changes
  useEffect(() => {
    const fetchDestination = async () => {
      try {
        // Reset loading and error states before making the request
        setLoading(true);
        setError("");

        // Request the selected destination from the backend API
        const response = await fetch(
          `${API_URL}/destinations/${id}`
        );

        // Handle unsuccessful API responses
        if (!response.ok) {
          throw new Error("Unable to load destination details.");
        }

        // Convert the API response into JSON format
        const result = await response.json();

        // Store destination information from the available response structure
        setDestination(result.data || result.destination || result);
      } catch (err) {
        // Store an error message if the request fails
        setError(err.message || "Something went wrong.");
      } finally {
        // Stop the loading state after the request finishes
        setLoading(false);
      }
    };

    // Execute the function to fetch destination information
    fetchDestination();
  }, [id]);

  // Convert activity and travel-tip data into arrays for displaying lists
  const getList = (value) => {
    // Return the value directly if it is already an array
    if (Array.isArray(value)) return value;

    // Split string values into individual list items
    if (typeof value === "string" && value.trim()) {
      return value
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    // Return an empty array if no valid list data is available
    return [];
  };

  // Display a loading message while destination data is being fetched
  if (loading) {
    return (
      <div className="destination-detail-message">
        Loading destination details...
      </div>
    );
  }

  // Display an error message if the destination cannot be loaded
  if (error || !destination) {
    return (
      <div className="destination-detail-message">
        <h2>Destination not found</h2>
        <p>{error || "This destination could not be found."}</p>

        {/* Provide a link to return to the destinations page */}
        <Link to="/destinations" className="back-destinations">
          <ArrowLeft size={17} />
          Back to Destinations
        </Link>
      </div>
    );
  }

  // Prepare activities and travel tips as arrays for rendering
  const thingsToDo = getList(destination.things_to_do);
  const travelTips = getList(destination.travel_tips);

  return (
    <div className="destination-detail-page">

      {/* Navigation link to return to all destinations */}
      <Link to="/destinations" className="back-destinations">
        <ArrowLeft size={18} />
        Back to Destinations
      </Link>

      {/* Hero section displaying the destination image and basic information */}
      <section className="destination-detail-hero">

        {/* Display the destination image with a fallback image if loading fails */}
        <img
          className="destination-detail-image"
          src={destination.image}
          alt={destination.name}
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/1200x600?text=TravelMate";
          }}
        />

        {/* Overlay containing the category, destination name, and location */}
        <div className="destination-detail-overlay">

          {/* Display the destination category */}
          <span className="detail-category">
            {destination.category || "Destination"}
          </span>

          {/* Display the destination name */}
          <h1>{destination.name}</h1>

          {/* Display the district or location of the destination */}
          <p>
            <MapPin size={18} />
            {destination.district || destination.location}
          </p>
        </div>

      </section>

      {/* Main content area containing detailed destination information */}
      <div className="destination-detail-content">

        {/* Section displaying the destination description */}
        <section className="detail-section">
          <h2>About This Destination</h2>
          <p className="full-description">
            {destination.description ||
              "Discover the beauty and attractions of this destination in Sri Lanka."}
          </p>
        </section>

        {/* Cards displaying important destination information */}
        <section className="detail-information-grid">

          {/* Display the best time to visit */}
          <article className="detail-info-card">
            <CalendarDays size={25} />
            <h3>Best Time to Visit</h3>
            <p>
              {destination.best_time_to_visit ||
                "Information coming soon."}
            </p>
          </article>

          {/* Display the recommended visiting duration */}
          <article className="detail-info-card">
            <Clock size={25} />
            <h3>Recommended Duration</h3>
            <p>
              {destination.recommended_duration ||
                "Information coming soon."}
            </p>
          </article>

          {/* Display the destination entry fee */}
          <article className="detail-info-card">
            <Ticket size={25} />
            <h3>Entry Fee</h3>
            <p>
              {destination.entry_fee || "Check locally before visiting."}
            </p>
          </article>

        </section>

        {/* Section displaying activities available at the destination */}
        <section className="detail-section">
          <h2>
            <Compass size={22} />
            Things to Do
          </h2>

          {/* Display the activities as a list when information is available */}
          {thingsToDo.length > 0 ? (
            <ul className="detail-list">
              {thingsToDo.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            // Display a fallback message when no activities are available
            <p>More activities will be added soon.</p>
          )}
        </section>

        {/* Section displaying useful travel tips for visitors */}
        <section className="detail-section">
          <h2>
            <Lightbulb size={22} />
            Travel Tips
          </h2>

          {/* Display travel tips as a list when information is available */}
          {travelTips.length > 0 ? (
            <ul className="detail-list">
              {travelTips.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            // Display a fallback message when no travel tips are available
            <p>Check local travel conditions before your visit.</p>
          )}
        </section>

        {/* Bottom navigation link for exploring other destinations */}
        <div className="detail-bottom-link">
          <Link to="/destinations">
            Explore More Destinations
            <ArrowLeft size={17} />
          </Link>
        </div>

      </div>
    </div>
  );
}

// Export the component so it can be used in the application routes
export default DestinationDetails;
