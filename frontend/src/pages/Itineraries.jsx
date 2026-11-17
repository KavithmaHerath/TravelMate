
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

import {
    getItineraries,
    createItinerary,
    updateItinerary,
    deleteItinerary,
    getDestinations
} from "../services/api";

import "./Itineraries.css";

const emptyForm = {
    title: "",
    start_date: "",
    end_date: "",
    notes: "",
    destinationIds: []
};

export default function Itineraries() {
    const [itineraries, setItineraries] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [planResult, destinationResult] = await Promise.all([
                getItineraries(),
                getDestinations()
            ]);

            setItineraries(planResult.data || []);
            setDestinations(destinationResult.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((current) => ({
            ...current,
            [name]: value
        }));
    };

    const toggleDestination = (id) => {
        setForm((current) => {
            const selected = current.destinationIds.includes(id);

            return {
                ...current,
                destinationIds: selected
                    ? current.destinationIds.filter((item) => item !== id)
                    : [...current.destinationIds, id]
            };
        });
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
        setMessage("");
    };

    const handleEdit = (itinerary) => {
        setEditingId(itinerary.id);
        setForm({
            title: itinerary.title || "",
            start_date: itinerary.start_date
                ? String(itinerary.start_date).slice(0, 10)
                : "",
            end_date: itinerary.end_date
                ? String(itinerary.end_date).slice(0, 10)
                : "",
            notes: itinerary.notes || "",
            destinationIds: (itinerary.destinations || [])
                .map((destination) => Number(destination.id))
        });

        setMessage("");
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {

const payload = {
    title: form.title,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    notes: form.notes,
    destination_ids: form.destinationIds
};


            if (editingId) {
                await updateItinerary(editingId, payload);
                setMessage("Your itinerary has been updated.");
            } else {
                await createItinerary(payload);
                setMessage("Your itinerary has been created.");
            }

            setForm(emptyForm);
            setEditingId(null);
            await loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this itinerary?"
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");
            await deleteItinerary(id);
            setItineraries((current) =>
                current.filter((item) => item.id !== id)
            );
            setMessage("Itinerary deleted.");
            if (editingId === id) resetForm();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <main className="itineraries-page">
            <div className="itineraries-heading">
                <span className="eyebrow">MAKE IT YOUR JOURNEY</span>
                <h1>Plan your <span>adventure.</span></h1>
                <p>Create and manage your own Sri Lankan travel plans.</p>
            </div>

            <section className="itinerary-form-card">
                <div className="itinerary-section-title">
                    <div className="itinerary-icon">
                        {editingId ? <Pencil /> : <Plus />}
                    </div>
                    <div>
                        <h2>{editingId ? "Edit itinerary" : "Create an itinerary"}</h2>
                        <p>Add your trip details and choose destinations.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="itinerary-form">
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

                    <div className="destination-picker">
                        <h3><MapPin size={18} /> Choose destinations</h3>
                        <p>Select the places you want to include in your trip.</p>

                        {destinations.length ? (
                            <div className="itinerary-destination-list">
                                {destinations.map((destination) => {
                                    const id = Number(destination.id);
                                    const checked = form.destinationIds.includes(id);

                                    return (
                                        <label
                                            key={id}
                                            className={`itinerary-destination-option ${checked ? "selected" : ""}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleDestination(id)}
                                            />
                                            <span>
                                                <strong>{destination.name}</strong>
                                                <small>{destination.location}</small>
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : (
                            <p>No destinations are available yet.</p>
                        )}
                    </div>

                    {error && <div className="form-error">{error}</div>}
                    {message && <div className="itinerary-success">{message}</div>}

                    <div className="itinerary-form-actions">
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

            <section className="saved-itineraries">
                <div className="saved-itineraries-heading">
                    <div>
                        <span className="eyebrow">YOUR TRAVEL PLANS</span>
                        <h2>Saved itineraries</h2>
                    </div>
                    <span className="itinerary-count">
                        {itineraries.length} {itineraries.length === 1 ? "trip" : "trips"}
                    </span>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <LoaderCircle className="spin" /> Loading itineraries...
                    </div>
                ) : itineraries.length ? (
                    <div className="saved-itinerary-grid">
                        {itineraries.map((itinerary) => (
                            <article className="saved-itinerary-card" key={itinerary.id}>
                                <div className="saved-itinerary-top">
                                    <div className="itinerary-icon">
                                        <CalendarDays />
                                    </div>
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

                                <h3>{itinerary.title}</h3>

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

                                {itinerary.notes && (
                                    <p className="saved-itinerary-notes">{itinerary.notes}</p>
                                )}

                                <div className="saved-destinations">
                                    <strong><MapPin size={15} /> Destinations</strong>
                                    {itinerary.destinations?.length ? (
                                        <ul>
                                            {itinerary.destinations.map((destination) => (
                                                <li key={destination.id}>
                                                    {destination.name}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No destinations selected.</p>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="itinerary-empty">
                        <Compass size={38} />
                        <h3>No itineraries yet</h3>
                        <p>Create your first trip using the form above.</p>
                    </div>
                )}
            </section>

            <Link to="/dashboard" className="itinerary-back-link">
                ← Back to dashboard
            </Link>
        </main>
    );
}
