
// Import useMemo for efficient destination lookups and useState for component state.
import { useMemo, useState } from "react";

// Import Link for navigation between application pages.
import { Link } from "react-router-dom";

// Import icons used in the destination comparison interface.
import {
    ArrowLeftRight,
    MapPin,
    Clock,
    CalendarDays,
    Ticket,
    Compass,
    ArrowUpRight
} from "lucide-react";

// Import CSS styles for the destination comparison page.
import "./DestinationCompare.css";

// Default image displayed when a destination does not have a valid image.
const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80";

// Helper function to handle missing or empty destination information.
// Displays "Coming soon" when a value is unavailable.
function getValue(value) {
    if (value === null || value === undefined || String(value).trim() === "") {
        return "Coming soon";
    }

    return value;
}

// Main destination comparison component.
// Receives the available destinations through props.
function DestinationCompare({ destinations = [] }) {

    // Store the IDs of the two destinations selected by the user.
    const [firstId, setFirstId] = useState("");
    const [secondId, setSecondId] = useState("");

    // Find the first selected destination from the available destinations.
    // useMemo avoids repeating the lookup unless its dependencies change.
    const firstDestination = useMemo(
        () => destinations.find((item) => String(item.id) === firstId),
        [destinations, firstId]
    );

    // Find the second selected destination.
    const secondDestination = useMemo(
        () => destinations.find((item) => String(item.id) === secondId),
        [destinations, secondId]
    );

    // Define the information fields displayed in the comparison table.
    // Each row contains a label, an icon, and a function to retrieve its value.
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

    // Exclude the first selected destination from the second dropdown.
    // This prevents users from comparing a destination with itself.
    const availableSecondDestinations = destinations.filter(
        (item) => String(item.id) !== firstId
    );

    // Swap the selected destination IDs between the two comparison fields.
    const swapDestinations = () => {
        setFirstId(secondId);
        setSecondId(firstId);
    };

    // Reset both destination selections to start a new comparison.
    const clearComparison = () => {
        setFirstId("");
        setSecondId("");
    };

    return (
        <main className="compare-page">

            {/* Main heading and introduction to the comparison page. */}
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

            {/* Destination selection section containing two dropdowns. */}
            <section className="compare-selection">

                {/* Dropdown for selecting the first destination. */}
                <div className="compare-select-card">
                    <label htmlFor="first-destination">
                        First destination
                    </label>

                    <select
                        id="first-destination"
                        value={firstId}
                        onChange={(event) => {
                            // Update the first selected destination.
                            setFirstId(event.target.value);

                            // Clear the second selection if both selections become identical.
                            if (event.target.value === secondId) {
                                setSecondId("");
                            }
                        }}
                    >
                        <option value="">Choose a destination</option>

                        {/* Display all available destinations as dropdown options. */}
                        {destinations.map((item) => (
                            <option key={item.id} value={String(item.id)}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Visual indicator between the two destination selectors. */}
                <div className="compare-swap">
                    <ArrowLeftRight size={23} />
                    <span>VS</span>
                </div>

                {/* Dropdown for selecting the second destination. */}
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

                        {/* Display destinations excluding the first selection. */}
                        {availableSecondDestinations.map((item) => (
                            <option key={item.id} value={String(item.id)}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            {/* Show the comparison results only after both destinations are selected. */}
            {firstDestination && secondDestination ? (
                <>
                    {/* Display the selected destinations in individual cards. */}
                    <section className="compare-destination-cards">

                        {/* Generate one destination card for each selected destination. */}
                        {[firstDestination, secondDestination].map((item) => (
                            <article className="compare-destination-card" key={item.id}>

                                {/* Display the destination image or fallback image. */}
                                <img
                                    src={item.image || FALLBACK_IMAGE}
                                    alt={item.name}
                                    onError={(event) => {
                                        // Replace the image if the original image fails to load.
                                        event.currentTarget.src = FALLBACK_IMAGE;
                                    }}
                                />

                                <div className="compare-card-content">

                                    {/* Display the destination category. */}
                                    <span className="compare-category">
                                        {getValue(item.category)}
                                    </span>

                                    {/* Display the destination name. */}
                                    <h2>{item.name}</h2>

                                    {/* Display the destination location. */}
                                    <p>
                                        <MapPin size={15} />
                                        {getValue(item.district || item.location)}
                                    </p>

                                    {/* Link to the individual destination details page. */}
                                    <Link to={`/destinations/${item.id}`}>
                                        Explore destination
                                        <ArrowUpRight size={16} />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </section>

                    {/* Side-by-side comparison table section. */}
                    <section className="comparison-table-section">
                        <div className="comparison-title">
                            <span className="eyebrow">SIDE-BY-SIDE DETAILS</span>
                            <h2>Destination comparison</h2>
                        </div>

                        {/* Wrapper provides horizontal scrolling when the table is wider than the screen. */}
                        <div className="comparison-table-wrapper">
                            <table className="comparison-table">

                                {/* Table headings showing the two selected destinations. */}
                                <thead>
                                    <tr>
                                        <th>Information</th>
                                        <th>{firstDestination.name}</th>
                                        <th>{secondDestination.name}</th>
                                    </tr>
                                </thead>

                                {/* Generate comparison rows using the comparisonRows array. */}
                                <tbody>
                                    {comparisonRows.map((row) => {

                                        // Get the icon component assigned to the current comparison row.
                                        const Icon = row.icon;

                                        return (
                                            <tr key={row.label}>
                                                {/* Display the comparison label and its icon. */}
                                                <th>
                                                    <span className="comparison-row-label">
                                                        <Icon size={17} />
                                                        {row.label}
                                                    </span>
                                                </th>

                                                {/* Display information for the first destination. */}
                                                <td>{row.getValue(firstDestination)}</td>

                                                {/* Display information for the second destination. */}
                                                <td>{row.getValue(secondDestination)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Action buttons for managing the comparison. */}
                    <div className="compare-actions">

                        {/* Swap the two selected destinations. */}
                        <button
                            type="button"
                            className="compare-secondary-button"
                            onClick={swapDestinations}
                        >
                            <ArrowLeftRight size={17} />
                            Swap destinations
                        </button>

                        {/* Clear the current comparison and start again. */}
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

                // Display this section when two destinations have not both been selected.
                <section className="compare-empty">

                    {/* Icon displayed in the empty comparison state. */}
                    <div className="compare-empty-icon">
                        <ArrowLeftRight size={32} />
                    </div>

                    <h2>Select two destinations</h2>

                    {/* Instructions explaining how to start comparing destinations. */}
                    <p>
                        Choose two places above to see their location,
                        travel information, activities and other details
                        side by side.
                    </p>

                    {/* Link to browse all available destinations. */}
                    <Link to="/destinations">
                        Browse destinations
                        <ArrowUpRight size={17} />
                    </Link>
                </section>
            )}
        </main>
    );
}

// Export the component so it can be imported and displayed in application routes.
export default DestinationCompare;
