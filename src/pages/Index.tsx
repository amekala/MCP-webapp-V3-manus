import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';

export const Index: React.FC = () => {
  return (
    <>
      <Header />
      <main className="landing-page">
        <section className="hero">
          <Container>
            <div className="hero-content">
              <h1>Simplify Amazon Advertising API Authentication</h1>
              <p className="hero-subtitle">
                Connect your Amazon Advertising accounts in seconds and securely manage API access for developers.
              </p>
              <div className="hero-actions">
                <Link to="/auth" className="primary-button">
                  Get Started
                </Link>
                <a href="#features" className="secondary-button">
                  Learn More
                </a>
              </div>
            </div>
          </Container>
        </section>

        <section id="features" className="features">
          <Container>
            <h2 className="section-title">Why Use AdsConnect?</h2>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🔐</div>
                <h3>Simple Authentication</h3>
                <p>
                  One-click authentication with Amazon Advertising accounts.
                  No more complex OAuth implementation or token management.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🔄</div>
                <h3>Automatic Token Refresh</h3>
                <p>
                  Tokens are automatically refreshed in the background.
                  Never worry about expired credentials again.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🔑</div>
                <h3>API Key Management</h3>
                <p>
                  Generate and revoke API keys for developers.
                  Control access to your advertising data with ease.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Campaign Data Access</h3>
                <p>
                  Access campaign data through a simple API.
                  Build custom reporting and optimization tools.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🛡️</div>
                <h3>Enhanced Security</h3>
                <p>
                  Your Amazon credentials are never exposed to third parties.
                  All tokens are securely encrypted at rest.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">👨‍💻</div>
                <h3>Developer Friendly</h3>
                <p>
                  Simple API documentation and integration guides.
                  Reduce development time for Amazon Ads integrations.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className="how-it-works">
          <Container>
            <h2 className="section-title">How It Works</h2>
            
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Connect Your Account</h3>
                <p>
                  Sign up for AdsConnect and connect your Amazon Advertising
                  account with a single click.
                </p>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <h3>Generate API Keys</h3>
                <p>
                  Create API keys for your developers or tools to access
                  your advertising data securely.
                </p>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <h3>Access Campaign Data</h3>
                <p>
                  Use the API keys to access campaign data, create reports,
                  and build optimization tools.
                </p>
              </div>
            </div>
            
            <div className="cta-container">
              <Link to="/auth" className="primary-button">
                Create Your Account
              </Link>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Index;
