"use client";

import { useEffect } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

/**
 * setup/add-custom-domain.html → React.
 *
 * Static markup (including the long CNAME-guide modal with its remote
 * admin.foodchow.com screenshots, kept as-is per spec) rendered here. The inline
 * <script> (help alert, add-domain validation + toast, open/close CNAME guide,
 * Escape-to-close, step prev/next) is ported into one useEffect wired with
 * addEventListener. The dropdown / outer-sidebar helpers (which targeted
 * shell-only elements) and the `helpBtn` listener (no such element on this page)
 * are dropped. The external sidebar-loader.js is dropped.
 */
export default function AddCustomDomainPage() {
  useEffect(() => {
    const toast = (msg: string, isErr = false): void => {
      const t = document.getElementById("toast");
      if (!t) return;
      t.textContent = msg;
      t.style.background = isErr ? "#ef4444" : "#0AA89E";
      t.className = "toast show";
      setTimeout(() => {
        t.className = "toast";
      }, 3000);
    };

    const triggerAddDomain = (): void => {
      const input = document.getElementById(
        "customDomainInput",
      ) as HTMLInputElement | null;
      const domainValue = input?.value.trim() ?? "";
      if (!domainValue) {
        toast("Please enter a valid custom domain value.", true);
        return;
      }
      toast("Custom domain configuration updated successfully!");
    };

    const cnameModal = document.getElementById("cnameGuideModal");
    const openCnameGuide = (e: Event): void => {
      e.preventDefault();
      cnameModal?.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    const closeCnameGuide = (): void => {
      cnameModal?.classList.remove("open");
      document.body.style.overflow = "";
    };
    const closeCnameGuideOutside = (e: Event): void => {
      if (e.target === cnameModal) closeCnameGuide();
    };
    const onKeydown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") closeCnameGuide();
    };

    // Step nav
    let currentStep = 10;
    const totalSteps = 10;
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

    // ── Wire handlers ──
    const helpBtnCard = document.getElementById("helpBtnCard");
    const onHelp = (): void => alert("Help & Support - Add Custom Domain");
    helpBtnCard?.addEventListener("click", onHelp);

    const addDomainBtn = document.getElementById("addDomainBtn");
    addDomainBtn?.addEventListener("click", triggerAddDomain);

    const emailBtn = document.getElementById("emailDevBtn");
    const onEmail = (): void => toast("Developer instructions sent successfully!");
    emailBtn?.addEventListener("click", onEmail);

    const detailLink = document.getElementById("cnameGuideLink");
    detailLink?.addEventListener("click", openCnameGuide);

    const backBtn = document.getElementById("cnameGuideBackBtn");
    backBtn?.addEventListener("click", closeCnameGuide);

    cnameModal?.addEventListener("click", closeCnameGuideOutside);
    document.addEventListener("keydown", onKeydown);

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    return () => {
      helpBtnCard?.removeEventListener("click", onHelp);
      addDomainBtn?.removeEventListener("click", triggerAddDomain);
      emailBtn?.removeEventListener("click", onEmail);
      detailLink?.removeEventListener("click", openCnameGuide);
      backBtn?.removeEventListener("click", closeCnameGuide);
      cnameModal?.removeEventListener("click", closeCnameGuideOutside);
      document.removeEventListener("keydown", onKeydown);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div id="pg-setup-add-custom-domain">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <div className="layout">
        <div className="main">
          <div className="content-area">
            <div className="card">
              <div className="card-actions">
                <button className="btn-help-new" id="helpBtnCard">
                  <i className="far fa-question-circle" /> HELP
                </button>
              </div>
              <div className="typ-page-heading card-title">Add Custom Domain</div>
              <div className="card-sub">
                Connect your own domain to your FoodChow store
              </div>

              {/* Primary Subdomain Setup */}
              <div className="domain-row">
                <div className="input-wrap">
                  <label className="domain-label">Primary Sub-Domain Name</label>
                  <input
                    type="text"
                    className="domain-input"
                    defaultValue="foodchowdemoindia.foodchow.com"
                    readOnly
                  />
                </div>
                <div className="toggle-switch-wrap">
                  <label className="custom-switch">
                    <input type="checkbox" defaultChecked id="subdomainToggle" />
                    <span className="custom-slider" />
                  </label>
                </div>
              </div>

              {/* Add Custom Domain Setup */}
              <div className="domain-row" style={{ marginBottom: "10px" }}>
                <div className="input-wrap">
                  <label className="domain-label">Add Your Custom Domain</label>
                  <input
                    type="text"
                    className="domain-input"
                    id="customDomainInput"
                    placeholder="e.g. myrestaurant.com"
                  />
                </div>
              </div>

              {/* Add Domain Button */}
              <div className="btn-center-container">
                <button className="btn-action-teal" id="addDomainBtn">
                  Add Domain
                </button>
              </div>

              {/* Step Instructions */}
              <h3 className="guide-section-title">
                How to Connect your Custom Domain?
              </h3>

              <div className="steps-container">
                <h4 className="guide-subtitle">
                  Steps to Add your Custom Domain CNAME
                </h4>
                <div className="step-block">
                  <strong>Step 1:</strong> Log in to your Domain Service Provider DNS
                  account. (For eg., CloudFlare, GoDaddy, Google)
                </div>
                <div className="step-block">
                  <strong>Step 2:</strong> Go to DNS Management. Under DNS Records, Find
                  &quot;CNAME&quot; record. If you have any &quot;CNAME&quot; records
                  listed, delete them.
                </div>
                <div className="step-block">
                  <strong>Step 3:</strong> Click Add record and then change the record
                  type to &quot;CNAME&quot;.
                </div>
                <div className="step-block">
                  <strong>Step 4:</strong> When configuring your custom domain,
                  &quot;www.&quot; is not included in the URL. This is because
                  &quot;www.&quot; is a subdomain of your root domain.
                </div>
                <div className="step-block">
                  <strong>Step 5:</strong> Create your first CNAME record. In the Name
                  field, enter &quot;www&quot;. In the Target field, enter your FoodChow
                  sub-domain (foodchowdemoindia.foodchow.com).
                </div>
                <div className="dns-mock-table">
                  <div className="dns-col">
                    <span className="dns-label">Type</span>
                    <input
                      type="text"
                      className="dns-val-input"
                      defaultValue="CNAME"
                      readOnly
                    />
                  </div>
                  <div className="dns-col">
                    <span className="dns-label">Name</span>
                    <input
                      type="text"
                      className="dns-val-input"
                      defaultValue="www"
                      readOnly
                    />
                  </div>
                  <div className="dns-col">
                    <span className="dns-label">Target</span>
                    <input
                      type="text"
                      className="dns-val-input"
                      defaultValue="foodchowdemoindia.foodchow.com"
                      readOnly
                    />
                  </div>
                  <div className="dns-col">
                    <span className="dns-label">TTL</span>
                    <span className="dns-val-text">Auto</span>
                  </div>
                </div>
                <div className="step-block">
                  <strong>Step 6:</strong> Create your second CNAME record. In the Name
                  field, enter &quot;@&quot;. In the Target field, enter your FoodChow
                  sub-domain.
                </div>
                <div className="dns-mock-table">
                  <div className="dns-col">
                    <span className="dns-label">Type</span>
                    <input
                      type="text"
                      className="dns-val-input"
                      defaultValue="CNAME"
                      readOnly
                    />
                  </div>
                  <div className="dns-col">
                    <span className="dns-label">Name</span>
                    <input
                      type="text"
                      className="dns-val-input"
                      defaultValue="@"
                      readOnly
                    />
                  </div>
                  <div className="dns-col">
                    <span className="dns-label">Target</span>
                    <input
                      type="text"
                      className="dns-val-input"
                      defaultValue="foodchowdemoindia.foodchow.com"
                      readOnly
                    />
                  </div>
                  <div className="dns-col">
                    <span className="dns-label">TTL</span>
                    <span className="dns-val-text">Auto</span>
                  </div>
                </div>
              </div>

              <div className="note-highlight">
                NOTE: Make sure to put your FoodChow subdomain in the Target field.
              </div>

              <div className="detail-steps-link">
                For Detail steps, Please{" "}
                <a href="#" id="cnameGuideLink">
                  Click Here
                </a>
              </div>

              <div className="btn-center-container" style={{ marginBottom: "10px" }}>
                <button className="btn-action-teal" id="emailDevBtn">
                  Email Instructions to Developer
                </button>
              </div>
            </div>

            <WizardFooter />
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className="toast" id="toast" />

      {/* CNAME Configuration Guide Modal */}
      <div className="modal-overlay" id="cnameGuideModal">
        <div className="modal-box">
          <div className="modal-topbar">
            <button className="modal-back-btn" id="cnameGuideBackBtn" title="Close">
              <svg viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="modal-topbar-title">
              Configure CNAME Record for Different Domain Registrar
            </span>
          </div>
          <div className="modal-body">
            {/* TITLE */}
            <h1
              className="mg-h1"
              style={{
                textAlign: "left",
                color: "#18a999",
                fontSize: "22px",
                fontWeight: 700,
                marginBottom: "20px",
              }}
            >
              Configure CNAME Record for Different Domain Registrar
            </h1>

            {/* OVERVIEW */}
            <h2 className="mg-h1" style={{ fontSize: "16px", fontWeight: 600 }}>
              Overview
            </h2>
            <div className="mg-overview-box">
              <p className="mg-p">
                While the specifics differ depending on your domain registrar, there
                are five basic steps that are necessary for connecting a custom root
                domain to your FoodChow Subdomain:
              </p>
              <ol className="mg-ol">
                <li>
                  Purchase a domain from a domain registrar (e.g., GoDaddy, Wordpress,
                  BlueHost, etc.).
                </li>
                <li>Edit your domain&apos;s nameservers to change your DNS settings.</li>
                <li>
                  Create a CNAME record that points your custom domain to your own
                  website.
                </li>
                <li>
                  Add the domain to the Site &gt; Domains section of your own website.
                </li>
                <li>
                  Set the domain as your restaurant&apos;s/store&apos;s/cafe&apos;s
                  primary domain.
                </li>
              </ol>
              <p className="mg-p">
                If you want to use a custom subdomain (e.g.
                &quot;restaurantname.foodchow.com&quot;) instead of a root domain (e.g.
                &quot;restaurantname.com&quot;) please refer the Custom Subdomain&apos;s
                article.
              </p>
            </div>

            {/* PURCHASE */}
            <h2 className="mg-h2">Purchase a domain</h2>
            <p className="mg-p">
              In order to use a custom domain for your FoodChow site, you&apos;ll first
              have to purchase a custom domain. If you already have one, you can move on
              to the next section. If you are yet to purchase a custom domain, follow the
              instructions of the domain provider of your choice to purchase one.
            </p>
            <p className="mg-p">
              <a
                href="https://hosting.tenacioustechies.com/products/domain-registration"
                target="_blank"
              >
                https://hosting.tenacioustechies.com/products/domain-registration
              </a>
            </p>

            {/* CLOUDFLARE */}
            <h2 className="mg-h2">Cloudflare</h2>

            <h3 className="mg-h3">Edit CNAME in Cloudflare</h3>
            <p className="mg-p">
              After purchasing a custom domain for your FoodChow Subdomain, you&apos;ll
              have to change your custom domain&apos;s nameservers to Cloudflare so that
              you can set up an CNAME record. However, if you have the experience of
              setting up CNAME records directly on another provider, you may use that
              option and skip this step.
            </p>
            <ol className="mg-ol">
              <li>
                Go to{" "}
                <a href="http://cloudflare.com" target="_blank">
                  http://cloudflare.com
                </a>{" "}
                and click the Sign Up link to create an account
              </li>
              <li>
                Enter the domain name that you want to use for your FoodChow
                Restaurant/Store/Cafe without &quot;www&quot;. <b>Click Add Site.</b>
              </li>
            </ol>
            <img
              src="https://admin.foodchow.com/img/Add%20Site.png"
              alt="Cloudflare Add Site"
              className="mg-screenshot"
            />
            <ol className="mg-ol" start={3}>
              <li>
                Choose a Cloudflare plan. (A free plan should be enough to complete the
                steps below).
              </li>
              <li>
                Cloudflare will automatically scan your domain&apos;s DNS records and
                prompt you to review them. At this point, you can leave your records as
                is and click Continue.
              </li>
              <li>
                You&apos;ll then be prompted to change your domain&apos;s name servers.
                Scroll down and copy the names of the two Cloudflare nameservers listed:
              </li>
            </ol>
            <img
              src="https://admin.foodchow.com/img/listed.png"
              alt="Cloudflare nameservers"
              className="mg-screenshot"
            />
            <p className="mg-p">
              From here, the process of changing your domain&apos;s nameservers differs
              depending on the domain provider you&apos;re using. If your domain provider
              is not listed below, we recommend taking a look at their help articles to
              see how you can edit your domain&apos;s nameservers.
            </p>

            <h3 className="mg-h3">Create CNAME in Cloudflare</h3>
            <p className="mg-p">
              Next, you&apos;ll need to create CNAME records that point your custom
              domain to FoodChow. If you are using a different provider because you chose
              to not use Cloudflare in the previous step, we recommend taking a look at
              that provider&apos;s help articles to see how you can set up CNAME records.
              This article documents the use of Cloudflare.
            </p>
            <ol className="mg-ol">
              <li>Log in to your Cloudflare account.</li>
              <li>In the menu, click DNS.</li>
              <li>
                If you have any &apos;A&apos;, &apos;AAAA&apos;, or &apos;CNAME&apos;
                records listed, delete them.
              </li>
              <li>Click Add record and then change the record type to &quot;CNAME&quot;.</li>
            </ol>
            <img
              src="https://admin.foodchow.com/img/cname.png"
              alt="Cloudflare CNAME"
              className="mg-screenshot"
            />
            <ol className="mg-ol" start={5}>
              <li>
                When configuring your custom domain, &quot;www.&quot; is not included in
                the URL. This is because &quot;www.&quot; is a subdomain of your root
                domain (e.g. &quot;restaurantname.com&quot;). To use both domains,
                you&apos;ll have to create 2 CNAME records —one for your root domain, and
                one for your domain with &quot;www.&quot;.
              </li>
            </ol>
            <ul className="mg-ul">
              <li>
                Create your first CNAME record. In the Name field, enter &quot;www&quot;.
                In the Target field, enter your FoodChow Subdomain (e.g.
                restaurantname.foodchow.com).
              </li>
            </ul>
            <img
              src="https://admin.foodchow.com/img/www.png"
              alt="CNAME www record"
              className="mg-screenshot"
            />
            <ul className="mg-ul">
              <li>
                Create your second CNAME record. In the Name field, enter &quot;@&quot;.
                In the Target field, enter your FoodChow Subdomain (e.g.
                restaurantname.foodchow.com).
              </li>
            </ul>
            <img
              src="https://admin.foodchow.com/img/Atarget.png"
              alt="CNAME @ record"
              className="mg-screenshot"
            />

            {/* GODADDY */}
            <h2 className="mg-h2">GoDaddy</h2>

            <h3 className="mg-h3">Edit CNAME in Godaddy</h3>
            <p className="mg-p">
              Edit a CNAME, or alias, record in your DNS zone file in your GoDaddy
              account. CNAME records use a domain prefix, such as blog or your own
              website, yourownwebsite.com to point to another domain name, or URL.
            </p>
            <ol className="mg-ol">
              <li>
                Log in to your GoDaddy Domain Control Center. (Need help logging in? Find
                your username or password.)
              </li>
              <li>Select your domain to access the Domain Settings page.</li>
            </ol>
            <img
              src="https://admin.foodchow.com/img/domain.png"
              alt="GoDaddy Domain Settings"
              className="mg-screenshot"
            />
            <ol className="mg-ol" start={3}>
              <li>Select Manage DNS under Additional Settings.</li>
              <li>Select Edit next to the CNAME record you&apos;re editing.</li>
              <li>Edit the details for your CNAME record:</li>
            </ol>
            <ul className="mg-ul">
              <li>
                <b>Name:</b> The host name or prefix the CNAME record will be set to. You
                can include a period (.) but not as the first or last character.
                Consecutive periods (...) are not allowed, and the host cannot exceed 63
                characters or be the @ symbol. You can&apos;t use a host that&apos;s
                already assigned to an existing A record, TXT record or MX record.
              </li>
              <li>
                <b>Value:</b> The URL you are setting as the destination for the host.
                Type &quot;@&quot; to point directly to your root domain name.
              </li>
              <li>
                <b>TTL:</b> How long the server should cache information. The default
                setting is 1 hour.
              </li>
            </ul>
            <ol className="mg-ol" start={6}>
              <li>Select Save to complete your changes.</li>
            </ol>
            <p className="mg-p">
              Most DNS updates take effect within an hour, but could take up to 48 hours
              to update globally.
            </p>

            <h3 className="mg-h3">Add CNAME in Godaddy</h3>
            <p className="mg-p">
              Add a CNAME (alias) record to use a domain prefix, such as blog to point
              your domain to another domain name, or URL, when your domain is using
              GoDaddy nameservers. To add a domain prefix that points to an IP address,
              add a subdomain instead. The most common CNAME is www, with the @ symbol
              entered for the Value field. This will make www.yourownwebsite.com load to
              the same webpage as the root domain, yourownwebsite.com.
            </p>
            <ol className="mg-ol">
              <li>
                Log in to your GoDaddy Domain Control Center. (Need help logging in? Find
                your username or password.)
              </li>
              <li>Select your domain to access the Domain Settings page.</li>
            </ol>
            <img
              src="https://admin.foodchow.com/img/domainSettings.png"
              alt="GoDaddy Domain Settings"
              className="mg-screenshot"
            />
            <ol className="mg-ol" start={3}>
              <li>Select Manage DNS under Additional Settings.</li>
              <li>Select Add to add a new record.</li>
            </ol>
            <img
              src="https://admin.foodchow.com/img/add.png"
              alt="GoDaddy Add Record"
              className="mg-screenshot"
            />
            <ol className="mg-ol" start={5}>
              <li>Select CNAME from the Type menu options.</li>
              <li>Enter the details for your new CNAME record:</li>
            </ol>
            <ul className="mg-ul">
              <li>
                <b>Name:</b> The host name or prefix the CNAME record will be set to. You
                can include a period but not as the first or last character. Consecutive
                periods (...) are not allowed, and the host cannot exceed 63 characters
                or be the @ symbol. You can&apos;t use a host that&apos;s already assigned
                to an existing A record, TXT record or MX record.
              </li>
              <li>
                <b>Value:</b> The URL you are setting as the destination for the host.
                Type @ to point directly to your root domain name.
              </li>
              <li>
                <b>TTL:</b> How long the server should cache information. The default
                setting is 1 hour.
              </li>
            </ul>
            <ol className="mg-ol" start={7}>
              <li>Select Add Record to save your new CNAME record.</li>
            </ol>
            <p className="mg-p">
              Most DNS updates take effect within an hour, but could take up to 48 hours
              to update globally.
            </p>

            {/* GOOGLE DOMAIN */}
            <h2 className="mg-h2">Google Domain</h2>

            <h3 className="mg-h3">Edit CNAME in Google</h3>
            <p className="mg-p">
              You might need to add a CNAME record to your domain host to either verify
              your domain or reset your administrator password. Your domain host is
              typically where you purchased your domain name (like GoDaddy, Enom, or
              Name.com). You may also need to add a CNAME record to your domain host if
              you are in the process of mapping your website.
            </p>
            <ol className="mg-ol">
              <li>
                <b>Step 1. Sign in to your domain host</b>
                <ol className="mg-ol" style={{ listStyleType: "lower-alpha", marginTop: "4px" }}>
                  <li>If you don&apos;t know who this is, read Identify your domain host.</li>
                  <li>
                    Open a browser tab or window and sign in to your host&apos;s website.
                  </li>
                </ol>
              </li>
              <li>
                <b>Step 2: Get your unique CNAME record</b>
                <br />
                You get a unique CNAME record for your domain when you set up Google
                Workspace or when you reset your administrator password.
              </li>
            </ol>
            <img
              src="https://admin.foodchow.com/img/record.png"
              alt="Google CNAME record"
              className="mg-screenshot"
            />
            <ol className="mg-ol" start={3}>
              <li>Keep the page with this record open. You&apos;ll use it later.</li>
              <li>
                <b>Step 3: Add the CNAME record to your domain&apos;s DNS records</b>
                <br />
                If you&apos;re not familiar with CNAME records, contact your domain host,
                who can help you. You can use the email template below when you call or
                email their support team.
                <br />
                To add the CNAME record to your domain host, follow the steps below. See
                your domain host&apos;s documentation for more specific instructions.
                <ol className="mg-ol" style={{ listStyleType: "lower-alpha", marginTop: "4px" }}>
                  <li>Go to your domain&apos;s DNS records.</li>
                  <li>
                    Add a record to your DNS settings, selecting CNAME as the record
                    type.
                  </li>
                  <li>
                    Return to the first window or tab and copy the contents of the
                    Label/Host field.
                  </li>
                  <li>
                    Paste the copied contents into the Label or Host field with your DNS
                    records.
                  </li>
                  <li>
                    Return to the first window or tab and copy the contents of the
                    Destination/Target field.
                  </li>
                  <li>
                    Paste the copied contents into the Destination or Target field with
                    your DNS records.
                  </li>
                </ol>
              </li>
            </ol>
            <p className="mg-p">
              Your record should look similar to one of the tables below:{" "}
              <b>Reset CNAME Record</b>
            </p>
            <table className="mg-dns-table">
              <thead>
                <tr>
                  <th>Record type</th>
                  <th>Label/Host field</th>
                  <th>Time to Live (TTL)</th>
                  <th>Destination/Target field</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CNAME</td>
                  <td>googleXXXXXXXXXXXXXXXX</td>
                  <td>3600</td>
                  <td>google.com</td>
                </tr>
              </tbody>
            </table>
            <ol className="mg-ol" start={5}>
              <li>
                Save your record.
                <br />
                CNAME record changes can take up to 72 hours to go into effect, but
                typically they happen much sooner.
              </li>
              <li>
                Return to the setup or password reset panel in your other browser window
                and follow the next steps.
              </li>
            </ol>

            {/* DOMAIN.COM */}
            <h2 className="mg-h2">Domain.com</h2>

            <h3 className="mg-h3">Edit CNAME in Domain.com</h3>
            <ol className="mg-ol">
              <li>Log in to your Domains Dashboard.</li>
            </ol>
            <img
              src="https://admin.foodchow.com/img/dashboard.png"
              alt="Domain.com Dashboard"
              className="mg-screenshot"
            />
            <ol className="mg-ol" start={2}>
              <li>
                On the dashboard, select the domain that you wish to update the CNAME
                record. There are two views in the Domains dashboard - the Card and List
                views. Click on the view icons to switch to your preferred view.
              </li>
            </ol>
            <img
              src="https://admin.foodchow.com/img/listView.png"
              alt="Domain.com List View"
              className="mg-screenshot"
            />
            <ol className="mg-ol" start={3}>
              <li>
                Choose the domain you want to modify. In the Card view, click the
                domain&apos;s Manage button.
              </li>
            </ol>
            <img
              src="https://admin.foodchow.com/img/cardview.png"
              alt="Domain.com Card View"
              className="mg-screenshot"
            />
            <p className="mg-p">
              In List view, click the domain or its gear icon on the right-hand side.
            </p>
            <img
              src="https://admin.foodchow.com/img/listright.png"
              alt="Domain.com List View gear"
              className="mg-screenshot"
            />
            <ol className="mg-ol" start={4}>
              <li>On the left sidebar, click on DNS &amp; Nameservers.</li>
            </ol>
            <img
              src="https://admin.foodchow.com/img/Nameservers.png"
              alt="DNS &amp; Nameservers"
              className="mg-screenshot"
            />
            <ol className="mg-ol" start={5}>
              <li>On the DNS &amp; Nameservers page, select the DNS Records tab.</li>
            </ol>
            <img
              src="https://admin.foodchow.com/img/dnsRecord.png"
              alt="DNS Records tab"
              className="mg-screenshot"
            />
            <ol className="mg-ol" start={6}>
              <li>
                On the DNS Records tab, click the blue + button icon that says Add DNS
                Record.
              </li>
              <li>Enter the details for your CNAME record:</li>
            </ol>
            <ul className="mg-ul">
              <li>
                <b>Host Name:</b> In the name field, enter the prefix of your serving
                domain that you want to add the record for. For example, if your serving
                domain is www.example.com, enter just &apos;www&apos; there
              </li>
              <li>
                <b>Content:</b> This record allows you to use an alternative subdomain.
              </li>
              <li>
                <b>TTL:</b> This record determines how long the server should cache
                content
              </li>
              <li>
                <b>Priority:</b> Priority number is used to indicate which of the servers
                listed should attempt to use first, but you may leave this blank instead.
              </li>
            </ul>
            <ol className="mg-ol" start={8}>
              <li>Below is an example of a CNAME record</li>
            </ol>
            <table className="mg-dns-table">
              <thead>
                <tr>
                  <th>Host Name</th>
                  <th>Type</th>
                  <th>Content</th>
                  <th>TTL (Time To Live)</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>www</td>
                  <td>CNAME</td>
                  <td>example.mydomain.com</td>
                  <td>1 hour</td>
                  <td>n/a</td>
                </tr>
              </tbody>
            </table>

            {/* HOSTINGER */}
            <h2 className="mg-h2">Hostinger hPanel</h2>

            <h3 className="mg-h3">Edit CNAME in hPanel</h3>
            <p className="mg-p">
              Managing CNAME records via Hostinger&apos;s hPanel
              <br />
              You can manage your DNS records via the DNS Zone Editor. To add a new
              record, choose the type of record as CNAME (or scroll to the CNAME records
              section in the old interface).
            </p>
            <img
              src="https://admin.foodchow.com/img/zoneEditor.png"
              alt="hPanel Zone Editor"
              className="mg-screenshot"
            />
            <p className="mg-p">
              <b>NOTE:</b>
              <br />
              If your domain is pointed elsewhere by NS records, your DNS Zone management
              is moved to the provider you pointed the domain to and should be managed
              from there.
            </p>
            <p className="mg-p">
              <b>What to use as a Name (Host)?</b>
              <br />
              Name is the hostname for the record, without the domain name. This is
              generally referred to as a &quot;subdomain&quot;. We automatically append
              the domain name.
            </p>
            <p className="mg-p">
              <b>What to use as Target (Points to)?</b>
              <br />
              Target is for the domain name the CNAME points to. Make sure that both Name
              and Target are correct when creating the CNAME record - they determine how
              your CNAME record will work.
            </p>
            <p className="mg-p">
              <b>What to use as a TTL?</b>
              <br />
              If you haven&apos;t received any requirements for TTL from the service you
              want to point your domain to, leave a default TTL value.
            </p>
            <p className="mg-p">
              <b>How to edit or delete CNAME records?</b>
              <br />
              At the bottom you will see these buttons:
            </p>
            <img
              src="https://admin.foodchow.com/img/cnameRecord.png"
              alt="CNAME record buttons"
              className="mg-screenshot"
            />
            <ol className="mg-ol">
              <li>Button to delete record completely</li>
              <li>Button to edit record</li>
            </ol>
            <p className="mg-p">
              In the old interface, the editing and deleting options will appear as soon
              as you hover your pointer over the value you want to do changes to:
            </p>
            <img
              src="https://admin.foodchow.com/img/alias.png"
              alt="CNAME alias edit"
              className="mg-screenshot"
            />
            <ol className="mg-ol">
              <li>Button to edit record host, content or TTL</li>
              <li>Button to delete record completely</li>
              <li>Button to add a new record</li>
            </ol>
            <p className="mg-p">
              Any DNS Record changes trigger propagation, which can take up to 24 hours
              to fully propagate.
            </p>

            {/* REFERENCES */}
            <h2 className="mg-h2">References:</h2>
            <div className="mg-refs">
              <ul>
                <li>
                  <a
                    href="https://support.cloudflare.com/hc/en-us/articles/360020348832-Understanding-a-CNAME-Setup"
                    target="_blank"
                  >
                    https://support.cloudflare.com/hc/en-us/articles/360020348832-Understanding-a-CNAME-Setup
                  </a>
                </li>
                <li>
                  <a
                    href="https://in.godaddy.com/help/edit-a-cname-record-19237"
                    target="_blank"
                  >
                    https://in.godaddy.com/help/edit-a-cname-record-19237
                  </a>
                </li>
                <li>
                  <a
                    href="https://in.godaddy.com/help/add-a-cname-record-19236"
                    target="_blank"
                  >
                    https://in.godaddy.com/help/add-a-cname-record-19236
                  </a>
                </li>
                <li>
                  <a
                    href="https://documentation.unbounce.com/hc/en-us/articles/360028657092-Setting-Up-Your-CNAME-with-Google-Domains"
                    target="_blank"
                  >
                    https://documentation.unbounce.com/hc/en-us/articles/360028657092-Setting-Up-Your-CNAME-with-Google-Domains
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.google.com/a/answer/47283?hl=en"
                    target="_blank"
                  >
                    https://support.google.com/a/answer/47283?hl=en
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.domain.com/help/article/dns-management-how-to-update-cname-aliases"
                    target="_blank"
                  >
                    https://www.domain.com/help/article/dns-management-how-to-update-cname-aliases
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.hostinger.com/en/articles/4738777-how-to-manage-cname-records-on-hpanel"
                    target="_blank"
                  >
                    https://support.hostinger.com/en/articles/4738777-how-to-manage-cname-records-on-hpanel
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
