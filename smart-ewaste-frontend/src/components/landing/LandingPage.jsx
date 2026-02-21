/**
 * Landing Page Component
 * 
 * Features:
 * - Hero section with headline and CTA buttons
 * - Feature highlights with icons
 * - Eco-friendly design theme
 * - Responsive layout
 */

import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <div className="logo-section">
              <span className="logo-icon">♻️</span>
              <h1 className="main-headline">
                Smart e-Waste Collection & Management Made Easy
              </h1>
            </div>
            
            <p className="sub-headline">
              Dispose your electronic waste responsibly with just a few clicks!
            </p>
            
            <p className="description">
              Request pickup, track your disposal status, and contribute to a cleaner planet.
            </p>

            {/* CTA Buttons */}
            <div className="cta-buttons">
              <Link to="/register" className="cta-button cta-signup">
                <span className="button-icon">🔹</span> Get Started in Seconds
              </Link>
              <Link to="/login" className="cta-button cta-login">
                <span className="button-icon">🔹</span> Access Your Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="info-section">
        <div className="info-content">
          <h2>How It Works</h2>
          <p className="info-text">
            Our platform connects you with authorized e-waste recyclers.<br />
            Say goodbye to clutter — recycle your old devices safely and efficiently.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="features-title">Why Choose Us?</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Schedule Doorstep Pickup</h3>
            <p>Book convenient pickup slots at your home or office. We come to you!</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Track Request Status</h3>
            <p>Monitor your e-waste disposal in real-time from request to completion.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>Eco-Friendly Recycling</h3>
            <p>100% environmentally responsible disposal following green standards.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Trusted Process</h3>
            <p>Government-aligned and certified recycling partners you can trust.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Data Destruction</h3>
            <p>Complete data wiping services ensuring your personal information is safe.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Quick Response</h3>
            <p>Fast pickup scheduling with same-day or next-day service availability.</p>
          </div>
        </div>
      </section>

      {/* Accepted Items Section */}
      <section className="accepted-items-section">
        <h2>What We Accept</h2>
        <div className="items-grid-two-rows">
          <div className="item-card">
            <div className="item-icon">💻</div>
            <h4>Computers & Laptops</h4>
          </div>
          <div className="item-card">
            <div className="item-icon">📱</div>
            <h4>Mobile Phones & Tablets</h4>
          </div>
          <div className="item-card">
            <div className="item-icon">📺</div>
            <h4>TVs & Monitors</h4>
          </div>
          <div className="item-card">
            <div className="item-icon">🖨️</div>
            <h4>Printers & Scanners</h4>
          </div>
          <div className="item-card">
            <div className="item-icon">🎮</div>
            <h4>Gaming Consoles</h4>
          </div>
          <div className="item-card">
            <div className="item-icon">⌨️</div>
            <h4>Keyboards & Accessories</h4>
          </div>
        </div>
      </section>

     

      {/* How It Works Steps */}
      <section className="steps-section">
        <h2>Simple 4-Step Process</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Register</h3>
            <p>Create your free account in seconds</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Schedule</h3>
            <p>Select device type and pickup location</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Pickup</h3>
            <p>We collect your e-waste from your doorstep</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Recycle</h3>
            <p>Your devices are responsibly recycled</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>What Our Users Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="quote-icon">"</div>
            <p className="testimonial-text">
              "Super convenient! They picked up my old laptop within 2 days. Great service!"
            </p>
            <div className="testimonial-author">- Priya S.</div>
          </div>
          <div className="testimonial-card">
            <div className="quote-icon">"</div>
            <p className="testimonial-text">
              "Finally, a hassle-free way to dispose of electronic waste. Highly recommended!"
            </p>
            <div className="testimonial-author">- Rahul K.</div>
          </div>
          <div className="testimonial-card">
            <div className="quote-icon">"</div>
            <p className="testimonial-text">
              "Professional team and excellent tracking system. Made recycling so easy!"
            </p>
            <div className="testimonial-author">- Anjali M.</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Make a Difference?</h2>
        <p>Join thousands of users who are contributing to a cleaner planet</p>
        <Link to="/register" className="cta-button-large">
          Start Recycling Today
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p className="footer-tagline">
            <span className="footer-icon">🌍</span> 
            "Recycle today. Save tomorrow."
          </p>
          <p className="footer-copyright">
            © 2025 Smart e-Waste Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
