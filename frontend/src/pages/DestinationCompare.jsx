
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeftRight,
    MapPin,
    Clock,
    CalendarDays,
    Ticket,
    Compass,
    ArrowUpRight
} from "lucide-react";
import "./DestinationCompare.css";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80";

function getValue(value) {
    if (value === null || value === undefined || String(value).trim() === "") {
        return "Coming soon";
    }

    return value;
}

function DestinationCompare({ destinations = [] }) {
    const [firstId, setFirstId] = useState("");
    const [secondId, setSecondId] = useState("");

    const firstDestination = useMemo(
        () => destinations.find((item) => String(item.id) === firstId),
        [destinations, firstId]
    );

    const secondDestination = useMemo(
        () => destinations.find((item) => String(item.id) === secondId),
        [destinations, secondId]
    );

    const comparisonRows = [
        {
            label: "Location / District",
            icon: MapPin,
            getValue: (item) => getValue(item.district || item.location)
        },
        {
            label: "Category",
            icon: Compass,
            getValue: (item) => getValue(item.category)
        },
        {
            label: "Recommended duration",
            icon: Clock,
            getValue: (item) => getValue(item.recommended_duration)
        },
        {
            label: "Best time to visit",
            icon: CalendarDays,
            getValue: (item) => getValue(item.best_time_to_visit)
        },
        {
            label: "Entry fee",
            icon: Ticket,
            getValue: (item) => getValue(item.entry_fee)
        },
        {
            label: "Things to do",
            icon: Compass,
            getValue: (item) => getValue(item.things_to_do)
        },
        {
            label: "Travel tips",
            icon: MapPin,
            getValue: (item) => getValue(item.travel_tips)
        },
        {
            label: "About this destination",
            icon: Compass,
            getValue: (item) => getValue(item.description)
        }
    ];

    const availableSecondDestinations = destinations.filter(
        (item) => String(item.id) !== firstId
    );

    const swapDestinations = () => {
        setFirstId(secondId);
        setSecondId(firstId);
    };

    const clearComparison = () => {
        setFirstId("");
        setSecondId("");
    };

    return (
        <main className="compare-page">
            <section className="compare-heading">
                <span className="eyebrow">MAKE THE RIGHT CHOICE</span>
                <h1>
                    Compare <span>Destinations.</span>
                </h1>
                <p>
                    Compare two Sri Lankan destinations and discover
                    which one suits your travel plans.
                </p>
            </section>

            <section className="compare-selection">
                <div className="compare-select-card">
                    <label htmlFor="first-destination">
                        First destination
                    </label>

                    <select
                        id="first-destination"
                        value={firstId}
                        onChange={(event) => {
                            setFirstId(event.target.value);
                            if (event.target.value === secondId) {
                                setSecondId("");
                            }
                        }}
                    >
                        <option value="">Choose a destination</option>
                        {destinations.map((item) => (
                            <option key={item.id} value={String(item.id)}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="compare-swap">
                    <ArrowLeftRight size={23} />
                    <span>VS</span>
                </div>

                <div className="compare-select-card">
                    <label htmlFor="second-destination">
                        Second destination
                    </label>

                    <select
                        id="second-destination"
                        value={secondId}
                        onChange={(event) => setSecondId(event.target.value)}
                    >
                        <option value="">Choose a destination</option>
                        {availableSecondDestinations.map((item) => (
                            <option key={item.id} value={String(item.id)}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            {firstDestination && secondDestination ? (
                <>
                    <section className="compare-destination-cards">
                        {[firstDestination, secondDestination].map((item) => (
                            <article className="compare-destination-card" key={item.id}>
                                <img
                                    src={item.image || FALLBACK_IMAGE}
                                    alt={item.name}
                                    onError={(event) => {
                                        event.currentTarget.src = FALLBACK_IMAGE;
                                    }}
                                />

                                <div className="compare-card-content">
                                    <span className="compare-category">
                                        {getValue(item.category)}
                                    </span>
                                    <h2>{item.name}</h2>
                                    <p>
                                        <MapPin size={15} />
                                        {getValue(item.district || item.location)}
                                    </p>
                                    <Link to={`/destinations/${item.id}`}>
                                        Explore destination
                                        <ArrowUpRight size={16} />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </section>

                    <section className="comparison-table-section">
                        <div className="comparison-title">
                            <span className="eyebrow">SIDE-BY-SIDE DETAILS</span>
                            <h2>Destination comparison</h2>
                        </div>

                        <div className="comparison-table-wrapper">
                            <table className="comparison-table">
                                <thead>
                                    <tr>
                                        <th>Information</th>
                                        <th>{firstDestination.name}</th>
                                        <th>{secondDestination.name}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {comparisonRows.map((row) => {
                                        const Icon = row.icon;

                                        return (
                                            <tr key={row.label}>
                                                <th>
                                                    <span className="comparison-row-label">
                                                        <Icon size={17} />
                                                        {row.label}
                                                    </span>
                                                </th>
                                                <td>{row.getValue(firstDestination)}</td>
                                                <td>{row.getValue(secondDestination)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <div className="compare-actions">
                        <button
                            type="button"
                            className="compare-secondary-button"
                            onClick={swapDestinations}
                        >
                            <ArrowLeftRight size={17} />
                            Swap destinations
                        </button>

                        <button
                            type="button"
                            className="compare-primary-button"
                            onClick={clearComparison}
                        >
                            Compare again
                        </button>
                    </div>
                </>
            ) : (
                <section className="compare-empty">
                    <div className="compare-empty-icon">
                        <ArrowLeftRight size={32} />
                    </div>

                    <h2>Select two destinations</h2>
                    <p>
                        Choose two places above to see their location,
                        travel information, activities and other details
                        side by side.
                    </p>

                    <Link to="/destinations">
                        Browse destinations
                        <ArrowUpRight size={17} />
                    </Link>
                </section>
            )}
        </main>
    );
}

export default DestinationCompare;
