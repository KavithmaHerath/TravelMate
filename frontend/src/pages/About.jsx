
// Import Link to navigate between pages without reloading the application.
import { Link } from "react-router-dom";

// Import icons used throughout the About page.
import {
    Compass,
    MapPin,
    Heart,
    Globe2,
    Mountain,
    Waves,
    CalendarDays,
    ArrowRight,
    Sparkles
} from "lucide-react";

// Import the CSS styles for the About page.
import "./About.css";

// Store the information displayed in the TravelMate feature cards.
// Each feature contains an icon, title, description, and colour style.
const features = [
    {
        icon: Compass,
        title: "Discover Destinations",
        description:
            "Explore beautiful beaches, mountains, historical places and hidden gems across Sri Lanka.",
        color: "purple"
    },
    {
        icon: CalendarDays,
        title: "Plan Your Journey",
        description:
            "Create your own travel itineraries and organize the destinations you want to visit.",
        color: "orange"
    },
    {
        icon: Heart,
        title: "Compare Your Choices",
        description:
            "Compare destinations and explore their travel information before choosing your next adventure.",
        color: "pink"
    }
];

// Main About page component.
function About() {
    return (
        <main className="about-page">

            {/* Hero section introducing the TravelMate platform. */}
            <section className="about-hero">
                <div className="about-hero-content">

                    {/* Small introductory label with a decorative icon. */}
                    <span className="about-tag">
                        <Sparkles size={16} />
                        GET TO KNOW TRAVELMATE
                    </span>

                    {/* Main heading of the About page. */}
                    <h1>
                        Discover more.
                        <br />
                        <span>Travel better.</span>
                    </h1>

                    {/* Short introduction to TravelMate. */}
                    <p>
                        Your little guide to discovering the beauty,
                        culture and unforgettable destinations of Sri Lanka.
                    </p>

                    {/* Navigation link to the destinations page. */}
                    <Link to="/destinations" className="about-hero-button">
                        Explore Sri Lanka <ArrowRight size={18} />
                    </Link>
                </div>

                {/* Hero image and location information. */}
                <div className="about-hero-image">
                    <img
                        src="https://images.unsplash.com/photo-1546708973-b339540b5162?w=1000&q=85"
                        alt="Beautiful tropical landscape"
                    />

                    {/* Location note displayed over the image. */}
                    <div className="about-image-note">
                        <MapPin size={17} />
                        The beautiful island of Sri Lanka
                    </div>
                </div>
            </section>

            {/* Story section explaining the purpose of TravelMate. */}
            <section className="about-story">

                {/* Decorative compass icon. */}
                <div className="about-story-icon">
                    <Compass size={36} />
                </div>

                <span className="about-small-heading">OUR STORY</span>

                {/* Main story heading. */}
                <h2>
                    Making every journey
                    <span> easier to discover.</span>
                </h2>

                {/* Description of the TravelMate platform. */}
                <p>
                    TravelMate is a travel planning and destination
                    discovery platform created to help people explore
                    the amazing places of Sri Lanka.

                    Whether you love relaxing on golden beaches,
                    exploring green mountains or discovering historical
                    landmarks, TravelMate helps you find places,
                    learn about destinations and organize your
                    travel plans in one place.
                </p>
            </section>

            {/* Mission and vision section. */}
            <section className="about-mission">

                {/* Mission card describing the platform's main purpose. */}
                <div className="mission-card mission-one">
                    <div className="mission-icon">
                        <Globe2 size={30} />
                    </div>

                    <span>OUR MISSION</span>
                    <h3>Make travel discovery simple.</h3>

                    <p>
                        Help travellers discover destinations and
                        access useful travel information through
                        one easy-to-use platform.
                    </p>
                </div>

                {/* Vision card describing the platform's future goal. */}
                <div className="mission-card mission-two">
                    <div className="mission-icon">
                        <Heart size={30} />
                    </div>

                    <span>OUR VISION</span>
                    <h3>Inspire more adventures.</h3>

                    <p>
                        Encourage people to explore the beauty,
                        culture and diversity of Sri Lanka.
                    </p>
                </div>
            </section>

            {/* Section highlighting the main TravelMate features. */}
            <section className="about-features">

                {/* Heading and introduction for the feature cards. */}
                <div className="about-section-heading">
                    <span className="about-small-heading">
                        WHAT YOU CAN DO
                    </span>

                    <h2>
                        Explore with <span>TravelMate.</span>
                    </h2>

                    <p>
                        Everything you need to start planning
                        your next journey.
                    </p>
                </div>

                {/* Generate feature cards dynamically from the features array. */}
                <div className="about-feature-grid">
                    {features.map((feature) => {

                        // Get the icon component for the current feature.
                        const Icon = feature.icon;

                        return (
                            <article
                                className="about-feature-card"
                                key={feature.title}
                            >
                                {/* Display the feature icon with its assigned colour. */}
                                <div className={`about-feature-icon ${feature.color}`}>
                                    <Icon size={28} />
                                </div>

                                {/* Display the feature title and description. */}
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </article>
                        );
                    })}
                </div>
            </section>

            {/* Final section encouraging visitors to explore Sri Lanka. */}
            <section className="about-beauty">
                <div>

                    {/* Introductory text about Sri Lanka. */}
                    <span>THE PEARL OF THE INDIAN OCEAN</span>

                    <h2>
                        So many places.
                        <br />
                        So many stories.
                    </h2>

                    <p>
                        From peaceful beaches to beautiful mountain
                        landscapes, your next discovery is waiting.
                    </p>

                    {/* Link to browse available destinations. */}
                    <Link to="/destinations">
                        Discover destinations <ArrowRight size={18} />
                    </Link>
                </div>

                {/* Decorative icons representing different travel experiences. */}
                <div className="about-beauty-icons">
                    <div><Waves size={32} /><span>Beaches</span></div>
                    <div><Mountain size={32} /><span>Mountains</span></div>
                    <div><Compass size={32} /><span>Adventure</span></div>
                </div>
            </section>

        </main>
    );
}

// Export the About component so it can be used in the application routes.
export default About;
