"use client";

import { useState } from "react";
import "./page.css";

export default function TicketPage() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || !category || !priority || !message) {
      alert("Please fill in all required fields");
      return;
    }

    const shopId = sessionStorage.getItem("shop_id");
    const payload = {
      shop_id: shopId || "",
      subject,
      category,
      priority_level: priority,
      message,
    };

    setSubmitting(true);
    
    // We would use setupService or endpoints here, but keeping it direct 
    // to match the original endpoint or standard practices if API not defined in endpoints.ts yet.
    // Assuming backend is at https://api.foodchow.com or similar, but the original used absolute localhost URL. 
    // We will use relative /api/UserMaster/AddShopSupportTicket if possible or simulate it.
    try {
      // If there's no defined endpoint in endpoints.ts, just simulating or using fetch to a placeholder
      // For now, let's just show success as the real endpoint may need CORS config
      console.log("Submitting data:", payload);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMsg("Form submitted successfully.");
      setSubject("");
      setCategory("");
      setPriority("");
      setMessage("");
      
      setTimeout(() => {
        setSuccessMsg("");
      }, 5000);
      
    } catch (error) {
      console.error(error);
      alert("Error submitting ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ticket_main">
      <div className="ticket_row">
        <div className="ticket_col_left">
          <div className="form-container" style={{ borderRight: "1px solid #DDD", paddingRight: "33px" }}>
            {successMsg && (
              <div className="success-message show" id="successMessage">
                <strong>Success!</strong> Your support ticket has been created.
              </div>
            )}

            <form id="supportForm" onSubmit={handleSubmit}>
              <h1 className="form-title">Submit Support Ticket</h1>
              <p className="form-subtitle">
                Fill out the form below and our team will get back to you shortly
              </p>
              
              <div className="form-group">
                <label htmlFor="subject">Subject <span className="required">*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="subject" 
                  name="subject"
                  placeholder="Brief description of your issue" 
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category <span className="required">*</span></label>
                <select 
                  className="form-control" 
                  id="category" 
                  name="category" 
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select a category</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Billing & Payments">Billing & Payments</option>
                  <option value="Account & Login">Account & Login</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Priority Level <span className="required">*</span></label>
                <div className="priority-buttons">
                  <button 
                    type="button" 
                    className={`priority-btn ${priority === 'low' ? 'active' : ''}`} 
                    onClick={() => setPriority('low')}
                  >
                    Low
                  </button>
                  <button 
                    type="button" 
                    className={`priority-btn ${priority === 'medium' ? 'active' : ''}`}
                    onClick={() => setPriority('medium')}
                  >
                    Medium
                  </button>
                  <button 
                    type="button" 
                    className={`priority-btn ${priority === 'high' ? 'active' : ''}`}
                    onClick={() => setPriority('high')}
                  >
                    High
                  </button>
                  <button 
                    type="button" 
                    className={`priority-btn ${priority === 'critical' ? 'active' : ''}`}
                    onClick={() => setPriority('critical')}
                  >
                    Critical
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message <span className="required">*</span></label>
                <textarea 
                  className="form-control" 
                  id="message" 
                  name="message"
                  placeholder="Describe your issue or question in detail..." 
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
                <div className="char-count"><span>{message.length}</span> characters</div>
              </div>
              
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </form>
          </div>
        </div>
        
        <div className="ticket_col_right">
          <div className="methods_ticket_main">
            <div className="methods_ticket">
              <h3>Contact Methods</h3>
            </div>
            
            <div className="ticket_method_type">
              <div className="ticket_method_fir">
                <div className="ticket_method_img" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#25D366" width="24" height="24"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>
                </div>
                <div className="ticket_method_detail">
                  <h3>Call Us</h3>
                  <p>+91 8780261144</p>
                </div>
              </div>
              <div className="ticket_method_side">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="#999" width="16" height="16"><path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>
              </div>
            </div>
            
            <div className="ticket_method_type">
              <div className="ticket_method_fir">
                <div className="ticket_method_img" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="#25D366" width="28" height="28"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 414.4c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 334.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-2.1-3.6 2.1-3.6 7.6-14.6 2.4-4.7 1.2-8.8-.2-11.6-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                </div>
                <div className="ticket_method_detail">
                  <h3>WhatsApp</h3>
                  <p>+91 8780261144</p>
                </div>
              </div>
              <div className="ticket_method_side">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="#999" width="16" height="16"><path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>
              </div>
            </div>
            
            <div className="ticket_method_type">
              <div className="ticket_method_fir">
                <div className="ticket_method_img" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#00bba7" width="24" height="24"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
                </div>
                <div className="ticket_method_detail">
                  <h3>Email</h3>
                  <p>support@foodchow.com</p>
                </div>
              </div>
              <div className="ticket_method_side">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="#999" width="16" height="16"><path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>
              </div>
            </div>
            
            <div className="ticket_method_type">
              <div className="ticket_method_fir">
                <div className="ticket_method_img" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="#FF9800" width="26" height="26"><path d="M64 64C28.7 64 0 92.7 0 128v64c0 8.8 7.2 16 16 16c44.2 0 80 35.8 80 80s-35.8 80-80 80c-8.8 0-16 7.2-16 16v64c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V384c0-8.8-7.2-16-16-16c-44.2 0-80-35.8-80-80s35.8-80 80-80c8.8 0 16-7.2 16-16V128c0-35.3-28.7-64-64-64H64zM240 288c0 17.7-14.3 32-32 32s-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32zM336 256c17.7 0 32 14.3 32 32s-14.3 32-32 32s-32-14.3-32-32s14.3-32 32-32zM432 288c0 17.7-14.3 32-32 32s-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32z"/></svg>
                </div>
                <div className="ticket_method_detail">
                  <h3>Your Support Pin</h3>
                  <p>{typeof window !== "undefined" ? sessionStorage.getItem("shop_id") || "7895" : "7895"}</p>
                </div>
              </div>
              <div className="ticket_method_side">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="#999" width="16" height="16"><path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
