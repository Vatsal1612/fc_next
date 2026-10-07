"use client";

import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

/**
 * marketing/whatsapp-notification-setting.html → React. Static markup port
 * (no JS). The sidebar-loader.js script is dropped (the shell owns the sidebar).
 */
export default function WhatsappNotificationSettingPage() {
  return (
    <div id="pg-marketing-whatsapp-notification-setting">
      <div className="layout">
        <div className="main">
          <div className="content-area">
            <div className="card">
              <div className="page-header">
                <h1 className="typ-page-heading page-title">WhatsApp Notification Setting</h1>
                <div className="report-header-actions">
                  <div className="free-message-badge">
                    <i className="far fa-comment-dots" /> Free Message:
                    <span className="free-message-count">0</span>
                  </div>
                  <button className="btn-help">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    HELP
                  </button>
                </div>
              </div>

              <div className="info-box">
                <p>
                  Receive Order Update From Foodchow on WhatsApp No <strong>+91 73837 23481</strong>.
                </p>
                <label className="checkbox-label">
                  <input type="checkbox" /> Want Notification on other Number
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Enter WhatsApp Number <span>*</span>
                </label>
                <div className="input-group">
                  <div className="input-with-select">
                    <select defaultValue="+91 (India)">
                      <option>+91 (India)</option>
                      <option>+1 (USA)</option>
                      <option>+44 (UK)</option>
                    </select>
                    <input type="text" placeholder="Enter WhatsApp Number" />
                  </div>
                  <button className="btn-primary">Save</button>
                </div>
              </div>

              <div className="table-title">Enable Notification for Following Event.</div>

              <table className="events-table">
                <thead>
                  <tr>
                    <th>For Restaurant</th>
                    <th>For Customer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <label className="checkbox-label ">
                        <input type="checkbox" defaultChecked /> New Order Notification
                      </label>
                    </td>
                    <td>
                      <label className="checkbox-label">
                        <input type="checkbox" /> Order Accept Confirm
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label className="checkbox-label ">
                        <input type="checkbox" defaultChecked /> Missed Order
                      </label>
                    </td>
                    <td>
                      <label className="checkbox-label ">
                        <input type="checkbox" /> Order Status Change
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label className="checkbox-label ">
                        <input type="checkbox" /> New Table Booking
                      </label>
                    </td>
                    <td>
                      <label className="checkbox-label ">
                        <input type="checkbox" /> Order Complete
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      <label className="checkbox-label ">
                        <input type="checkbox" /> Feedback &amp; Review
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>

              <button className="btn-primary">Save</button>
            </div>

            <WizardFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
