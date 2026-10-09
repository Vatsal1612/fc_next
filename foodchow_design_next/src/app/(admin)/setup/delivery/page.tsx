"use client";

import { useEffect, useState, useRef } from "react";
import { setupService } from "@/api/services/setup.service";
import Script from "next/script";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

/**
 * setup/delivery.html → React.
 *
 * Leaflet + Leaflet.draw are page-specific CDN libs: their stylesheets are linked
 * in JSX (React hoists them) and the scripts are loaded with next/script
 * (afterInteractive). Because the map API is only available at runtime, the whole
 * map/zone/table behaviour from the inline <script> is ported into one useEffect
 * that waits (poll) until `window.L` and `window.L.Draw` exist, then initialises.
 * Inline onclick handlers (toggleRowEdit / openDeleteModal / closeDeleteModal /
 * closeDetailsModal / openHelpModal) are wired via addEventListener and event
 * delegation (for dynamically-inserted rows). The sidebar/dropdown helpers
 * (shell-only) and the external sidebar-loader.js are dropped.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Minimal structural typings for the Leaflet globals actually used here.
interface LLayer {
  addTo(map: LMap): LLayer;
  _map?: unknown;
  getRadius?: () => number;
  getLatLng?: () => { lat: number; lng: number };
  getLatLngs?: () => any;
  bindPopup?: (html: string) => LLayer;
  openPopup?: () => LLayer;
}
interface LMap {
  getCenter(): unknown;
  getZoom(): number;
  setView(center: unknown, zoom: number): void;
  removeLayer(layer: LLayer): void;
  addLayer(layer: LLayer): void;
  panBy(offset: [number, number]): void;
  invalidateSize(): void;
  on(event: string, handler: (e: { layer: LLayer }) => void): void;
}
interface LCircle extends LLayer {
  getRadius(): number;
  getLatLng(): { lat: number; lng: number };
  bindPopup(html: string): LCircle;
  openPopup(): LCircle;
}
interface LDrawPolygon {
  enable(): void;
  disable(): void;
}
interface LeafletStatic {
  map(
    id: string,
    opts: {
      center: unknown;
      zoom: number;
      layers: LLayer[];
      zoomControl: boolean;
    }
  ): LMap;

  tileLayer(
    url: string,
    opts: { maxZoom: number }
  ): LLayer;

  circle(
    center: unknown,
    opts: Record<string, unknown>
  ): LCircle;

  polygon(
    points: any[],
    opts: Record<string, unknown>
  ): LLayer;

  Draw: {
    Polygon: new (
      map: LMap,
      opts: Record<string, unknown>
    ) => LDrawPolygon;

    Event: {
      CREATED: string;
    };
  };

  Edit: {
    Circle: new (
      layer: LLayer,
      options?: Record<string, unknown>
    ) => {
      enable(): void;
      disable(): void;
    };

    Poly: new (
      layer: LLayer
    ) => {
      enable(): void;
      disable(): void;
    };
  };
}
declare global {
  interface Window {
    L?: LeafletStatic;
  }
}

export default function DeliveryPage() {
  const [deliveryType, setDeliveryType] = useState<"area" | "zone">("area");
  const [areas, setAreas] = useState([
    { id: 1, active: true, name: "Sydney", minAmt: 110, freeAmt: 120, fee: 10, time: "10 Minute" },
    { id: 2, active: true, name: "kadodara", minAmt: 500, freeAmt: 510, fee: 15, time: "10 Minute" },
    { id: 3, active: true, name: "ADAJAN", minAmt: 200, freeAmt: 510, fee: 30, time: "20 Minute" },
    { id: 4, active: true, name: "katargam", minAmt: 200, freeAmt: 510, fee: 30, time: "20 Minute" },
    { id: 5, active: true, name: "Dumas", minAmt: 100, freeAmt: 200, fee: 50, time: "10 Minute" }
  ]);
  const [zones, setZones] = useState<any[]>([]);

  const editingZoneRef = useRef<any | null>(null);
  const editModeRef = useRef<"FORM" | "MAP" | null>(null);

  const mapRef = useRef<LMap | null>(null);
  const loadZoneOnMapRef = useRef<((zone: any) => void) | null>(null);

  const mapEditorRef = useRef<any | null>(null);
  const validateFreeDeliveryAmount = (): boolean => {
    const minAmt =
      (document.getElementById("formMinAmt") as HTMLInputElement | null)
        ?.value.trim() || "";

    const freeAmt =
      (document.getElementById("formFreeAmt") as HTMLInputElement | null)
        ?.value.trim() || "";

    const errorElement =
      document.getElementById("freeDeliveryError");

    if (!errorElement) return true;

    // Don't show error when fields are empty
    if (!minAmt || !freeAmt) {
      errorElement.style.display = "none";
      return true;
    }

    const minimumOrder = Number(minAmt);
    const freeDelivery = Number(freeAmt);

    if (freeDelivery <= minimumOrder) {
      errorElement.style.display = "block";
      return false;
    }

    errorElement.style.display = "none";
    return true;
  };

  const groupZones = (rawZones: any[]) => {
    const grouped = new Map<string | number, any>();

    rawZones.forEach((item) => {
      const id = item.Id ?? item.id ?? item.zone_id;

      if (!id) return;

      if (!grouped.has(id)) {
        grouped.set(id, {
          ...item,
          latArray: [],
          longArray: [],
        });
      }

      const zone = grouped.get(id);

      const type = String(item.type ?? item.shape ?? "")
        .trim()
        .toUpperCase();

      if (type === "SHAPE") {
        if (item.latitude != null) {
          zone.latArray.push(String(item.latitude));
        }

        if (item.longitude != null) {
          zone.longArray.push(String(item.longitude));
        }
      } else if (type === "CIRCLE") {
        zone.latArray = [
          String(item.latitude ?? "")
        ];

        zone.longArray = [
          String(item.longitude ?? "")
        ];
      }
    });

    return Array.from(grouped.values());
  };

  useEffect(() => {
    let cancelled = false;
    const cleanups: Array<() => void> = [];

    const init = (): void => {
      const L = window.L;
      if (!L) return;

      const byId = (id: string) => document.getElementById(id);

      // ── MAP ──
      let mapCircle: LCircle | null = null;
      let mapPolygon: LDrawPolygon | null = null;
      let activeDrawnLayer: LLayer | null = null;
      const defaultCenter = [21.1702, 72.8311];
      const streetLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxZoom: 19 },
      );
      const terrainLayer = L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        { maxZoom: 17 },
      );
      // Satellite without labels
      const satelliteLayer = L.tileLayer(
        "http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}",
        { maxZoom: 19 },
      );
      // Satellite with labels (Hybrid)
      const hybridLayer = L.tileLayer(
        "http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}",
        { maxZoom: 19 },
      );

      const map = L.map("map", {
        center: defaultCenter,
        zoom: 13,
        layers: [hybridLayer], // default to satellite with labels
        zoomControl: false,
      });
      mapRef.current = map;

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

      const mapViewTab = byId("mapViewTab");
      mapViewTab?.addEventListener("click", onMapViewTab);

      const satViewTab = byId("satelliteViewTab");
      satViewTab?.addEventListener("click", onSatTab);

      terrainCheckbox?.addEventListener("change", onTerrainToggle);
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

      const fullscreenBtn = byId("fullscreenToggleBtn");
      fullscreenBtn?.addEventListener("click", onFullscreen);

      const onPanPad = (e: Event): void => {
        const dir = (e.target as HTMLElement).getAttribute("data-dir");
        if (!dir) return;
        const p = 150;
        if (dir === "up") map.panBy([0, -p]);
        if (dir === "down") map.panBy([0, p]);
        if (dir === "left") map.panBy([-p, 0]);
        if (dir === "right") map.panBy([p, 0]);
      };
      const panPad = byId("panPad");
      panPad?.addEventListener("click", onPanPad);

      const updateCirclePopup = (): void => {
        if (!mapCircle) return;
        const r = (mapCircle.getRadius() / 1000).toFixed(2);
        mapCircle
          .bindPopup(
            `<div style="font-weight:700;font-size:12px;">Radius: ${r} km</div>`,
          )
          .openPopup();
      };

      const loadZoneOnMap = (zone: any): void => {

        if (mapEditorRef.current) {
          try {
            mapEditorRef.current.disable();
          } catch (error) {
            console.log("Error disabling previous editor:", error);
          }

          mapEditorRef.current = null;
        }

        if (mapCircle) {
          map.removeLayer(mapCircle);
          mapCircle = null;
        }

        if (activeDrawnLayer) {
          map.removeLayer(activeDrawnLayer);
          activeDrawnLayer = null;
        }



        const shape = String(
          zone.type ??
          zone.shape ??
          ""
        )
          .trim()
          .toUpperCase();

        console.log("========== POLYGON DEBUG ==========");
        console.log("FULL ZONE OBJECT:", zone);
        console.log("ZONE KEYS:", Object.keys(zone));
        console.log("type:", zone.type);
        console.log("shape:", zone.shape);
        console.log("latArray:", zone.latArray);
        console.log("longArray:", zone.longArray);
        console.log("latitudeArray:", zone.latitudeArray);
        console.log("longitudeArray:", zone.longitudeArray);
        console.log("latitude:", zone.latitude);
        console.log("longitude:", zone.longitude);
        console.log("==================================");


        if (shape === "CIRCLE") {
          const lat = Number(
            zone.latitude ??
            zone.lat ??
            zone.latArray?.[0]
          );

          const lng = Number(
            zone.longitude ??
            zone.lng ??
            zone.longArray?.[0]
          );

          const radius = Number(zone.radius ?? 1000);

          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            console.error("Invalid circle coordinates:", zone);
            return;
          }

          mapCircle = L.circle([lat, lng], {
            color: zone.color ?? zone.col ?? "#2b7891",
            fillColor: zone.color ?? zone.col ?? "#5ca4bb",
            fillOpacity: 0.35,
            weight: 2,
            radius,
          });

          mapCircle.addTo(map);

          activeDrawnLayer = mapCircle;

          map.setView([lat, lng], 15);

          // IMPORTANT:
          // Store editor in ref
          const circleEditor = new (L as any).Edit.Circle(mapCircle, {
            moveMarker: true,
          });

          circleEditor.enable();

          mapEditorRef.current = circleEditor;

          console.log("Circle loaded and editable.");

          return;
        }

        // -----------------------------------------
        // POLYGON
        // -----------------------------------------

        if (shape === "SHAPE") {
          let latArray: any = zone.latArray ?? zone.latitudeArray ?? [];
          let longArray: any = zone.longArray ?? zone.longitudeArray ?? [];

          // If API sends JSON string
          if (typeof latArray === "string") {
            try {
              latArray = JSON.parse(latArray);
            } catch {
              latArray = [];
            }
          }

          if (typeof longArray === "string") {
            try {
              longArray = JSON.parse(longArray);
            } catch {
              longArray = [];
            }
          }

          // Make sure arrays actually exist
          if (!Array.isArray(latArray) || !Array.isArray(longArray)) {
            console.error("Polygon coordinates are not arrays:", {
              latArray,
              longArray,
              zone,
            });
            return;
          }

          if (latArray.length === 0 || longArray.length === 0) {
            console.error("Polygon coordinates are empty:", {
              latArray,
              longArray,
            });
            return;
          }

          if (latArray.length !== longArray.length) {
            console.error("Polygon latitude/longitude length mismatch:", {
              latArray,
              longArray,
            });
            return;
          }

          const points = latArray
            .map((lat: any, index: number) => {
              const latitude = Number(lat);
              const longitude = Number(longArray[index]);

              if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude)
              ) {
                return null;
              }

              return [latitude, longitude];
            })
            .filter(Boolean);

          console.log("FINAL POLYGON POINTS:", points);

          if (points.length < 3) {
            console.error(
              "Polygon requires at least 3 valid points:",
              points
            );
            return;
          }

          const polygon = (L as any).polygon(points, {
            color: zone.color ?? zone.col ?? "#00a89d",
            fillColor: zone.color ?? zone.col ?? "#00a89d",
            fillOpacity: 0.25,
            weight: 2,
          });

          polygon.addTo(map);

          activeDrawnLayer = polygon;

          map.setView(points[0], 15);

          // IMPORTANT:
          // Store polygon editor in ref
          const polygonEditor = new (L as any).Edit.Poly(
            polygon
          );

          polygonEditor.enable();

          mapEditorRef.current = polygonEditor;

          console.log("Polygon loaded and editable.");

          return;
        }

        console.error("Unknown zone shape:", shape);
      };
      loadZoneOnMapRef.current = loadZoneOnMap;
      const exitMapEditMode = (): void => {
        console.log("========== EXIT MAP EDIT MODE ==========");

        // 1. Disable Leaflet editor
        if (mapEditorRef.current) {
          try {
            mapEditorRef.current.disable();
          } catch (error) {
            console.log("Editor disable error:", error);
          }

          mapEditorRef.current = null;
        }

        // 2. Remove current map zone
        if (mapCircle) {
          map.removeLayer(mapCircle);
          mapCircle = null;
        }

        if (activeDrawnLayer) {
          map.removeLayer(activeDrawnLayer);
          activeDrawnLayer = null;
        }

        if (mapPolygon) {
          try {
            mapPolygon.disable();
          } catch (error) {
            console.log("Draw polygon disable error:", error);
          }

          mapPolygon = null;
        }

        // 3. Reset refs
        editingZoneRef.current = null;
        editModeRef.current = null;

        // 4. Reset buttons
        const defaultActions =
          byId("default-actions");

        const circleActions =
          byId("active-circle-actions");

        const shapeActions =
          byId("active-shape-actions");

        if (defaultActions) {
          defaultActions.style.display = "flex";
        }

        if (circleActions) {
          circleActions.style.display = "none";
        }

        if (shapeActions) {
          shapeActions.style.display = "none";
        }

        // 5. Hide instructions
        const circleInstruction =
          byId("circleInstructionLabel");

        const shapeInstruction =
          byId("shapeInstructionLabel");

        if (circleInstruction) {
          circleInstruction.style.display = "none";
        }

        if (shapeInstruction) {
          shapeInstruction.style.display = "none";
        }

        console.log("MAP EDIT MODE EXITED");
      };
      const onLoadZoneOnMap = (e: Event): void => {
        const customEvent = e as CustomEvent;
        const zone = customEvent.detail;

        if (zone) {
          loadZoneOnMap(zone);
        }
      };

      window.addEventListener("loadZoneOnMap", onLoadZoneOnMap);

      const clearActiveModes = (): void => {
        const def = byId("default-actions");
        const circ = byId("active-circle-actions");
        const shp = byId("active-shape-actions");

        if (def) def.style.display = "flex";
        if (circ) circ.style.display = "none";
        if (shp) shp.style.display = "none";

        const circLbl = byId("circleInstructionLabel");
        const shpLbl = byId("shapeInstructionLabel");

        if (circLbl) circLbl.style.display = "none";
        if (shpLbl) shpLbl.style.display = "none";

        if (mapCircle) {
          map.removeLayer(mapCircle);
          mapCircle = null;
        }

        if (activeDrawnLayer) {
          map.removeLayer(activeDrawnLayer);
          activeDrawnLayer = null;
        }

        if (mapPolygon) {
          mapPolygon.disable();
          mapPolygon = null;
        }
      };

      const openDetailsModal = (isEdit = false): void => {
        if (!isEdit) {
          editingZoneRef.current = null;
        }

        ["formZoneName", "formMinAmt", "formFreeAmt", "formFees"].forEach((id) => {
          const el = byId(id) as HTMLInputElement | null;
          if (el) el.value = "";
        });

        const time = byId("formTime") as HTMLSelectElement | null;
        if (time) time.value = "10 Minute";

        const errorElement = byId("freeDeliveryError");
        if (errorElement) {
          errorElement.style.display = "none";
        }

        const modal = byId("detailsFormModal");
        if (modal) modal.style.display = "flex";
      };
      const minAmtInput = byId("formMinAmt") as HTMLInputElement | null;
      const freeAmtInput = byId("formFreeAmt") as HTMLInputElement | null;

      minAmtInput?.addEventListener("input", validateFreeDeliveryAmount);
      freeAmtInput?.addEventListener("input", validateFreeDeliveryAmount);
      const closeDetailsModal = (): void => {
        const modal = byId("detailsFormModal");
        if (modal) modal.style.display = "none";
      };

      const onAddCircle = (): void => {
        // Start a completely new ADD operation
        editingZoneRef.current = null;
        editModeRef.current = null;

        // Clear previous map state
        clearActiveModes();

        const def = byId("default-actions");
        const circ = byId("active-circle-actions");
        const shapeActions = byId("active-shape-actions");
        const lbl = byId("circleInstructionLabel");
        const shapeLbl = byId("shapeInstructionLabel");

        // Show ONLY circle ADD actions
        if (def) def.style.display = "none";
        if (circ) circ.style.display = "flex";
        if (shapeActions) shapeActions.style.display = "none";

        if (lbl) lbl.style.display = "block";
        if (shapeLbl) shapeLbl.style.display = "none";

        // Create new circle
        mapCircle = L.circle((map as any).getCenter(), {
          color: "#2b7891",
          fillColor: "#5ca4bb",
          fillOpacity: 0.35,
          weight: 2,
          radius: 1000,
        });

        mapCircle.addTo(map);

        activeDrawnLayer = mapCircle;

        // ⭐ IMPORTANT: Enable circle editing/resizing
        const circleEditor = new (L as any).Edit.Circle(mapCircle, {
          moveMarker: true,
        });

        circleEditor.enable();

        // Store editor so it can be disabled later
        mapEditorRef.current = circleEditor;

        updateCirclePopup();

        console.log("ADD CIRCLE: Circle is now movable and resizable.");
      };
      byId("addCircleBtn")?.addEventListener("click", onAddCircle);

      byId("saveCircleZoneBtn")?.addEventListener("click", () => {
        openDetailsModal(true);
      });
      byId("cancelCircleBtn")?.addEventListener("click", clearActiveModes);

      const onAddShape = (): void => {
        editingZoneRef.current = null;
        editModeRef.current = null;

        clearActiveModes();

        const def = byId("default-actions");
        const shapeActions = byId("active-shape-actions");

        const circleLbl = byId("circleInstructionLabel");
        const shapeLbl = byId("shapeInstructionLabel");

        if (def) def.style.display = "none";

        // Hide UPDATE ZONE while adding a new shape
        if (shapeActions) shapeActions.style.display = "none";

        if (circleLbl) circleLbl.style.display = "none";
        if (shapeLbl) shapeLbl.style.display = "block";

        mapPolygon = new L.Draw.Polygon(map, {
          shapeOptions: {
            color: "#00a89d",
            fillColor: "#00a89d",
            fillOpacity: 0.25,
            weight: 2,
          },
        });

        mapPolygon.enable();
      };
      byId("addShapeBtn")?.addEventListener("click", onAddShape);

      map.on(L.Draw.Event.CREATED, (e: any) => {
        map.addLayer(e.layer);
        activeDrawnLayer = e.layer;

        if (mapPolygon) {
          mapPolygon.disable();
          mapPolygon = null;
        }

        openDetailsModal(false);
      });

      const onCancelShape = (): void => {
        exitMapEditMode();
      };
      byId("cancelShapeBtn")?.addEventListener("click", onCancelShape);

      const onSaveDetails = async (): Promise<void> => {
        try {
          const shopId = sessionStorage.getItem("shop_id");

          if (!shopId) {
            alert("Shop ID not found.");
            return;
          }

          if (!activeDrawnLayer && !editingZoneRef.current) {
            alert("Please create a delivery zone first.");
            return;
          }

          const name =
            (byId("formZoneName") as HTMLInputElement | null)?.value.trim() || "";

          const minAmt =
            (byId("formMinAmt") as HTMLInputElement | null)?.value.trim() || "";

          const freeAmt =
            (byId("formFreeAmt") as HTMLInputElement | null)?.value.trim() || "";

          const fees =
            (byId("formFees") as HTMLInputElement | null)?.value.trim() || "";

          const time =
            (byId("formTime") as HTMLSelectElement | null)?.value || "10 Minute";

          if (!name) {
            alert("Please enter zone name.");
            return;
          }

          if (!minAmt) {
            alert("Please enter minimum order amount.");
            return;
          }

          if (!freeAmt) {
            alert("Please enter free delivery amount.");
            return;
          }

          if (!fees) {
            alert("Please enter delivery fees.");
            return;
          }
          if (!validateFreeDeliveryAmount()) {
            return;
          }
          /*
           * Convert:
           * "10 Minute" → "00" hours + "10" minutes
           */
          const minuteValue = time.split(" ")[0];

          let latArray: string[] = [];
          let longArray: string[] = [];

          let shape = "";
          let radius = "0";
          let color = "#00a89d";

          const zoneToEdit = editingZoneRef.current;

          if (zoneToEdit) {
            // =========================
            // UPDATE
            // =========================

            shape = String(
              zoneToEdit.type ??
              zoneToEdit.shape ??
              ""
            ).toUpperCase();

            color =
              zoneToEdit.color ??
              zoneToEdit.col ??
              "#00a89d";


            if (editModeRef.current === "MAP" && mapCircle) {
              shape = "CIRCLE";

              const center = mapCircle.getLatLng();

              latArray = [String(center.lat)];
              longArray = [String(center.lng)];

              radius = String(mapCircle.getRadius());
            }

            else if (
              editModeRef.current === "MAP" &&
              activeDrawnLayer?.getLatLngs
            ) {
              // -------- UPDATED POLYGON --------
              shape = "SHAPE";

              const latLngs = activeDrawnLayer.getLatLngs();

              const points = Array.isArray(latLngs[0])
                ? latLngs[0]
                : latLngs;

              latArray = points.map((point: any) =>
                String(point.lat)
              );

              longArray = points.map((point: any) =>
                String(point.lng)
              );

              radius = "0";
            }

            /*
             * If only FORM was edited:
             * keep the existing map information.
             */
            else {
              latArray =
                zoneToEdit.latArray ??
                zoneToEdit.latitudeArray ??
                [];

              longArray =
                zoneToEdit.longArray ??
                zoneToEdit.longitudeArray ??
                [];

              radius = String(
                zoneToEdit.radius ??
                "0"
              );
            }
          } else if (mapCircle) {
            // ADD CIRCLE
            shape = "CIRCLE";
            color = "#2b7891";

            const center = mapCircle.getLatLng();

            latArray = [String(center.lat)];
            longArray = [String(center.lng)];

            radius = String(mapCircle.getRadius());

          } else if (activeDrawnLayer && activeDrawnLayer.getLatLngs) {
            // ADD POLYGON
            shape = "SHAPE";

            const latLngs = activeDrawnLayer.getLatLngs();

            const points = Array.isArray(latLngs[0])
              ? latLngs[0]
              : latLngs;

            latArray = points.map((point: any) => String(point.lat));
            longArray = points.map((point: any) => String(point.lng));

            radius = "0";

          } else {
            alert("Unable to get zone coordinates.");
            return;
          }
          const payload = {
            shopId: String(shopId),

            latArray,
            longArray,

            zone: name,

            shape,

            amt: minAmt,

            fees,

            col: color,

            deliveryHours: "00",

            deliveryMinute: minuteValue,

            freeDelivery: freeAmt,

            radius,
          };

          console.log("SELECT ZONE PAYLOAD:", payload);

          let response;


          console.log("========== UPDATE DEBUG ==========");
          console.log("zoneToEdit:", zoneToEdit);
          console.log("zone ID:", zoneToEdit?.Id);
          console.log("payload:", payload);
          console.log("=================================");

          if (zoneToEdit) {
            const zoneId =
              zoneToEdit.Id ??
              zoneToEdit.id ??
              zoneToEdit.zone_id;

            if (!zoneId) {
              alert("Delivery zone ID not found.");
              console.error("Zone object:", zoneToEdit);
              return;
            }

            response = await setupService.updateDeliveryZone({
              id: String(zoneId),
              ...payload,
            });
          } else {
            response = await setupService.addDileveryZone(payload);
          }
          console.log("SELECT ZONE RESPONSE:", response);

          if (response?.success === false) {
            alert(response?.message || "Failed to save delivery zone.");
            return;
          }
          // Reset Add/Update mode after successful save
          editingZoneRef.current = null;
          // Close details modal
          closeDetailsModal();

          // Show success modal
          const successModal = byId("successModal");

          if (successModal) {
            successModal.style.display = "flex";
          }

        } catch (error: any) {
          console.error("========== SAVE ERROR ==========");
          console.error("Full error:", error);
          console.error("Response:", error?.response);
          console.error("Response data:", error?.response?.data);
          console.error("Status:", error?.response?.status);
          console.error("Message:", error?.message);
          console.error("================================");

          alert(
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong while saving the delivery zone."
          );
        }
      };

      const saveDetailsBtn = byId("saveDetailsBtn");
      const onUpdateMapZone = async (): Promise<void> => {
        const zone = editingZoneRef.current;

        if (!zone) {
          alert("No zone selected.");
          return;
        }

        if (!activeDrawnLayer) {
          alert("Zone is not loaded on the map.");
          return;
        }

        const shopId = sessionStorage.getItem("shop_id");

        if (!shopId) {
          alert("Shop ID not found.");
          return;
        }

        let latArray: string[] = [];
        let longArray: string[] = [];
        let shape = "";
        let radius = "0";

        // -----------------------------------------
        // CIRCLE
        // -----------------------------------------

        if (mapCircle) {
          shape = "CIRCLE";

          const center = mapCircle.getLatLng();

          latArray = [String(center.lat)];
          longArray = [String(center.lng)];

          radius = String(mapCircle.getRadius());
        }

        // -----------------------------------------
        // POLYGON
        // -----------------------------------------

        else if (activeDrawnLayer.getLatLngs) {
          shape = "SHAPE";

          const latLngs = activeDrawnLayer.getLatLngs();

          const points =
            Array.isArray(latLngs[0])
              ? latLngs[0]
              : latLngs;

          latArray = points.map(
            (point: any) => String(point.lat)
          );

          longArray = points.map(
            (point: any) => String(point.lng)
          );

          radius = "0";
        }

        else {
          alert("Unable to read zone coordinates.");
          return;
        }

        const payload = {
          shopId: String(shopId),

          latArray,
          longArray,

          zone: zone.zone_no,

          shape,

          amt: String(
            zone.min_order ?? ""
          ),

          fees: String(
            zone.delivery_fee ?? ""
          ),

          col:
            zone.color ??
            zone.col ??
            "#00a89d",

          deliveryHours: "00",

          deliveryMinute: String(
            zone.delivery_minute ?? "10"
          ),

          freeDelivery: String(
            zone.min_order_freedelivery ?? ""
          ),

          radius,
        };

        console.log(
          "========== MAP UPDATE =========="
        );

        console.log("ZONE:", zone);
        console.log("SHAPE:", shape);
        console.log("PAYLOAD:", payload);

        try {
          const zoneId =
            zone.Id ??
            zone.id ??
            zone.zone_id;

          if (!zoneId) {
            alert("Delivery zone ID not found.");
            return;
          }

          const response =
            await setupService.updateDeliveryZone({
              id: String(zoneId),
              ...payload,
            });

          console.log(
            "MAP UPDATE RESPONSE:",
            response
          );

          if (response?.success === false) {
            alert(
              response?.message ||
              "Failed to update zone."
            );
            return;
          }

          // -----------------------------------------
          // UPDATE SUCCESS
          // -----------------------------------------

          alert(
            "Delivery zone updated successfully."
          );

          // IMPORTANT:
          // Exit Leaflet map editing completely
          exitMapEditMode();

          // -----------------------------------------
          // REFRESH TABLE DATA
          // -----------------------------------------

          try {
            const refreshed =
              await setupService.getAllZones(
                Number(shopId)
              );

            console.log(
              "REFRESHED ZONES:",
              refreshed
            );

            const rawZones = refreshed.data?.[0] ?? [];

            const groupedZones = groupZones(rawZones);

            console.log("RAW ZONES:", rawZones);
            console.log("GROUPED ZONES:", groupedZones);

            setZones(groupedZones);
          } catch (refreshError) {
            console.error(
              "Error refreshing zones:",
              refreshError
            );
          }

        } catch (error: any) {
          console.error(
            "========== MAP UPDATE ERROR =========="
          );

          console.error(error);

          alert(
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong while updating the delivery zone."
          );
        }
      };
      byId("updateMapZoneBtn")?.addEventListener(
        "click",
        () => {
          void onUpdateMapZone();
        }
      );
      const onSaveDetailsClick = (): void => {
        void onSaveDetails();
      };

      saveDetailsBtn?.addEventListener(
        "click",
        onSaveDetailsClick
      );


      const onSuccessOk = async (): Promise<void> => {
        const successModal = byId("successModal");

        if (successModal) {
          successModal.style.display = "none";
        }

        const shopId = sessionStorage.getItem("shop_id");

        if (!shopId) {
          console.error("Shop ID not found.");
          return;
        }

        try {
          const response = await setupService.getAllZones(Number(shopId));

          console.log("REFRESH ZONES RESPONSE:", response);

          const rawZones = response.data?.[0] ?? [];

          const groupedZones = groupZones(rawZones);

          console.log("RAW ZONES:", rawZones);
          console.log("GROUPED ZONES:", groupedZones);

          setZones(groupedZones);

          if (mapCircle) {
            map.removeLayer(mapCircle);
            mapCircle = null;
          }

          if (activeDrawnLayer) {
            map.removeLayer(activeDrawnLayer);
            activeDrawnLayer = null;
          }

          if (mapEditorRef.current) {
            try {
              mapEditorRef.current.disable();
            } catch { }

            mapEditorRef.current = null;
          }

          mapPolygon = null;

          clearActiveModes();

        } catch (error) {
          console.error("Error refreshing delivery zones:", error);
        }
      };
      byId("successOkBtn")?.addEventListener("click", onSuccessOk);

      // toggleRowEdit + openDeleteModal via delegation on the table
      // (handles the original row and dynamically-added rows).
      const toggleRowEdit = (button: HTMLElement): void => {
        const row = button.closest("tr");
        if (!row) return;
        const inputs = row.querySelectorAll<HTMLInputElement>('input[type="text"]');
        const icon = button.querySelector("i");
        if (icon?.classList.contains("fa-pen-to-square")) {
          inputs.forEach((i) => (i.disabled = false));
          icon.className = "fa-solid fa-check";
          button.classList.add("active-edit");
        } else if (icon) {
          inputs.forEach((i) => (i.disabled = true));
          icon.className = "fa-solid fa-pen-to-square";
          button.classList.remove("active-edit");
        }
      };

      let rowPendingDeletion: string | null = null;
      const openDeleteModal = (rowId: string): void => {
        rowPendingDeletion = rowId;

        const modal = byId("deleteModal");

        if (modal) {
          modal.style.display = "flex";
        }
      };
      const closeDeleteModal = (): void => {
        const modal = byId("deleteModal");
        if (modal) modal.style.display = "none";
      };

      const onTableClick = (e: Event): void => {
        const target = e.target as HTMLElement;
        const editBtn = target.closest<HTMLElement>(".icon-btn-edit");
        if (editBtn) {
          toggleRowEdit(editBtn);
          return;
        }
        const delBtn = target.closest<HTMLElement>(".icon-btn-delete");
        if (delBtn) {
          const rowId = delBtn.getAttribute("data-row");
          if (rowId) openDeleteModal(rowId);
        }
      };
      const deliveryTable = byId("deliveryTable");
      deliveryTable?.addEventListener("click", onTableClick);

      byId("cancelDeleteBtn")?.addEventListener("click", closeDeleteModal);
      byId("closeDetailsBtn")?.addEventListener("click", closeDetailsModal);

      const onConfirmDelete = async (): Promise<void> => {
        if (!rowPendingDeletion) return;
        
        const zoneIdStr = rowPendingDeletion.replace("row-idx-", "");
        const zoneId = Number(zoneIdStr);
        const shopId = sessionStorage.getItem("shop_id");
        
        if (!shopId) {
          alert("Shop ID not found");
          return;
        }

        const confirmBtn = byId("confirmDeleteBtn");
        if (confirmBtn) confirmBtn.textContent = "DELETING...";

        try {
          const response = await setupService.deleteDeliveryZone(Number(shopId), zoneId);
          if (response?.success === false) {
            alert(response?.message || "Failed to delete zone");
            if (confirmBtn) confirmBtn.textContent = "YES, DELETE IT";
            return;
          }

          // Fetch fresh data
          const refreshed = await setupService.getAllZones(Number(shopId));
          const rawZones = refreshed.data?.[0] ?? [];
          setZones(groupZones(rawZones));

          closeDeleteModal();
        } catch (error: any) {
          console.error("Delete Error:", error);
          alert(error?.response?.data?.message || error?.message || "Failed to delete zone");
        } finally {
          if (confirmBtn) confirmBtn.textContent = "YES, DELETE IT";
        }
      };
      byId("confirmDeleteBtn")?.addEventListener("click", () => { void onConfirmDelete(); });

      const onHelp = (): void => alert("Help coming soon!");
      const helpBtns = Array.from(
        document.querySelectorAll<HTMLButtonElement>("#pg-setup-delivery .btn-help"),
      );
      helpBtns.forEach((b) => b.addEventListener("click", onHelp));

      cleanups.push(() => {
        mapViewTab?.removeEventListener("click", onMapViewTab);
        satViewTab?.removeEventListener("click", onSatTab);
        terrainCheckbox?.removeEventListener("change", onTerrainToggle);
        fullscreenBtn?.removeEventListener("click", onFullscreen);
        panPad?.removeEventListener("click", onPanPad);
        window.removeEventListener("loadZoneOnMap", onLoadZoneOnMap);

        deliveryTable?.removeEventListener("click", onTableClick);

        saveDetailsBtn?.removeEventListener(
          "click",
          onSaveDetailsClick
        );

        byId("confirmDeleteBtn")?.removeEventListener(
          "click",
          onConfirmDelete
        );

        byId("successOkBtn")?.removeEventListener(
          "click",
          onSuccessOk
        );

        helpBtns.forEach((b) =>
          b.removeEventListener("click", onHelp)
        );
      });
    };

    // Wait for both leaflet and leaflet.draw to be present.
    const timer = setInterval(() => {
      if (cancelled) return;
      if (window.L && window.L.Draw && document.getElementById("map")) {
        clearInterval(timer);
        init();
      }
    }, 50);

    return () => {
      cancelled = true;
      clearInterval(timer);
      cleanups.forEach((fn) => fn());
    };
  }, []);
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const ShopId = sessionStorage.getItem("shop_id")

        const response = await setupService.getAllZones(Number(ShopId));

        console.log("GET ALL ZONES RESPONSE:", response);

        const rawZones = response.data?.[0] ?? [];

        const groupedZones = groupZones(rawZones);

        setZones(groupedZones);
      } catch (error) {
        console.error("Error fetching delivery zones:", error);
      }
    };

    fetchZones();
  }, []);
  return (
    <div id="pg-setup-delivery">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js"
        strategy="afterInteractive"
      />

      {/* ── APP CONTAINER ── */}
      <div className="app-container">
        {/* ── MAIN WORKSPACE ── */}
        <div className="main-workspace">
          <div className="container">
            <div className="page-header" style={{ background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h1 className="header-title typ-page-heading" style={{ margin: 0, fontSize: "1.25rem", color: "#334155" }}>How would you like to Setup Delivery?</h1>
              <div style={{ display: "flex", gap: "24px" }}>
                <label style={{ fontWeight: 600, fontSize: "15px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: deliveryType === "area" ? "#0f766e" : "#64748b" }}>
                  <input type="radio" name="setup" checked={deliveryType === "area"} onChange={() => setDeliveryType("area")} style={{ accentColor: "#0f766e", width: "16px", height: "16px" }} /> Area Wise
                </label>
                <label style={{ fontWeight: 600, fontSize: "15px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: deliveryType === "zone" ? "#0f766e" : "#64748b" }}>
                  <input type="radio" name="setup" checked={deliveryType === "zone"} onChange={() => setDeliveryType("zone")} style={{ accentColor: "#0f766e", width: "16px", height: "16px" }} /> Zone Wise
                </label>
              </div>
            </div>

            {deliveryType === "area" && (
              <div className="area-wise-container" style={{ background: "#fff", padding: "24px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginTop: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: 0, display: "inline-block", marginRight: "20px" }}>Area Wise Delivery</h2>
                    <span style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 600 }}>Click On Add Area to Add Area</span>
                  </div>
                  <button className="btn-add-area" style={{ background: "#0f766e", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "6px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", letterSpacing: "0.5px" }}>
                    ADD AREA
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="area-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
                    <thead>
                      <tr style={{ background: "#0f766e", color: "#fff" }}>
                        <th style={{ padding: "14px 10px", borderTopLeftRadius: "6px", width: "60px" }}></th>
                        <th style={{ padding: "14px 10px", fontSize: "0.85rem", fontWeight: 600 }}>Sr. No.</th>
                        <th style={{ padding: "14px 10px", fontSize: "0.85rem", fontWeight: 600 }}>Area Name</th>
                        <th style={{ padding: "14px 10px", fontSize: "0.85rem", fontWeight: 600 }}>Minimum Order Amount</th>
                        <th style={{ padding: "14px 10px", fontSize: "0.85rem", fontWeight: 600 }}>Minimum Order Amount for Free Delivery</th>
                        <th style={{ padding: "14px 10px", fontSize: "0.85rem", fontWeight: 600 }}>Delivery Fees</th>
                        <th style={{ padding: "14px 10px", fontSize: "0.85rem", fontWeight: 600 }}>Delivery Time</th>
                        <th style={{ padding: "14px 10px", fontSize: "0.85rem", fontWeight: 600 }}>Edit</th>
                        <th style={{ padding: "14px 10px", borderTopRightRadius: "6px", fontSize: "0.85rem", fontWeight: 600 }}>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {areas.map((area, index) => (
                        <tr key={area.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "16px 10px" }}>
                            <label className="switch" style={{ margin: "0 auto" }}>
                              <input type="checkbox" checked={area.active} onChange={() => {
                                const newAreas = [...areas];
                                newAreas[index].active = !newAreas[index].active;
                                setAreas(newAreas);
                              }} />
                              <span className="slider"></span>
                            </label>
                          </td>
                          <td style={{ padding: "16px 10px", fontWeight: 600, color: "#1e293b", fontSize: "0.95rem" }}>{index + 1}</td>
                          <td style={{ padding: "16px 10px", fontWeight: 600, color: "#1e293b", fontSize: "0.95rem" }}>{area.name}</td>
                          <td style={{ padding: "16px 10px" }}>
                            <input type="text" value={area.minAmt} readOnly className="area-input" />
                          </td>
                          <td style={{ padding: "16px 10px" }}>
                            <input type="text" value={area.freeAmt} readOnly className="area-input" />
                          </td>
                          <td style={{ padding: "16px 10px" }}>
                            <input type="text" value={area.fee} readOnly className="area-input" />
                          </td>
                          <td style={{ padding: "16px 10px" }}>
                            <input type="text" value={area.time} readOnly className="area-input" />
                          </td>
                          <td style={{ padding: "16px 10px" }}>
                            <button className="circle-action-btn btn-edit" style={{ margin: "0 auto", width: "32px", height: "32px", borderRadius: "50%", background: "#0f766e", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                              <i className="fa-solid fa-pen" style={{ fontSize: "12px" }}></i>
                            </button>
                          </td>
                          <td style={{ padding: "16px 10px" }}>
                            <button className="circle-action-btn btn-delete" style={{ margin: "0 auto", width: "32px", height: "32px", borderRadius: "50%", background: "#334155", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                              <i className="fa-solid fa-trash" style={{ fontSize: "12px" }}></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {deliveryType === "zone" && (
              <>
            <div className="page-header" style={{ marginBottom: "15px", marginTop: "24px" }}>
              <h1 className="header-title typ-page-heading" style={{ margin: 0 }}>
                Select Delivery Zone{" "}
                <span className="header-subtitle">
                  Click On &apos;Add Zone&apos; To Add Zone
                </span>
              </h1>
            </div>

            <div
              id="default-actions"
              style={{ display: "flex", gap: "10px", alignItems: "center" }}
            >
              <button className="btn-teal" id="addShapeBtn">
                ADD ZONE IN SHAPE
              </button>
              <button className="btn-teal" id="addCircleBtn">
                ADD ZONE IN CIRCLE
              </button>
              <button className="btn-help">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                HELP
              </button>
            </div>

            <div
              id="active-circle-actions"
              style={{ display: "none", gap: "10px", alignItems: "center" }}
            >
              <button className="btn-teal" id="saveCircleZoneBtn">
                SAVE ZONE
              </button>
              <button className="btn-red" id="cancelCircleBtn">
                CANCEL
              </button>
              <button className="btn-help">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                HELP
              </button>
            </div>

            <div
              id="active-shape-actions"
              style={{ display: "none", gap: "10px", alignItems: "center" }}
            >
              <button className="btn-teal" id="updateMapZoneBtn">
                UPDATE ZONE
              </button>
              <button className="btn-red" id="cancelShapeBtn">
                CANCEL
              </button>
              <button className="btn-help">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                HELP
              </button>
            </div>


          <div className="instruction-text" id="circleInstructionLabel">
            look at the circle on map and you can resize and move the circle at your
            preferred location
          </div>
          <div className="instruction-text" id="shapeInstructionLabel">
            start drawing your zone in the map below:
          </div>

          <div className="map-wrapper-canvas" id="mapWrapper">
            <div className="custom-map-type-control">
              <div className="map-type-tabs-row">
                <button
                  className="map-tab-btn"
                  id="mapViewTab"
                  data-type="map"
                >
                  Map
                </button>
                <button
                  className="map-tab-btn tab-active"
                  id="satelliteViewTab"
                  data-type="satellite"
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

            <div id="map" />
          </div>

          <div className="table-responsive-container">
            <table id="deliveryTable">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Zone Name</th>
                  <th>Minimum Order Amount</th>
                  <th>Minimum Order Amount for Free Delivery</th>
                  <th>Delivery Fees</th>
                  <th>Delivery Time</th>
                  <th className="action-col-header">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {zones.length > 0 ? (
                  zones.map((zone, index) => (
                    <tr key={zone.Id} id={`row-idx-${zone.Id}`}>
                      <td>{index + 1}</td>

                      <td>
                        <div className="cell-flex-center">
                          <span
                            className="zone-dot"
                            style={{ background: zone.color || "#e5a2cb" }}
                          />
                          {zone.zone_no}
                        </div>
                      </td>

                      <td>
                        <input
                          type="text"
                          value={zone.min_order ?? ""}
                          disabled
                          readOnly
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          value={zone.min_order_freedelivery ?? ""}
                          disabled
                          readOnly
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          value={zone.delivery_fee ?? ""}
                          disabled
                          readOnly
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          value={`${zone.delivery_hours ?? "00"}:${zone.delivery_minute ?? "00"}`}
                          style={{ width: "100px" }}
                          disabled
                          readOnly
                        />
                      </td>

                      <td>
                        <div
                          style={{
                            display: "inline-flex",
                            gap: "10px",
                            alignItems: "center",
                          }}
                        >
                          <button
                            className="icon-btn-edit"
                            title="Edit"
                            onClick={() => {
                              console.log("========== FORM EDIT ==========");
                              console.log("ZONE:", zone);

                              editingZoneRef.current = zone;
                              editModeRef.current = "FORM";

                              const zoneName =
                                document.getElementById("formZoneName") as HTMLInputElement | null;
                              const minAmt =
                                document.getElementById("formMinAmt") as HTMLInputElement | null;
                              const freeAmt =
                                document.getElementById("formFreeAmt") as HTMLInputElement | null;
                              const fees =
                                document.getElementById("formFees") as HTMLInputElement | null;
                              const time =
                                document.getElementById("formTime") as HTMLSelectElement | null;
                              const modal =
                                document.getElementById("detailsFormModal");

                              if (zoneName) {
                                zoneName.value = zone.zone_no ?? "";
                              }
                              if (minAmt) {
                                minAmt.value = zone.min_order ?? "";
                              }
                              if (freeAmt) {
                                freeAmt.value = zone.min_order_freedelivery ?? "";
                              }
                              if (fees) {
                                fees.value = zone.delivery_fee ?? "";
                              }
                              if (time) {
                                time.value = `${zone.delivery_minute ?? "10"} Minute`;
                              }
                              validateFreeDeliveryAmount();
                              if (modal) {
                                modal.style.display = "flex";
                              }
                            }}
                          >
                            <i className="fa-solid fa-pen-to-square" />
                          </button>

                          <button
                            className="icon-btn-delete"
                            data-row={`row-idx-${zone.Id}`}
                            title="Delete"
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                          <button
                            className="edit-zone-btn"
                            title="Edit Zone Map"
                            onClick={() => {
                              console.log("========== MAP EDIT ==========");
                              console.log("ZONE:", zone);

                              editingZoneRef.current = zone;
                              editModeRef.current = "MAP";

                              if (!loadZoneOnMapRef.current) {
                                console.error("loadZoneOnMap is not available");
                                return;
                              }

                              loadZoneOnMapRef.current(zone);

                              const defaultActions =
                                document.getElementById("default-actions");

                              const mapEditActions =
                                document.getElementById("active-shape-actions");

                              if (defaultActions) {
                                defaultActions.style.display = "none";
                              }

                              if (mapEditActions) {
                                mapEditActions.style.display = "flex";
                              }
                            }}
                          >
                            Edit Zone
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>
                      No delivery zones found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
        )}
        </div>

      <WizardFooter />
    </div>


      {/* Delete Modal */ }
  <div className="modal-overlay" id="deleteModal">
    <div className="modal-box">
      <div className="modal-text">
        This will delete all the zone details and the region that you have just
        added!!
      </div>
      <div className="modal-actions">
        <button className="modal-btn btn-cancel" id="cancelDeleteBtn">
          Cancel
        </button>
        <button className="modal-btn btn-confirm" id="confirmDeleteBtn">
          YES, DELETE IT
        </button>
      </div>
    </div>
  </div>

  {/* Zone Details Form Modal */ }
  <div className="modal-overlay" id="detailsFormModal">
    <div className="form-modal-box">
      <div className="form-title">Enter Zone Details</div>
      <div className="form-group">
        <label>Zone Name</label>
        <input
          type="text"
          className="form-control"
          id="formZoneName"
          placeholder="Enter Zone Name"
          style={{ textAlign: "left", fontWeight: "normal", width: "100%" }}
        />
      </div>
      <div className="form-group">
        <label>Minimum Order Amount</label>
        <input
          type="text"
          className="form-control"
          id="formMinAmt"
          placeholder="0.00"
          style={{ textAlign: "left", fontWeight: "normal", width: "100%" }}
        />
      </div>
      <div className="form-group">
        <label>Minimum Order Amount for Free Delivery</label>
        <span
          className="error-subtext"
          id="freeDeliveryError"
          style={{ display: "none" }}
        >
          ** Amount must be greater than minimum order amount
        </span>
        <input
          type="text"
          className="form-control"
          id="formFreeAmt"
          placeholder="0.00"
          style={{
            textAlign: "left",
            fontWeight: "normal",
            width: "100%",
            marginTop: "4px",
          }}
        />
      </div>
      <div className="form-row-grid">
        <div className="form-group">
          <label>Delivery Fees</label>
          <input
            type="text"
            className="form-control"
            id="formFees"
            placeholder="0.00"
            style={{ textAlign: "left", fontWeight: "normal", width: "100%" }}
          />
        </div>
        <div className="form-group">
          <label>Delivery Time</label>
          <select
            className="form-control"
            id="formTime"
            style={{ height: "40px", padding: "5px 10px" }}
            defaultValue="10 Minute"
          >
            <option value="10 Minute">10 Minutes</option>
            <option value="20 Minute">20 Minutes</option>
            <option value="30 Minute">30 Minutes</option>
          </select>
        </div>
      </div>
      <div className="modal-actions" style={{ marginTop: "25px" }}>
        <button className="btn-teal" style={{ padding: "10px 30px" }} id="saveDetailsBtn">
          SAVE
        </button>
        <button className="btn-red" style={{ padding: "10px 30px" }} id="closeDetailsBtn">
          CANCEL
        </button>
      </div>
    </div>
  </div>

  {/* Success Modal */ }
  <div className="modal-overlay" id="successModal" style={{ zIndex: 10000 }}>
    <div className="success-box">
      <div className="success-title">Success</div>
      <div className="success-text">Your Delivery Zone Save Successfully</div>
      <button className="btn-success-ok" id="successOkBtn">
        OK
      </button>
    </div>
  </div>
    </div>
    </div>
  );
}