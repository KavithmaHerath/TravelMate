
// Import React hooks for managing component state and side effects
import { useEffect, useState } from "react";

// Import React Router components and hooks for navigation and routing
import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    NavLink,
    useNavigate,
    useLocation
} from "react-router-dom";

// Import icons used throughout the TravelMate application
import {
    Compass,
    MapPin,
    Search,
    Menu,
    X,
    ArrowRight,
    ArrowUpRight,
    Heart,
    Mountain,
    Waves,
    Landmark,
    TreePalm,
    CalendarDays,
    UserRound,
    LogOut,
    ShieldCheck,
    Camera,
    Sparkles,
    LoaderCircle,
    CheckCircle2,
    Eye, 
    EyeOff
} from "lucide-react";

// Import API functions for destinations and user authentication
import {
    getDestinations,
    registerUser,
    loginUser,
    getCurrentUser,
    getSavedUser,
    saveAuth,
    clearAuth
} from "./services/api";

// Import application page components
import Itineraries from "./pages/Itineraries";
import DestinationDetails from "./pages/DestinationDetails";
import DestinationCompare from "./pages/DestinationCompare";
import About from "./pages/About";

// Import the main application stylesheet
import "./App.css";

// Main background image displayed in the home page hero section
const HERO_IMAGE =
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&q=85";

// Fallback image used when a destination image cannot be loaded
const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80";

// Destination categories and their corresponding icons
const categories = [
    { name: "All Places", icon: Compass },
    { name: "Beach", icon: Waves },
    { name: "Nature", icon: TreePalm },
    { name: "Historical", icon: Landmark },
    { name: "Adventure", icon: Mountain }
];

// List of all 25 districts in Sri Lanka
const districts = [
    "Colombo",
    "Gampaha",
    "Kalutara",
    "Kandy",
    "Matale",
    "Nuwara Eliya",
    "Galle",
    "Matara",
    "Hambantota",
    "Jaffna",
    "Kilinochchi",
    "Mannar",
    "Mullaitivu",
    "Vavuniya",
    "Trincomalee",
    "Batticaloa",
    "Ampara",
    "Kurunegala",
    "Puttalam",
    "Anuradhapura",
    "Polonnaruwa",
    "Badulla",
    "Monaragala",
    "Ratnapura",
    "Kegalle"
];

// Component that scrolls the page to the top when the URL path changes
function ScrollToTop() {
    const { pathname } = useLocation();

    // Monitor route changes and scroll to the top of the page
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    }, [pathname]);

    return null;
}

// --------------------------------------------------
// NAVBAR
// --------------------------------------------------

// Navigation bar component displaying links and user actions
function Navbar({ user, logout }) {

    // State for opening and closing the mobile navigation menu
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="navbar">

            {/* TravelMate logo and home navigation link */}
            <Link
                to="/"
                className="brand"
                onClick={() => setMenuOpen(false)}
            >
                <span className="brand-icon">
                    <Compass size={25} />
                </span>

                <span>
                    Travel<span className="brand-accent">Mate.</span>
                </span>
            </Link>

            {/* Button for opening or closing the mobile menu */}
            <button
                className="mobile-menu"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                {menuOpen ? <X /> : <Menu />}
            </button>

            {/* Navigation links and authentication options */}
            <nav className={menuOpen ? "nav-links open" : "nav-links"}>

                {/* Home page link */}
                <NavLink
                    to="/"
                    end
                    onClick={() => setMenuOpen(false)}
                >
                    Home
                </NavLink>

                {/* About page link */}
                <NavLink
                    to="/about"
                    onClick={() => setMenuOpen(false)}
                >
                    About
                </NavLink>

                {/* Destinations page link */}
                <NavLink
                    to="/destinations"
                    onClick={() => setMenuOpen(false)}
                >
                    Destinations
                </NavLink>

                {/* Destination comparison page link */}
                <NavLink
                    to="/compare"
                    onClick={() => setMenuOpen(false)}
                >
                    Compare
                </NavLink>

                {/* Display dashboard and logout options for logged-in users */}
                {user ? (
                    <>
                        <NavLink
                            to="/dashboard"
                            onClick={() => setMenuOpen(false)}
                        >
                            My Dashboard
                        </NavLink>

                        {/* Logout button for authenticated users */}
                        <button
                            className="nav-logout"
                            onClick={() => {
                                setMenuOpen(false);
                                logout();
                            }}
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </>
                ) : (
                    /* Display login link when the user is not logged in */
                    <Link
                        to="/login"
                        className="nav-login"
                        onClick={() => setMenuOpen(false)}
                    >
                        Login <ArrowUpRight size={16} />
                    </Link>
                )}

            </nav>
        </header>
    );
}

// --------------------------------------------------
// DESTINATION CARD
// --------------------------------------------------

// Reusable component for displaying an individual destination
function DestinationCard({ destination }) {

    // State for tracking whether the destination is marked as saved
    const [saved, setSaved] = useState(false);

    return (
        <article className="destination-card">

            {/* Destination image and category information */}
            <div className="destination-image">

                <img
                    src={destination.image || FALLBACK_IMAGE}
                    alt={destination.name}
                    onError={(e) => {
                        // Display a fallback image if the original image fails
                        e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                />

                {/* Display the destination category */}
                <span className="category-tag">
                    {destination.category}
                </span>

                {/* Button for marking the destination as saved */}
                <button
                    className={`heart-button ${saved ? "saved" : ""}`}
                    onClick={() => setSaved(!saved)}
                    aria-label="Save destination"
                >
                    <Heart
                        size={18}
                        fill={saved ? "currentColor" : "none"}
                    />
                </button>

            </div>

            {/* Destination name, location, description, and navigation link */}
            <div className="destination-info">

                {/* Display the destination location */}
                <div className="destination-location">
                    <MapPin size={14} />
                    {destination.location}
                </div>

                {/* Display the destination name */}
                <h3>{destination.name}</h3>

                {/* Display a short destination description */}
                <p>{destination.description}</p>

                {/* Navigate to the full destination details page */}
                <Link
                    to={`/destinations/${destination.id}`}
                    className="card-link"
                >
                    Explore destination
                    <ArrowUpRight size={17} />
                </Link>

            </div>
        </article>
    );
}

// --------------------------------------------------
// HOME PAGE
// --------------------------------------------------

// Home page component displaying featured destinations and introduction
function Home({ destinations, loading, error }) {

    // State for the destination search input
    const [search, setSearch] = useState("");

    // React Router navigation function
    const navigate = useNavigate();

    // Select the first four destinations for the featured section
    const featured = destinations.slice(0, 4);

    // Handle submission of the home page search form
    const handleSearch = (e) => {
        e.preventDefault();

        // Navigate to the destinations page with the search query
        navigate(
            `/destinations?search=${encodeURIComponent(search)}`
        );
    };

    return (
        <>

            {/* Main hero section of the home page */}
            <section className="hero">

                {/* Background image */}
                <img
                    className="hero-background"
                    src={HERO_IMAGE}
                    alt=""
                />

                {/* Overlay used to improve text visibility */}
                <div className="hero-overlay"></div>

                {/* Main hero content */}
                <div className="hero-content">

                    {/* Introductory badge */}
                    <div className="hero-badge">
                        <Sparkles size={15} />
                        YOUR NEXT ADVENTURE STARTS HERE
                    </div>

                    {/* Main welcome heading */}
                    <h1>
                        Discover the magic
                        <br />
                        of <span>Sri Lanka.</span>
                    </h1>

                    {/* Introduction to TravelMate */}
                    <p>
                        From golden beaches to misty mountains,
                        discover unforgettable places and plan
                        your perfect island adventure.
                    </p>

                    {/* Search form for finding destinations */}
                    <form
                        className="hero-search"
                        onSubmit={handleSearch}
                    >
                        <Search size={21} />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Where do you want to go?"
                        />

                        <button type="submit">
                            Explore <ArrowRight size={17} />
                        </button>
                    </form>

                    {/* Highlights displayed below the search form */}
                    <div className="hero-trust">

                        <span>
                            <CheckCircle2 size={15} />
                            Discover amazing places
                        </span>

                        <span>
                            <CheckCircle2 size={15} />
                            Plan your own journey
                        </span>

                    </div>

                </div>

                {/* Small location information at the bottom of the hero */}
                <div className="hero-bottom">
                    <span>THE PEARL OF THE INDIAN OCEAN</span>
                    <span>06°55' N — 79°51' E</span>
                </div>

            </section>

            {/* Section displaying TravelMate highlights */}
            <section className="stats-section">

                <div className="stat-item">
                    <Compass />
                    <div>
                        <strong>Sri Lanka</strong>
                        <span>One beautiful island</span>
                    </div>
                </div>

                <div className="stat-item">
                    <Mountain />
                    <div>
                        <strong>Mountains</strong>
                        <span>Explore nature</span>
                    </div>
                </div>

                <div className="stat-item">
                    <Waves />
                    <div>
                        <strong>Beaches</strong>
                        <span>Discover paradise</span>
                    </div>
                </div>

                <div className="stat-item">
                    <Camera />
                    <div>
                        <strong>Memories</strong>
                        <span>Make every moment count</span>
                    </div>
                </div>

            </section>

            {/* Featured destinations section */}
            <section className="section destinations-section">

                <div className="section-heading">

                    <div>
                        <span className="eyebrow">
                            EXPLORE THE ISLAND
                        </span>

                        <h2>
                            Places you'll <span>fall in love with.</span>
                        </h2>

                        <p>
                            Discover the most beautiful destinations in Sri Lanka.
                        </p>
                    </div>

                    {/* Link to view all destinations */}
                    <Link
                        to="/destinations"
                        className="outline-button"
                    >
                        View all destinations
                        <ArrowRight size={17} />
                    </Link>

                </div>

                {/* Display loading, error, destination cards, or empty state */}
                {loading ? (
                    <div className="loading-state">
                        <LoaderCircle className="spin" />
                        Loading destinations...
                    </div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : featured.length ? (
                    <div className="destination-grid">

                        {/* Generate a destination card for each featured destination */}
                        {featured.map((destination) => (
                            <DestinationCard
                                key={destination.id}
                                destination={destination}
                            />
                        ))}

                    </div>
                ) : (
                    /* Display a message when no destinations are available */
                    <div className="empty-state">
                        No destinations available yet.
                    </div>
                )}

            </section>

            {/* HOME PAGE ABOUT SECTION */}

            {/* Introduction to the purpose and benefits of TravelMate */}
            <section className="about-section" id="about">

                {/* Image and supporting message */}
                <div className="about-image">

                    <img
                        src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000&q=85"
                        alt="Beautiful mountain landscape"
                    />

                    <div className="about-image-label">
                        <Sparkles />
                        Discover something beautiful
                    </div>

                </div>

                {/* About TravelMate text and feature highlights */}
                <div className="about-content">

                    <span className="eyebrow">
                        WHY TRAVELMATE?
                    </span>

                    <h2>
                        Your journey.
                        <br />
                        <span>Your story.</span>
                    </h2>

                    <p>
                        TravelMate makes discovering Sri Lanka easier.
                        Explore amazing destinations, find inspiration
                        and start planning a journey that is uniquely yours.
                    </p>

                    {/* Main benefits of using TravelMate */}
                    <div className="about-points">

                        <div>
                            <CheckCircle2 />
                            Explore incredible destinations
                        </div>

                        <div>
                            <CheckCircle2 />
                            Discover places across Sri Lanka
                        </div>

                        <div>
                            <CheckCircle2 />
                            Create personalized travel plans
                        </div>

                    </div>

                    {/* Navigate to the separate About page */}
                    <Link
                        to="/about"
                        className="primary-button"
                    >
                        Learn more about us
                        <ArrowRight size={18} />
                    </Link>

                </div>

            </section>

            {/* Final call-to-action section on the home page */}
            <section className="cta-section">

                <span className="eyebrow">
                    YOUR ISLAND ADVENTURE AWAITS
                </span>

                <h2>
                    Ready to explore <span>Sri Lanka?</span>
                </h2>

                <p>
                    Find your favourite destinations and start planning.
                </p>

                {/* Navigate to the destinations page */}
                <Link
                    to="/destinations"
                    className="cta-button"
                >
                    Explore destinations
                    <ArrowRight size={18} />
                </Link>

            </section>

        </>
    );
}

// --------------------------------------------------
// DESTINATIONS PAGE WITH DISTRICT FILTER
// --------------------------------------------------

// Component displaying destinations with search and filtering options
function Destinations({ destinations, loading }) {

    // Initialize search from the URL query parameter when available
    const [search, setSearch] = useState(
        () => new URLSearchParams(window.location.search).get("search") || ""
    );

    // State for the selected destination category and district
    const [category, setCategory] = useState("All Places");
    const [district, setDistrict] = useState("");

    // Filter destinations based on the selected search and filter values
    const filtered = destinations.filter((destination) => {

        // Convert the search text to lowercase and remove extra spaces
        const searchText = search.trim().toLowerCase();

        // Check whether the destination name or location matches the search
        const matchesSearch =
            !searchText ||
            destination.name?.toLowerCase().includes(searchText) ||
            destination.location?.toLowerCase().includes(searchText);

        // Check whether the selected category matches
        const matchesCategory =
            category === "All Places" ||
            destination.category === category;

        // Check whether the selected district matches
        const matchesDistrict =
            district === "" ||
            destination.district === district;

        // Return destinations that match all selected conditions
        return (
            matchesSearch &&
            matchesCategory &&
            matchesDistrict
        );
    });

    // Reset the search, category, district, and URL query parameter
    const clearFilters = () => {
        setSearch("");
        setCategory("All Places");
        setDistrict("");

        window.history.replaceState(
            {},
            "",
            "/destinations"
        );
    };

    return (
        <main className="page-container">

            {/* Page heading and introduction */}
            <div className="page-heading">

                <span className="eyebrow">
                    THE ISLAND IS CALLING
                </span>

                <h1>
                    Discover <span>Sri Lanka.</span>
                </h1>

                <p>
                    Find beautiful destinations for your next adventure.
                </p>

            </div>

            {/* Main destination search and filtering panel */}
            <div className="filter-panel">

                {/* Search destinations by name or location */}
                <div className="destination-search">

                    <Search size={20} />

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search destinations..."
                    />

                </div>

                {/* District selection dropdown */}
                <div className="district-filter">

                    <label htmlFor="district-select">
                        <MapPin size={17} />
                        Discover by District
                    </label>

                    <select
                        id="district-select"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                    >
                        <option value="">
                            Choose a district to explore
                        </option>

                        {/* Generate dropdown options from the districts array */}
                        {districts.map((item) => (
                            <option key={item} value={item}>
                                {item} District
                            </option>
                        ))}
                    </select>

                </div>

                {/* Category buttons for filtering destinations */}
                <div className="category-list">

                    {categories.map(({ name, icon: Icon }) => (

                        <button
                            key={name}
                            className={
                                category === name
                                    ? "category-button active"
                                    : "category-button"
                            }
                            onClick={() => setCategory(name)}
                        >
                            <Icon size={17} />
                            {name}
                        </button>

                    ))}

                </div>

                {/* Button for resetting all destination filters */}
                <button
                    className="clear-destination-filters"
                    onClick={clearFilters}
                >
                    Clear Filters
                </button>

            </div>

            {/* Display loading, filtered results, or an empty state */}
            {loading ? (

                <div className="loading-state">
                    <LoaderCircle className="spin" />
                    Loading destinations...
                </div>

            ) : filtered.length ? (

                <>

                    {/* Display the number of matching destinations */}
                    <p className="results-count">
                        {filtered.length} destinations found
                        {district ? ` in ${district} District` : ""}
                    </p>

                    {/* Display the filtered destination cards */}
                    <div className="destination-grid">

                        {filtered.map((destination) => (

                            <DestinationCard
                                key={destination.id}
                                destination={destination}
                            />

                        ))}

                    </div>

                </>

            ) : (

                /* Empty state displayed when no destinations match */
                <div className="empty-state">

                    <Compass size={40} />

                    <h3>No destinations found</h3>

                    <p>
                        Try another district, category or search.
                    </p>

                    <button
                        className="primary-button"
                        onClick={clearFilters}
                    >
                        Show All Destinations
                    </button>

                </div>

            )}

        </main>
    );
}


// --------------------------------------------------
// LOGIN AND REGISTER
// --------------------------------------------------

// Shared authentication component for both login and registration.
// The mode prop decides which form should be displayed.
function AuthPage({ mode, onLogin }) {

    // React Router navigation function
    const navigate = useNavigate();

    // Check whether the user is creating a new account
    const isRegister = mode === "register";

    // Form field states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // State for showing or hiding password characters
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // States for form submission and error feedback
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Handle login and registration form submission
    const handleSubmit = async (e) => {

        // Prevent the browser from refreshing the page
        e.preventDefault();

        // Clear any previous error message
        setError("");

        // Prevent another submission while a request is running
        if (loading) return;

        // Validate the full name during registration
        if (isRegister && name.trim().length < 2) {
            setError("Please enter your full name.");
            return;
        }

        // Check that the password contains at least 8 characters
        if (password.length < 8) {
            setError("Your password must contain at least 8 characters.");
            return;
        }

        // Make sure both passwords match during registration
        if (isRegister && password !== confirmPassword) {
            setError("The passwords do not match. Please try again.");
            return;
        }

        // Start the loading state
        setLoading(true);

        try {

            // Prepare the correct request for the selected authentication mode
            const result = isRegister
                ? await registerUser({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password
                })
                : await loginUser({
                    email: email.trim().toLowerCase(),
                    password
                });

            // Check that the backend returned a token and user
            if (!result?.token || !result?.user) {
                throw new Error(
                    result?.message || "Authentication failed. Please try again."
                );
            }

            // Save the JWT token and user information using the existing API helper
            saveAuth(result.token, result.user);

            // Update the logged-in user in the main application
            onLogin(result.user);

            // Navigate to the dashboard after successful authentication
            navigate("/dashboard");

        } catch (err) {

            // Show the error returned by the backend or API service
            setError(
                err.message || "Something went wrong. Please try again."
            );

        } finally {

            // Stop the loading indicator after the request finishes
            setLoading(false);

        }
    };

    return (

        <main className="auth-page">

            {/* -----------------------------------------
                LEFT SIDE: TRAVEL IMAGE AND INTRODUCTION
            ------------------------------------------ */}

            <div className="auth-visual">

                {/* Travel-themed background image */}
                <img
                    src="https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=85"
                    alt="Beautiful coastal scenery"
                />

                {/* Dark overlay to make the text easier to read */}
                <div className="auth-visual-overlay"></div>

                {/* Introductory content over the image */}
                <div className="auth-visual-content">

                    <Compass size={38} />

                    <h2>
                        Find your next
                        <br />
                        <span>happy place.</span>
                    </h2>

                    <p>
                        Discover beautiful destinations and make
                        unforgettable memories with TravelMate.
                    </p>

                </div>

            </div>

            {/* -----------------------------------------
                RIGHT SIDE: LOGIN OR REGISTER FORM
            ------------------------------------------ */}

            <div className="auth-form-side">

                <div className="auth-form">

                    {/* TravelMate logo linking to the home page */}
                    <Link to="/" className="auth-brand">
                        <Compass />
                        TravelMate.
                    </Link>

                    {/* Small heading above the form */}
                    <span className="eyebrow">
                        {isRegister
                            ? "JOIN THE ADVENTURE"
                            : "WELCOME BACK"}
                    </span>

                    {/* Main form heading */}
                    <h1>
                        {isRegister
                            ? "Create your account"
                            : "Welcome back!"}
                    </h1>

                    {/* Supporting description */}
                    <p>
                        {isRegister
                            ? "Create your account and start exploring Sri Lanka."
                            : "Sign in to continue your travel journey."}
                    </p>

                    {/* Authentication form */}
                    <form onSubmit={handleSubmit}>

                        {/* Full name field appears only during registration */}
                        {isRegister && (

                            <label htmlFor="auth-name">
                                Full name

                                <input
                                    id="auth-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    minLength={2}
                                    maxLength={100}
                                    required
                                />

                            </label>

                        )}

                        {/* Email address field */}
                        <label htmlFor="auth-email">
                            Email address

                            <input
                                id="auth-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />

                        </label>

                        {/* Password field with show/hide control */}
                        <label htmlFor="auth-password">
                            Password

                            <div className="auth-password-field">

                                <input
                                    id="auth-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete={
                                        isRegister
                                            ? "new-password"
                                            : "current-password"
                                    }
                                    minLength={8}
                                    required
                                />

                                {/* Button to show or hide the password */}
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword
                                        ? <EyeOff size={19} />
                                        : <Eye size={19} />}
                                </button>

                            </div>

                        </label>

                        {/* Confirm password field appears only during registration */}
                        {isRegister && (

                            <label htmlFor="auth-confirm-password">
                                Confirm password

                                <div className="auth-password-field">

                                    <input
                                        id="auth-confirm-password"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        placeholder="Enter your password again"
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                    />

                                    {/* Button to show or hide the confirmation password */}
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide confirmation password"
                                                : "Show confirmation password"
                                        }
                                    >
                                        {showConfirmPassword
                                            ? <EyeOff size={19} />
                                            : <Eye size={19} />}
                                    </button>

                                </div>

                            </label>

                        )}

                        {/* Password length guidance during registration */}
                        {isRegister && (
                            <p className="auth-password-hint">
                                Use at least 8 characters for your password.
                            </p>
                        )}

                        {/* Display authentication errors */}
                        {error && (
                            <div
                                className="form-error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        {/* Submit button with loading feedback */}
                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <LoaderCircle
                                        size={18}
                                        className="spin"
                                    />
                                    Please wait...
                                </>
                            ) : (
                                <>
                                    {isRegister
                                        ? "Create account"
                                        : "Sign in"}

                                    <ArrowRight size={18} />
                                </>
                            )}

                        </button>

                    </form>

                    {/* Link for switching between login and registration */}
                    <div className="auth-switch">

                        {isRegister
                            ? "Already have an account?"
                            : "New to TravelMate?"}

                        {" "}

                        <Link to={isRegister ? "/login" : "/register"}>
                            {isRegister ? "Sign in" : "Create account"}
                        </Link>

                    </div>

                    {/* Security information below the form */}
                    <div className="auth-security">

                        <ShieldCheck size={16} />

                        Your account is protected.

                    </div>

                </div>

            </div>

        </main>

    );
}

// --------------------------------------------------
// DASHBOARD
// --------------------------------------------------

// Dashboard component displaying the logged-in user's information
function Dashboard({ user, logout }) {

    // Store the verified user information retrieved from the backend
    const [verifiedUser, setVerifiedUser] = useState(user);

    // State for handling errors while retrieving user information
    const [error, setError] = useState("");

    // Fetch the current authenticated user's details when the dashboard loads
    useEffect(() => {

        getCurrentUser()
            .then((result) => setVerifiedUser(result.user))
            .catch((err) => setError(err.message));

    }, []);

    return (

        <main className="dashboard-page">

            {/* Dashboard welcome message */}
            <div className="dashboard-welcome">

                <span className="eyebrow">
                    YOUR TRAVEL SPACE
                </span>

                <h1>
                    Hello, <span>{verifiedUser?.name || "Traveller"}!</span>
                </h1>

                <p>
                    Welcome to your TravelMate dashboard.
                </p>

            </div>

            {/* Display an error if user information cannot be retrieved */}
            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}

            {/* Grid containing the profile and dashboard feature cards */}
            <div className="dashboard-grid">

                {/* User profile information card */}
                <div className="dashboard-card profile-card">

                    <div className="profile-avatar">
                        <UserRound size={32} />
                    </div>

                    <h2>{verifiedUser?.name}</h2>

                    <p>{verifiedUser?.email}</p>

                    <span className="member-tag">
                        <CheckCircle2 size={14} />
                        Registered member
                    </span>

                </div>

                {/* Dashboard card linking to the destinations page */}
                <div className="dashboard-card">

                    <div className="dashboard-card-icon">
                        <Compass />
                    </div>

                    <h3>Explore destinations</h3>

                    <p>
                        Discover beautiful places throughout Sri Lanka.
                    </p>

                    <Link to="/destinations" className="card-link">
                        Explore now <ArrowRight size={17} />
                    </Link>

                </div>

                {/* Dashboard card linking to itinerary management */}
                <div className="dashboard-card">

                    <div className="dashboard-card-icon orange">
                        <CalendarDays />
                    </div>

                    <h3>Travel itineraries</h3>

                    <p>
                        Create, manage and organize your own
                        Sri Lankan travel plans.
                    </p>

                    <Link to="/itineraries" className="card-link">
                        Plan your trip <ArrowRight size={17} />
                    </Link>

                </div>

            </div>

            {/* Button for logging out from the dashboard */}
            <button
                className="dashboard-logout"
                onClick={logout}
            >
                <LogOut size={17} />
                Sign out
            </button>

        </main>

    );

}

// --------------------------------------------------
// FOOTER
// --------------------------------------------------

// Footer component displayed at the bottom of the application
function Footer() {

    return (

        <footer className="footer">

            {/* TravelMate logo linking back to the home page */}
            <Link to="/" className="brand">

                <span className="brand-icon">
                    <Compass size={23} />
                </span>

                <span>
                    Travel<span className="brand-accent">Mate.</span>
                </span>

            </Link>

            {/* Short application description */}
            <p>
                Discover more. Travel better. Explore Sri Lanka.
            </p>

            {/* Display the current year automatically */}
            <span>
                © {new Date().getFullYear()} TravelMate.
                All rights reserved.
            </span>

        </footer>

    );

}

// --------------------------------------------------
// MAIN APP CONTENT
// --------------------------------------------------

// Main component managing application data, authentication, and routes
function AppContent() {

    // Initialize the user state using previously saved authentication data
    const [user, setUser] = useState(getSavedUser);

    // State variables for storing destination data and request status
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Function for retrieving destination data from the backend
    const loadDestinations = async () => {

        try {

            // Activate loading state and clear previous errors
            setLoading(true);
            setError("");

            // Request destination data using the API service
            const result = await getDestinations();

            // Store the returned destination array
            setDestinations(
                Array.isArray(result.data)
                    ? result.data
                    : []
            );

        } catch (err) {

            // Store an error message if the request fails
            setError(err.message);

        } finally {

            // Stop the loading state after the request completes
            setLoading(false);

        }
    };

    // Load destinations once when the main application content mounts
    useEffect(() => {
        loadDestinations();
    }, []);

    // Handle user logout and clear saved authentication information
    const logout = () => {

        // Remove authentication data from storage
        clearAuth();

        // Clear the current user from application state
        setUser(null);

        // Redirect the browser to the home page
        window.location.href = "/";

    };

    return (

        <div className="app">

            {/* Display the navigation bar across application pages */}
            <Navbar
                user={user}
                logout={logout}
            />

            {/* Define application routes and the components displayed for each route */}
            <Routes>

                {/* Home page route */}
                <Route
                    path="/"
                    element={
                        <Home
                            destinations={destinations}
                            loading={loading}
                            error={error}
                        />
                    }
                />

                {/* About page route */}
                <Route
                    path="/about"
                    element={<About />}
                />

                {/* Destinations listing page route */}
                <Route
                    path="/destinations"
                    element={
                        <Destinations
                            destinations={destinations}
                            loading={loading}
                        />
                    }
                />

                {/* Individual destination details route */}
                <Route
                    path="/destinations/:id"
                    element={<DestinationDetails />}
                />

                {/* Destination comparison page route */}
                <Route
                    path="/compare"
                    element={
                        <DestinationCompare
                            destinations={destinations}
                        />
                    }
                />

                {/* Login page route */}
                <Route
                    path="/login"
                    element={
                        user
                            ? <Dashboard user={user} logout={logout} />
                            : <AuthPage mode="login" onLogin={setUser} />
                    }
                />

                {/* Registration page route */}
                <Route
                    path="/register"
                    element={
                        user
                            ? <Dashboard user={user} logout={logout} />
                            : <AuthPage mode="register" onLogin={setUser} />
                    }
                />

                {/* Protected dashboard route */}
                <Route
                    path="/dashboard"
                    element={
                        user
                            ? <Dashboard user={user} logout={logout} />
                            : <AuthPage mode="login" onLogin={setUser} />
                    }
                />

                {/* Protected itinerary management route */}
                <Route
                    path="/itineraries"
                    element={
                        user
                            ? <Itineraries />
                            : <AuthPage mode="login" onLogin={setUser} />
                    }
                />

                {/* Fallback route for URLs that do not match an existing page */}
                <Route
                    path="*"
                    element={
                        <div className="empty-state">

                            <h2>Page not found</h2>

                            <Link to="/" className="primary-button">
                                Go home
                            </Link>

                        </div>
                    }
                />

            </Routes>

            {/* Display the footer below the current page */}
            <Footer />

        </div>

    );

}

// --------------------------------------------------
// APP ENTRY
// --------------------------------------------------

// Main application component that enables browser-based routing
export default function App() {

    return (

        <BrowserRouter>
            <AppContent />
        </BrowserRouter>

    );

}
