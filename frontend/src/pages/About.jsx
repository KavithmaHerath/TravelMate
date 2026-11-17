import { Link } from "react-router-dom";
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
import "./About.css";

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

function About() {
    return (
        <main className="about-page">

            <section className="about-hero">
                <div className="about-hero-content">
                    <span className="about-tag">
                        <Sparkles size={16} />
                        GET TO KNOW TRAVELMATE
                    </span>

                    <h1>
                        Discover more.
                        <br />
                        <span>Travel better.</span>
                    </h1>

                    <p>
                        Your little guide to discovering the beauty,
                        culture and unforgettable destinations of Sri Lanka.
                    </p>

                    <Link to="/destinations" className="about-hero-button">
                        Explore Sri Lanka <ArrowRight size={18} />
                    </Link>
                </div>

                <div className="about-hero-image">
                    <img
                        src="https://images.unsplash.com/photo-1546708973-b339540b5162?w=1000&q=85"
                        alt="Beautiful tropical landscape"
                    />
                    <div className="about-image-note">
                        <MapPin size={17} />
                        The beautiful island of Sri Lanka
                    </div>
                </div>
            </section>

            <section className="about-story">
                <div className="about-story-icon">
                    <Compass size={36} />
                </div>

                <span className="about-small-heading">OUR STORY</span>

                <h2>
                    Making every journey
                    <span> easier to discover.</span>
                </h2>

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

            <section className="about-mission">
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

            <section className="about-features">
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

                <div className="about-feature-grid">
                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <article
                                className="about-feature-card"
                                key={feature.title}
                            >
                                <div className={`about-feature-icon ${feature.color}`}>
                                    <Icon size={28} />
                                </div>

                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="about-beauty">
                <div>
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

                    <Link to="/destinations">
                        Discover destinations <ArrowRight size={18} />
                    </Link>
                </div>

                <div className="about-beauty-icons">
                    <div><Waves size={32} /><span>Beaches</span></div>
                    <div><Mountain size={32} /><span>Mountains</span></div>
                    <div><Compass size={32} /><span>Adventure</span></div>
                </div>
            </section>

        </main>
    );
}

export default About;