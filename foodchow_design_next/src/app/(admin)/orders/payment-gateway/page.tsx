"use client";

import { useEffect } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

/**
 * orders/payment-gateway.html → React.
 * Inline <script> ported into one useEffect: gateway selection (card + panel
 * toggle), Stripe field check, Stripe-Connect popup + "already created" alert,
 * payment popup open/close + card formatting + submit validation, generic
 * validators, FlutterWave validator, webhook copy, toast, and step navigation.
 */
export default function PaymentGatewayPage() {
  useEffect(() => {
    const root = document.getElementById("pg-orders-payment-gateway");
    if (!root) return;

    let toastTimer: ReturnType<typeof setTimeout> | undefined;
    const showToast = (msg: string, isErr = false): void => {
      const t = document.getElementById("toast");
      if (!t) return;
      t.textContent = msg;
      t.className = "toast show" + (isErr ? " err" : "");
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        t.className = "toast";
      }, 2800);
    };

    const selectGateway = (gw: string): void => {
      root.querySelectorAll<HTMLElement>(".gw-card").forEach((c) => c.classList.remove("active"));
      const card = root.querySelector<HTMLElement>(`[data-gateway="${gw}"]`);
      card?.classList.add("active");
      root.querySelectorAll<HTMLElement>(".gateway-panel").forEach((p) => p.classList.remove("active"));
      document.getElementById("panel-" + gw)?.classList.add("active");
    };

    // Gateway cards
    const gwCards = Array.from(root.querySelectorAll<HTMLElement>(".gw-card"));
    const gwHandlers: Array<() => void> = gwCards.map((card) => {
      const gw = card.getAttribute("data-gateway") ?? "";
      const fn = (): void => selectGateway(gw);
      card.addEventListener("click", fn);
      return fn;
    });

    // Payment popup
    const payOverlay = document.getElementById("payOverlay");
    const openPaymentPopup = (): void => {
      const pub = (document.getElementById("stripe-pub") as HTMLInputElement | null)?.value.trim();
      const sec = (document.getElementById("stripe-sec") as HTMLInputElement | null)?.value.trim();
      if (!pub || !sec) {
        showToast("Please fill in all required fields.", true);
        return;
      }
      payOverlay?.classList.add("show");
    };
    const closePaymentPopup = (): void => payOverlay?.classList.remove("show");
    const submitPayment = (): void => {
      const get = (id: string): string =>
        (document.getElementById(id) as HTMLInputElement | null)?.value.trim() ?? "";
      const name = get("payName");
      const email = get("payEmail");
      const hold = get("payHolder");
      const card = get("payCard");
      const mm = get("payMM");
      const yy = get("payYY");
      const cvv = get("payCVV");
      if (!name || !email || !hold || !card || !mm || !yy || !cvv) {
        showToast("Please fill in all payment fields.", true);
        return;
      }
      closePaymentPopup();
      showToast("Stripe integration validated successfully!");
    };
    const formatCard = (el: HTMLInputElement): void => {
      const v = el.value.replace(/\D/g, "").substring(0, 16);
      el.value = v.replace(/(.{4})/g, "$1 ").trim();
    };

    // Stripe connect popup
    const scOverlay = document.getElementById("scOverlay");
    const alreadyAlertOverlay = document.getElementById("alreadyAlertOverlay");
    const openStripeConnectPopup = (): void => scOverlay?.classList.add("show");
    const closeStripeConnectPopup = (): void => scOverlay?.classList.remove("show");
    const stripeConnectContinue = (): void => {
      const opt = root.querySelector<HTMLInputElement>('input[name="stripeOpt"]:checked')?.value;
      if (opt === "existing") {
        closeStripeConnectPopup();
        window.open(
          "https://connect.stripe.com/oauth/v2/authorize?client_id=ca_B1qCzNc7dHkwFvoELfFOE6DIZv8DPBJu&redirect_uri=https%3A%2F%2Fapi.foodchow.com%2Fapi%2FStripe%2FOAuthCallback&response_type=code&scope=read_write&state=3161",
          "_blank",
        );
      } else {
        closeStripeConnectPopup();
        alreadyAlertOverlay?.classList.add("show");
      }
    };
    const closeAlreadyAlert = (): void => alreadyAlertOverlay?.classList.remove("show");

    const validateFlutterWave = (): void => {
      const pub = (document.getElementById("fw-public") as HTMLInputElement | null)?.value.trim();
      const enc = (document.getElementById("fw-encrypt") as HTMLInputElement | null)?.value.trim();
      if (!pub || !enc) {
        showToast("Please fill in all required fields.", true);
        return;
      }
      showToast("Redirecting to FlutterWave integration…");
    };
    const validateGeneric = (name: string): void =>
      showToast(name + " integration validated successfully!");
    const copyWebhookText = (): void => {
      const text = document.getElementById("webhook-text")?.textContent ?? "";
      navigator.clipboard
        .writeText(text)
        .then(() => showToast("Webhook URL copied to clipboard!"))
        .catch(() => showToast("Failed to copy text.", true));
    };

    // ── Wire data-action buttons ──
    const actionMap: Record<string, () => void> = {
      "open-payment": openPaymentPopup,
      "validate-paypal": () => validateGeneric("PayPal"),
      "validate-flutterwave": validateFlutterWave,
      "validate-ghl": () => validateGeneric("GHL"),
      "validate-tranzak": () => validateGeneric("Tranzak"),
      "validate-mpesa": () => validateGeneric("M-Pesa"),
      "validate-instasend": () => validateGeneric("InstaSend"),
      "validate-linkly": () => validateGeneric("Linkly"),
      "validate-pesapal": () => validateGeneric("Pesapal"),
      "validate-affinia": () => validateGeneric("Affinia"),
      "open-stripe-connect": openStripeConnectPopup,
      "copy-webhook": copyWebhookText,
      "close-payment": closePaymentPopup,
      "submit-payment": submitPayment,
      "cancel-stripe-connect": closeStripeConnectPopup,
      "continue-stripe-connect": stripeConnectContinue,
      "close-already-alert": closeAlreadyAlert,
    };
    const actionBtns = Array.from(root.querySelectorAll<HTMLElement>("[data-action]"));
    const actionHandlers: Array<() => void> = actionBtns.map((btn) => {
      const fn = actionMap[btn.getAttribute("data-action") ?? ""] ?? (() => {});
      btn.addEventListener("click", fn);
      return fn;
    });

    // Card formatting input
    const payCard = document.getElementById("payCard") as HTMLInputElement | null;
    const onCardInput = (): void => {
      if (payCard) formatCard(payCard);
    };
    payCard?.addEventListener("input", onCardInput);

    // Init
    selectGateway("stripe");
    const onScOverlay = (e: MouseEvent): void => {
      if (e.target === scOverlay) closeStripeConnectPopup();
    };
    const onPayOverlay = (e: MouseEvent): void => {
      if (e.target === payOverlay) closePaymentPopup();
    };
    scOverlay?.addEventListener("click", onScOverlay);
    payOverlay?.addEventListener("click", onPayOverlay);

    // Step nav
    let currentStep = 5;
    const totalSteps = 6;
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const stepValue = document.getElementById("stepValue");
    const onPrev = (): void => {
      if (currentStep > 1) {
        currentStep--;
        if (stepValue) stepValue.textContent = currentStep + " / " + totalSteps;
      }
    };
    const onNext = (): void => {
      if (currentStep < totalSteps) {
        currentStep++;
        if (stepValue) stepValue.textContent = currentStep + " / " + totalSteps;
      }
    };
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    return () => {
      gwCards.forEach((card, i) => card.removeEventListener("click", gwHandlers[i]));
      actionBtns.forEach((btn, i) => btn.removeEventListener("click", actionHandlers[i]));
      payCard?.removeEventListener("input", onCardInput);
      scOverlay?.removeEventListener("click", onScOverlay);
      payOverlay?.removeEventListener("click", onPayOverlay);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
      if (toastTimer) clearTimeout(toastTimer);
    };
  }, []);

  return (
    <div id="pg-orders-payment-gateway">
      <div className="page-wrapper">
        {/* SINGLE WHITE CARD wraps everything */}
        <div className="card">
          {/* CARD HEADER */}
          <div className="card-header">
            <h2 className="typ-page-heading">Payment Gateway Integration</h2>
            <button className="btn-help-hdr">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              HELP
            </button>
          </div>

          {/* GATEWAY GRID */}
          <div className="gateway-grid">
            <div className="gw-card" data-gateway="stripe">
              <div className="gw-logo">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 60 25"
                  style={{ height: "26px", width: "auto" }}
                >
                  <text x="0" y="20" fontFamily="Arial,sans-serif" fontSize="21" fontWeight="900" fill="#635bff" letterSpacing="-0.5">
                    stripe
                  </text>
                </svg>
              </div>
              <div className="active-badge">ACTIVE</div>
            </div>

            <div className="gw-card" data-gateway="razorpay">
              <div className="gw-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 28" style={{ height: "26px", width: "auto" }}>
                  <polygon points="0,27 13,1 21,1 8,27" fill="#3395FF" />
                  <polygon points="8,27 21,1 28,11 18,27" fill="#072654" />
                  <text x="33" y="21" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="700" fill="#3395FF">
                    Razor
                  </text>
                  <text x="72" y="21" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="700" fill="#072654">
                    pay
                  </text>
                </svg>
              </div>
              <div className="active-badge">ACTIVE</div>
            </div>

            <div className="gw-card" data-gateway="flutterwave">
              <div className="gw-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 30" style={{ height: "26px", width: "auto" }}>
                  <path d="M4,15 C7,7 13,7 16,15 C19,23 25,23 28,15" stroke="#f5a623" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M9,15 C12,7 18,7 21,15 C24,23 30,23 33,15" stroke="#ff5722" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <text x="38" y="20" fontFamily="Arial,sans-serif" fontSize="12" fontWeight="700" fill="#1a1a1a">
                    Flutterwave
                  </text>
                </svg>
              </div>
              <div className="active-badge">ACTIVE</div>
            </div>

            <div className="gw-card" data-gateway="paypal">
              <div className="gw-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 28" style={{ height: "26px", width: "auto" }}>
                  <text x="0" y="22" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="900" fontStyle="italic" fill="#003087">
                    P
                  </text>
                  <text x="11" y="22" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="900" fontStyle="italic" fill="#009cde">
                    P
                  </text>
                  <text x="25" y="21" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="700" fill="#003087">
                    ayPal
                  </text>
                </svg>
              </div>
              <div className="active-badge">ACTIVE</div>
            </div>

            <div className="gw-card" data-gateway="eghl">
              <div className="gw-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 28" style={{ height: "26px", width: "auto" }}>
                  <text x="0" y="22" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="900" fill="#e53e3e">e</text>
                  <text x="16" y="22" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="900" fill="#22a55a">G</text>
                  <text x="34" y="22" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="900" fill="#1a73e8">H</text>
                  <text x="52" y="22" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="900" fill="#f5a623">L</text>
                </svg>
              </div>
              <div className="active-badge">ACTIVE</div>
            </div>

            <div className="gw-card" data-gateway="tranzak">
              <div className="gw-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 28" style={{ height: "26px", width: "auto" }}>
                  <rect x="0" y="3" width="18" height="18" rx="4" fill="#7c3aed" />
                  <text x="4" y="16" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="900" fill="#fff">t</text>
                  <text x="22" y="19" fontFamily="Arial,sans-serif" fontSize="15" fontWeight="700" fill="#1a1a1a">ranzak</text>
                </svg>
              </div>
              <div className="active-badge">ACTIVE</div>
            </div>

            <div className="gw-card" data-gateway="mpesa">
              <div className="gw-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 28" style={{ height: "26px", width: "auto" }}>
                  <text x="0" y="21" fontFamily="Arial,sans-serif" fontSize="18" fontWeight="900" fill="#4caf50">M</text>
                  <rect x="18" y="5" width="2.5" height="16" fill="#4caf50" rx="1" />
                  <polygon points="15,10 22,13.5 15,17" fill="#4caf50" />
                  <text x="25" y="21" fontFamily="Arial,sans-serif" fontSize="18" fontWeight="900" fill="#4caf50">PESA</text>
                </svg>
              </div>
              <div className="active-badge">ACTIVE</div>
            </div>

            <div className="gw-card" data-gateway="instasend">
              <div className="gw-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 105 28" style={{ height: "26px", width: "auto" }}>
                  <circle cx="11" cy="14" r="10" fill="#0ea5e9" opacity="0.12" />
                  <circle cx="11" cy="14" r="10" fill="none" stroke="#0ea5e9" strokeWidth="1.5" />
                  <path d="M6,14 L16,14 M12,10 L16,14 L12,18" stroke="#0ea5e9" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="26" y="19" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="700" fill="#1a1a1a">IntaSend</text>
                </svg>
              </div>
              <div className="active-badge">ACTIVE</div>
            </div>

            <div className="gw-card" data-gateway="linkly">
              <div className="gw-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 30" style={{ height: "28px", width: "auto" }}>
                  <text x="0" y="17" fontFamily="Arial,sans-serif" fontSize="17" fontWeight="900" fill="#e8470a">linkly</text>
                  <text x="0" y="27" fontFamily="Arial,sans-serif" fontSize="7" fontWeight="600" fill="#888" letterSpacing="0.2">
                    THE PAYMENT PEOPLE
                  </text>
                </svg>
              </div>
              <div className="active-badge">ACTIVE</div>
            </div>

            <div className="gw-card" data-gateway="stripeconnect">
              <div className="gw-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 30" style={{ height: "28px", width: "auto" }}>
                  <circle cx="16" cy="15" r="13" fill="#635bff" />
                  <circle cx="36" cy="15" r="13" fill="#0aa89e" opacity="0.9" />
                  <ellipse cx="26" cy="15" rx="6" ry="12" fill="#3b82f6" opacity="0.35" />
                </svg>
              </div>
              <div className="active-badge">ACTIVE</div>
            </div>

            <div className="gw-card" data-gateway="pesapal">
              <div className="gw-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85 28" style={{ height: "26px", width: "auto" }}>
                  <text x="0" y="20" fontFamily="Arial,sans-serif" fontSize="16" fontWeight="800" fill="#e53e3e">pesa</text>
                  <text x="40" y="20" fontFamily="Arial,sans-serif" fontSize="16" fontWeight="800" fill="#2d3748">pal</text>
                </svg>
              </div>
              <div className="active-badge">ACTIVE</div>
            </div>

            <div className="gw-card" data-gateway="affinia">
              <div className="gw-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 28" style={{ height: "26px", width: "auto" }}>
                  <text x="0" y="20" fontFamily="Arial,sans-serif" fontSize="16" fontWeight="800" fill="#0aa89e">affinia</text>
                </svg>
              </div>
              <div className="active-badge">ACTIVE</div>
            </div>
          </div>

          {/* DIVIDER */}
          <hr className="section-divider" />

          {/* DETAIL PANEL */}
          <div className="detail-panel">
            {/* STRIPE */}
            <div className="gateway-panel active" id="panel-stripe">
              <div className="panel-header">
                <h3>Stripe</h3>
                <svg viewBox="0 0 80 25" style={{ height: "22px", opacity: 0.9 }} xmlns="http://www.w3.org/2000/svg">
                  <text x="0" y="20" fontFamily="Arial" fontSize="22" fontWeight="900" fill="white" letterSpacing="-1">
                    stripe
                  </text>
                </svg>
              </div>
              <div className="panel-body">
                <div className="cred-top-bar">
                  <div className="form-group">
                    <label className="form-label">
                      Published Key <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" id="stripe-pub" placeholder="pk_test_S5yfSYEAL2bc9hTsXaZmoxAR" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Secret Key <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" id="stripe-sec" placeholder="sk_test_uz861KaR25IVeyIDYZMp6sFT" />
                  </div>
                  <button className="btn-validate" id="stripe-validate-btn" data-action="open-payment">
                    Validate Stripe Integration
                  </button>
                </div>
                <div className="get-cred-block">
                  <h4>Get Stripe Credentials</h4>
                  <p>
                    You need a &quot;Stripe Account&quot;. You can sign up for one{" "}
                    <a href="https://dashboard.stripe.com/register" target="_blank">
                      Click Here.
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* RAZORPAY */}
            <div className="gateway-panel" id="panel-razorpay">
              <div className="panel-header">
                <h3>Razorpay</h3>
                <svg viewBox="0 0 110 30" style={{ height: "22px" }} xmlns="http://www.w3.org/2000/svg">
                  <polygon points="0,28 14,0 22,0 8,28" fill="rgba(255,255,255,0.6)" />
                  <polygon points="8,28 22,0 28,10 18,28" fill="white" />
                  <text x="34" y="22" fontFamily="Arial" fontSize="15" fontWeight="700" fill="white">
                    Razorpay
                  </text>
                </svg>
              </div>
              <div className="panel-body">
                <div className="info-connected">
                  <p className="info-connected-title">Your Razorpay Account is Connected with FoodChow.</p>
                  <p className="info-connected-sub">
                    Razorpay Account Id : <span>acc_NVxGiRpZ8FFVdE</span>
                  </p>
                </div>
              </div>
            </div>

            {/* PAYPAL */}
            <div className="gateway-panel" id="panel-paypal">
              <div className="panel-header">
                <h3>PayPal</h3>
              </div>
              <div className="panel-body">
                <div className="cred-top-bar">
                  <div className="form-group">
                    <label className="form-label">
                      Client ID <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Client Secret <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <button className="btn-validate" data-action="validate-paypal">
                    Validate PayPal Integration
                  </button>
                </div>
                <div className="get-cred-block">
                  <h4>Get PayPal Credentials</h4>
                  <p>
                    You need a &quot;PayPal Business Account&quot;.{" "}
                    <a href="https://www.paypal.com/bizsignup/" target="_blank">
                      Click Here.
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* FLUTTERWAVE */}
            <div className="gateway-panel" id="panel-flutterwave">
              <div className="panel-header">
                <h3>Flutterwave</h3>
              </div>
              <div className="panel-body">
                <div className="cred-top-bar">
                  <div className="form-group">
                    <label className="form-label">
                      Public Key <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" id="fw-public" placeholder="FLWPUBK_TEST-..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Encryption Key <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" id="fw-encrypt" />
                  </div>
                  <button className="btn-validate" data-action="validate-flutterwave">
                    Validate Flutterwave Integration
                  </button>
                </div>
                <div className="get-cred-block">
                  <h4>Get FlutterWave Credentials</h4>
                  <p>
                    You need a &quot;FlutterWave Account&quot;.{" "}
                    <a href="https://flutterwave.com/signup" target="_blank">
                      Click Here.
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* eGHL */}
            <div className="gateway-panel" id="panel-eghl">
              <div className="panel-header">
                <h3>eGHL (Internet Payment Gateway)</h3>
              </div>
              <div className="panel-body">
                <div className="cred-top-bar">
                  <div className="form-group">
                    <label className="form-label">
                      Merchant ID <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Merchant Password <span className="req">*</span>
                    </label>
                    <input type="password" className="form-control" />
                  </div>
                  <button className="btn-validate" data-action="validate-ghl">
                    Validate GHL Integration
                  </button>
                </div>
                <div className="get-cred-block">
                  <h4>Get Internet Payment Gateway Credentials</h4>
                  <p>
                    You need a &quot;GHL Account&quot;.{" "}
                    <a href="https://my.nttdatapay.com/en/contact" target="_blank">
                      Click Here.
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* TRANZAK */}
            <div className="gateway-panel" id="panel-tranzak">
              <div className="panel-header">
                <h3>Tranzak</h3>
              </div>
              <div className="panel-body">
                <div className="cred-top-bar">
                  <div className="form-group">
                    <label className="form-label">
                      Merchant ID <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Api ID <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <button className="btn-validate" data-action="validate-tranzak">
                    Validate Tranzak Integration
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Api Key <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                </div>
                <div className="get-cred-block" style={{ marginTop: "16px" }}>
                  <h4>Get Tranzak Credentials</h4>
                  <p>
                    You need a &quot;Tranzak Account&quot;.{" "}
                    <a href="https://tranzak.me" target="_blank">
                      Click Here.
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* MPESA */}
            <div className="gateway-panel" id="panel-mpesa">
              <div className="panel-header">
                <h3>M-Pesa Payment</h3>
              </div>
              <div className="panel-body">
                <div className="cred-top-bar">
                  <div className="form-group">
                    <label className="form-label">
                      Short Code <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Consumer Key <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <button className="btn-validate" data-action="validate-mpesa">
                    Validate M-Pesa Integration
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Consumer Secret <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Transaction Type <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Pass Key <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                </div>
                <div className="get-cred-block">
                  <h4>Get M-Pesa Daraja Credentials</h4>
                  <p>
                    You need a &quot;M-PESA Account&quot;.{" "}
                    <a href="https://developer.safaricom.co.ke" target="_blank">
                      Click Here.
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* INSTASEND */}
            <div className="gateway-panel" id="panel-instasend">
              <div className="panel-header">
                <h3>InstaSend Payment</h3>
              </div>
              <div className="panel-body">
                <div className="cred-top-bar">
                  <div className="form-group">
                    <label className="form-label">
                      Published Key <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Secret Key <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <button className="btn-validate" data-action="validate-instasend">
                    Validate InstaSend Integration
                  </button>
                </div>
                <div className="get-cred-block">
                  <h4>Get InstaSend Credentials</h4>
                  <p>
                    You need an &quot;InstaSend Account&quot;.{" "}
                    <a href="https://instasend.io" target="_blank">
                      Click Here.
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* LINKLY */}
            <div className="gateway-panel" id="panel-linkly">
              <div className="panel-header">
                <h3>Linkly Payment</h3>
              </div>
              <div className="panel-body">
                <div className="cred-top-bar">
                  <div className="form-group">
                    <label className="form-label">
                      Username <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Password <span className="req">*</span>
                    </label>
                    <input type="password" className="form-control" />
                  </div>
                  <button className="btn-validate" data-action="validate-linkly">
                    Validate Linkly Integration
                  </button>
                </div>
                <div className="get-cred-block">
                  <h4>Get Linkly Credentials</h4>
                  <p>
                    You need a &quot;Linkly Account&quot;.{" "}
                    <a href="https://linkly.com.au" target="_blank">
                      Click Here.
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* STRIPE CONNECT */}
            <div className="gateway-panel" id="panel-stripeconnect">
              <div className="panel-header">
                <h3>Stripe Connect</h3>
              </div>
              <div className="panel-body">
                <div style={{ padding: "22px 24px" }}>
                  <button className="btn-validate" data-action="open-stripe-connect">
                    <i className="fab fa-stripe-s" /> Connect Stripe Account
                  </button>
                </div>
              </div>
            </div>

            {/* PESAPAL */}
            <div className="gateway-panel" id="panel-pesapal">
              <div className="panel-header">
                <h3>Pesapal Payment</h3>
              </div>
              <div className="panel-body">
                <div className="cred-top-bar">
                  <div className="form-group">
                    <label className="form-label">
                      Consumer Key <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Consumer Secret <span className="req">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <button className="btn-validate" data-action="validate-pesapal">
                    Validate Pesapal Integration
                  </button>
                </div>
                <div className="get-cred-block">
                  <h4>Get Pesapal Credentials</h4>
                  <p>
                    You need a &quot;Pesapal Account&quot;.{" "}
                    <a href="https://pesapal.com" target="_blank">
                      Click Here.
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* AFFINIA */}
            <div className="gateway-panel" id="panel-affinia">
              <div className="panel-header">
                <h3>Affinia Payment</h3>
              </div>
              <div className="panel-body">
                <div className="cred-top-bar">
                  <div className="form-group full">
                    <label className="form-label">
                      API Key <span className="req">*</span>
                    </label>
                    <textarea className="form-control" id="affinia-key" rows={3} />
                  </div>
                  <button className="btn-validate" data-action="validate-affinia">
                    Validate Affinia Integration
                  </button>
                </div>
                <div className="webhook-wrap">
                  <label className="form-label">Webhook URL</label>
                  <div className="webhook-row">
                    <span className="webhook-url" id="webhook-text">
                      https://api.foodchow.com/api/AffiniaPayment/PaymentCallbackAffinia
                    </span>
                    <button className="btn-copy" data-action="copy-webhook">
                      Copy
                    </button>
                  </div>
                </div>
                <div className="get-cred-block">
                  <h4>Get Affinia Credentials</h4>
                  <p>
                    You need an &quot;Affinia Account&quot;.{" "}
                    <a href="https://dashboard.afinia.site/" target="_blank">
                      Click Here.
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* /detail-panel */}
        </div>

        <WizardFooter />
      </div>

      {/* TOAST */}
      <div className="toast" id="toast" />

      {/* STRIPE CONNECT POPUP */}
      <div className="overlay" id="scOverlay">
        <div className="modal">
          <h2>Stripe Connect Setup</h2>
          <div className="radio-group">
            <label className="radio-label">
              <input type="radio" name="stripeOpt" value="existing" defaultChecked /> I already have a
              Stripe account
            </label>
            <label className="radio-label">
              <input type="radio" name="stripeOpt" value="new" /> Create a new Stripe account
            </label>
          </div>
          <div className="modal-actions">
            <button className="btn-cancel" data-action="cancel-stripe-connect">
              Cancel
            </button>
            <button className="btn-continue" data-action="continue-stripe-connect">
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* PAYMENT INFO POPUP */}
      <div className="overlay" id="payOverlay">
        <div className="modal pay-modal">
          <button className="modal-close" data-action="close-payment">
            ×
          </button>
          <h2>Payment Information</h2>
          <div className="card-logos">
            <svg className="card-logo" viewBox="0 0 60 38">
              <rect width="60" height="38" rx="4" fill="#1A1F71" />
              <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" fill="#fff" fontSize="14" fontFamily="Arial" fontWeight="bold" letterSpacing="1">
                VISA
              </text>
            </svg>
            <svg className="card-logo" viewBox="0 0 60 38">
              <rect width="60" height="38" rx="4" fill="#252525" />
              <circle cx="22" cy="19" r="11" fill="#EB001B" />
              <circle cx="38" cy="19" r="11" fill="#F79E1B" />
              <ellipse cx="30" cy="19" rx="5" ry="11" fill="#FF5F00" />
            </svg>
            <svg className="card-logo" viewBox="0 0 60 38">
              <rect width="60" height="38" rx="4" fill="#fff" stroke="#ddd" strokeWidth="1" />
              <circle cx="42" cy="19" r="13" fill="#F76F20" />
              <text x="9" y="22" fill="#231F20" fontSize="7" fontFamily="Arial" fontWeight="bold">
                DISCOVER
              </text>
            </svg>
            <svg className="card-logo" viewBox="0 0 60 38">
              <rect width="60" height="38" rx="4" fill="#2E77BC" />
              <text x="50%" y="44%" dominantBaseline="middle" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="Arial" fontWeight="bold">
                AMERICAN
              </text>
              <text x="50%" y="68%" dominantBaseline="middle" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="Arial" fontWeight="bold">
                EXPRESS
              </text>
            </svg>
          </div>
          <div className="pay-row">
            <div className="pay-field">
              <label className="pay-label">
                Name <span className="req">*</span>
              </label>
              <input type="text" className="pay-input" id="payName" placeholder="Name" />
            </div>
            <div className="pay-field">
              <label className="pay-label">
                Email Address <span className="req">*</span>
              </label>
              <input type="email" className="pay-input" id="payEmail" placeholder="Email Address" />
            </div>
          </div>
          <div className="pay-row">
            <div className="pay-field">
              <label className="pay-label">
                Card Holder&apos;s Name <span className="req">*</span>
              </label>
              <input type="text" className="pay-input" id="payHolder" placeholder="Card Holder's Name" />
            </div>
            <div className="pay-field">
              <label className="pay-label">
                Card Number <span className="req">*</span>
              </label>
              <div className="pay-input-icon">
                <input type="text" className="pay-input" id="payCard" placeholder="Card Number" maxLength={19} />
                <svg viewBox="0 0 24 24" fill="none" stroke="#0AA89E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
            </div>
          </div>
          <div className="pay-row">
            <div className="pay-field">
              <label className="pay-label">
                Card Expiry Date <span className="req">*</span>
              </label>
              <div className="expiry-row">
                <input type="text" className="pay-input expiry-in" id="payMM" placeholder="MM" maxLength={2} />
                <input type="text" className="pay-input expiry-in" id="payYY" placeholder="YY" maxLength={2} />
              </div>
            </div>
            <div className="pay-field">
              <label className="pay-label">
                CVV/CVV2 <span className="req">*</span>
              </label>
              <input type="password" className="pay-input" id="payCVV" placeholder="CVV" maxLength={4} />
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <button className="btn-pay" data-action="submit-payment">
              PAY $1
            </button>
          </div>
        </div>
      </div>

      {/* ALREADY CREATED ALERT */}
      <div className="overlay" id="alreadyAlertOverlay">
        <div className="modal" style={{ textAlign: "center", padding: "40px 36px" }}>
          <div className="success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: "17px", fontWeight: 800, color: "var(--ink)", marginBottom: "10px" }}>
            Account Already Created
          </h2>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "26px" }}>
            Your Stripe account has already been created. You can connect it using the existing account
            option.
          </p>
          <button className="btn-continue" data-action="close-already-alert">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
