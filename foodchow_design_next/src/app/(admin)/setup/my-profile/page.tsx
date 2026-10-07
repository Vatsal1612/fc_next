"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { setupService } from "@/api/services/setup.service";
import { WizardFooter } from "@/components/shared/WizardFooter";
import Select from "react-select";
import type { MultiValue } from "react-select";
type CuisineOption = {
  value: string;
  label: string;
};
import "./page.css";
const cuisineSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: "48px",
    border: state.isFocused ? "1.5px solid #00a896" : "1.5px solid #e6eaee",
    borderRadius: "9px",
    boxShadow: state.isFocused ? "0 0 0 3px #e6f7f5" : "none",
    padding: "2px",
    backgroundColor: "#fff",
    fontFamily: '"Manrope", sans-serif',
    fontSize: "14px",
    "&:hover": {
      borderColor: "#00a896",
    },
    transition: "all 0.12s ease",
  }),

  valueContainer: (base: any) => ({
    ...base,
    padding: "6px 8px",
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
  }),

  placeholder: (base: any) => ({
    ...base,
    color: "#90a0ac",
    fontFamily: '"Poppins", sans-serif',
  }),

  menu: (base: any) => ({
    ...base,
    zIndex: 9999,
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginTop: "6px",
  }),

  menuList: (base: any) => ({
    ...base,
    padding: "6px",
    maxHeight: "260px",
  }),

  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#00a896"
      : state.isFocused
        ? "#e6f7f5"
        : "transparent",
    color: state.isSelected ? "#fff" : "#1f3a37",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: '"Poppins", sans-serif',
    padding: "8px 12px",
    borderRadius: "6px",
    marginBottom: "4px",
    ":active": {
      backgroundColor: "#008f7f",
      color: "#fff",
    },
  }),
};

/**
 * setup/my_profile.html → React.
 *
 * Conversion pattern (the template every other page follows):
 *  1. The exact original markup is rendered, wrapped in a single
 *     `#pg-<slug>` element that scopes the page CSS (see page.css).
 *     class→className, for→htmlFor, value→defaultValue, checked→defaultChecked,
 *     style="…"→style object, inline on* handlers removed, ids kept.
 *  2. The original inline <script> is ported verbatim into one useEffect that
 *     runs after mount, wiring behaviour with addEventListener / delegation so
 *     there is no hydration mismatch and behaviour stays identical.
 *  3. The external sidebar-loader.js is dropped — the shell renders the sidebar.
 */
export default function MyProfilePage() {
  const [shopId, setShopId] = useState<number | null>(null);

  const [profile, setProfile] = useState<any>({});
  const [address, setAddress] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [restaurantTypes, setRestaurantTypes] = useState<
    { id: string; label: string }[]
  >([]);
  const [cuisineOptions, setCuisineOptions] = useState<CuisineOption[]>([]);

  // Master lists (shop types + cuisines) come from the live API.
  useEffect(() => {
    setupService
      .getShopTypesAndCuisine()
      .then(({ shopTypes, cuisineTypes }) => {
        setRestaurantTypes(
          shopTypes.map((t) => ({ id: String(t.id), label: t.name.trim() })),
        );
        setCuisineOptions(
          cuisineTypes.map((c) => ({
            value: String(c.id),
            label: c.name.trim(),
          })),
        );
      })
      .catch((error) =>
        console.error("Failed to load shop types & cuisines:", error),
      );
  }, []);

  useEffect(() => {
    const id = sessionStorage.getItem("shop_id");
    if (id) {
      setShopId(Number(id));
    }
  }, []);

  useEffect(() => {
    if (shopId !== null) {
      loadProfile(shopId);
    }
  }, [shopId]);

  const loadProfile = async (currentShopId: number) => {
    try {
      setLoading(true);

      const [profileData, addressData] = await Promise.all([
        setupService.getRestaurantInformation(currentShopId),
        setupService.getRestaurantAddress(currentShopId),
      ]);

      setProfile(profileData ?? {});
      setAddress(addressData?.[0] ?? {});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveOwner = async () => {
    try {
      await setupService.saveOwnerInformation({
        shop_id: String(shopId),
        firstName: profile.first_name,
        lastName: profile.last_name,
        owner_email: profile.owner_eamil,
        phoneno: profile.owner_phoneno,
        promo_code: profile.promo_code,
      });

      alert("Owner updated");
    } catch (err) {
      console.log(err);
    }
  };
  const updateRestaurant = async () => {
    try {
      await setupService.updateShopProfile({
        shop_id: String(shopId),
        shop_name: profile.shop_name,
        email_id: profile.email_id,
        mobileno: profile.mobileno,
        CountryCode: profile.CountryCode,
        timezone: profile.timezone,
        subdomain: profile.subdomain,
        shoplogo: profile.shoplogo,
        business_type_id: profile.business_type_id,
        cuisine_type: profile.cuisine_type,
        shop_type: profile.shop_type,
        insta_url: profile.insta_url,
      });

      alert("Restaurant Updated");
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // 1. Save Owner Information
      await setupService.saveOwnerInformation({
        shop_id: String(shopId),
        firstName: profile.first_name,
        lastName: profile.last_name,
        owner_email: profile.owner_eamil,
        phoneno: profile.owner_phoneno,
        promo_code: profile.promo_code,
      });

      // 2. Update Restaurant Profile
      await setupService.updateShopProfile({
        shop_id: String(shopId),
        shop_name: profile.shop_name,
        email_id: profile.email_id,
        mobileno: profile.mobileno,
        CountryCode: profile.CountryCode,
        timezone: profile.timezone,
        subdomain: profile.subdomain,
        shoplogo: profile.shoplogo,
        business_type_id: profile.business_type_id,
        cuisine_type: profile.cuisine_type,
        shop_type: profile.shop_type,
        insta_url: profile.insta_url,
      });

      // 3. Update Address
      await setupService.updateShopAddress({
        id: address.id,
        houseno: address.houseno,
        address: address.address,
        address1: address.address1,
        country: address.country,
        state: address.state,
        city: address.city,
        area: address.area,
        pincode: address.pincode,
        latitude: address.latitude,
        longitude: address.longitude,
      });

      alert("Profile updated successfully.");

      // Optional: Refresh latest data
      if (shopId !== null) {
        loadProfile(shopId);
      }

    } catch (err: any) {
      console.error("Full Error:", err);

      console.log("Response:");
      console.log(err.response);

      console.log("Response Data:");
      console.log(err.response?.data);

      console.log("Validation Errors:");
      console.log(err.response?.data?.errors);

      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async () => {
    try {
      await setupService.updateShopAddress({
        id: address.id,
        houseno: address.houseno,
        address: address.address,
        address1: address.address1,
        country: address.country,
        state: address.state,
        city: address.city,
        area: address.area,
        pincode: address.pincode,
        latitude: address.latitude,
        longitude: address.longitude,
      });

      alert("Address updated");
    } catch (err) {
      console.log(err);
    }
  };
  void saveOwner; void updateRestaurant; void updateAddress;

  // Initialize Leaflet Map
  useEffect(() => {
    let map: any = null;
    let cancelled = false;

    const initMap = () => {
      if (!(window as any).L || !document.getElementById("map")) return;
      const L = (window as any).L;

      const lat = parseFloat(address?.latitude) || 21.1702;
      const lng = parseFloat(address?.longitude) || 72.8311;

      const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "OpenStreetMap",
      });
      const terrainLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution: "Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)",
      });
      // Satellite without labels
      const satelliteLayer = L.tileLayer("http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}", {
        attribution: "Google Maps",
      });
      // Satellite with labels (Hybrid)
      const hybridLayer = L.tileLayer("http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}", {
        attribution: "Google Maps",
      });

      map = L.map("map", {
        layers: [hybridLayer], // default to satellite with labels
        zoomControl: false,
      }).setView([lat, lng], 16);

      (window as any).myMap = map;

      // ── Custom Map UI Listeners ──
      const byId = (id: string) => document.getElementById(id);

      const terrainCheckbox = byId("terrainToggleCheckbox") as HTMLInputElement | null;
      const labelsCheckbox = byId("labelsToggleCheckbox") as HTMLInputElement | null;
      const terrainCont = byId("terrainCheckboxContainer");
      const labelsCont = byId("labelsCheckboxContainer");

      const onMapViewTab = function (this: HTMLElement): void {
        byId("satelliteViewTab")?.classList.remove("tab-active");
        this.classList.add("tab-active");

        if (terrainCont) {
          terrainCont.style.visibility = "visible";
        }
        if (labelsCont) {
          labelsCont.style.visibility = "hidden";
        }

        map.removeLayer(satelliteLayer);
        map.removeLayer(hybridLayer);

        if (terrainCheckbox?.checked) {
          map.removeLayer(streetLayer);
          terrainLayer.addTo(map);
        } else {
          map.removeLayer(terrainLayer);
          streetLayer.addTo(map);
        }
      };
      byId("mapViewTab")?.addEventListener("click", onMapViewTab);

      const onSatTab = function (this: HTMLElement): void {
        byId("mapViewTab")?.classList.remove("tab-active");
        this.classList.add("tab-active");

        if (terrainCont) {
          terrainCont.style.visibility = "hidden";
        }
        if (labelsCont) {
          labelsCont.style.visibility = "visible";
        }

        map.removeLayer(streetLayer);
        map.removeLayer(terrainLayer);

        if (labelsCheckbox?.checked) {
          map.removeLayer(satelliteLayer);
          hybridLayer.addTo(map);
        } else {
          map.removeLayer(hybridLayer);
          satelliteLayer.addTo(map);
        }
      };
      byId("satelliteViewTab")?.addEventListener("click", onSatTab);

      const onTerrainToggle = function (this: HTMLInputElement): void {
        if (!satelliteLayer._map && !hybridLayer._map) {
          if (this.checked) {
            map.removeLayer(streetLayer);
            terrainLayer.addTo(map);
          } else {
            map.removeLayer(terrainLayer);
            streetLayer.addTo(map);
          }
        }
      };
      terrainCheckbox?.addEventListener("change", onTerrainToggle);

      const onLabelsToggle = function (this: HTMLInputElement): void {
        if (!streetLayer._map && !terrainLayer._map) {
          if (this.checked) {
            map.removeLayer(satelliteLayer);
            hybridLayer.addTo(map);
          } else {
            map.removeLayer(hybridLayer);
            satelliteLayer.addTo(map);
          }
        }
      };
      labelsCheckbox?.addEventListener("change", onLabelsToggle);

      const onFullscreen = function (this: HTMLElement): void {
        const mapWrapper = byId("mapWrapper");
        if (!mapWrapper) return;

        const isCssFullscreen = mapWrapper.classList.contains("map-fullscreen");

        if (!document.fullscreenElement && !isCssFullscreen) {
          if (mapWrapper.requestFullscreen) {
            mapWrapper.requestFullscreen().catch(() => {
              // Ignore Permissions error, fallback to CSS
              mapWrapper.classList.add("map-fullscreen");
              const icon = byId("fullscreenToggleBtn")?.querySelector("i");
              if (icon) icon.className = "fas fa-compress";
              setTimeout(() => { if (map) map.invalidateSize(); }, 200);
            });
          } else {
            mapWrapper.classList.add("map-fullscreen");
            const icon = byId("fullscreenToggleBtn")?.querySelector("i");
            if (icon) icon.className = "fas fa-compress";
            setTimeout(() => { if (map) map.invalidateSize(); }, 200);
          }
        } else {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
          }
          if (isCssFullscreen) {
            mapWrapper.classList.remove("map-fullscreen");
            const icon = byId("fullscreenToggleBtn")?.querySelector("i");
            if (icon) icon.className = "fas fa-expand";
            setTimeout(() => { if (map) map.invalidateSize(); }, 200);
          }
        }
      };

      document.addEventListener("fullscreenchange", () => {
        const icon = byId("fullscreenToggleBtn")?.querySelector("i");
        if (icon) {
          icon.className = document.fullscreenElement
            ? "fa-solid fa-compress"
            : "fa-solid fa-expand";
        }
        setTimeout(() => { if (map) map.invalidateSize(); }, 200);
      });

      byId("fullscreenToggleBtn")?.addEventListener("click", onFullscreen);

      const onPanPad = (e: Event): void => {
        const dir = (e.target as HTMLElement).getAttribute("data-dir");
        if (!dir) return;
        const p = 150;
        if (dir === "up") map.panBy([0, -p]);
        if (dir === "down") map.panBy([0, p]);
        if (dir === "left") map.panBy([-p, 0]);
        if (dir === "right") map.panBy([p, 0]);
      };
      byId("panPad")?.addEventListener("click", onPanPad);

      // Make marker completely static with no popup and RED color
      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      L.marker([lat, lng], { icon: redIcon, draggable: false }).addTo(map);

      // Force Leaflet to recalculate map size once container is fully rendered
      setTimeout(() => {
        if (map && !cancelled) {
          map.invalidateSize();
        }
      }, 500);
    };

    const timer = setInterval(() => {
      if (cancelled) return;
      if ((window as any).L && document.getElementById("map")) {
        clearInterval(timer);
        initMap();
      }
    }, 100);

    return () => {
      cancelled = true;
      clearInterval(timer);
      if (map) {
        map.remove();
      }
    };
  }, [address?.latitude, address?.longitude]);

  useEffect(() => {
    let currentStep = 1;

    const go = (n: number): void => {
      if (n < 1 || n > 3) return;
      currentStep = n;
      for (let i = 1; i <= 3; i++) {
        document.getElementById("step" + i)?.classList.toggle("hidden", i !== n);
        const st = document.getElementById("s" + i);
        st?.classList.toggle("on", i === n);
        st?.classList.toggle("done", i < n);
      }
      const badge = document.getElementById("stepBadge");
      if (badge) badge.textContent = n + "/3";
      document
        .querySelector(".content-area")
        ?.scrollTo({ top: 0, behavior: "smooth" });

      // If switching to the map step, force Leaflet to recalculate size explicitly
      if (n === 3) {
        setTimeout(() => {
          if ((window as any).myMap) {
            (window as any).myMap.invalidateSize();
          }
        }, 100);
      }
    };

    const addTag = (e: KeyboardEvent): void => {
      if (e.key !== "Enter") return;
      const target = e.target as HTMLInputElement;
      const v = target.value.trim();
      if (!v) return;
      const tag = document.createElement("div");
      tag.className = "tag";
      tag.innerHTML = v + ' <button type="button">×</button>';
      target.parentNode?.insertBefore(tag, target);
      target.value = "";
      e.preventDefault();
    };

    const toggleAddr = (): void => {
      const panel = document.getElementById("addrPanel");
      const btn = document.getElementById("addrToggle");
      const open = panel?.classList.toggle("open");
      btn?.classList.toggle("open", !!open);
    };

    // ── Wire handlers (replaces the original inline on* attributes) ──
    const stepClicks: Array<[HTMLElement | null, () => void]> = [
      [document.getElementById("s1"), () => go(1)],
      [document.getElementById("s2"), () => go(2)],
      [document.getElementById("s3"), () => go(3)],
    ];
    stepClicks.forEach(([el, fn]) => el?.addEventListener("click", fn));

    const tagInp = document.getElementById("taginp") as HTMLInputElement | null;
    tagInp?.addEventListener("keydown", addTag);

    const tagWrap = tagInp?.parentElement;
    const focusTag = () => tagInp?.focus();
    tagWrap?.addEventListener("click", focusTag);
    // Delegate the per-tag remove button (handles dynamically added tags too).
    const removeDelegate = (e: Event) => {
      const btn = (e.target as HTMLElement).closest(".tag button");
      if (btn) btn.closest(".tag")?.remove();
    };
    tagWrap?.addEventListener("click", removeDelegate);

    const addrToggle = document.getElementById("addrToggle");
    addrToggle?.addEventListener("click", toggleAddr);

    const prevBtn = document.getElementById("navPrev");
    const nextBtn = document.getElementById("navNext");
    const goPrev = () => go(currentStep - 1);
    const goNext = () => go(currentStep + 1);
    prevBtn?.addEventListener("click", goPrev);
    nextBtn?.addEventListener("click", goNext);

    // In-wizard Previous / Next buttons (data-step-nav="prev" | "next").
    const root = document.getElementById("pg-setup-my-profile");
    const onStepNav = (e: Event): void => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-step-nav]",
      );
      if (!btn) return;
      go(currentStep + (btn.dataset.stepNav === "next" ? 1 : -1));
    };
    root?.addEventListener("click", onStepNav);

    return () => {
      root?.removeEventListener("click", onStepNav);
      stepClicks.forEach(([el, fn]) => el?.removeEventListener("click", fn));
      tagInp?.removeEventListener("keydown", addTag);
      tagWrap?.removeEventListener("click", focusTag);
      tagWrap?.removeEventListener("click", removeDelegate);
      addrToggle?.removeEventListener("click", toggleAddr);
      prevBtn?.removeEventListener("click", goPrev);
      nextBtn?.removeEventListener("click", goNext);
    };
  }, []);

  return (
    <div id="pg-setup-my-profile">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"
        strategy="afterInteractive"
      />

      {/* ── LOADER ── */}
      <div className="app-container">
        <div className="main">
          <div className="content-area">
            {/* PROFILE SETUP CARD — a form-within-a-page with its own tabs */}
            <div className="pf-card">
              <div className="pf-card-head">
                <div className="pf-card-title">
                  <span>Profile Setup</span>
                  <span className="pf-badge">
                    Section <b id="stepBadge">1/3</b>
                  </span>
                </div>
                {/* STEPPER (tabs) */}
                <div className="stepper">
                  <div className="st on" id="s1">
                    <span className="num">1</span>
                    <span className="lab">Owner Information</span>
                  </div>
                  <div className="line" />
                  <div className="st" id="s2">
                    <span className="num">2</span>
                    <span className="lab">Other Information</span>
                  </div>
                  <div className="line" />
                  <div className="st" id="s3">
                    <span className="num">3</span>
                    <span className="lab">Restaurant Information</span>
                  </div>
                </div>
              </div>

              <div className="pf-card-body">
            <div className="timehint">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4l3 2" />
              </svg>
              About a minute — most of it&apos;s already filled in from your signup.
            </div>

            {/* STEP 1 — Owner Information */}
            <div id="step1">
              <h1 className="typ-page-heading" style={{ margin: 0 }}>Owner Information</h1>
              <div className="ssub">
                We pulled these from your signup. Just check they&apos;re right.
              </div>
              <div className="grid2">
                <div className="field">
                  <span className="lab2">
                    First Name <span className="req">*</span>
                  </span>
                  <input className="inp prefill" type="text"
                    value={profile.first_name || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        first_name: e.target.value,
                      })
                    } />
                  <span className="filledtag">
                    <svg viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" />
                    </svg>{" "}
                    From your signup
                  </span>
                </div>
                <div className="field">
                  <span className="lab2">
                    Last Name <span className="req">*</span>
                  </span>
                  <input className="inp prefill" type="text"
                    value={profile.last_name || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        last_name: e.target.value
                      })
                    } />
                  <span className="filledtag">
                    <svg viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" />
                    </svg>{" "}
                    From your signup
                  </span>
                </div>
                <div className="field">
                  <span className="lab2">
                    Email Address <span className="req">*</span>
                  </span>
                  <input
                    className="inp prefill"
                    type="email"
                    value={profile.owner_eamil || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        owner_eamil: e.target.value
                      })
                    }
                  />
                  <span className="filledtag">
                    <svg viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" />
                    </svg>{" "}
                    From your signup
                  </span>
                </div>
                <div className="field">
                  <span className="lab2">
                    Mobile No [Order Taking Number] <span className="req">*</span>
                  </span>
                  <input className="inp prefill" type="tel" value={profile.owner_phoneno || ""} onChange={(e) => setProfile({ ...profile, owner_phoneno: e.target.value })} />
                  <span className="helper">
                    Where new order alerts go. Restaurant landline can be added later.
                  </span>
                </div>
                <div className="field">
                  <span className="lab2">
                    Restaurant Phone No <span className="pill opt">Optional</span>
                  </span>
                  <input className="inp" type="tel" value={profile.mobileno || ""} onChange={(e) => setProfile({ ...profile, mobileno: e.target.value })} />
                  <span className="helper">
                    Shown to customers on your restaurant page.
                  </span>
                </div>
              </div>
              <div className="cap">
                Every field we already captured at signup is pre-filled and marked, so
                step 1 is a 10-second confirm instead of re-typing the same data a
                second time.
              </div>
              <div className="step-nav">
                <span className="step-nav-hint">Section 1 of 3 · Next up: Other Information</span>
                <button type="button" className="nav-btn" data-step-nav="next">
                  NEXT: OTHER INFO
                  <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            </div>

            {/* STEP 2 — Other Information */}
            <div id="step2" className="hidden">
              <h1 className="typ-page-heading" style={{ margin: 0 }}>Other Information</h1>
              <div className="ssub">
                Tell us about your restaurant type and cuisines.
              </div>
              <div className="grid2">
                <div className="field">
                  <span className="lab2">
                    Restaurant Type <span className="req">*</span>
                  </span>
                  {/*<div className="check-wrap">
                    <label className="check-item">
                      <input type="checkbox" defaultChecked /> Vegetarian
                    </label>
                    <label className="check-item">
                      <input type="checkbox" /> Non vegetarian
                    </label>
                    <label className="check-item">
                      <input type="checkbox" defaultChecked /> Jain
                    </label>
                    <label className="check-item">
                      <input type="checkbox" /> Vegan
                    </label>
                    <label className="check-item">
                      <input type="checkbox" /> Eggetarian
                    </label>
                    <label className="check-item">
                      <input type="checkbox" /> Gluten-Free
                    </label>
                    <label className="check-item">
                      <input type="checkbox" /> Halal
                    </label>
                    <label className="check-item">
                      <input type="checkbox" /> Organic
                    </label>
                    <label className="check-item">
                      <input type="checkbox" /> Ayurvedic
                    </label>
                  </div>*/}
                  <div className="check-wrap">
                    {restaurantTypes.map((item) => (
                      <label key={item.id} className="check-item">
                        <input
                          type="checkbox"
                          checked={profile.shop_type?.split(",").includes(item.id) || false}
                          onChange={(e) => {
                            const selected = profile.shop_type
                              ? profile.shop_type.split(",")
                              : [];

                            let updated = [];

                            if (e.target.checked) {
                              updated = [...selected, item.id];
                            } else {
                              updated = selected.filter((id: any) => id !== item.id);
                            }

                            setProfile({
                              ...profile,
                              shop_type: updated.join(","),
                            });
                          }}
                        />

                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <span className="lab2">
                    Select Your Restaurant Cuisines <span className="req">*</span>
                  </span>
                  <Select
                    instanceId="restaurant-cuisine"
                    inputId="restaurant-cuisine"
                    isMulti
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    menuPlacement="auto"
                    maxMenuHeight={260}
                    styles={cuisineSelectStyles}
                    classNamePrefix="fc-cuisine"
                    options={cuisineOptions}
                    value={cuisineOptions.filter(option =>
                      profile.cuisine_type?.split(",").includes(option.value)
                    )}
                    onChange={(selected: MultiValue<CuisineOption>) => {
                      setProfile({
                        ...profile,
                        cuisine_type: selected.map((item) => item.value).join(","),
                      });
                    }}
                  />
                  {/* <div className="tag-wrap">
                    <div className="tag">
                      Pizza <button type="button">×</button>
                    </div>
                    <div className="tag">
                      Wraps <button type="button">×</button>
                    </div>
                    <div className="tag">
                      Chinese <button type="button">×</button>
                    </div>
                    <input
                      className="tag-inp"
                      id="taginp"
                      type="text"
                      placeholder="Type and press Enter…"
                    />
                  </div> */}
                  <span className="helper">
                    Type a cuisine and press Enter to add it.
                  </span>
                </div>
                <div className="field">
                  <span className="lab2">
                    Default Currency <span className="req">*</span>{" "}
                    <span className="pill auto">Auto</span>
                  </span>
                  <input
                    className="inp prefill"
                    type="text"
                    value={profile.currency || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        currency: e.target.value,
                      })
                    }
                  />
                  <span className="helper">Set from your country. Change if needed.</span>
                </div>
              </div>
              <div className="cap">
                Dietary type and cuisine affect how you appear on the FoodChow
                marketplace — they&apos;re required here so customers can find you.
              </div>
              <div className="step-nav">
                <button type="button" className="nav-btn ghost" data-step-nav="prev">
                  <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
                  BACK: OWNER
                </button>
                <span className="step-nav-hint">Section 2 of 3</span>
                <button type="button" className="nav-btn" data-step-nav="next">
                  NEXT: RESTAURANT INFO
                  <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            </div>

            {/* STEP 3 — Restaurant Information */}
            <div id="step3" className="hidden">
              <h1 className="typ-page-heading" style={{ margin: 0 }}>Restaurant Information</h1>
              <div className="ssub">
                Your restaurant address and details for the listing page.
              </div>
              <div className="grid2" style={{ marginBottom: "18px" }}>
                <div className="field">
                  <span className="lab2">
                    Restaurant Name <span className="req">*</span>
                  </span>
                  <input className="inp" type="text" value={profile.shop_name || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        shop_name: e.target.value
                      })
                    } />
                </div>
                <div className="field">
                  <span className="lab2">
                    Restaurant Website URL <span className="req">*</span>
                  </span>
                  <input
                    className="inp"
                    type="text"
                    value={profile.subdomain || ""}
                    onChange={(e) => setProfile({ ...profile, subdomain: e.target.value })}
                  />
                </div>
                <div className="field">
                  <span className="lab2">
                    Promocode <span className="pill opt">Optional</span>
                  </span>
                  <input className="inp" type="text" value={profile.promo_code || ""} onChange={(e) => setProfile({ ...profile, promo_code: e.target.value })} />
                </div>
                <div className="field">
                  <span className="lab2">
                    Timezones <span className="req">*</span>{" "}
                    <span className="pill auto">Auto</span>
                  </span>
                  <input
                    className="inp prefill"
                    type="text"
                    value={profile.timezone || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        timezone: e.target.value,
                      })
                    }

                  />
                </div>
              </div>
              <div className="field full" style={{ marginBottom: 0 }}>
                <span className="lab2">
                  Find your restaurant{" "}
                  <span className="pill go">Needed for delivery &amp; listing</span>
                </span>
                <div className="searchwrap">
                  <svg className="s" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4-4" />
                  </svg>
                  <input
                    className="inp"
                    type="text"
                    value={address.search_query || ""}
                    onChange={(e) => setAddress({ ...address, search_query: e.target.value })}
                    placeholder="Search your restaurant address…"
                  />
                </div>
                <span className="helper">
                  Auto-fills area, city, state, pincode &amp; timezone — no separate
                  fields needed.
                </span>
              </div>
              <div className="map-wrapper-canvas" id="mapWrapper">
                <div className="custom-map-type-control">
                  <div className="map-type-tabs-row">
                    <button
                      className="map-tab-btn"
                      id="mapViewTab"
                      data-type="map"
                      type="button"
                    >
                      Map
                    </button>
                    <button
                      className="map-tab-btn tab-active"
                      id="satelliteViewTab"
                      data-type="satellite"
                      type="button"
                    >
                      Satellite
                    </button>
                  </div>
                  <div className="map-sub-options-panel" id="terrainCheckboxContainer" style={{ visibility: 'hidden', left: 0 }}>
                    <input type="checkbox" id="terrainToggleCheckbox" />
                    <label htmlFor="terrainToggleCheckbox" style={{ cursor: "pointer" }}>
                      Terrain
                    </label>
                  </div>
                  <div className="map-sub-options-panel" id="labelsCheckboxContainer" style={{ right: 0 }}>
                    <input type="checkbox" id="labelsToggleCheckbox" defaultChecked />
                    <label htmlFor="labelsToggleCheckbox" style={{ cursor: "pointer" }}>
                      Labels
                    </label>
                  </div>
                </div>

                <div className="google-fullscreen-control">
                  <button
                    className="google-control-box"
                    id="fullscreenToggleBtn"
                    title="Toggle Fullscreen"
                    type="button"
                  >
                    <i className="fas fa-expand" />
                  </button>
                </div>

                <div className="google-bottom-right-controls">
                  <div className="google-pan-pad" id="panPad">
                    <i className="fas fa-caret-up pan-up" data-dir="up" />
                    <i className="fas fa-caret-left pan-left" data-dir="left" />
                    <i className="fas fa-caret-right pan-right" data-dir="right" />
                    <i className="fas fa-caret-down pan-down" data-dir="down" />
                  </div>
                  <div className="google-pegman-box" title="Drag to enter Street View">
                    <div className="pegman-icon" />
                  </div>
                </div>

                <div id="map" className="map" style={{ zIndex: 1, height: "350px", minHeight: "350px" }}></div>
              </div>
              <button className="disclosure-btn" id="addrToggle">
                <svg viewBox="0 0 24 24" id="addrCaret">
                  <path d="M9 6l6 6-6 6" />
                </svg>
                Edit address details (area, pincode, building no)
              </button>
              <div className="addr-panel" id="addrPanel">
                <div className="addr-grid">
                  <div className="field">
                    <span className="lab2">
                      Apartment / Building / House No <span className="req">*</span>
                    </span>
                    <input className="inp prefill" type="text" value={address.houseno || ""} onChange={(e) => setAddress({ ...address, houseno: e.target.value })} />
                  </div>
                  <div className="field">
                    <span className="lab2">Pincode</span>
                    <input className="inp prefill" type="text" value={address.pincode || ""} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />
                  </div>
                  <div className="field">
                    <span className="lab2">
                      Address Line 1 <span className="req">*</span>
                    </span>
                    <input className="inp prefill" type="text" value={address.address || ""} onChange={(e) => setAddress({ ...address, address: e.target.value })} />
                  </div>
                  <div className="field">
                    <span className="lab2">
                      Address Line 2 <span className="pill opt">Optional</span>
                    </span>
                    <input className="inp" type="text" value={address.address1 || ""} onChange={(e) => setAddress({ ...address, address1: e.target.value })} />
                  </div>
                  <div className="field">
                    <span className="lab2">
                      Area / Suburb <span className="req">*</span>
                    </span>
                    <input className="inp prefill" type="text" value={address.area || ""} onChange={(e) => setAddress({ ...address, area: e.target.value })} />
                  </div>
                  <div className="field">
                    <span className="lab2">
                      City <span className="req">*</span>
                    </span>
                    <input className="inp prefill" type="text" value={address.city || ""} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                  </div>
                  <div className="field">
                    <span className="lab2">
                      State <span className="req">*</span>
                    </span>
                    <input className="inp prefill" type="text" value={address.state || ""} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                  </div>
                  <div className="field">
                    <span className="lab2">
                      Country <span className="req">*</span>
                    </span>
                    <input className="inp prefill" type="text" value={address.country || ""} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="skipnote">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16h.01" />
                </svg>
                <div>
                  Only doing <b>pickup or QR table ordering</b> for now? You can skip the
                  address and still go live — we&apos;ll ask again the moment you switch
                  on delivery or marketplace listing.
                </div>
              </div>
              <div className="cap">
                Drop the pin exactly on your restaurant — this sets the delivery radius
                and your Google listing location. Address details are collapsed by
                default and auto-filled from your search.
              </div>
              <div className="step-nav">
                <button type="button" className="nav-btn ghost" data-step-nav="prev">
                  <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
                  BACK: OTHER INFO
                </button>
                <span className="step-nav-hint">Section 3 of 3 · Last step</span>
                <button
                  type="button"
                  className="nav-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "SAVE & SUBMIT"}
                </button>
              </div>
            </div>

              </div>{/* /pf-card-body */}
            </div>{/* /pf-card */}

            <div className="pf-page-nav-note">
              <span>Setup pages</span>
              Finished with My Profile? Use the buttons below to move to the next setup page.
            </div>
            <WizardFooter />
          </div>
          {/* /content-area */}
        </div>
        {/* /main */}
      </div>
      {/* /layout */}
    </div>
  );
}
