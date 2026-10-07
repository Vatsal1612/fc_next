"use client";

import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

/**
 * marketing/whatsapp-marketing.html → React. Static markup port (no JS).
 * The sidebar-loader.js script is dropped (the shell owns the sidebar).
 */
export default function WhatsappMarketingPage() {
  return (
    <div id="pg-marketing-whatsapp-marketing">
      <div className="app-container">
        <div className="main">
          <div className="content-area">
            <div className="hero-card">
              <div className="wa-icon-wrapper">
                <i className="fab fa-whatsapp" />
              </div>

              <h1 className="typ-page-heading hero-title">
                Boost Your Orders with <br />
                <span>WhatsApp Automation</span>
              </h1>
              <div className="hero-subtitle">
                Engage customers, send promotions, and automate order updates — all on WhatsApp.
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="far fa-comment-alt" />
                  </div>
                  <div className="feature-title">24/7 Auto Replies</div>
                  <div className="feature-desc">Never miss a customer message with automated responses</div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-bullhorn" />
                  </div>
                  <div className="feature-title">Broadcast Promotions</div>
                  <div className="feature-desc">Send targeted offers to your customer base instantly</div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="far fa-bell" />
                  </div>
                  <div className="feature-title">Instant Order Notifications</div>
                  <div className="feature-desc">Keep customers updated on their order status in real-time</div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-gift" />
                  </div>
                  <div className="feature-title">Free to Try</div>
                  <div className="feature-desc">Start automating today with no upfront costs</div>
                </div>
              </div>

              <button className="btn-primary">Click Here to Login</button>
            </div>

            <WizardFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
