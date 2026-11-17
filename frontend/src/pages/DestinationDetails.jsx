
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

const API_URL = "http://localhost:5000/api";

function DestinationDetails() {
  const { id } = useParams();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/destinations/${id}`
        );

        if (!response.ok) {
          throw new Error("Unable to load destination details.");
        }

        const result = await response.json();

        setDestination(result.data || result.destination || result);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [id]);

  const getList = (value) => {
    if (Array.isArray(value)) return value;

    if (typeof value === "string" && value.trim()) {
      return value
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  if (loading) {
    return (
      <div className="destination-detail-message">
        Loading destination details...
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="destination-detail-message">
        <h2>Destination not found</h2>
        <p>{error || "This destination could not be found."}</p>
        <Link to="/destinations" className="back-destinations">
          <ArrowLeft size={17} />
          Back to Destinations
        </Link>
      </div>
    );
  }

  const thingsToDo = getList(destination.things_to_do);
  const travelTips = getList(destination.travel_tips);

  return (
    <div className="destination-detail-page">

      <Link to="/destinations" className="back-destinations">
        <ArrowLeft size={18} />
        Back to Destinations
      </Link>

      <section className="destination-detail-hero">

        <img
          className="destination-detail-image"
          src={destination.image}
          alt={destination.name}
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/1200x600?text=TravelMate";
          }}
        />

        <div className="destination-detail-overlay">
          <span className="detail-category">
            {destination.category || "Destination"}
          </span>

          <h1>{destination.name}</h1>

          <p>
            <MapPin size={18} />
            {destination.district || destination.location}
          </p>
        </div>

      </section>

      <div className="destination-detail-content">

        <section className="detail-section">
          <h2>About This Destination</h2>
          <p className="full-description">
            {destination.description ||
              "Discover the beauty and attractions of this destination in Sri Lanka."}
          </p>
        </section>

        <section className="detail-information-grid">

          <article className="detail-info-card">
            <CalendarDays size={25} />
            <h3>Best Time to Visit</h3>
            <p>
              {destination.best_time_to_visit ||
                "Information coming soon."}
            </p>
          </article>

          <article className="detail-info-card">
            <Clock size={25} />
            <h3>Recommended Duration</h3>
            <p>
              {destination.recommended_duration ||
                "Information coming soon."}
            </p>
          </article>

          <article className="detail-info-card">
            <Ticket size={25} />
            <h3>Entry Fee</h3>
            <p>
              {destination.entry_fee || "Check locally before visiting."}
            </p>
          </article>

        </section>

        <section className="detail-section">
          <h2>
            <Compass size={22} />
            Things to Do
          </h2>

          {thingsToDo.length > 0 ? (
            <ul className="detail-list">
              {thingsToDo.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>More activities will be added soon.</p>
          )}
        </section>

        <section className="detail-section">
          <h2>
            <Lightbulb size={22} />
            Travel Tips
          </h2>

          {travelTips.length > 0 ? (
            <ul className="detail-list">
              {travelTips.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>Check local travel conditions before your visit.</p>
          )}
        </section>

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

export default DestinationDetails;
