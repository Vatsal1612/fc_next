"use client";

import { useEffect, useState } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import { orderService, MenuType, OrderingMethod, PaymentMethod, SelectedPaymentMethod, OrderMethodStatus, UserOptionDetails, OnlineOrderStatus, MissedOrderTiming, } from "@/api/services/order.service";
import { useShopId } from "@/utils/shop";
import "./page.css";

/**
 * orders/ordersetting.html → React.
 * Inline <script> ported into one useEffect: save-button toast, outer-tab
 * active toggle, inner-tab content switching. The header/sidebar menu logic in
 * the original targeted shell-owned markup (removed) and is therefore dropped.
 */

export default function OrderSettingPage() {
  const SHOP_ID = useShopId();

  const [menuTypes, setMenuTypes] = useState<MenuType[]>([]);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [orderingMethods, setOrderingMethods] = useState<OrderingMethod[]>([]);
  const [activeMethod, setActiveMethod] = useState<number | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<SelectedPaymentMethod[]>([]);
  const [orderMethodStatus, setOrderMethodStatus] =
    useState<OrderMethodStatus | null>(null);
  const [userOptionDetails, setUserOptionDetails] =
    useState<UserOptionDetails | null>(null);

  const [onlineOrderStatus, setOnlineOrderStatus] =
    useState<OnlineOrderStatus | null>(null);
  const [tableReservation, setTableReservation] = useState(true);
  const [_missedOrderTiming, setMissedOrderTiming] =
    useState<MissedOrderTiming | null>(null);
  void _missedOrderTiming;
  

  const [customLabel, setCustomLabel] = useState("");
const [prepTime, setPrepTime] = useState("");
const [customNotes, setCustomNotes] = useState("");
const [chargeLabel, setChargeLabel] = useState("");
const [chargeAmount, setChargeAmount] = useState("");

useEffect(() => {
    if (orderMethodStatus) {
        setCustomLabel(orderMethodStatus.custom_label_method || "");
        setPrepTime(orderMethodStatus.prep_time || "");
        setCustomNotes(orderMethodStatus.custom_notes || "");
        setChargeLabel(orderMethodStatus.order_method_charge_label || "");
        setChargeAmount(orderMethodStatus.order_method_charge_amount || "");
    }
}, [orderMethodStatus]);

  console.log(
    "Rendering",
    activeMenu,
    activeMethod,
    orderMethodStatus?.menu_id,
    orderMethodStatus?.custom_notes
  );
  useEffect(() => {
    console.log("React state changed");
    console.log(orderMethodStatus);
  }, [orderMethodStatus]);
  useEffect(() => {

    const saveButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>("#pg-orders-ordersetting .btn-save"),
    );
    const toast = document.getElementById("successToast");
    let toastTimer: ReturnType<typeof setTimeout> | undefined;

    const onSave = (e: Event): void => {
      e.preventDefault();
      if (toastTimer) clearTimeout(toastTimer);
      toast?.classList.add("show");
      toastTimer = setTimeout(() => {
        toast?.classList.remove("show");
      }, 2000);
    };
    saveButtons.forEach((button) => button.addEventListener("click", onSave));


    // const innerTabs = Array.from(
    //   document.querySelectorAll<HTMLElement>("#pg-orders-ordersetting .inner-tab"),
    // );
    // const tabContents = Array.from(
    //   document.querySelectorAll<HTMLElement>("#pg-orders-ordersetting .tab-content"),
    // );
    // const innerHandlers: Array<() => void> = innerTabs.map((tab) => {
    //   const fn = (): void => {
    //     innerTabs.forEach((t) => t.classList.remove("active"));
    //     tab.classList.add("active");
    //     tabContents.forEach((content) => {
    //       content.style.display = "none";
    //     });
    //     const targetId = tab.getAttribute("data-target");
    //     const targetContent = targetId ? document.getElementById(targetId) : null;
    //     if (targetContent) targetContent.style.display = "flex";
    //   };
    //   tab.addEventListener("click", fn);
    //   return fn;
    // });


    return () => {
      saveButtons.forEach((button) => button.removeEventListener("click", onSave));
      // innerTabs.forEach((tab, i) => tab.removeEventListener("click", innerHandlers[i]));
      if (toastTimer) clearTimeout(toastTimer);
    };
  }, []);

  useEffect(() => {
    const loadMenuTypes = async () => {
      try {
        const menus = await orderService.fetchMenuTypes(SHOP_ID);

        setMenuTypes(menus);

        if (menus.length > 0) {
          setActiveMenu(menus[0].id);
        }
      } catch (err) {
        console.error("Failed to load menu types", err);
      }
    };

    loadMenuTypes();
  }, []);

  useEffect(() => {
    const loadOrderingMethods = async () => {
      try {
        const methods = await orderService.fetchOrderingMethods();

        setOrderingMethods(methods);

        if (methods.length > 0) {
          setActiveMethod(methods[0].id);
        }
      } catch (err) {
        console.error("Failed to load ordering methods", err);
      }
    };

    loadOrderingMethods();
  }, []);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const methods = await orderService.fetchPaymentMethods();
        setPaymentMethods(methods);
      } catch (err) {
        console.error(err);
      }
    };

    loadPaymentMethods();
  }, []);

  useEffect(() => {

    if (!activeMenu || !activeMethod) return;
    console.log("Loading", activeMenu, activeMethod);
    const loadSelected = async () => {

      try {

        const selected =
          await orderService.fetchSelectedPaymentMethods(
            SHOP_ID,
            activeMethod,
            activeMenu
          );

        setSelectedPayments(selected);

      } catch (err) {

        console.error(err);

      }

    };

    loadSelected();

  }, [activeMenu, activeMethod]);

  useEffect(() => {

    if (!activeMenu || !activeMethod) return;

    const loadOrderMethodStatus = async () => {
      try {

        const status =
          await orderService.fetchOrderMethodStatus(
            SHOP_ID,
            activeMethod,
            activeMenu
          );

        console.log("Setting state", status);
        setOrderMethodStatus(status);
        console.log(
          "Returning status for menu",
          activeMenu,
          status
        );

      } catch (err) {
        console.error(err);
      }
    };

    loadOrderMethodStatus();

  }, [activeMenu, activeMethod]);

  useEffect(() => {

    const loadUserOptions = async () => {
      try {
        const options =
          await orderService.fetchUserOptionDetails(SHOP_ID);

        setUserOptionDetails(options);
      } catch (err) {
        console.error(err);
      }
    };

    loadUserOptions();

  }, []);

  useEffect(() => {
    const loadOnlineOrderStatus = async () => {
      try {
        const status = await orderService.fetchOnlineOrderStatus(SHOP_ID);
        setOnlineOrderStatus(status);
      } catch (err) {
        console.error(err);
      }
    };

    loadOnlineOrderStatus();
  }, []);

  useEffect(() => {
    const loadMissedOrderTiming = async () => {
      try {
        const timing = await orderService.fetchMissedOrderTiming(SHOP_ID);
        setMissedOrderTiming(timing);
      } catch (err) {
        console.error(err);
      }
    };

    loadMissedOrderTiming();
  }, []);


  // Handler functions for each feature
const handleOrderMethodToggle = async (checked: boolean) => {
    if (!activeMenu || !activeMethod) return;
    
    await orderService.updateOrderMethodFlag(
        SHOP_ID,
        activeMethod,
        activeMenu,
        checked ? 1 : 0,
        "order_method"
    );
    
    const status = await orderService.fetchOrderMethodStatus(
        SHOP_ID,
        activeMethod,
        activeMenu
    );
    setOrderMethodStatus(status);
};

const handlePreOrderToggle = async (checked: boolean) => {
    if (!activeMenu || !activeMethod) return;
    
    await orderService.updateOrderMethodFlag(
        SHOP_ID,
        activeMethod,
        activeMenu,
        checked ? 1 : 0,
        "preorder_status"
    );
    
    const status = await orderService.fetchOrderMethodStatus(
        SHOP_ID,
        activeMethod,
        activeMenu
    );
    setOrderMethodStatus(status);
};

const handleRestaurantEmailToggle = async (checked: boolean) => {
    if (!activeMenu || !activeMethod) return;
    
    await orderService.updateOrderMethodFlag(
        SHOP_ID,
        activeMethod,
        activeMenu,
        checked ? 1 : 0,
        "email_notify"
    );
    
    const status = await orderService.fetchOrderMethodStatus(
        SHOP_ID,
        activeMethod,
        activeMenu
    );
    setOrderMethodStatus(status);
};

const handleCustomerEmailToggle = async (checked: boolean) => {
    if (!activeMenu || !activeMethod) return;
    
    await orderService.updateOrderMethodFlag(
        SHOP_ID,
        activeMethod,
        activeMenu,
        checked ? 1 : 0,
        "email_notify_customer"
    );
    
    const status = await orderService.fetchOrderMethodStatus(
        SHOP_ID,
        activeMethod,
        activeMenu
    );
    setOrderMethodStatus(status);
};

const handleCustomNotesSave = async () => {
    if (!activeMenu || !activeMethod) return;
    
    await orderService.updateOrderMethodFlag(
        SHOP_ID,
        activeMethod,
        activeMenu,
        customNotes,
        "custom_notes"
    );
    
    const status = await orderService.fetchOrderMethodStatus(
        SHOP_ID,
        activeMethod,
        activeMenu
    );
    setOrderMethodStatus(status);
    
    // Show toast
    showToast();
};

const handleCustomLabelSave = async () => {
    if (!activeMenu || !activeMethod) return;
    
    await orderService.updateOrderMethodFlag(
        SHOP_ID,
        activeMethod,
        activeMenu,
        customLabel,
        "custom_label"
    );
    
    const status = await orderService.fetchOrderMethodStatus(
        SHOP_ID,
        activeMethod,
        activeMenu
    );
    setOrderMethodStatus(status);
    
    // Show toast
    showToast();
};

const handleExtraChargeSave = async () => {
    if (!activeMenu || !activeMethod) return;
    
    // Format: chargeLabel***chargeAmount
    const value = `${chargeLabel}***${chargeAmount}`;
    
    await orderService.updateOrderMethodFlag(
        SHOP_ID,
        activeMethod,
        activeMenu,
        value,
        "order_method_charge"
    );
    
    const status = await orderService.fetchOrderMethodStatus(
        SHOP_ID,
        activeMethod,
        activeMenu
    );
    setOrderMethodStatus(status);
    
    // Show toast
    showToast();
};

// Add this after handleExtraChargeSave
const handleUserOptionToggle = async (
    field: "f_name" | "l_name" | "phone_no",
    checked: boolean
) => {
    try {
        await orderService.updateUserOption(
            SHOP_ID,
            field,
            checked
        );
        
        // Refresh user options after update
        const options = await orderService.fetchUserOptionDetails(SHOP_ID);
        setUserOptionDetails(options);
        
        // Show toast
        showToast();
    } catch (err) {
        console.error("Error updating user option:", err);
    }
};
// Add this handler
const handlePrepTimeSave = async () => {
    if (!activeMenu || !activeMethod) return;
    
    await orderService.updateOrderMethodFlag(
        SHOP_ID,
        activeMethod,
        activeMenu,
        prepTime,
        "prep_time" // Check with your senior if this flag exists
    );
    
    const status = await orderService.fetchOrderMethodStatus(
        SHOP_ID,
        activeMethod,
        activeMenu
    );
    setOrderMethodStatus(status);
    showToast();
};
// Toast helper function
const showToast = () => {
    const toast = document.getElementById("successToast");
    if (toast) {
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 2000);
    }
};

  const handlePaymentMethodToggle = async (
    paymentMethodId: number,
    checked: boolean
  ) => {
    try {
      if (!activeMenu || !activeMethod) return;

      if (checked) {
        await orderService.assignPaymentMethod(
          SHOP_ID,
          activeMethod,
          paymentMethodId,
          activeMenu
        );
      } else {
        await orderService.deAssignPaymentMethod(
          SHOP_ID,
          activeMethod,
          paymentMethodId,
          activeMenu
        );
      }

      // Refresh selected payment methods
      const selected =
        await orderService.fetchSelectedPaymentMethods(
          SHOP_ID,
          activeMethod,
          activeMenu
        );

      setSelectedPayments(selected);

    } catch (err) {
      console.error(err);
    }
  };

  console.log("Current activeMethod:", activeMethod);
console.log("Available ordering methods:", orderingMethods);



  return (
    <div id="pg-orders-ordersetting">
      <div className="app-container">
        <main className="main-content">
          <div className="content-area">
            <div className="order-setting-card">
              <div className="report-header">
                <h1 className="typ-page-heading report-title">Order Setting</h1>
                <div className="report-header-actions">
                  <button className="btn-help">
                    <svg viewBox="0 0 24 24" style={{ width: "16px", height: "16px", fill: "none", stroke: "currentColor", strokeWidth: 2 }}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    HELP
                  </button>
                </div>
              </div>

              <div className="outer-tabs">
                {menuTypes.map((menu) => (
                  <div
                    key={menu.id}
                    className={`outer-tab ${activeMenu === menu.id ? "active" : ""}`}
                    onClick={() => {
                      console.log("Clicked menu:", menu.id);
                      setActiveMenu(menu.id);
                    }}
                  >
                    {menu.menu_name}
                  </div>
                ))}
              </div>
              <div className="inner-container">
                <div className="inner-tabs-row">
                  <div className="inner-tabs">
                    {orderingMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`inner-tab ${activeMethod === method.id ? "active" : ""}`}
                        data-target={method.delivery_method_name
                          .toLowerCase()
                          .replace(/\s+/g, "-") + "-content"}
                        onClick={() => setActiveMethod(method.id)}
                      >
                        {method.delivery_method_name}
                      </div>
                    ))}
                  </div>
                  <div className="top-right-toggles">
                    <div className="toggle-wrapper">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={onlineOrderStatus?.online_ordering === 1}
                          onChange={async (e) => {
                            await orderService.setOnlineOrderStatus(
                              SHOP_ID,
                              e.target.checked
                            );
                            const status =
                              await orderService.fetchOnlineOrderStatus(SHOP_ID);
                            setOnlineOrderStatus(status);
                          }}
                        />
                        <span className="slider" />
                      </label>
                      <span>Order Online for Main menu</span>
                    </div>

                    <div className="toggle-wrapper">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={tableReservation}
                          onChange={(e) => setTableReservation(e.target.checked)}
                        />
                        <span className="slider" />
                      </label>
                      <span>Table Reservation</span>
                    </div>
                  </div>
                </div>

                {activeMethod === 1 && (

                  // id="take-away-content"
                  <div className="form-section tab-content">
                    <div className="toggle-wrapper">
                      <label className="switch">
                        {/* <input type="checkbox" defaultChecked /> */}
                        <input
                          type="checkbox"
                          checked={orderMethodStatus?.method_status === 1}
                          onChange={(e) =>
                            handleOrderMethodToggle(e.target.checked)
                          }
                        />
                        <span className="slider" />
                      </label>
                      Enable Take Away
                    </div>

                    <div>
                      <div className="section-title">Select Payment Method for Take Away</div>
                      {/* <div className="checkbox-group" style={{ fontWeight: 400 }}>
                      <label className="checkbox-label">
                        <input type="checkbox" /> Cash at Take Away
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked /> Card at Take Away
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked /> Pay Online at Take Away
                      </label>
                    </div> */}
                      <div className="checkbox-group" style={{ fontWeight: 400 }}>

                        {paymentMethods.map((payment) => {

                          const checked = selectedPayments.some(
                            p => p.payment_method_id === payment.id
                          );

                          return (

                            <label
                              key={payment.id}
                              className="checkbox-label"
                            >

                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) =>
                                  handlePaymentMethodToggle(
                                    payment.id,
                                    e.target.checked
                                  )
                                }
                              />

                              {payment.method_name}

                            </label>

                          );

                        })}

                      </div>
                    </div>

                    <div className="toggle-wrapper">
                      <label className="switch">
                        {/* <input type="checkbox" defaultChecked /> */}
                        <input
                          type="checkbox"
                          checked={orderMethodStatus?.preorder_status === 1}
                          onChange={(e) =>
                            handlePreOrderToggle(e.target.checked)
                          }
                        />
                        <span className="slider" />
                      </label>
                      Pre-Order
                    </div>

                    <div className="radio-group" style={{ fontWeight: 600 }}>
                      Order Approval :
                      <label className="radio-label" style={{ fontWeight: 500 }}>
                        {/* <input type="radio" name="takeaway_approval" /> Auto */}
                        <input
                          type="radio"
                          name="takeaway_approval"
                          checked={orderMethodStatus?.order_approval === 0}
                          readOnly
                        /> Auto
                      </label>
                      <label className="radio-label" style={{ fontWeight: 500 }}>
                        {/* <input type="radio" name="takeaway_approval" defaultChecked /> Manual */}
                        <input
                          type="radio"
                          name="takeaway_approval"
                          checked={orderMethodStatus?.order_approval === 1}
                          readOnly
                        /> Manual
                      </label>
                    </div>

                    <div className="input-save-row">
                      <label>Enter Custom Label For : Take Away</label>
                      <div className="input-group">
                        {/* <input type="text" className="form-control" defaultValue="breakfast takeaway" /> */}
                        <input
                          type="text"
                          className="form-control"
                          // value={orderMethodStatus?.custom_label_method ?? ""}
                          // readOnly
                          value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
                        />
                        <button type="button" className="btn-save" onClick={handleCustomLabelSave}>
                          SAVE
                        </button>
                      </div>
                    </div>

                    <div className="input-save-row">
                      <label>
                        Order Take Away Time (Minutes) <span>*</span>
                      </label>
                      <div className="input-group">
                        {/* <input type="text" className="form-control" defaultValue="15" /> */}
                        <input
                          type="text"
                          className="form-control"
                          // value={orderMethodStatus?.prep_time ?? ""}
                          // readOnly
                          value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
                        />
                        <button type="button" className="btn-save" onClick={handlePrepTimeSave}>
                          SAVE
                        </button>
                      </div>
                    </div>

                    <div className="input-save-row">
                      <label>Enter notes to display the customers</label>
                      <div className="input-group">
                        <textarea
                          className="form-control"
                          // value={orderMethodStatus?.custom_notes ?? ""}
                          // readOnly
                          value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="Enter notes for customers..."
            rows={3}
                        />
                        <button type="button" className="btn-save" onClick={handleCustomNotesSave}>
                          SAVE
                        </button>
                      </div>
                    </div>

                    <div className="extra-charge-container">
                      <div className="section-title">Add Extra Charge On Take Away</div>
                      <div className="extra-charge-row">
                        <div className="charge-field">
                          <label>Charge Label</label>
                          {/* <input type="text" className="form-control" defaultValue="Pick Up Charge" /> */}
                          <input
                            type="text"
                            className="form-control"
                            // value={orderMethodStatus?.order_method_charge_label ?? ""}
                            value={chargeLabel}
                onChange={(e) => setChargeLabel(e.target.value)}
                            
                          />
                        </div>
                        <div className="charge-field">
                          <label>Charge Amount (INR)</label>
                          {/* <input type="text" className="form-control" defaultValue="10" /> */}
                          <input
                            type="text"
                            className="form-control"
                            // value={orderMethodStatus?.order_method_charge_amount ?? ""}
                            value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                          />
                        </div>
                        <button type="button" className="btn-save" onClick={handleExtraChargeSave}>
                          SAVE
                        </button>
                      </div>
                    </div>

                    <div className="toggle-wrapper">
                      <label className="switch">
                        {/* <input type="checkbox" defaultChecked /> */}
                        <input
                          type="checkbox"
                          checked={orderMethodStatus?.email_notify === 1}
                          onChange={(e) =>
                            handleRestaurantEmailToggle(e.target.checked)
                          }
                        />
                        <span className="slider" />
                      </label>
                      Send Order Email Notification to Restaurant
                    </div>

                    <div className="toggle-wrapper">
                      <label className="switch">
                        {/* <input type="checkbox" defaultChecked /> */}
                        <input
                          type="checkbox"
                          checked={orderMethodStatus?.email_notify_customer === 1}
                          onChange={(e) =>
                            handleCustomerEmailToggle(e.target.checked)
                          }
                        />
                        <span className="slider" />
                      </label>
                      Send Order Email Notification to Customer
                    </div>
                  </div>
                )}

{activeMethod === 2 && (
    <div className="form-section tab-content">
        <div className="toggle-wrapper">
            <label className="switch">
                <input
                    type="checkbox"
                    checked={orderMethodStatus?.method_status === 1}
                    onChange={(e) =>
                        handleOrderMethodToggle(e.target.checked)
                    }
                />
                <span className="slider" />
            </label>
            Enable Dine In
        </div>

        <div>
            <div className="section-title">Select Payment Method for Dine In</div>
            <div className="checkbox-group" style={{ fontWeight: 400 }}>
                {paymentMethods.map((payment) => {
                    const checked = selectedPayments.some(
                        (p) => p.payment_method_id === payment.id
                    );
                    return (
                        <label key={payment.id} className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) =>
                                    handlePaymentMethodToggle(
                                        payment.id,
                                        e.target.checked
                                    )
                                }
                            />
                            {payment.method_name}
                        </label>
                    );
                })}
            </div>
        </div>

        <div className="toggle-wrapper">
            <label className="switch">
                <input 
                    type="checkbox" 
                    checked={orderMethodStatus?.preorder_status === 1} 
                    onChange={(e) => handlePreOrderToggle(e.target.checked)} 
                />
                <span className="slider" />
            </label>
            Pre-Order
        </div>

        <div className="radio-group" style={{ fontWeight: 600 }}>
            Order Approval :
            <label className="radio-label" style={{ fontWeight: 500 }}>
                <input
                    type="radio"
                    name="dinein_approval"
                    checked={orderMethodStatus?.order_approval === 0}
                    readOnly
                /> Auto
            </label>
            <label className="radio-label" style={{ fontWeight: 500 }}>
                <input
                    type="radio"
                    name="dinein_approval"
                    checked={orderMethodStatus?.order_approval === 1}
                    readOnly
                /> Manual
            </label>
        </div>

        <div className="input-save-row">
            <label>Enter Custom Label For : Dine In</label>
            <div className="input-group">
                <input 
                    type="text" 
                    className="form-control" 
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)} 
                />
                <button type="button" className="btn-save" onClick={handleCustomLabelSave}>
                    SAVE
                </button>
            </div>
        </div>

        <div className="input-save-row">
            <label>Order Dine In Time (Minutes) <span>*</span></label>
            <div className="input-group">
                <input
                    type="text"
                    className="form-control"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                />
                <button type="button" className="btn-save" onClick={handlePrepTimeSave}>
                    SAVE
                </button>
            </div>
        </div>

        <div className="input-save-row">
            <label>Enter notes to display the customers</label>
            <div className="input-group">
                <textarea
                    className="form-control"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Enter notes for customers..."
                />
                <button type="button" className="btn-save" onClick={handleCustomNotesSave}>
                    SAVE
                </button>
            </div>
        </div>

        <div className="extra-charge-container">
            <div className="section-title">Add Extra Charge On Dine In</div>
            <div className="extra-charge-row">
                <div className="charge-field">
                    <label>Charge Label</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        value={chargeLabel}
                        onChange={(e) => setChargeLabel(e.target.value)} 
                    />
                </div>
                <div className="charge-field">
                    <label>Charge Amount (INR)</label>
                    <input
                        type="text"
                        className="form-control"
                        value={chargeAmount}
                        onChange={(e) => setChargeAmount(e.target.value)}
                    />
                </div>
                <button type="button" className="btn-save" onClick={handleExtraChargeSave}>
                    SAVE
                </button>
            </div>
        </div>

        <div>
            <div className="section-title">Customers Details (For QR Orders Only)</div>
            <div className="checkbox2-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={userOptionDetails?.first_name === "1"}
                        onChange={(e) => 
                            handleUserOptionToggle("f_name", e.target.checked)
                        }
                    />
                    First Name
                </label>

                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={userOptionDetails?.last_name === "1"}
                        onChange={(e) => 
                            handleUserOptionToggle("l_name", e.target.checked)
                        }
                    />
                    Last Name
                </label>

                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={userOptionDetails?.phone_no === "1"}
                        onChange={(e) => 
                            handleUserOptionToggle("phone_no", e.target.checked)
                        }
                    />
                    Phone Number
                </label>
            </div>
        </div>

        <div className="toggle-wrapper">
            <label className="switch">
                <input
                    type="checkbox"
                    checked={orderMethodStatus?.email_notify === 1}
                    onChange={(e) =>
                        handleRestaurantEmailToggle(e.target.checked)
                    }
                />
                <span className="slider" />
            </label>
            Send Order Email Notification to Restaurant
        </div>

        <div className="toggle-wrapper">
            <label className="switch">
                <input
                    type="checkbox"
                    checked={orderMethodStatus?.email_notify_customer === 1}
                    onChange={(e) =>
                        handleCustomerEmailToggle(e.target.checked)
                    }
                />
                <span className="slider" />
            </label>
            Send Order Email Notification to Customer
        </div>
    </div>
)}
                {activeMethod === 5 && (
                  // id="home-delivery-content"
                  <div className="form-section tab-content">
                    <div className="toggle-wrapper">
                      <label className="switch">
                        <input type="checkbox" checked={orderMethodStatus?.method_status === 1} onChange={(e) =>
                          handleOrderMethodToggle(e.target.checked)
                        } />
                        <span className="slider" />
                      </label>
                      Enable Home Delivery
                    </div>

                    <div>
                      <div className="section-title">Select Payment Method for Home Delivery</div>
                      <div className="checkbox-group" style={{ fontWeight: 400 }}>
                        {paymentMethods.map((payment) => {
                          const checked = selectedPayments.some(
                            (p) => p.payment_method_id === payment.id
                          );

                          return (
                            <label
                              key={payment.id}
                              className="checkbox-label"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) =>
                                  handlePaymentMethodToggle(
                                    payment.id,
                                    e.target.checked
                                  )
                                }
                              />
                              {payment.method_name}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="toggle-wrapper">
                      <label className="switch">
                        <input type="checkbox" checked={orderMethodStatus?.preorder_status === 1} onChange={(e) =>
                          handlePreOrderToggle(e.target.checked)
                        } />
                        <span className="slider" />
                      </label>
                      Pre-Order
                    </div>

                    <div className="radio-group" style={{ fontWeight: 600 }}>
                      Order Approval :
                      <label className="radio-label" style={{ fontWeight: 500 }}>
                        {/* <input type="radio" name="delivery_approval" /> Auto */}
                        <input
                          type="radio"
                          name="delivery_approval"
                          checked={orderMethodStatus?.order_approval === 0}
                          readOnly
                        /> Auto
                      </label>
                      <label className="radio-label" style={{ fontWeight: 500 }}>
                        <input
                          type="radio"
                          checked={orderMethodStatus?.order_approval === 1}
                          readOnly
                        /> Manual
                      </label>
                    </div>

                    <div className="input-save-row">
                      <label>Enter Custom Label For : Home Delivery</label>
                      <div className="input-group">
                        <input type="text" className="form-control" value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)} />
                        <button type="button" className="btn-save" onClick={handleCustomLabelSave}>
                          SAVE
                        </button>
                      </div>
                    </div>

                    <div className="input-save-row">
                      <label>
                        Order Home Delivery Time (Minutes) <span>*</span>
                      </label>
                      <div className="input-group">
                        <input type="text" className="form-control" value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)} />
                        <button type="button" className="btn-save" onClick={handlePrepTimeSave}>
                          SAVE
                        </button>
                      </div>
                    </div>

                    <div className="input-save-row">
                      <label>Enter notes to display the customers</label>
                      <div className="input-group">
                        <textarea
                          className="form-control"
                           value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="Enter notes for customers..."
            rows={3}
                        />
                        <button type="button" className="btn-save" onClick={handleCustomNotesSave}>
                          SAVE
                        </button>
                      </div>
                    </div>

                    <div className="extra-charge-container">
                      <div className="section-title">Add Extra Charge On Home Delivery</div>
                      <div className="extra-charge-row">
                        <div className="charge-field">
                          <label>Charge Label</label>
                          <input type="text" className="form-control" value={chargeLabel}
                onChange={(e) => setChargeLabel(e.target.value)} />
                        </div>
                        <div className="charge-field">
                          <label>Charge Amount (INR)</label>
                          <input type="text" className="form-control"value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)} />
                        </div>
                        <button type="button" className="btn-save" onClick={handleExtraChargeSave}>
                          SAVE
                        </button>
                      </div>
                    </div>

                    <div className="toggle-wrapper">
                      <label className="switch">
                        {/* <input type="checkbox" defaultChecked /> */}
                        <input
                          type="checkbox"
                          checked={orderMethodStatus?.email_notify === 1}
                          onChange={(e) =>
                            handleRestaurantEmailToggle(e.target.checked)
                          }
                        />
                        <span className="slider" />
                      </label>
                      Send Order Email Notification to Restaurant
                    </div>

                    <div className="toggle-wrapper">
                      <label className="switch">
                        {/* <input type="checkbox" defaultChecked /> */}
                        <input
                          type="checkbox"
                          checked={orderMethodStatus?.email_notify_customer === 1}
                          onChange={(e) =>
                            handleCustomerEmailToggle(e.target.checked)
                          }
                        />
                        <span className="slider" />
                      </label>
                      Send Order Email Notification to Customer
                    </div>
                  </div>
                )}
              </div>
            </div>

            <WizardFooter />
          </div>
        </main>
      </div>

      <div id="successToast" className="toast-alert">
        <svg viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span>Settings saved successfully!</span>
      </div>
    </div>
  );
}
