"use client";

import { WizardFooter } from "@/components/shared/WizardFooter";
import React from 'react';
import html2canvas from "html2canvas";
import Swal from "sweetalert2";
import "./page.css";

/**
 * marketing/marketing-material.html → React. Static markup port (no JS).
 * The commented-out material cards (Pinterest, WhatsApp Story) render nothing
 * and are omitted. The sidebar-loader.js script is dropped (the shell owns the
 * sidebar).
 */
export default function MarketingMaterialPage() {
  const [data] = React.useState({
    logo: "FOOD CHOW",
    heading1: "Our Trusted Online",
    heading2: "Food Ordering",
    heading3: "Partner",
    appStore: "App Store",
    googlePlay: "Google Play",
    promoHeading1: "GET YOUR OWN",
    promoHeading2: "FOOD ORDERING APP",
    promoHeading3: "for just $1",
    promoBtn: "GET STARTED!"
  });

  const getFormattedDate = () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${yy}-${mm}-${dd}_${hh}-${min}-${ss}`;
  };

  const handlePreviewClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    try {
      const canvas = await html2canvas(el, { useCORS: true, allowTaint: true, scale: 2 });
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          window.location.href = url;
        }
      }, 'image/png');
    } catch (err) {
      console.error('Preview failed', err);
    }
  };

  const performDownload = async (index: number, suffix: string = '') => {
    const el = document.querySelectorAll('.material-preview')[index] as HTMLElement;
    if (el) {
      try {
        const canvas = await html2canvas(el, { useCORS: true, allowTaint: true, scale: 2 });
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `__MarketingMaterialPosterIn${getFormattedDate()}${suffix}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Download failed', err);
      }
    }
  };

  const downloadCard = (index: number) => {
    Swal.fire({
      text: "Are you sure that you want to download this Document?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2ab5e1",
      cancelButtonColor: "#333333",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        performDownload(index);
      }
    });
  };

  const downloadAll = () => {
    Swal.fire({
      text: "Are you sure that you want to download this all Documents?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2ab5e1",
      cancelButtonColor: "#333333",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const totalCards = 6;
        for (let i = 0; i < totalCards; i++) {
          await performDownload(i, `_${i + 1}`);
          // Wait slightly to ensure browser processes each file
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    });
  };

  return (
    <div id="pg-marketing-marketing-material">
      <div className="layout">
        <div className="main">
          <div className="content-area">
            <div className="card">
              <div className="report-header">
                <h1 className="typ-page-heading report-title">Marketing Material</h1>
                <div className="report-header-actions">
                  <button className="btn-download-all" onClick={downloadAll}>
                    <i className="fas fa-download" /> DOWNLOAD
                  </button>
                </div>
              </div>

              <div className="material-grid">
                {/* Card 1: Table Top */}
                <div className="material-card">
                  <div className="card-top-action">
                    <button className="btn-icon-circle" onClick={() => downloadCard(0)}>
                      <i className="fas fa-download" />
                    </button>
                  </div>
                  <div className="material-preview" style={{ cursor: "pointer" }} onClick={handlePreviewClick}>
                    <div className="bg-table-top" />
                    <div
                      style={{
                        position: "relative",
                        zIndex: 2,
                        width: "140px",
                        height: "190px",
                        background: "white",
                        borderRadius: "12px",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      }}
                    >
                      <div className="mockup-logo" style={{ marginTop: "10px", fontSize: "12px" }}>
                        <i className="fas fa-utensils" /> {data.logo}
                      </div>
                      <div className="mockup-heading" style={{ marginTop: "16px", fontSize: "8px" }}>
                        {data.heading1}<br />{data.heading2}<br />{data.heading3}
                      </div>
                      <div
                        style={{
                          marginTop: "8px",
                          width: "40px",
                          height: "2px",
                          background: "var(--teal)",
                          borderRadius: "1px",
                        }}
                      />
                      <div style={{ display: "flex", gap: "6px", marginTop: "auto", marginBottom: "10px" }}>
                        <div
                          style={{
                            width: "45px",
                            height: "16px",
                            background: "#111",
                            color: "white",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "6px",
                          }}
                        >
                          <i className="fab fa-apple" style={{ marginRight: "2px" }} /> App Store
                        </div>
                        <div
                          style={{
                            width: "45px",
                            height: "16px",
                            background: "#111",
                            color: "white",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "6px",
                          }}
                        >
                          <i className="fab fa-google-play" style={{ marginRight: "2px" }} /> {data.googlePlay}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="material-footer">
                    <div className="material-info">
                      <div className="material-title">Table Top</div>
                      <div className="material-subtitle">Table Top</div>
                    </div>

                  </div>
                </div>

                {/* Card 2: Facebook Ad */}
                <div className="material-card">
                  <div className="card-top-action">
                    <button className="btn-icon-circle" onClick={() => downloadCard(1)}>
                      <i className="fas fa-download" />
                    </button>
                  </div>
                  <div className="material-preview" style={{ cursor: "pointer" }} onClick={handlePreviewClick}>
                    <div className="bg-diagonal" />
                    <div
                      className="real-phone"
                      style={{
                        transform: "scale(0.8) rotate(-5deg) translateX(20px)",
                        zIndex: 1,
                        boxShadow: "-5px 10px 20px rgba(0,0,0,0.2)",
                      }}
                    >
                      <div className="real-phone-screen">
                        <div className="phone-header" />
                        <div
                          className="phone-hero"
                          style={{
                            backgroundImage:
                              "url('https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80')",
                          }}
                        />
                        <div className="phone-content">
                          <div className="phone-line" />
                          <div className="phone-line short" />
                          <div className="phone-item" style={{ marginTop: "10px" }}>
                            <div className="phone-item-img" />
                            <div className="phone-item-text">
                              <div className="phone-item-line" />
                              <div className="phone-item-line short" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="real-phone" style={{ zIndex: 2, transform: "scale(0.9) translateY(10px)" }}>
                      <div className="real-phone-screen">
                        <div className="phone-header" />
                        <div className="phone-hero" />
                        <div className="phone-content">
                          <div className="phone-line" />
                          <div className="phone-line short" />
                          <div className="phone-item">
                            <div className="phone-item-img" />
                            <div className="phone-item-text">
                              <div className="phone-item-line" />
                              <div className="phone-item-line short" />
                            </div>
                          </div>
                          <div className="phone-item">
                            <div
                              className="phone-item-img"
                              style={{
                                backgroundImage:
                                  "url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80')",
                              }}
                            />
                            <div className="phone-item-text">
                              <div className="phone-item-line" />
                              <div className="phone-item-line short" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mockup-text">
                      <div className="mockup-logo">
                        <i className="fas fa-utensils" /> {data.logo}
                      </div>
                      <div className="mockup-heading">
                        {data.promoHeading1}<br />{data.promoHeading2}<br />{data.promoHeading3}
                      </div>
                      <div className="mockup-btn">{data.promoBtn}</div>
                    </div>
                  </div>
                  <div className="material-footer">
                    <div className="material-info">
                      <div className="material-title">Own food ordering app - Facebook AD</div>
                      <div className="material-subtitle">Facebook AD_810 x 450</div>
                    </div>
                  </div>
                </div>

                <div className="material-card">
                  <div className="card-top-action">
                    <button className="btn-icon-circle" onClick={() => downloadCard(2)}>
                      <i className="fas fa-download" />
                    </button>
                  </div>
                  <div className="material-preview" style={{ cursor: "pointer" }} onClick={handlePreviewClick}>
                    <div
                      className="bg-diagonal"
                      style={{ background: "linear-gradient(115deg, var(--teal) 50%, #f0fdfa 50%)" }}
                    />
                    <div
                      className="real-phone"
                      style={{ transform: "scale(0.7) translateY(20px) translateX(15px)", zIndex: 1 }}
                    >
                      <div className="real-phone-screen">
                        <div className="phone-header" />
                        <div
                          className="phone-hero"
                          style={{
                            backgroundImage:
                              "url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80')",
                          }}
                        />
                        <div className="phone-content">
                          <div className="phone-line" />
                        </div>
                      </div>
                    </div>
                    <div
                      className="real-phone"
                      style={{ transform: "scale(0.85)", zIndex: 2, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
                    >
                      <div className="real-phone-screen">
                        <div className="phone-header" />
                        <div className="phone-hero" />
                        <div className="phone-content">
                          <div className="phone-line" />
                          <div className="phone-line short" />
                          <div className="phone-item">
                            <div className="phone-item-img" />
                            <div className="phone-item-text">
                              <div className="phone-item-line" />
                              <div className="phone-item-line short" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mockup-text">
                      <div className="mockup-logo"> {data.logo}</div>
                      <div className="mockup-heading">
                        {data.promoHeading1}<br />{data.promoHeading2}<br />{data.promoHeading3}
                      </div>
                      <div className="mockup-btn">{data.promoBtn}</div>
                    </div>
                  </div>
                  <div className="material-footer">
                    <div className="material-info">
                      <div className="material-title">Own food ordering app - Youtube</div>
                      <div className="material-subtitle">Youtube Thumbnail_1280 x 720</div>
                    </div>
                  </div>
                </div>

                {/* Card 4: Youtube Thumbnail */}
                <div className="material-card">
                  <div className="card-top-action">
                    <button className="btn-icon-circle" onClick={() => downloadCard(3)}>
                      <i className="fas fa-download" />
                    </button>
                  </div>
                  <div className="material-preview" style={{ cursor: "pointer" }} onClick={handlePreviewClick}>
                    <div
                      className="bg-diagonal"
                      style={{ background: "linear-gradient(105deg, var(--teal) 45%, #f0fdfa 45%)" }}
                    />
                    <div
                      className="real-phone"
                      style={{
                        zIndex: 2,
                        marginRight: "20px",
                        transform: "scale(0.95)",
                        boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
                      }}
                    >
                      <div className="real-phone-screen">
                        <div className="phone-header" />
                        <div
                          className="phone-hero"
                          style={{
                            backgroundImage:
                              "url('https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=400&q=80')",
                          }}
                        />
                        <div className="phone-content">
                          <div className="phone-line" />
                          <div className="phone-line short" />
                          <div className="phone-item" style={{ marginTop: "10px" }}>
                            <div
                              className="phone-item-img"
                              style={{
                                backgroundImage:
                                  "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80')",
                              }}
                            />
                            <div className="phone-item-text">
                              <div className="phone-item-line" />
                              <div className="phone-item-line short" />
                            </div>
                          </div>
                          <div className="phone-item">
                            <div
                              className="phone-item-img"
                              style={{
                                backgroundImage:
                                  "url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80')",
                              }}
                            />
                            <div className="phone-item-text">
                              <div className="phone-item-line" />
                              <div className="phone-item-line short" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mockup-text">
                      <div className="mockup-logo">
                        <i className="fas fa-utensils" /> {data.logo}
                      </div>
                      <div className="mockup-heading">
                        {data.promoHeading1}<br />{data.promoHeading2}<br />{data.promoHeading3}
                      </div>
                      <div className="mockup-btn">{data.promoBtn}</div>
                    </div>
                  </div>
                  <div className="material-footer">
                    <div className="material-info">
                      <div className="material-title">Own food ordering app - Youtube</div>
                      <div className="material-subtitle">Youtube Thumbnail_1280 x 720</div>
                    </div>
                  </div>
                </div>

                {/* Card 5: Twitter Post */}
                <div className="material-card">
                  <div className="card-top-action">
                    <button className="btn-icon-circle" onClick={() => downloadCard(4)}>
                      <i className="fas fa-download" />
                    </button>
                  </div>
                  <div className="material-preview" style={{ cursor: "pointer" }} onClick={handlePreviewClick}>
                    <div
                      className="bg-diagonal"
                      style={{ background: "linear-gradient(115deg, var(--teal) 50%, #f0fdfa 50%)" }}
                    />
                    <div
                      className="real-phone"
                      style={{
                        zIndex: 2,
                        marginRight: "15px",
                        transform: "scale(0.9)",
                        boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
                      }}
                    >
                      <div className="real-phone-screen">
                        <div className="phone-header" style={{ background: "#e67e22" }} />
                        <div
                          className="phone-hero"
                          style={{
                            backgroundImage:
                              "url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80')",
                          }}
                        />
                        <div className="phone-content">
                          <div className="phone-line" />
                          <div className="phone-line short" />
                          <div className="phone-item" style={{ marginTop: "8px" }}>
                            <div
                              className="phone-item-img"
                              style={{
                                backgroundImage:
                                  "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80')",
                              }}
                            />
                            <div className="phone-item-text">
                              <div className="phone-item-line" />
                              <div className="phone-item-line short" />
                            </div>
                          </div>
                          <div className="phone-item">
                            <div
                              className="phone-item-img"
                              style={{
                                backgroundImage:
                                  "url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80')",
                              }}
                            />
                            <div className="phone-item-text">
                              <div className="phone-item-line" />
                              <div className="phone-item-line short" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mockup-text">
                      <div className="mockup-logo">
                        <i className="fas fa-utensils" /> {data.logo}
                      </div>
                      <div className="mockup-heading">
                        {data.promoHeading1}<br />{data.promoHeading2}<br />{data.promoHeading3}
                      </div>
                      <div className="mockup-btn">{data.promoBtn}</div>
                    </div>
                  </div>
                  <div className="material-footer">
                    <div className="material-info">
                      <div className="material-title">Own food ordering app - Twitter</div>
                      <div className="material-subtitle">Twitter post_1024 x 512</div>
                    </div>
                  </div>
                </div>

                <div className="material-card">
                  <div className="card-top-action">
                    <button className="btn-icon-circle" onClick={() => downloadCard(5)}>
                      <i className="fas fa-download" />
                    </button>
                  </div>
                  <div className="material-preview" style={{ cursor: "pointer" }} onClick={handlePreviewClick}>
                    <div
                      className="bg-diagonal"
                      style={{ background: "linear-gradient(115deg, var(--teal) 50%, #f0fdfa 50%)" }}
                    />
                    <div
                      className="real-phone"
                      style={{
                        zIndex: 2,
                        transform: "scale(0.9)",
                        marginTop: "10px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                      }}
                    >
                      <div className="real-phone-screen">
                        <div className="phone-header" style={{ background: "#10b981" }} />
                        <div
                          className="phone-hero"
                          style={{
                            backgroundImage:
                              "url('https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80')",
                            height: "45px",
                          }}
                        />
                        <div className="phone-content">
                          <div className="phone-line" />
                          <div className="phone-line short" />
                          <div className="phone-item" style={{ marginTop: "12px", background: "#f0fdfa" }}>
                            <div
                              className="phone-item-img"
                              style={{
                                backgroundImage:
                                  "url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80')",
                              }}
                            />
                            <div className="phone-item-text">
                              <div className="phone-item-line" style={{ background: "#0AA89E" }} />
                              <div className="phone-item-line short" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mockup-text">
                      <div className="mockup-logo">
                        <i className="fas fa-utensils" /> {data.logo}
                      </div>
                      <div className="mockup-heading">
                        {data.promoHeading1}<br />{data.promoHeading2}<br />{data.promoHeading3}
                      </div>
                      <div className="mockup-btn">{data.promoBtn}</div>
                    </div>
                  </div>
                  <div className="material-footer">
                    <div className="material-info">
                      <div className="material-title">Own food ordering app - Youtube</div>
                      <div className="material-subtitle">Youtube Thumbnail_1280 x 720</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <WizardFooter currentStepOverride={31} totalStepsOverride={35} />
          </div>
        </div>
      </div>
    </div>
  );
}
