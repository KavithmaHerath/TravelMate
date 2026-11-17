
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    CalendarDays,
    MapPin,
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Compass,
    LoaderCircle
} from "lucide-react";

// Import API functions for managing itineraries and retrieving destinations
import {
    getItineraries,
    createItinerary,
    updateItinerary,
    deleteItinerary,
    getDestinations
} from "../services/api";

// Import styles for the itineraries page
import "./Itineraries.css";

// Initial values used when creating or resetting the itinerary form
const emptyForm = {
    title: "",
    start_date: "",
    end_date: "",
    notes: "",
    destinationIds: []
};

// Main component for creating and managing travel itineraries
export default function Itineraries() {

    // State for storing saved itineraries and available destinations
    const [itineraries, setItineraries] = useState([]);
    const [destinations, setDestinations] = useState([]);

    // State for managing the itinerary form data
    const [form, setForm] = useState(emptyForm);

    // Store the ID of the itinerary currently being edited
    const [editingId, setEditingId] = useState(null);

    // State variables for loading, saving, errors, and success messages
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Fetch saved itineraries and available destinations from the backend
    const loadData = async () => {
        try {
            // Show loading state and clear previous errors
            setLoading(true);
            setError("");

            // Fetch itineraries and destinations at the same time
            const [planResult, destinationResult] = await Promise.all([
                getItineraries(),
                getDestinations()
            ]);

            // Store the retrieved data in their respective state variables
            setItineraries(planResult.data || []);
            setDestinations(destinationResult.data || []);
        } catch (err) {
            // Display an error if either API request fails
            setError(err.message);
        } finally {
            // Stop the loading state after both requests finish
            setLoading(false);
        }
    };

    // Load itinerary and destination data when the component first renders
    useEffect(() => {
        loadData();
    }, []);

    // Handle changes to the itinerary form inputs
    const handleChange = (e) => {
        // Get the input field name and its updated value
        const { name, value } = e.target;

        // Update the corresponding form property
        setForm((current) => ({
            ...current,
            [name]: value
        }));
    };

    // Add or remove a destination from the selected destination list
    const toggleDestination = (id) => {
        setForm((current) => {
            // Check whether the destination is already selected
            const selected = current.destinationIds.includes(id);

            // Update the selected destination IDs
            return {
                ...current,
                destinationIds: selected
                    ? current.destinationIds.filter((item) => item !== id)
                    : [...current.destinationIds, id]
            };
        });
    };

    // Reset the form and clear editing, error, and success states
    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
        setMessage("");
    };

    // Load an existing itinerary into the form for editing
    const handleEdit = (itinerary) => {
        // Store the ID of the itinerary being edited
        setEditingId(itinerary.id);

        // Populate the form with the selected itinerary's existing information
        setForm({
            title: itinerary.title || "",
            start_date: itinerary.start_date
                ? String(itinerary.start_date).slice(0, 10)
                : "",
            end_date: itinerary.end_date
                ? String(itinerary.end_date).slice(0, 10)
                : "",
            notes: itinerary.notes || "",

            // Convert destination IDs into numbers for checkbox selection
            destinationIds: (itinerary.destinations || [])
                .map((destination) => Number(destination.id))
        });

        // Clear previous messages when entering edit mode
        setMessage("");
        setError("");

        // Scroll to the top so the user can access the editing form
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Handle itinerary creation and updating when the form is submitted
    const handleSubmit = async (e) => {
        // Prevent the browser's default form submission behaviour
        e.preventDefault();

        // Set saving state and clear previous messages
        setSaving(true);
        setError("");
        setMessage("");

        try {

            // Prepare itinerary information to send to the backend API
            const payload = {
                title: form.title,
                start_date: form.start_date || null,
                end_date: form.end_date || null,
                notes: form.notes,
                destination_ids: form.destinationIds
            };

            // Update an existing itinerary if an ID is available
            if (editingId) {
                await updateItinerary(editingId, payload);
                setMessage("Your itinerary has been updated.");
            } else {
                // Otherwise, create a new itinerary
                await createItinerary(payload);
                setMessage("Your itinerary has been created.");
            }

            // Reset the form after a successful operation
            setForm(emptyForm);
            setEditingId(null);

            // Reload data to display the latest itinerary information
            await loadData();
        } catch (err) {
            // Display an error if creating or updating the itinerary fails
            setError(err.message);
        } finally {
            // Stop the saving state after the operation completes
            setSaving(false);
        }
    };

    // Delete an existing itinerary after user confirmation
    const handleDelete = async (id) => {
        // Ask the user to confirm the deletion
        const confirmed = window.confirm(
            "Are you sure you want to delete this itinerary?"
        );

        // Stop the deletion if the user cancels
        if (!confirmed) return;

        try {
            // Clear previous error and success messages
            setError("");
            setMessage("");

            // Send the delete request to the backend
            await deleteItinerary(id);

            // Remove the deleted itinerary from the displayed list
            setItineraries((current) =>
                current.filter((item) => item.id !== id)
            );

            // Display a success message
            setMessage("Itinerary deleted.");

            // Reset the form if the deleted itinerary was being edited
            if (editingId === id) resetForm();
        } catch (err) {
            // Display an error if deletion fails
            setError(err.message);
        }
    };

    return (
        // Main container for the itineraries page
        <main className="itineraries-page">

            {/* Page heading and introductory description */}
            <div className="itineraries-heading">
                <span className="eyebrow">MAKE IT YOUR JOURNEY</span>
                <h1>Plan your <span>adventure.</span></h1>
                <p>Create and manage your own Sri Lankan travel plans.</p>
            </div>

            {/* Form section for creating or editing an itinerary */}
            <section className="itinerary-form-card">

                {/* Form heading changes depending on whether the user is editing */}
                <div className="itinerary-section-title">
                    <div className="itinerary-icon">
                        {editingId ? <Pencil /> : <Plus />}
                    </div>
                    <div>
                        <h2>{editingId ? "Edit itinerary" : "Create an itinerary"}</h2>
                        <p>Add your trip details and choose destinations.</p>
                    </div>
                </div>

                {/* Itinerary form with submission handling */}
                <form onSubmit={handleSubmit} className="itinerary-form">

                    {/* Input field for the itinerary title */}
                    <label>
                        Trip title
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Example: My Sri Lanka Adventure"
                            maxLength={150}
                            required
                        />
                    </label>

                    {/* Input fields for the trip start and end dates */}
                    <div className="itinerary-date-grid">
                        <label>
                            Start date
                            <input
                                type="date"
                                name="start_date"
                                value={form.start_date}
                                onChange={handleChange}
                            />
                        </label>

                        <label>
                            End date
                            <input
                                type="date"
                                name="end_date"
                                value={form.end_date}
                                min={form.start_date || undefined}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    {/* Text area for additional trip notes */}
                    <label>
                        Trip notes
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Add any notes about your trip..."
                            rows={4}
                        />
                    </label>

                    {/* Destination selection section */}
                    <div className="destination-picker">
                        <h3><MapPin size={18} /> Choose destinations</h3>
                        <p>Select the places you want to include in your trip.</p>

                        {/* Display available destinations as selectable checkboxes */}
                        {destinations.length ? (
                            <div className="itinerary-destination-list">
                                {destinations.map((destination) => {
                                    // Convert the destination ID into a number
                                    const id = Number(destination.id);

                                    // Check whether this destination is selected
                                    const checked = form.destinationIds.includes(id);

                                    return (
                                        // Destination option with conditional selected styling
                                        <label
                                            key={id}
                                            className={`itinerary-destination-option ${checked ? "selected" : ""}`}
                                        >
                                            {/* Checkbox for selecting or deselecting a destination */}
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleDestination(id)}
                                            />

                                            {/* Display destination name and location */}
                                            <span>
                                                <strong>{destination.name}</strong>
                                                <small>{destination.location}</small>
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : (
                            // Display a message if no destinations are available
                            <p>No destinations are available yet.</p>
                        )}
                    </div>

                    {/* Display error and success messages when available */}
                    {error && <div className="form-error">{error}</div>}
                    {message && <div className="itinerary-success">{message}</div>}

                    {/* Form action buttons */}
                    <div className="itinerary-form-actions">

                        {/* Submit button for creating or updating an itinerary */}
                        <button
                            type="submit"
                            className="primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Save changes"
                                    : "Create itinerary"}
                            {!saving && <Save size={17} />}
                        </button>

                        {/* Cancel button displayed only while editing */}
                        {editingId && (
                            <button
                                type="button"
                                className="itinerary-cancel"
                                onClick={resetForm}
                            >
                                <X size={17} /> Cancel
                            </button>
                        )}
                    </div>
                </form>
            </section>

            {/* Section displaying all saved itineraries */}
            <section className="saved-itineraries">

                {/* Heading and total number of saved trips */}
                <div className="saved-itineraries-heading">
                    <div>
                        <span className="eyebrow">YOUR TRAVEL PLANS</span>
                        <h2>Saved itineraries</h2>
                    </div>
                    <span className="itinerary-count">
                        {itineraries.length} {itineraries.length === 1 ? "trip" : "trips"}
                    </span>
                </div>

                {/* Show content depending on loading and itinerary availability */}
                {loading ? (
                    // Loading indicator while saved itineraries are retrieved
                    <div className="loading-state">
                        <LoaderCircle className="spin" /> Loading itineraries...
                    </div>
                ) : itineraries.length ? (
                    // Display saved itinerary cards when records are available
                    <div className="saved-itinerary-grid">
                        {itineraries.map((itinerary) => (
                            <article className="saved-itinerary-card" key={itinerary.id}>

                                {/* Card header with icon and action buttons */}
                                <div className="saved-itinerary-top">
                                    <div className="itinerary-icon">
                                        <CalendarDays />
                                    </div>

                                    {/* Edit and delete actions for each itinerary */}
                                    <div className="saved-itinerary-actions">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(itinerary)}
                                            aria-label="Edit itinerary"
                                            title="Edit"
                                        >
                                            <Pencil size={17} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(itinerary.id)}
                                            aria-label="Delete itinerary"
                                            title="Delete"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </div>

                                {/* Display the saved itinerary title */}
                                <h3>{itinerary.title}</h3>

                                {/* Display the trip dates when at least one date exists */}
                                {(itinerary.start_date || itinerary.end_date) && (
                                    <p className="saved-itinerary-date">
                                        <CalendarDays size={15} />
                                        {itinerary.start_date
                                            ? String(itinerary.start_date).slice(0, 10)
                                            : "Date not set"}
                                        {" — "}
                                        {itinerary.end_date
                                            ? String(itinerary.end_date).slice(0, 10)
                                            : "Date not set"}
                                    </p>
                                )}

                                {/* Display additional notes when available */}
                                {itinerary.notes && (
                                    <p className="saved-itinerary-notes">{itinerary.notes}</p>
                                )}

                                {/* Display destinations included in the saved itinerary */}
                                <div className="saved-destinations">
                                    <strong><MapPin size={15} /> Destinations</strong>

                                    {/* Show the selected destinations as a list */}
                                    {itinerary.destinations?.length ? (
                                        <ul>
                                            {itinerary.destinations.map((destination) => (
                                                <li key={destination.id}>
                                                    {destination.name}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        // Display a message when no destinations were selected
                                        <p>No destinations selected.</p>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    // Empty state displayed when the user has no saved itineraries
                    <div className="itinerary-empty">
                        <Compass size={38} />
                        <h3>No itineraries yet</h3>
                        <p>Create your first trip using the form above.</p>
                    </div>
                )}
            </section>

            {/* Navigation link to return to the user dashboard */}
            <Link to="/dashboard" className="itinerary-back-link">
                ← Back to dashboard
            </Link>
        </main>
    );
}
