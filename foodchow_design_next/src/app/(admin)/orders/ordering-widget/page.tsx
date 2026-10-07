"use client";

import { useEffect } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

/**
 * orders/ordering-widget.html → React.
 *
 * The page originally loaded behaviour from an external `ordering-widget.js`.
 * That logic is ported here, inline, into one useEffect:
 *   - tab switcher (Any Website / WordPress) swapping the code box content,
 *   - COPY CODE → clipboard with transient "COPIED!" feedback,
 *   - EMAIL THE ABOVE CODE → email modal open/close + mailto compose,
 *   - step-footer Prev/Next navigation.
 * The external sidebar-loader.js (shell) is dropped; dropdown/help helpers in
 * the original JS targeted shell-owned markup not present in the body and are
 * therefore omitted.
 */
export default function OrderingWidgetPage() {
  useEffect(() => {
    const root = document.getElementById("pg-orders-ordering-widget");
    if (!root) return;

    const fullCode = `<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,shrink-to-fit=no" />
<title>Order Online</title>
</head>
<body>
<style type="text/css">
html { overflow: scroll }
html, body, div, iframe { margin: 0px; padding: 0px; height: 100%; border: none }
iframe { display: block; width: 100%; border: none; }
</style>
<iframe
src="https://foodchowdemoindia.foodchow.com"
style="overflow: auto!important; -webkit-overflow-scrolling: touch!important;"
frameborder="0" marginheight="0" marginwidth="0">
</iframe>

</body>
</html>`;

    const codes: Record<string, string> = {
      website: fullCode,
      wordpress: `[foodchow_ordering_widget url="https://foodchowdemoindia.foodchow.com" width="100%" height="100vh"]`,
    };

    const codeContent = document.getElementById("codeContent");

    // ── Tabs ──
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>(".ow-tab"));
    const tabTypes = ["website", "wordpress"];
    const tabHandlers: Array<() => void> = tabs.map((btn, i) => {
      const fn = (): void => {
        tabs.forEach((t) => t.classList.remove("active"));
        btn.classList.add("active");
        if (codeContent) codeContent.textContent = codes[tabTypes[i]];
      };
      btn.addEventListener("click", fn);
      return fn;
    });

    // ── Copy ──
    const copyBtn = root.querySelector<HTMLButtonElement>(".btn-copy-code");
    let copyTimer: ReturnType<typeof setTimeout> | undefined;
    const onCopy = (): void => {
      const text = codeContent?.textContent ?? "";
      navigator.clipboard.writeText(text).then(() => {
        if (!copyBtn) return;
        const original = copyBtn.innerHTML;
        copyBtn.innerHTML = "COPIED!";
        copyTimer = setTimeout(() => {
          copyBtn.innerHTML = original;
        }, 1500);
      });
    };
    copyBtn?.addEventListener("click", onCopy);

    // ── Email modal ──
    const emailModal = document.getElementById("emailModal");
    const emailBtn = root.querySelector<HTMLButtonElement>(".btn-email");
    const closeBtns = Array.from(
      root.querySelectorAll<HTMLButtonElement>(".modal-close, .btn-close-modal"),
    );
    const sendBtn = root.querySelector<HTMLButtonElement>(".btn-send-modal");

    const openEmailModal = (): void => emailModal?.classList.add("show");
    const closeEmailModal = (): void => emailModal?.classList.remove("show");
    emailBtn?.addEventListener("click", openEmailModal);
    closeBtns.forEach((b) => b.addEventListener("click", closeEmailModal));

    const sendInstructions = (): void => {
      const emailInput = document.getElementById("developerEmail") as HTMLInputElement | null;
      const email = emailInput?.value ?? "";
      if (!email.trim()) {
        alert("Please enter email address");
        return;
      }
      const subject = encodeURIComponent("FoodChow Ordering Widget Integration");
      const body = encodeURIComponent(
        `Greetings from FoodChow!!\n\nPlease go through the following link so that you can embed our code into your website:\n\nhttps://foodchowdemoindia.foodchow.com\n\nCopy and paste the below code into your HTML file:\n\n${fullCode}\n\nFor any queries, feel free to contact us at support@foodchow.com.`,
      );
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    };
    sendBtn?.addEventListener("click", sendInstructions);

    const onOverlayClick = (e: MouseEvent): void => {
      if (e.target === emailModal) closeEmailModal();
    };
    window.addEventListener("click", onOverlayClick);

    // ── Help ──
    const helpBtn = root.querySelector<HTMLButtonElement>(".btn-help");
    const onHelp = (): void => alert("Help documentation coming soon!");
    helpBtn?.addEventListener("click", onHelp);

    // ── Step nav ──
    let currentStep = 6;
    const totalSteps = 25;
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const stepValue = document.getElementById("stepValue");
    const onPrev = (): void => {
      if (currentStep > 1) {
        currentStep--;
        if (stepValue) stepValue.textContent = currentStep + "/" + totalSteps;
      }
    };
    const onNext = (): void => {
      if (currentStep < totalSteps) {
        currentStep++;
        if (stepValue) stepValue.textContent = currentStep + "/" + totalSteps;
      }
    };
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    return () => {
      tabs.forEach((btn, i) => btn.removeEventListener("click", tabHandlers[i]));
      copyBtn?.removeEventListener("click", onCopy);
      emailBtn?.removeEventListener("click", openEmailModal);
      closeBtns.forEach((b) => b.removeEventListener("click", closeEmailModal));
      sendBtn?.removeEventListener("click", sendInstructions);
      window.removeEventListener("click", onOverlayClick);
      helpBtn?.removeEventListener("click", onHelp);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
      if (copyTimer) clearTimeout(copyTimer);
    };
  }, []);

  return (
    <div id="pg-orders-ordering-widget">
      <div className="layout">
        {/* ── MAIN ── */}
        <div className="main">
          <div className="content-area">
            <div className="card">
              {/* Page header */}
              <div className="ow-header">
                <h2>Start online ordering on your website</h2>
                <button className="btn-help">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  HELP
                </button>
              </div>

              {/* Intro */}
              <div className="ow-intro-box">
                Wouldn&apos;t it be amazing to start online ordering on your own website? All you need to
                do is add the code below to your website.
              </div>

              {/* Steps */}
              <div className="ow-steps-box">
                <h3>Follow three simple steps:</h3>
                <ol>
                  <li>Create HTML file with any name example online-order.html in your server.</li>
                  <li>
                    Copy the code below and paste into your html file. or you can simply email the code to
                    your developer.
                  </li>
                  <li>Visit www.yourwebsite.com/order-online.html — your ordering engine is ready.</li>
                </ol>
              </div>

              {/* Copy section */}
              <div className="typ-page-heading ow-copy-heading">Just Copy Below Code and Paste On your new File</div>

              {/* Tabs */}
              <div className="ow-tabs">
                <button className="ow-tab active">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                  Any Website
                </button>
                <button className="ow-tab">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                    <line x1="15" y1="3" x2="15" y2="21" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="3" y1="15" x2="21" y2="15" />
                  </svg>
                  WordPress
                </button>
              </div>

              {/* Code box */}
              <div className="ow-code-wrap">
                <div className="ow-code-inner">
                  <code id="codeContent">
                    {
                      '<iframe src="https://foodchowdemoindia.foodchow.com" name="myFrame" style="width: 100vw; height: 100vh; overflow: auto!important; -webkit-overflow-scrolling: touch !important; border: none;" scrolling="yes"></iframe>'
                    }
                  </code>
                </div>
                <div className="ow-code-scrollbar">
                  <span style={{ fontSize: "12px", color: "#aaa" }}>‹</span>
                  <div className="ow-scrolltrack">
                    <div className="ow-scrollthumb" />
                  </div>
                  <span style={{ fontSize: "12px", color: "#aaa" }}>›</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="ow-actions">
                <button className="btn-email">
                  <svg viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  EMAIL THE ABOVE CODE
                </button>
                <button className="btn-copy-code">COPY CODE</button>
              </div>
            </div>

            <WizardFooter />
          </div>
        </div>
      </div>

      {/* ── Email Modal ── */}
      <div className="modal-overlay" id="emailModal">
        <div className="email-modal">
          <button className="modal-close">×</button>

          <h2>Email Instructions To Developer</h2>
          <p className="modal-subtitle">
            Send instructions to your developer telling them how to embed code to your website
          </p>

          <div className="modal-field">
            <label>
              Email <span>*</span>
            </label>
            <input type="email" id="developerEmail" placeholder="abc@gmail.com" />
          </div>

          <div className="modal-field">
            <label>Instructions</label>
            <div className="modal-instructions">
              <p>
                <strong>Greetings from FoodChow!!</strong>
              </p>
              <p>Please go through the following link so that you can embed our code into your website:</p>
              <p className="modal-link">https://foodchowdemoindia.foodchow.com</p>
              <p>For any queries, feel free to contact us at support@foodchow.com.</p>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-send-modal">SEND INSTRUCTIONS</button>
            <button className="btn-close-modal">CLOSE</button>
          </div>
        </div>
      </div>
    </div>
  );
}
