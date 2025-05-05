import React, { useState } from "react";
import "../styles/Landing.css";
import Drop from "../components/Drop"; // Import the Drop component

// Feature Cards
const cards = [
  {
    id: 1,
    title: "Remove Metadata",
    image: require("../assets/images/remove_metadata.jpeg"),
    description: "Strip image files of EXIF data that may reveal personal info."
  },
  {
    id: 2,
    title: "Scan for Malware",
    image: require("../assets/images/scan_for_malware.jpeg"),
    description: "Check files for malicious content before sharing."
  },
  {
    id: 3,
    title: "Privacy Insights",
    image: require("../assets/images/privacy_insights.jpeg"),
    description: "Get a detailed breakdown of privacy-sensitive metadata."
  },
  {
    id: 4,
    title: "QR Malware Detector",
    image: require("../assets/images/qr_code_safety.jpeg"),
    description: "Check for hidden malware in QR."
  },
  {
    id: 5,
    title: "Device Info Removal",
    image: require("../assets/images/device_info.jpeg"),
    description: "Clean device-identifying tags hidden inside files."
  }
];

// Feature Carousel (Updated Logic for 3 Cards Visible with Center Enlarged)
const FeatureCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getVisibleCards = () => {
    const total = cards.length;
    return [
      cards[(currentIndex + total - 1) % total], // Previous card
      cards[currentIndex], // Center card (current)
      cards[(currentIndex + 1) % total] // Next card
    ];
  };

  return (
    <section className="carousel-section">
      <h2 className="carousel-heading">What do we Offer?</h2>
      <div className="carousel-container">
        {getVisibleCards().map((card, index) => (
          <div
            key={card.id}
            className={`carousel-card ${index === 1 ? "focused" : ""}`}
          >
            <img src={card.image} alt={card.title} className="card-image" />
            <div className="card-info">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Main Landing Page Component
const Landing = () => {
  const [goToDragDrop, setGoToDragDrop] = useState(false);
  const dragDropSectionRef = React.useRef(null);

  const handleCleanButtonClick = () => {
    setGoToDragDrop(true);
    // Smooth scroll to the drag-drop section using ref
    dragDropSectionRef.current.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="landing-container">
      <header>
        <h1 className="main-heading">Welcome to MetaShield</h1>
        <p className="intro-description">
          MetaShield helps you safeguard your privacy by removing metadata,
          scanning for malware, and giving you insights into the files you share.
        </p>

        {/* Clean Button with styled class */}
        <button
          className="clean-button"
          onClick={handleCleanButtonClick}
        >
          Clean
        </button>
      </header>

      {/* Feature Carousel */}
      <FeatureCarousel />

      {/* Drag-Drop Section with ref */}
      <section
        id="drag-drop-section"
        className="drag-drop-section"
        ref={dragDropSectionRef}
      >
        <Drop scrollIntoView={goToDragDrop} />
      </section>

      <div className="spacer"></div>

      <footer>
        <p className="copyright">© 2025 MetaShield. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
