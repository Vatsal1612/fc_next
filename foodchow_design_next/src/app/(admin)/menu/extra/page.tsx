"use client";

import { useEffect, useState } from "react";
import { menuService, type ExtraCategory, type ExtraOption } from "@/api/services/menu.service";
import Swal from "sweetalert2";
import { WizardFooter } from "@/components/shared/WizardFooter";
import { useShopId } from "@/utils/shop";
import "./page.css";

const PAGE_SIZE = 10;

export default function ExtraPage() {
  const SHOP_ID = useShopId();
  const [categories, setCategories] = useState<ExtraCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Category");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("extras-view");
  const [sizeRows, setSizeRows] = useState([
    {
      sizeId: "",
      price: "",
    },
  ]);
  const addSizeRow = () => {
    setSizeRows((prev) => [
      ...prev,
      {
        sizeId: "",
        price: "",
      },
    ]);
  };
  const removeSizeRow = (index: number) => {
    setSizeRows((prev) => prev.filter((_, i) => i !== index));
  };
  const updateSizeRow = (
    index: number,
    field: "sizeId" | "price",
    value: string
  ) => {
    setSizeRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  };
  const [sizes, setSizes] = useState<
    { size_id: number; size_name: string }[]
  >([]);

  // ── Edit Form States ──
  const [editSizeRows, setEditSizeRows] = useState<{ sizeId: string; price: string }[]>([
    { sizeId: "", price: "" },
  ]);
  const [editPrice, setEditPrice] = useState("");
  const [editExtraContainsSize, setEditExtraContainsSize] = useState(false);

  // ── Form states ──
  const [_showAddExtrasForm, setShowAddExtrasForm] = useState(false);
  const [_showEditExtrasForm, setShowEditExtrasForm] = useState(false);
  const [_showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [_showEditCategoryForm, setShowEditCategoryForm] = useState(false);
  void _showAddExtrasForm; void _showEditExtrasForm; void _showAddCategoryForm; void _showEditCategoryForm;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; type: string } | null>(null);
  const [editTarget, setEditTarget] = useState<ExtraOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Add Extras Form States ──
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");
  const [newExtraCategory, setNewExtraCategory] = useState("");
  const [newExtraContainsSize, setNewExtraContainsSize] = useState(false);
  const [newExtraDiet, setNewExtraDiet] = useState("vegetarian");
  const [newExtraStatus, setNewExtraStatus] = useState("active");

  // ── Add Category Form States ──
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryStatus, setNewCategoryStatus] = useState("active");

  // ── Edit Category Form States ──
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryStatus, setEditCategoryStatus] = useState("active");
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);

  // ── Edit Extra Form States ──
  const [editStatus, setEditStatus] = useState(1);
  const [editVeg, setEditVeg] = useState(1);

  // ── Load extras from the FoodChow API ──
  const loadExtras = async () => {
    setLoading(true);

    try {
      const data = await menuService.extrasByShop(SHOP_ID);

      setCategories(data);

      const uniqueSizes = new Map();

      data.forEach((category) => {
        category.extraCategoryOptionList.forEach((extra) => {
          extra.extraCategoryOptionSizeList?.forEach((size) => {
            if (
              size.size_id &&
              size.size_name &&
              !uniqueSizes.has(size.size_id)
            ) {
              uniqueSizes.set(size.size_id, {
                size_id: size.size_id,
                size_name: size.size_name,
              });
            }
          });
        });
      });

      setSizes(Array.from(uniqueSizes.values()));

      setError(null);
    } catch (err: any) {
      setError(err.message ?? "Failed to load extras");
    } finally {
      setLoading(false);
    }
  };
  // ── Load data on component mount ──
  useEffect(() => {
    loadExtras();
  }, []);

  // ── Edit Size Row Functions ──
  const addEditSizeRow = () => {
    setEditSizeRows((prev) => [
      ...prev,
      {
        sizeId: "",
        price: "",
      },
    ]);
  };

  const removeEditSizeRow = (index: number) => {
    setEditSizeRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEditSizeRow = (
    index: number,
    field: "sizeId" | "price",
    value: string
  ) => {
    setEditSizeRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  };
  // ── Get unique categories for filter dropdown ──
  const categoryNames = ["All Category", ...categories.map(cat => cat.custom_cat_name)];

  // ── Filter categories based on selection ──
  const filteredCategories = selectedCategory === "All Category"
    ? categories
    : categories.filter(cat => cat.custom_cat_name === selectedCategory);

  // ── Get all extras from filtered categories ──
  const allExtras = filteredCategories.flatMap(cat =>
    cat.extraCategoryOptionList.map(extra => ({
      ...extra,
      categoryName: cat.custom_cat_name
    }))
  );

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(allExtras.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pagedExtras = allExtras.slice(pageStart, pageStart + PAGE_SIZE);

  // ── Helper functions ──
  const getDietClass = (isVeg: number) => isVeg === 1 ? "veg-box" : "non-veg-box";
  // const isActive = (status: number) => status === 1;

  const getSizeDisplay = (sizeList: ExtraOption["extraCategoryOptionSizeList"]) => {
    if (!sizeList || sizeList.length === 0) return null;
    const validSizes = sizeList.filter(s => s.size_id !== 0 && s.size_name !== null);
    if (validSizes.length === 0) return null;

    return validSizes.map((size, index) => (
      <div key={index} className="variant-pill" data-size={size.size_name || "standard"}>
        <span className="v-label">{size.size_name || "standard"}</span>
        <span className="v-cost">Rs. {size.price}</span>
      </div>
    ));
  };

  // ── Navigation between tabs ──
  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
    document.querySelectorAll<HTMLElement>(".panel-view").forEach(view => {
      view.classList.remove("visible");
    });
    const targetPanel = document.getElementById(tabId);
    if (targetPanel) targetPanel.classList.add("visible");

    document.querySelectorAll<HTMLElement>(".tab-trigger").forEach(btn => {
      btn.classList.remove("active-tab");
    });
    const tabBtn = document.getElementById(`tab-${tabId}`);
    if (tabBtn) tabBtn.classList.add("active-tab");
  };

  // ── Handle Add Extras ──
  const handleAddExtra = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const itemSizeList = newExtraContainsSize
        ? sizeRows.map((row) => ({
          size_id: row.sizeId,
          price: row.price,
        }))
        : [];

      const payload = {
        ingredient_id: "0",
        shop_id: SHOP_ID.toString(),
        ingredient_name: newExtraName,
        ingredient_category_id: newExtraCategory,
        is_size_available: newExtraContainsSize ? "1" : "0",
        is_veg: newExtraDiet === "vegetarian" ? "1" : "0",
        status: newExtraStatus === "active" ? "1" : "0",
        price: newExtraContainsSize
          ? "0"
          : newExtraPrice,
        ItemSizeList: itemSizeList,
      };

      const response = await menuService.addExtraItem(payload);


      if (response.success) {
        // alert("Extra added successfully");
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Extra added successfully',
          timer: 2000,
          showConfirmButton: false
        });

        await loadExtras();

        resetAddExtrasForm();

        setSizeRows([
          {
            sizeId: "",
            price: "",
          },
        ]);

        setShowAddExtrasForm(false);

        const navBar = document.getElementById("main-nav-tabs-bar");
        if (navBar) navBar.style.display = "flex";

        switchTab("extras-view");
      } else {
        // alert(response.message || "Failed to add extra");
        await Swal.fire({
          icon: 'error',
          title: 'Failed!',
          text: response.message || 'Failed to add extra',
        });
      }
    } catch (err: any) {
      console.error(err);
      // alert(err?.message || "Something went wrong");
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err?.message || 'Something went wrong',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // ── Handle Add Category with API ──
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) {
      // alert("Please enter category name");
      await Swal.fire({
        icon: 'warning',
        title: 'Warning!',
        text: 'Please enter category name',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await menuService.addExtraCategory(SHOP_ID, newCategoryName);

      if (response.success) {
        await loadExtras();
        setNewCategoryName("");
        setNewCategoryStatus("active");
        setShowAddCategoryForm(false);
        switchTab("category-view");
        // alert("Category added successfully!");
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Category added successfully!',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // alert(response.message || "Failed to add category");
        await Swal.fire({
          icon: 'error',
          title: 'Failed!',
          text: response.message || 'Failed to add category',
        });
      }
    } catch (err: any) {
      console.error("API ERROR:", err);
      console.error("RESPONSE:", err?.response?.data);

      // alert(err?.message || "An error occurred while adding category");
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err?.message || 'An error occurred while adding category',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle Edit Category with API ──
  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategoryName || !editCategoryId) {
      // alert("Please enter category name");
      await Swal.fire({
        icon: 'warning',
        title: 'Warning!',
        text: 'Please enter category name',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await menuService.updateExtraCategory(
        editCategoryId,
        SHOP_ID,
        editCategoryName
      );

      if (response.success) {
        await loadExtras();
        setEditCategoryName("");
        setEditCategoryStatus("active");
        setEditCategoryId(null);
        setShowEditCategoryForm(false);
        switchTab("category-view");
        // alert("Category updated successfully!");
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Category updated successfully!',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // alert(response.message || "Failed to update category");
        await Swal.fire({
          icon: 'error',
          title: 'Failed!',
          text: response.message || 'Failed to update category',
        });
      }
    } catch (err: any) {
      console.error("API ERROR:", err);
      console.error("RESPONSE:", err?.response?.data);

      // alert(err?.message || "An error occurred while updating category");
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err?.message || 'An error occurred while updating category',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle Delete with API ──
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    try {
      if (deleteTarget.type === "category") {
        const response = await menuService.deleteExtraCategory(deleteTarget.id);

        if (response.success) {
          await loadExtras();
          setShowDeleteModal(false);
          setDeleteTarget(null);
          // alert("Category deleted successfully!");
          await Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Category deleted successfully!',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          // alert(response.message || "Failed to delete category");
          await Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: response.message || 'Failed to delete category',
          });
        }
      }
      else if (deleteTarget.type === "extra") {
        const response = await menuService.deleteExtraItem(
          deleteTarget.id
        );

        if (response.success) {
          await loadExtras();

          setShowDeleteModal(false);
          setDeleteTarget(null);

          // alert("Extra deleted successfully!");
          await Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Extra deleted successfully!',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          // alert(response.message || "Failed to delete extra");
          await Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: response.message || 'Failed to delete extra',
          });
        }
      }
    } catch (err: any) {
      console.error("API ERROR:", err);
      console.error("RESPONSE:", err?.response?.data);

      // alert(err?.message || "An error occurred while deleting");
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err?.message || 'An error occurred while deleting',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Reset forms ──
  const resetAddExtrasForm = () => {
    setNewExtraName("");
    setNewExtraPrice("");
    setNewExtraCategory("");
    setNewExtraContainsSize(false);
    setNewExtraDiet("vegetarian");
    setNewExtraStatus("active");
  };

  // ── Open edit extra form ──
  const openEditExtra = (extra: ExtraOption, categoryId?: number) => {
    console.log("EDIT EXTRA:", extra);
    setEditTarget(extra);
    setEditExtraContainsSize(extra.is_size === 1);

    // Store the category ID
    if (categoryId) {
      setEditCategoryId(categoryId);
    }

    // Set price
    setEditPrice(extra.price.toString());

    // Set size rows from the extra's size list
    if (extra.extraCategoryOptionSizeList && extra.extraCategoryOptionSizeList.length > 0) {
      const filteredSizes = extra.extraCategoryOptionSizeList.filter(s => s.size_id !== 0);
      if (filteredSizes.length > 0) {
        setEditSizeRows(
          filteredSizes.map(s => ({
            sizeId: s.size_id.toString(),
            price: s.price.toString(),
          }))
        );
      } else {
        setEditSizeRows([{ sizeId: "", price: "" }]);
      }
    } else {
      setEditSizeRows([{ sizeId: "", price: "" }]);
    }

    setShowEditExtrasForm(true);
    setEditStatus(extra.status);
    setEditVeg(extra.is_veg);

    document.querySelectorAll<HTMLElement>(".panel-view").forEach(view => {
      view.classList.remove("visible");
    });

    const navBar = document.getElementById("main-nav-tabs-bar");
    if (navBar) navBar.style.display = "none";

    document
      .getElementById("edit-ingredients-form-view")
      ?.classList.add("visible");
  };
  // ── Close edit extra form ──
  const closeEditExtra = () => {
    setEditTarget(null);
    setShowEditExtrasForm(false);
    setEditSizeRows([{ sizeId: "", price: "" }]);
    setEditPrice("");
    setEditExtraContainsSize(false);
    setEditCategoryId(null); // Clear the category ID
    const navBar = document.getElementById("main-nav-tabs-bar");
    if (navBar) navBar.style.display = "flex";
    switchTab("extras-view");
  };  // ── Handle Update Extra ──
  // const handleUpdateExtra = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!editTarget) return;

  //   try {
  //     setIsSubmitting(true);

  //     const form = e.target as HTMLFormElement;

  //     const name = (
  //       form.querySelector("#edit-name-input") as HTMLInputElement
  //     ).value;

  //     const containSize = (
  //       form.querySelector("#edit-contain-size-checkbox") as HTMLInputElement
  //     ).checked;

  //     let sizeList: any[] = [];
  //     let price = editTarget.price;

  //     if (containSize) {
  //       sizeList = editTarget.extraCategoryOptionSizeList.map((size) => ({
  //         size_id: size.size_id,
  //         price: size.price,
  //       }));

  //       price = 0;
  //     }

  //     const payload = {
  //       ingredient_id: editTarget.ingredient_id,
  //       ingredient_name: name,
  //       is_size: containSize ? 1 : 0,
  //       is_veg: editVeg,
  //       status: editStatus,
  //       price,
  //       extraCategoryOptionSizeList: sizeList,
  //     };

  //     const response = await menuService.updateExtraItem(payload);

  //     if (response.success) {
  //       alert("Extra updated successfully");

  //       await loadExtras();

  //       closeEditExtra();
  //     } else {
  //       alert(response.message || "Failed to update extra");
  //     }
  //   } catch (err: any) {
  //     console.error(err);
  //     alert(err?.message || "Something went wrong");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
  // ── Handle Update Extra ──
  // ── Handle Update Extra ──
  const handleUpdateExtra = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editTarget) return;

    try {
      setIsSubmitting(true);

      const form = e.target as HTMLFormElement;

      const name = (
        form.querySelector("#edit-name-input") as HTMLInputElement
      ).value;

      const containSize = editExtraContainsSize;

      let sizeList: any[] = [];
      let price = 0;

      if (containSize) {
        sizeList = editSizeRows
          .filter(row => row.sizeId && row.price)
          .map(row => ({
            size_id: parseInt(row.sizeId),
            price: row.price,
          }));

        price = 0;
      } else {
        price = parseFloat(editPrice) || 0;
      }

      const payload = {
        ingredient_id: editTarget.ingredient_id,
        ingredient_name: name,
        is_size: containSize ? 1 : 0,
        is_veg: editVeg,
        status: editStatus,
        price: price,
        extraCategoryOptionSizeList: sizeList,
        // Add category ID if needed
        ingredient_category_id: editCategoryId,
      };

      const response = await menuService.updateExtraItem(payload);

      if (response.success) {
        // alert("Extra updated successfully");
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Extra updated successfully',
          timer: 2000,
          showConfirmButton: false
        });

        await loadExtras();
        closeEditExtra();
      } else {
        // alert(response.message || "Failed to update extra");
        await Swal.fire({
          icon: 'error',
          title: 'Failed!',
          text: response.message || 'Failed to update extra',
        });
      }
    } catch (err: any) {
      console.error(err);
      // alert(err?.message || "Something went wrong");
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err?.message || 'Something went wrong',
      });
    } finally {
      setIsSubmitting(false);
    }
  };  // ── Handle category filter change ──

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  // ── Handle pagination ──
  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // ── Render ──
  return (
    <div id="pg-menu-extra">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <div className="app-container">
        <div className="main-workspace-wrapper">
          <main className="workspace-canvas">
            <div className="panel-data-card">
              <div className="navigation-tabs" id="main-nav-tabs-bar">
                <button
                  id="tab-extras-view"
                  className={`tab-trigger ${activeTab === "extras-view" ? "active-tab" : ""}`}
                  onClick={() => switchTab("extras-view")}
                >
                  Extras List
                </button>
                <button
                  id="tab-category-view"
                  className={`tab-trigger ${activeTab === "category-view" ? "active-tab" : ""}`}
                  onClick={() => switchTab("category-view")}
                >
                  Manage Categories
                </button>
              </div>

              {/* EXTRAS LIST VIEW PANEL */}
              <div id="extras-view" className={`panel-view ${activeTab === "extras-view" ? "visible" : ""}`}>
                <div className="section-header">
                  <div className="action-cluster-left">
                    <h1 className="typ-page-heading" style={{ margin: 0 }}>Extras</h1>
                    <select
                      className="custom-dropdown"
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                    >
                      {categoryNames.map((name, index) => (
                        <option key={index} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="action-cluster-right">
                    <button
                      className="action-btn btn-brand-primary"
                      onClick={() => {
                        setShowAddExtrasForm(true);
                        document.querySelectorAll<HTMLElement>(".panel-view").forEach(view => {
                          view.classList.remove("visible");
                        });
                        const navBar = document.getElementById("main-nav-tabs-bar");
                        if (navBar) navBar.style.display = "none";
                        document.getElementById("add-extras-form-view")?.classList.add("visible");
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      ADD EXTRAS
                    </button>
                    <button className="btn-help">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      HELP
                    </button>
                  </div>
                </div>

                <div className="table-module">
                  <div className="table-thead grid-row-extras">
                    <div>Extra Name</div>
                    <div>Price</div>
                    <div style={{ textAlign: "right", paddingRight: "20px" }}>Action</div>
                  </div>

                  <div className="table-tbody" id="extras-dynamic-table-body">
                    {loading && (
                      <div style={{ textAlign: "center", padding: "40px" }}>
                        Loading extras...
                      </div>
                    )}

                    {!loading && error && (
                      <div style={{ textAlign: "center", padding: "40px", color: "#e53e3e" }}>
                        {error}
                      </div>
                    )}

                    {!loading && !error && pagedExtras.length === 0 && (
                      <div style={{ textAlign: "center", padding: "40px" }}>
                        No extras found.
                      </div>
                    )}

                    {!loading && !error && pagedExtras.map((extra) => {
                      const hasSizes = extra.is_size === 1 &&
                        extra.extraCategoryOptionSizeList &&
                        extra.extraCategoryOptionSizeList.some(s => s.size_id !== 0);

                      return (
                        <div
                          key={extra.ingredient_id}
                          className="row-item grid-row-extras"
                          data-category={extra.categoryName.toLowerCase()}
                          data-diet={extra.is_veg === 1 ? "vegetarian" : "non-vegetarian"}
                        >
                          <div className="meta-title-cell">
                            <span className={getDietClass(extra.is_veg)}></span>
                            <span className="item-display-name">{extra.ingredient_name}</span>
                          </div>
                          <div className="pricing-stack">
                            {hasSizes ? (
                              getSizeDisplay(extra.extraCategoryOptionSizeList)
                            ) : (
                              <div className="variant-pill" data-size="standard">
                                <span className="v-label">standard</span>
                                <span className="v-cost">Rs. {extra.price}</span>
                              </div>
                            )}
                          </div>
                          <div className="functional-controls">
                            {/* <button
                              className="control-squircle squircle-edit"
                              title="Edit Item"
                              onClick={() => openEditExtra(extra)}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button> */}
                            <button
                              className="control-squircle squircle-edit"
                              title="Edit Item"
                              onClick={() => {
                                // Find the category that contains this extra
                                const category = categories.find(cat =>
                                  cat.extraCategoryOptionList.some(opt => opt.ingredient_id === extra.ingredient_id)
                                );
                                openEditExtra(extra, category?.custom_cat_id);
                              }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button
                              className="control-squircle squircle-delete"
                              title="Delete Item"
                              onClick={() => {
                                setDeleteTarget({ id: extra.ingredient_id, type: "extra" });
                                setShowDeleteModal(true);
                              }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                            <label className="ios-toggle">
                              <input
                                type="checkbox"
                                checked={extra.status === 1}
                                onChange={async (e) => {
                                  const newStatus = e.target.checked ? 1 : 0;

                                  try {
                                    const response =
                                      await menuService.changeExtraItemStatus(
                                        extra.ingredient_id,
                                        newStatus
                                      );

                                    if (response.success) {
                                      await loadExtras();
                                    } else {
                                      // alert(
                                      //   response.message ||
                                      //   "Failed to update status"
                                      // );
                                      await Swal.fire({
                                        icon: 'error',
                                        title: 'Failed!',
                                        text: response.message || 'Failed to update status',
                                      });
                                    }
                                  } catch (error: any) {
                                    console.error(error);
                                    // alert("Failed to update status");
                                    await Swal.fire({
                                      icon: 'error',
                                      title: 'Failed!',
                                      text: error?.response?.data?.message ||
                                        error?.message || 'Failed to update status',
                                    });
                                  }
                                }}
                              />
                              <span className="ios-slider"></span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <footer className="footer-pagination">
                  <div className="pagination-controls-left">
                    <button
                      className="nav-control-btn"
                      onClick={handlePrevious}
                      disabled={page <= 1}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                      Previous
                    </button>
                  </div>
                  <div className="progress-indicator-text">
                    {!loading && !error && (
                      <>Showing <strong>{allExtras.length > 0 ? `${pageStart + 1}-${Math.min(pageStart + PAGE_SIZE, allExtras.length)}` : "0"} of {allExtras.length}</strong> entries</>
                    )}
                    {loading && <>Loading...</>}
                  </div>
                  <button
                    className="nav-control-btn"
                    onClick={handleNext}
                    disabled={page >= totalPages}
                  >
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </footer>
              </div>

              {/* ADD NEW EXTRAS WORKSPACE PANEL */}
              <div id="add-extras-form-view" className="panel-view">
                <div className="section-header" style={{ marginBottom: "12px" }}>
                  <h1 className="typ-page-heading" style={{ margin: 0 }}>Add New Extras</h1>
                </div>

                <form id="extras-assignment-form" onSubmit={handleAddExtra}>
                  <div className="form-grid-row">
                    <div className="form-group">
                      <label htmlFor="extras-category-select">
                        Extras Category<span className="required-asterisk">*</span>
                      </label>
                      <select
                        id="extras-category-select"
                        className="form-control-select"
                        required
                        value={newExtraCategory}
                        onChange={(e) => setNewExtraCategory(e.target.value)}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.custom_cat_id} value={cat.custom_cat_id}>
                            {cat.custom_cat_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="extra-name-input">
                        Extra Name(English)<span className="required-asterisk">*</span>
                      </label>
                      <input
                        type="text"
                        id="extra-name-input"
                        className="form-control-input"
                        required
                        placeholder="e.g. Extra Cheese"
                        value={newExtraName}
                        onChange={(e) => setNewExtraName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "16px" }}>
                    <label className="custom-checkbox-label">
                      <input
                        type="checkbox"
                        checked={newExtraContainsSize}
                        onChange={(e) => setNewExtraContainsSize(e.target.checked)}
                      />
                      <span className="custom-checkbox-box"></span>
                      <span>Contain Size</span>
                    </label>
                  </div>

                  {newExtraContainsSize ? (
                    <>
                      {sizeRows.map((row, index) => (
                        <div
                          key={index}
                          className="size-row"
                        >
                          <div className="form-group">
                            <label>
                              Extras Size
                              <span className="required-asterisk">*</span>
                            </label>
                            <select
                              className="form-control-select"
                              value={row.sizeId}
                              onChange={(e) =>
                                updateSizeRow(index, "sizeId", e.target.value)
                              }
                            >
                              <option value="">Select Item Size</option>

                              {sizes.map((size) => (
                                <option
                                  key={size.size_id}
                                  value={size.size_id}
                                >
                                  {size.size_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="form-group">
                            <label>
                              Price (Rs.)
                              <span className="required-asterisk">*</span>
                            </label>

                            <input
                              type="number"
                              className="form-control-input"
                              placeholder="0.00"
                              value={row.price}
                              onChange={(e) =>
                                updateSizeRow(index, "price", e.target.value)
                              }
                            />
                          </div>

                          {index > 0 && (
                            <button
                              type="button"
                              className="delete-size-btn"
                              onClick={() => removeSizeRow(index)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        className="btn-add-more"
                        onClick={addSizeRow}
                        style={{ marginTop: "12px" }}
                      >
                        ADD MORE
                      </button>
                    </>
                  ) : (
                    <div
                      className="form-grid-row"
                      style={{
                        marginTop: "16px",
                      }}
                    >
                      <div className="form-group">
                        <label>
                          Price (Rs.)
                          <span className="required-asterisk">*</span>
                        </label>

                        <input
                          type="number"
                          className="form-control-input"
                          placeholder="0.00"
                          value={newExtraPrice}
                          onChange={(e) => setNewExtraPrice(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                  <div className="form-grid-row" style={{ marginTop: "16px" }}>
                    <div className="radio-cluster-group">
                      <span className="radio-cluster-title">Status</span>
                      <div className="radio-options-flex">
                        <label className="custom-radio-label">
                          <input
                            type="radio"
                            name="status-radio-group"
                            value="active"
                            checked={newExtraStatus === "active"}
                            onChange={(e) => setNewExtraStatus(e.target.value)}
                          />
                          <span className="custom-radio-circle"></span>
                          <span>Active</span>
                        </label>
                        <label className="custom-radio-label">
                          <input
                            type="radio"
                            name="status-radio-group"
                            value="deactive"
                            checked={newExtraStatus === "deactive"}
                            onChange={(e) => setNewExtraStatus(e.target.value)}
                          />
                          <span className="custom-radio-circle"></span>
                          <span>Deactive</span>
                        </label>
                      </div>
                    </div>

                    <div className="radio-cluster-group">
                      <span className="radio-cluster-title">&nbsp;</span>
                      <div className="radio-options-flex">
                        <label className="custom-radio-label">
                          <input
                            type="radio"
                            name="diet-radio-group"
                            value="vegetarian"
                            checked={newExtraDiet === "vegetarian"}
                            onChange={(e) => setNewExtraDiet(e.target.value)}
                          />
                          <span className="custom-radio-circle"></span>
                          <span>Vegetarian</span>
                        </label>
                        <label className="custom-radio-label">
                          <input
                            type="radio"
                            name="diet-radio-group"
                            value="non-vegetarian"
                            checked={newExtraDiet === "non-vegetarian"}
                            onChange={(e) => setNewExtraDiet(e.target.value)}
                          />
                          <span className="custom-radio-circle"></span>
                          <span>Non Vegetarian</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button type="submit" className="action-btn btn-submit-action">ADD</button>
                    <button
                      type="button"
                      className="action-btn btn-cancel-action"
                      onClick={() => {
                        resetAddExtrasForm();
                        setShowAddExtrasForm(false);
                        const navBar = document.getElementById("main-nav-tabs-bar");
                        if (navBar) navBar.style.display = "flex";
                        switchTab("extras-view");
                      }}
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              </div>

              {/* EDIT INGREDIENTS WORKSPACE PANEL */}
              <div id="edit-ingredients-form-view" className="panel-view">
                <div className="section-header" style={{ marginBottom: "12px" }}>
                  <h1 className="typ-page-heading" style={{ margin: 0 }}>Edit Ingredients</h1>
                </div>

                <form id="edit-ingredients-assignment-form" onSubmit={handleUpdateExtra}>
                  <input type="hidden" id="edit-target-row-index" value={editTarget?.ingredient_id || ""} />

                  <div className="form-grid-row">
                    <div className="form-group">
                      <label htmlFor="edit-category-select">
                        Extras Category<span className="required-asterisk">*</span>
                      </label>
                      <select
                        id="edit-category-select"
                        className="form-control-select"
                        required
                        value={editCategoryId || ""}
                        onChange={(e) => setEditCategoryId(Number(e.target.value))}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.custom_cat_id} value={cat.custom_cat_id}>
                            {cat.custom_cat_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-name-input">
                        Extras Name<span className="required-asterisk">*</span>
                      </label>
                      <input
                        type="text"
                        id="edit-name-input"
                        className="form-control-input"
                        required
                        defaultValue={editTarget?.ingredient_name || ""}
                      />
                    </div>
                  </div>

                  <div style={{ margin: "20px 0" }}>
                    <label className="custom-checkbox-label">
                      <input
                        type="checkbox"
                        id="edit-contain-size-checkbox"
                        checked={editExtraContainsSize}
                        onChange={(e) => {
                          setEditExtraContainsSize(e.target.checked);
                          // If unchecking, clear size rows
                          if (!e.target.checked && editTarget) {
                            // Keep only the first size row with empty values
                            setEditSizeRows([{ sizeId: "", price: "" }]);
                          }
                        }}
                      />
                      <span className="custom-checkbox-box"></span>
                      <span>Contain Size</span>
                    </label>
                  </div>

                  {editExtraContainsSize ? (
                    <>
                      <div
                        id="edit-variants-container"
                        className="variant-container-block"
                      >
                        {editSizeRows.map((row, index) => (
                          <div key={index} className="variant-row">
                            <div className="form-group">
                              <label>
                                Extras Size
                                <span className="required-asterisk">*</span>
                              </label>
                              <select
                                className="form-control-select"
                                value={row.sizeId}
                                onChange={(e) => updateEditSizeRow(index, "sizeId", e.target.value)}
                              >
                                <option value="">Select Item Size</option>
                                {sizes.map((s) => (
                                  <option key={s.size_id} value={s.size_id}>
                                    {s.size_name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="form-group">
                              <label>
                                Price (Rs.)
                                <span className="required-asterisk">*</span>
                              </label>
                              <input
                                type="number"
                                className="form-control-input"
                                value={row.price}
                                onChange={(e) => updateEditSizeRow(index, "price", e.target.value)}
                              />
                            </div>

                            {index > 0 && (
                              <button
                                type="button"
                                className="delete-size-btn"
                                onClick={() => removeEditSizeRow(index)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="btn-add-more"
                        onClick={addEditSizeRow}
                      >
                        ADD MORE
                      </button>
                    </>
                  ) : (
                    <div
                      className="form-grid-row"
                      style={{ marginTop: "16px" }}
                    >
                      <div className="form-group">
                        <label>
                          Price (Rs.)
                          <span className="required-asterisk">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control-input"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-grid-row" style={{ marginTop: "24px" }}>
                    <div className="radio-cluster-group">
                      <span className="radio-cluster-title">Status</span>
                      <div className="radio-options-flex">
                        <label className="custom-radio-label">
                          <input
                            type="radio"
                            name="edit-status-radio-group"
                            value="active"
                            checked={editStatus === 1}
                            onChange={() => setEditStatus(1)}
                          />
                          <span className="custom-radio-circle"></span>
                          <span>Active</span>
                        </label>
                        <label className="custom-radio-label">
                          <input
                            type="radio"
                            name="edit-status-radio-group"
                            value="deactive"
                            checked={editStatus === 0}
                            onChange={() => setEditStatus(0)}
                          />
                          <span className="custom-radio-circle"></span>
                          <span>Deactive</span>
                        </label>
                      </div>
                    </div>

                    <div className="radio-cluster-group">
                      <span className="radio-cluster-title">&nbsp;</span>
                      <div className="radio-options-flex">
                        <label className="custom-radio-label">
                          <input
                            type="radio"
                            name="edit-diet-radio-group"
                            value="vegetarian"
                            checked={editVeg === 1}
                            onChange={() => setEditVeg(1)}
                          />
                          <span className="custom-radio-circle"></span>
                          <span>Vegetarian</span>
                        </label>
                        <label className="custom-radio-label">
                          <input
                            type="radio"
                            name="edit-diet-radio-group"
                            value="non-vegetarian"
                            checked={editVeg === 0}
                            onChange={() => setEditVeg(0)}
                          />
                          <span className="custom-radio-circle"></span>
                          <span>Non Vegetarian</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button type="submit" className="action-btn btn-submit-action">UPDATE</button>
                    <button type="button" className="action-btn btn-cancel-action" onClick={closeEditExtra}>
                      CANCEL
                    </button>
                  </div>
                </form>
              </div>

              {/* CATEGORIES LIST VIEW PANEL */}
              <div id="category-view" className={`panel-view ${activeTab === "category-view" ? "visible" : ""}`}>
                <div className="section-header">
                  <div>
                    <h1 className="typ-page-heading" style={{ margin: 0 }}>Extras Category</h1>
                    <p style={{ fontSize: "13px", color: "var(--text-gray)" }}>(Toppings, Extras etc.)</p>
                  </div>
                  <div className="action-cluster-right">
                    <button
                      className="action-btn btn-brand-primary"
                      onClick={() => {
                        setShowAddCategoryForm(true);
                        document.querySelectorAll<HTMLElement>(".panel-view").forEach(view => {
                          view.classList.remove("visible");
                        });
                        const navBar = document.getElementById("main-nav-tabs-bar");
                        if (navBar) navBar.style.display = "none";
                        document.getElementById("add-category-form-view")?.classList.add("visible");
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      ADD NEW EXTRAS CATEGORY
                    </button>
                    <button className="btn-help">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      HELP
                    </button>
                  </div>
                </div>

                <div className="table-module">
                  <div className="table-thead grid-row-categories">
                    <div>Category Name</div>
                    <div style={{ textAlign: "right", paddingRight: "20px" }}>Action</div>
                  </div>

                  <div className="table-tbody" id="categories-dynamic-table-body">
                    {loading && (
                      <div style={{ textAlign: "center", padding: "40px" }}>
                        Loading categories...
                      </div>
                    )}

                    {!loading && error && (
                      <div style={{ textAlign: "center", padding: "40px", color: "#e53e3e" }}>
                        {error}
                      </div>
                    )}

                    {!loading && !error && categories.length === 0 && (
                      <div style={{ textAlign: "center", padding: "40px" }}>
                        No categories found.
                      </div>
                    )}

                    {!loading && !error && categories.map((category) => (
                      <div
                        key={category.custom_cat_id}
                        className="row-item grid-row-categories"
                        data-status={category.status === 1 ? "active" : "deactive"}
                      >
                        <div className="meta-title-cell">
                          <span className="category-display-name">{category.custom_cat_name}</span>
                        </div>
                        <div className="functional-controls">
                          <button
                            className="control-squircle squircle-edit"
                            title="Edit Category"
                            onClick={() => {
                              setEditCategoryId(category.custom_cat_id);
                              setEditCategoryName(category.custom_cat_name);
                              setEditCategoryStatus(category.status === 1 ? "active" : "deactive");
                              setShowEditCategoryForm(true);
                              document.querySelectorAll<HTMLElement>(".panel-view").forEach(view => {
                                view.classList.remove("visible");
                              });
                              const navBar = document.getElementById("main-nav-tabs-bar");
                              if (navBar) navBar.style.display = "none";
                              document.getElementById("edit-category-form-view")?.classList.add("visible");
                            }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            className="control-squircle squircle-delete"
                            title="Delete Category"
                            onClick={() => {
                              setDeleteTarget({ id: category.custom_cat_id, type: "category" });
                              setShowDeleteModal(true);
                            }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                          {/* <label className="ios-toggle">
                            <input type="checkbox" defaultChecked={category.status === 1} />
                            <span className="ios-slider"></span>
                          </label> */}
                          <label className="ios-toggle">
                            <input
                              type="checkbox"
                              checked={category.status === 1}
                              onChange={async (e) => {
                                const newStatus = e.target.checked ? 1 : 0;

                                try {
                                  // Update local state immediately for better UX
                                  const updatedCategories = categories.map(cat =>
                                    cat.custom_cat_id === category.custom_cat_id
                                      ? { ...cat, status: newStatus }
                                      : cat
                                  );
                                  setCategories(updatedCategories);

                                  // Call API to update status
                                  const response = await menuService.changeCategoryStatus(
                                    category.custom_cat_id,
                                    newStatus
                                  );

                                  if (response.success) {
                                    // Reload to get fresh data
                                    await loadExtras();
                                  } else {
                                    // alert(response.message || "Failed to update status");
                                    await Swal.fire({
                                      icon: 'error',
                                      title: 'Failed!',
                                      text: response.message || 'Failed to update status',
                                    });
                                    // Revert on error
                                    await loadExtras();
                                  }
                                } catch (error: any) {
                                  console.error(error);
                                  // alert("Failed to update status");
                                  await Swal.fire({
                                    icon: 'error',
                                    title: 'Failed!',
                                    text: error?.response?.data?.message ||
                                      error?.message || 'Failed to update status',
                                  });
                                  // Revert on error
                                  await loadExtras();
                                }
                              }}
                            />
                            <span className="ios-slider"></span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <footer className="footer-pagination">
                  <div className="pagination-controls-left">
                    <button className="nav-control-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                      Previous
                    </button>
                  </div>
                  <div className="progress-indicator-text">
                    Step <strong id="step-metric-cat">6.1/26</strong>
                  </div>
                  <button className="nav-control-btn">
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </footer>
              </div>

              {/* ADD NEW EXTRAS CATEGORY WORKSPACE PANEL */}
              <div id="add-category-form-view" className="panel-view">
                <div className="section-header" style={{ marginBottom: "12px" }}>
                  <h1 className="typ-page-heading" style={{ margin: 0 }}>Add New Extras Category</h1>
                </div>

                <form id="category-assignment-form" onSubmit={handleAddCategory}>
                  <div className="form-grid-row">
                    <div className="form-group">
                      <label htmlFor="category-name-input">
                        Category Name(English)<span className="required-asterisk">*</span>
                      </label>
                      <input
                        type="text"
                        id="category-name-input"
                        className="form-control-input"
                        required
                        placeholder="e.g. Toppings"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="form-group" style={{ justifyContent: "center", marginTop: "24px" }}>
                      <div className="radio-cluster-group">
                        <span className="radio-cluster-title">Status</span>
                        <div className="radio-options-flex">
                          <label className="custom-radio-label">
                            <input
                              type="radio"
                              name="cat-status-radio-group"
                              value="active"
                              checked={newCategoryStatus === "active"}
                              onChange={(e) => setNewCategoryStatus(e.target.value)}
                              disabled={isSubmitting}
                            />
                            <span className="custom-radio-circle"></span>
                            <span>Active</span>
                          </label>
                          <label className="custom-radio-label">
                            <input
                              type="radio"
                              name="cat-status-radio-group"
                              value="deactive"
                              checked={newCategoryStatus === "deactive"}
                              onChange={(e) => setNewCategoryStatus(e.target.value)}
                              disabled={isSubmitting}
                            />
                            <span className="custom-radio-circle"></span>
                            <span>Deactive</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button type="submit" className="action-btn btn-submit-action" disabled={isSubmitting}>
                      {isSubmitting ? "ADDING..." : "ADD"}
                    </button>
                    <button
                      type="button"
                      className="action-btn btn-cancel-action"
                      onClick={() => {
                        setNewCategoryName("");
                        setNewCategoryStatus("active");
                        setShowAddCategoryForm(false);
                        const navBar = document.getElementById("main-nav-tabs-bar");
                        if (navBar) navBar.style.display = "flex";
                        switchTab("category-view");
                      }}
                      disabled={isSubmitting}
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              </div>

              {/* EDIT EXTRAS CATEGORY WORKSPACE PANEL */}
              <div id="edit-category-form-view" className="panel-view">
                <div className="section-header" style={{ marginBottom: "12px" }}>
                  <h1 className="typ-page-heading" style={{ margin: 0 }}>Edit Extras Category</h1>
                </div>

                <form id="edit-category-assignment-form" onSubmit={handleEditCategory}>
                  <input type="hidden" id="edit-cat-target-row-id" value={editCategoryId || ""} />

                  <div className="form-grid-row">
                    <div className="form-group">
                      <label htmlFor="edit-category-name-input">
                        Extra Category Name<span className="required-asterisk">*</span>
                      </label>
                      <input
                        type="text"
                        id="edit-category-name-input"
                        className="form-control-input"
                        required
                        placeholder="Toppings"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="form-grid-row" style={{ marginTop: "16px" }}>
                    <div className="radio-cluster-group">
                      <span className="radio-cluster-title">Status</span>
                      <div className="radio-options-flex">
                        <label className="custom-radio-label">
                          <input
                            type="radio"
                            name="edit-cat-status-group"
                            id="edit-cat-status-active"
                            value="active"
                            checked={editCategoryStatus === "active"}
                            onChange={(e) => setEditCategoryStatus(e.target.value)}
                            disabled={isSubmitting}
                          />
                          <span className="custom-radio-circle"></span>
                          <span>Active</span>
                        </label>
                        <label className="custom-radio-label">
                          <input
                            type="radio"
                            name="edit-cat-status-group"
                            id="edit-cat-status-deactive"
                            value="deactive"
                            checked={editCategoryStatus === "deactive"}
                            onChange={(e) => setEditCategoryStatus(e.target.value)}
                            disabled={isSubmitting}
                          />
                          <span className="custom-radio-circle"></span>
                          <span>Deactive</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button type="submit" className="action-btn btn-submit-action" disabled={isSubmitting}>
                      {isSubmitting ? "UPDATING..." : "UPDATE"}
                    </button>
                    <button
                      type="button"
                      className="action-btn btn-cancel-action"
                      onClick={() => {
                        setEditCategoryName("");
                        setEditCategoryStatus("active");
                        setEditCategoryId(null);
                        setShowEditCategoryForm(false);
                        const navBar = document.getElementById("main-nav-tabs-bar");
                        if (navBar) navBar.style.display = "flex";
                        switchTab("category-view");
                      }}
                      disabled={isSubmitting}
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <WizardFooter />
          </main>
        </div>
      </div>

      {/* ================= GLOBAL MODAL OVERLAY INJECTION ================= */}
      {showDeleteModal && (
        <div id="delete-confirmation-overlay" className="global-modal-overlay modal-visible">
          <div className="delete-dialog-box">
            <div className="delete-dialog-icon">
              <span>!</span>
            </div>
            <h2 className="delete-dialog-heading">
              Are you sure you want to delete this{" "}
              <span id="modal-dynamic-type-text">{deleteTarget?.type === "category" ? "Extras Category" : "Ingredient"}</span>?
            </h2>
            <div className="delete-dialog-actions">
              <button
                type="button"
                className="modal-action-btn modal-btn-cancel-style"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-action-btn modal-btn-confirm-style"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? "DELETING..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}