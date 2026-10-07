"use client";

import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

/**
 * marketing/real-time-offer.html → React. Static markup port (no JS).
 * The sidebar-loader.js script is dropped (the shell owns the sidebar).
 */
export default function RealTimeOfferPage() {
  return (
    <div id="pg-marketing-real-time-offer">
      <div className="main-content">
        <div className="promo-container">
          <div className="bg-curve" />

          <div className="promo-content">
            <div className="promo-left">
              <div className="promo-badge">
                <i className="fas fa-star" style={{ fontSize: "9px" }} /> Exclusive Offer
              </div>
              <h1 className="typ-page-heading promo-title">
                Manage Your Restaurant <br />
                <span>On The Go</span>
              </h1>
              <p className="promo-subtitle">
                Streamline your restaurant operations, track orders, and boost your sales with our intuitive mobile
                app. Download now for exclusive real-time offers!
              </p>

              <div className="store-buttons">
                <a href="#" className="store-btn">
                  <i className="fab fa-google-play" />
                  <div className="store-btn-text">
                    <span className="small">GET IT ON</span>
                    <span className="large">Google Play</span>
                  </div>
                </a>
                <a href="#" className="store-btn">
                  <i className="fab fa-apple" />
                  <div className="store-btn-text">
                    <span className="small">Download on the</span>
                    <span className="large">App Store</span>
                  </div>
                </a>
              </div>

              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="fas fa-chart-line" />
                  </div>
                  <div className="feature-text">
                    <h4>Boost Sales</h4>
                    <p>Increase your revenue with smart insights.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="fas fa-clock" />
                  </div>
                  <div className="feature-text">
                    <h4>Real-time Updates</h4>
                    <p>Get instant alerts for orders and customers.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="fas fa-cog" />
                  </div>
                  <div className="feature-text">
                    <h4>Easy Management</h4>
                    <p>Manage everything from your phone.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="promo-right">
              <div className="float-icon float-heart">
                <i className="fas fa-heart" />
              </div>
              <div className="float-icon float-bell">
                <i className="fas fa-bell" />
              </div>
              <div className="float-icon float-star">
                <i className="fas fa-star" />
              </div>

              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="phone-notch" />

                  <div className="phone-header">
                    <div className="phone-logo">FOOD CHOW</div>
                    <div className="phone-icon-wrapper">
                      <i className="fas fa-store" />
                    </div>
                  </div>

                  <div className="phone-body">
                    <div className="phone-title">
                      Take your restaurant<br />online today
                    </div>
                    <div className="phone-subtitle">
                      Increase your business with your own online ordering platform seamlessly.
                    </div>

                    <button className="phone-btn">SIGN UP NOW</button>

                    <div>
                      <span style={{ fontSize: "10px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                        Already have an account?
                      </span>
                      <a href="#" className="phone-link">
                        Log In Here
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <WizardFooter />
      </div>
    </div>
  );
}
