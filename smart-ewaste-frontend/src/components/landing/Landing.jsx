/**
 * Landing Page Component
 * 
 * Features:
 * - Interactive hero section with logo
 * - Feature showcase with animations
 * - Call-to-action buttons
 * - Responsive design
 * - Smooth scrolling
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Landing.css';

const Landing = () => {
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  // Handle scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: '♻️',
      title: 'Easy Collection',
      description: 'Request e-waste collection from your doorstep with just a few clicks',
    },
    {
      icon: '🌍',
      title: 'Eco-Friendly',
      description: 'Help protect the environment by properly disposing electronic waste',
    },
    {
      icon: '🏆',
      title: 'Certified Process',
      description: 'Work with certified e-waste management partners for safe disposal',
    },
    {
      icon: '📱',
      title: 'Track & Monitor',
      description: 'Monitor your requests in real-time and get instant updates',
    },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
        <div className="hero-content">
          <div className="logo-container">
            <div className="logo-circle">
              <span className="logo-text">♻️</span>
            </div>
          </div>

          <h1 className="hero-title">Smart E-Waste Collection</h1>
          <p className="hero-subtitle">
            Responsible E-Waste Management for a Sustainable Tomorrow
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>

          <div className="scroll-indicator">
            <span>Scroll to explore</span>
            <div className="mouse">
              <div className="wheel"></div>
            </div>
          </div>
        </div>

        <div className="hero-background">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose Us?</h2>
        <p className="section-subtitle">Our commitment to responsible e-waste management</p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card ${activeFeature === index ? 'active' : ''}`}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up with your email and basic information</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Submit Request</h3>
            <p>Tell us about your e-waste items</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Schedule Pickup</h3>
            <p>Choose a convenient time and date</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Safe Disposal</h3>
            <p>Your e-waste is disposed responsibly</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stat-item">
          <div className="stat-number">10K+</div>
          <p>Users Served</p>
        </div>
        <div className="stat-item">
          <div className="stat-number">50K+</div>
          <p>Items Recycled</p>
        </div>
        <div className="stat-item">
          <div className="stat-number">98%</div>
          <p>Satisfaction Rate</p>
        </div>
        <div className="stat-item">
          <div className="stat-number">25+</div>
          <p>Partner Centers</p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <h2>Join Our Movement</h2>
        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="benefit-icon">🛡️</span>
            <h3>100% Safe</h3>
            <p>Your data is encrypted and protected</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">⚡</span>
            <h3>Fast Service</h3>
            <p>Quick scheduling and instant notifications</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">💚</span>
            <h3>Eco-Friendly</h3>
            <p>Making a real difference for our planet</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🤝</span>
            <h3>Community</h3>
            <p>Join thousands of responsible users</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to Make a Difference?</h2>
        <p>Start your journey towards responsible e-waste management today</p>
        <div className="cta-buttons">
          <Link to="/register" className="btn btn-primary btn-large">
            Create Account Now
          </Link>
          <Link to="/login" className="btn btn-outline btn-large">
            Already a Member? Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Smart E-Waste</h4>
            <p>Responsible e-waste management for a sustainable future</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: info@smartewaste.com</p>
            <p>Phone: +1-800-EWASTE</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Smart E-Waste Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
