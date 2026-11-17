
import { useEffect, useState } from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    NavLink,
    useNavigate,
    useLocation
} from "react-router-dom";

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
    CheckCircle2
} from "lucide-react";

import {
    getDestinations,
    registerUser,
    loginUser,
    getCurrentUser,
    getSavedUser,
    saveAuth,
    clearAuth
} from "./services/api";

import Itineraries from "./pages/Itineraries";
import DestinationDetails from "./pages/DestinationDetails";
import DestinationCompare from "./pages/DestinationCompare";
import About from "./pages/About";

import "./App.css";

const HERO_IMAGE =
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&q=85";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80";

const categories = [
    { name: "All Places", icon: Compass },
    { name: "Beach", icon: Waves },
    { name: "Nature", icon: TreePalm },
    { name: "Historical", icon: Landmark },
    { name: "Adventure", icon: Mountain }
];

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

function ScrollToTop() {
    const { pathname } = useLocation();

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

function Navbar({ user, logout }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="navbar">

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

            <button
                className="mobile-menu"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                {menuOpen ? <X /> : <Menu />}
            </button>

            <nav className={menuOpen ? "nav-links open" : "nav-links"}>

                <NavLink
                    to="/"
                    end
                    onClick={() => setMenuOpen(false)}
                >
                    Home
                </NavLink>

                <NavLink
                    to="/about"
                    onClick={() => setMenuOpen(false)}
                >
                    About
                </NavLink>

                <NavLink
                    to="/destinations"
                    onClick={() => setMenuOpen(false)}
                >
                    Destinations
                </NavLink>

                <NavLink
                    to="/compare"
                    onClick={() => setMenuOpen(false)}
                >
                    Compare
                </NavLink>

                {user ? (
                    <>
                        <NavLink
                            to="/dashboard"
                            onClick={() => setMenuOpen(false)}
                        >
                            My Dashboard
                        </NavLink>

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

function DestinationCard({ destination }) {
    const [saved, setSaved] = useState(false);

    return (
        <article className="destination-card">

            <div className="destination-image">

                <img
                    src={destination.image || FALLBACK_IMAGE}
                    alt={destination.name}
                    onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                />

                <span className="category-tag">
                    {destination.category}
                </span>

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

            <div className="destination-info">

                <div className="destination-location">
                    <MapPin size={14} />
                    {destination.location}
                </div>

                <h3>{destination.name}</h3>

                <p>{destination.description}</p>

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

function Home({ destinations, loading, error }) {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const featured = destinations.slice(0, 4);

    const handleSearch = (e) => {
        e.preventDefault();

        navigate(
            `/destinations?search=${encodeURIComponent(search)}`
        );
    };

    return (
        <>

            <section className="hero">

                <img
                    className="hero-background"
                    src={HERO_IMAGE}
                    alt=""
                />

                <div className="hero-overlay"></div>

                <div className="hero-content">

                    <div className="hero-badge">
                        <Sparkles size={15} />
                        YOUR NEXT ADVENTURE STARTS HERE
                    </div>

                    <h1>
                        Discover the magic
                        <br />
                        of <span>Sri Lanka.</span>
                    </h1>

                    <p>
                        From golden beaches to misty mountains,
                        discover unforgettable places and plan
                        your perfect island adventure.
                    </p>

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

                <div className="hero-bottom">
                    <span>THE PEARL OF THE INDIAN OCEAN</span>
                    <span>06°55' N — 79°51' E</span>
                </div>

            </section>

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

                    <Link
                        to="/destinations"
                        className="outline-button"
                    >
                        View all destinations
                        <ArrowRight size={17} />
                    </Link>

                </div>

                {loading ? (
                    <div className="loading-state">
                        <LoaderCircle className="spin" />
                        Loading destinations...
                    </div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : featured.length ? (
                    <div className="destination-grid">

                        {featured.map((destination) => (
                            <DestinationCard
                                key={destination.id}
                                destination={destination}
                            />
                        ))}

                    </div>
                ) : (
                    <div className="empty-state">
                        No destinations available yet.
                    </div>
                )}

            </section>

            {/* HOME PAGE ABOUT SECTION */}

            <section className="about-section" id="about">

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

                    <Link
                        to="/about"
                        className="primary-button"
                    >
                        Learn more about us
                        <ArrowRight size={18} />
                    </Link>

                </div>

            </section>

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

function Destinations({ destinations, loading }) {

    const [search, setSearch] = useState(
        () => new URLSearchParams(window.location.search).get("search") || ""
    );

    const [category, setCategory] = useState("All Places");
    const [district, setDistrict] = useState("");

    const filtered = destinations.filter((destination) => {

        const searchText = search.trim().toLowerCase();

        const matchesSearch =
            !searchText ||
            destination.name?.toLowerCase().includes(searchText) ||
            destination.location?.toLowerCase().includes(searchText);

        const matchesCategory =
            category === "All Places" ||
            destination.category === category;

        const matchesDistrict =
            district === "" ||
            destination.district === district;

        return (
            matchesSearch &&
            matchesCategory &&
            matchesDistrict
        );
    });

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

            <div className="filter-panel">

                <div className="destination-search">

                    <Search size={20} />

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search destinations..."
                    />

                </div>

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

                        {districts.map((item) => (
                            <option key={item} value={item}>
                                {item} District
                            </option>
                        ))}
                    </select>

                </div>

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

                <button
                    className="clear-destination-filters"
                    onClick={clearFilters}
                >
                    Clear Filters
                </button>

            </div>

            {loading ? (

                <div className="loading-state">
                    <LoaderCircle className="spin" />
                    Loading destinations...
                </div>

            ) : filtered.length ? (

                <>

                    <p className="results-count">
                        {filtered.length} destinations found
                        {district ? ` in ${district} District` : ""}
                    </p>

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

function AuthPage({ mode, onLogin }) {

    const navigate = useNavigate();

    const isRegister = mode === "register";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const result = isRegister
                ? await registerUser({ name, email, password })
                : await loginUser({ email, password });

            saveAuth(result.token, result.user);

            onLogin(result.user);

            navigate("/dashboard");

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }
    };

    return (

        <main className="auth-page">

            <div className="auth-visual">

                <img
                    src="https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=85"
                    alt="Sri Lankan coastal scenery"
                />

                <div className="auth-visual-overlay"></div>

                <div className="auth-visual-content">

                    <Compass size={38} />

                    <h2>
                        Find your next
                        <br />
                        <span>happy place.</span>
                    </h2>

                    <p>
                        Discover beautiful destinations and make
                        unforgettable memories.
                    </p>

                </div>

            </div>

            <div className="auth-form-side">

                <div className="auth-form">

                    <Link to="/" className="auth-brand">
                        <Compass /> TravelMate.
                    </Link>

                    <span className="eyebrow">
                        {isRegister
                            ? "JOIN THE ADVENTURE"
                            : "WELCOME BACK"}
                    </span>

                    <h1>
                        {isRegister
                            ? "Create your account"
                            : "Welcome back!"}
                    </h1>

                    <p>
                        {isRegister
                            ? "Start exploring Sri Lanka with TravelMate."
                            : "Sign in to continue your travel journey."}
                    </p>

                    <form onSubmit={handleSubmit}>

                        {isRegister && (

                            <label>
                                Full name

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    minLength={2}
                                    maxLength={100}
                                    required
                                />

                            </label>

                        )}

                        <label>
                            Email address

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />

                        </label>

                        <label>
                            Password

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 8 characters"
                                minLength={8}
                                required
                            />

                        </label>

                        {error && (
                            <div className="form-error">
                                {error}
                            </div>
                        )}

                        <button
                            className="auth-submit"
                            disabled={loading}
                        >

                            {loading
                                ? "Please wait..."
                                : isRegister
                                    ? "Create account"
                                    : "Sign in"}

                            {!loading && <ArrowRight size={18} />}

                        </button>

                    </form>

                    <div className="auth-switch">

                        {isRegister
                            ? "Already have an account?"
                            : "New to TravelMate?"}

                        {" "}

                        <Link to={isRegister ? "/login" : "/register"}>
                            {isRegister ? "Sign in" : "Create account"}
                        </Link>

                    </div>

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

function Dashboard({ user, logout }) {

    const [verifiedUser, setVerifiedUser] = useState(user);
    const [error, setError] = useState("");

    useEffect(() => {

        getCurrentUser()
            .then((result) => setVerifiedUser(result.user))
            .catch((err) => setError(err.message));

    }, []);

    return (

        <main className="dashboard-page">

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

            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}

            <div className="dashboard-grid">

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

function Footer() {

    return (

        <footer className="footer">

            <Link to="/" className="brand">

                <span className="brand-icon">
                    <Compass size={23} />
                </span>

                <span>
                    Travel<span className="brand-accent">Mate.</span>
                </span>

            </Link>

            <p>
                Discover more. Travel better. Explore Sri Lanka.
            </p>

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

function AppContent() {

    const [user, setUser] = useState(getSavedUser);

    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDestinations = async () => {

        try {

            setLoading(true);
            setError("");

            const result = await getDestinations();

            setDestinations(
                Array.isArray(result.data)
                    ? result.data
                    : []
            );

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        loadDestinations();
    }, []);

    const logout = () => {

        clearAuth();

        setUser(null);

        window.location.href = "/";

    };

    return (

        <div className="app">

            <Navbar
                user={user}
                logout={logout}
            />

            <Routes>

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

                <Route
                    path="/about"
                    element={<About />}
                />

                <Route
                    path="/destinations"
                    element={
                        <Destinations
                            destinations={destinations}
                            loading={loading}
                        />
                    }
                />

                <Route
                    path="/destinations/:id"
                    element={<DestinationDetails />}
                />

                <Route
                    path="/compare"
                    element={
                        <DestinationCompare
                            destinations={destinations}
                        />
                    }
                />

                <Route
                    path="/login"
                    element={
                        user
                            ? <Dashboard user={user} logout={logout} />
                            : <AuthPage mode="login" onLogin={setUser} />
                    }
                />

                <Route
                    path="/register"
                    element={
                        user
                            ? <Dashboard user={user} logout={logout} />
                            : <AuthPage mode="register" onLogin={setUser} />
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        user
                            ? <Dashboard user={user} logout={logout} />
                            : <AuthPage mode="login" onLogin={setUser} />
                    }
                />

                <Route
                    path="/itineraries"
                    element={
                        user
                            ? <Itineraries />
                            : <AuthPage mode="login" onLogin={setUser} />
                    }
                />

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

            <Footer />

        </div>

    );
}

// --------------------------------------------------
// APP ENTRY
// --------------------------------------------------

export default function App() {

    return (

        <BrowserRouter>
            <AppContent />
        </BrowserRouter>

    );

}
