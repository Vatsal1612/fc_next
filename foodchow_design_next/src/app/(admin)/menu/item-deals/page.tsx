"use client";
import { WizardFooter } from "@/components/shared/WizardFooter";
import { menuService } from "@/api/services/menu.service";
import { useState, useEffect } from "react";
import "./page.css";
import { useShopId } from "@/utils/shop";

interface Deal {
  id: string;
  name: string;
  description?: string;
  price: number;
  mrp: number;
  minimumOrder: number;
  photo: string;
  active: boolean;
}

export default function ItemDealsPage() {
  const shopId = useShopId();

  // --- Wizard & Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // --- Dynamic Categories State ---
  const [categories, setCategories] = useState<any[]>([]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      if (!shopId) return;
      try {
        const categoryData = await menuService.getItems(shopId);
        setCategories(categoryData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [shopId]);

  // ADD / UPDATE MODE
  const [dealMode, setDealMode] = useState<"add" | "update">("add");
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  const [_updateStep, setUpdateStep] = useState(1);
  const [_updateDealName, setUpdateDealName] = useState("");

  const [_updateDealActive, setUpdateDealActive] = useState(true);
  const [_updateDealDescription, setUpdateDealDescription] =
    useState("");
  void _updateStep; void _updateDealName; void _updateDealActive; void _updateDealDescription;





  // --- Step 1 Form States ---
  const [dealName, setDealName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  // --- Mock Table Data State ---
  const [deals, setDeals] = useState<Deal[]>([]);

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  // Helper Toast
  const showToast = (message: string) => {
    const toast = document.getElementById("toast");
    const toastText = document.getElementById("toastText");
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
  };

  // --- Modal Open / Close Handlers ---
  const handleOpenAddModal = () => {
    setDealMode("add");
    setSelectedDealId(null);

    setUpdateStep(1);
    setUpdateDealName("");
    setUpdateDealDescription("");
    setUpdateDealActive(true);

    setDealName("");
    setDescription("");
    setStatus("active");

    setDealPrice("");
    setDealMrp("");
    setMinQty("1");

    setSelectedTaxes([]);
    setAppliedTaxes([]);
    setTaxAmount(0);
    setNetPrice(0);
    setFinalPrice(0);
    setTaxMode("included");

    setCurrentStep(1);
    setIsModalOpen(true);
  };

  // ==============================
  // EDIT DEAL - OPEN SAME FORM
  // ==============================
  const openEditModal = (id: string) => {
    const deal = deals.find((d) => d.id === id);

    if (!deal) {
      showToast("Deal not found");
      return;
    }

    console.log("EDIT DEAL:", deal);

    // UPDATE MODE
    setDealMode("update");
    setSelectedDealId(id);

    // Load existing deal data
    setDealName(deal.name);
    setDescription(deal.description || "");
    setStatus(deal.active ? "active" : "inactive");

    setDealPrice(String(deal.price));
    setDealMrp(String(deal.mrp));
    setMinQty(String(deal.minimumOrder));

    // Open FRIEND'S SAME FORM
    setCurrentStep(1);
    setIsModalOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentStep(1);
  };

  // --- Step 1 Next Button Action ---
  const handleNextStep1 = () => {
    if (!dealName.trim()) {
      showToast("Please enter a Deal Name");
      return;
    }
    if (!description.trim()) {
      showToast("Please enter a Description");
      return;
    }

    // Step 1 validation passed -> move to Step 2
    setCurrentStep(2);
  };

  // Filtered Deals
  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = deal.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "active" && deal.active) ||
      (activeFilter === "deactive" && !deal.active);
    return matchesSearch && matchesFilter;
  });

  const toggleDealActive = async (id: string) => {
    const deal = deals.find((d) => d.id === id);

    if (!deal) {
      showToast("Deal not found");
      return;
    }

    const newStatus = deal.active ? 0 : 1;

    console.log("STATUS UPDATE DEAL ID:", id);
    console.log("NEW STATUS:", newStatus);

    try {
      const statusResponse = await fetch(
        `https://www.foodchow.com/api/FoodChowRMS/UpdateDealStatusWD?dealId=${id}&status=${newStatus}`,
        {
          method: "GET",
        }
      );

      console.log(
        "STATUS UPDATE API STATUS:",
        statusResponse.status
      );

      if (!statusResponse.ok) {
        throw new Error(
          `Status API failed with status ${statusResponse.status}`
        );
      }

      const statusResult = await statusResponse.json();

      console.log(
        "STATUS UPDATE API RESPONSE:",
        statusResult
      );

      if (statusResult.response_code !== "1") {
        throw new Error(
          statusResult.message ||
          "Failed to update deal status"
        );
      }

      // Update UI only after API success
      setDeals((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
              ...d,
              active: newStatus === 1,
            }
            : d
        )
      );

      showToast(
        newStatus === 1
          ? "Deal activated successfully"
          : "Deal deactivated successfully"
      );

    } catch (error) {
      console.error(
        "STATUS UPDATE ERROR:",
        error
      );

      showToast(
        "Failed to update deal status"
      );
    }
  };

  const deleteDeal = (id: string) => {
    const deal = deals.find((d) => d.id === id);
    if (deal && confirm(`Are you sure you want to delete "${deal.name}"?`)) {
      setDeals((prev) => prev.filter((d) => d.id !== id));
      showToast("Deal deleted successfully");
    }
  };

  // --- Step 2 States ---

  interface ItemSize {
    id: string;
    name: string;
  }



  // interface SelectedSize {
  //   sizeId: string;
  // } 

  interface SelectedItem {
    itemId: string;
    selectedSizes: string[];
  }

  interface SelectedCategory {
    categoryId: string;
    selectedItems: SelectedItem[];
  }

  interface ItemGroup {
    id: string;
    name: string;
    selectedCount: number;
    selectedCategories: SelectedCategory[];
  }

  const [itemGroups, setItemGroups] = useState<ItemGroup[]>([
    {
      id: "1",
      name: "Item Group 1:",
      selectedCount: 0,
      selectedCategories: [],
    },
  ]);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const [dealPrice, setDealPrice] = useState("");
  const [dealMrp, setDealMrp] = useState("");
  const [minQty, setMinQty] = useState("1");

  type TaxMode = "included" | "excluded";

  interface TaxOption {
    id: string;
    name: string;
    rate: number;
  }

  const includedTaxes: TaxOption[] = [
    {
      id: "gst5",
      name: "GST",
      rate: 5,
    },
    {
      id: "hhhh6",
      name: "hhhhhhhhhh",
      rate: 6,
    },
    {
      id: "gfd10",
      name: "gfd",
      rate: 10,
    },
  ];

  const excludedTaxes: TaxOption[] = [
    {
      id: "kgst25",
      name: "KGST",
      rate: 2.5,
    },
    {
      id: "igst25",
      name: "IGST",
      rate: 2.5,
    },
  ];

  const [taxMode, setTaxMode] = useState<TaxMode>("included");

  // Taxes currently selected inside popup
  const [selectedTaxes, setSelectedTaxes] = useState<string[]>([]);

  // Taxes actually applied after clicking APPLY
  const [appliedTaxes, setAppliedTaxes] = useState<string[]>([]);

  const [, setTaxAmount] = useState(0);
  const [netPrice, setNetPrice] = useState(0);
  const [, setFinalPrice] = useState(0);

  const getAvailableTaxes = () => {
    return taxMode === "included"
      ? includedTaxes
      : excludedTaxes;
  };

  const getTaxDetails = () => {
    const price = Number(dealPrice);

    if (!price || price <= 0 || selectedTaxes.length === 0) {
      return {
        netPrice: 0,
        taxAmount: 0,
        finalPrice: 0,
        taxes: [],
      };
    }

    const availableTaxes = getAvailableTaxes();

    const taxes = availableTaxes.filter((tax) =>
      selectedTaxes.includes(tax.id)
    );

    if (taxMode === "included") {
      // Price already contains tax
      const calculatedTaxes = taxes.map((tax) => {
        const amount = (price * tax.rate) / (100 + tax.rate);

        return {
          ...tax,
          amount,
        };
      });

      const totalTax = calculatedTaxes.reduce(
        (sum, tax) => sum + tax.amount,
        0
      );

      return {
        netPrice: price - totalTax,
        taxAmount: totalTax,
        finalPrice: price,
        taxes: calculatedTaxes,
      };
    }

    // EXCLUDED
    const calculatedTaxes = taxes.map((tax) => {
      const amount = (price * tax.rate) / 100;

      return {
        ...tax,
        amount,
      };
    });

    const totalTax = calculatedTaxes.reduce(
      (sum, tax) => sum + tax.amount,
      0
    );

    return {
      netPrice: price,
      taxAmount: totalTax,
      finalPrice: price + totalTax,
      taxes: calculatedTaxes,
    };
  };
  const handleOpenTaxModal = () => {
    if (!dealPrice.trim() || Number(dealPrice) <= 0) {
      showToast("Please enter a valid Deal Price first");
      return;
    }

    setIsTaxModalOpen(true);
  };
  const [expandedCategory, setExpandedCategory] = useState<string | null>("side");
  const handleCategorySelection = (
    category: any
  ) => {
    if (!editingGroupId) return;

    setItemGroups((prev) =>
      prev.map((group) => {
        if (group.id !== editingGroupId) {
          return group;
        }

        const existingCategory =
          group.selectedCategories.find(
            (cat) => cat.categoryId === category.id
          );

        const categoryIsSelected =
          existingCategory &&
          existingCategory.selectedItems.length > 0;

        // Category is already selected
        // → remove ALL items
        if (categoryIsSelected) {
          return {
            ...group,
            selectedCategories:
              group.selectedCategories.filter(
                (cat) =>
                  cat.categoryId !== category.id
              ),
          };
        }

        // Category not selected
        // → select ALL items
        return {
          ...group,
          selectedCategories: [
            ...group.selectedCategories,
            {
              categoryId: category.id,

              selectedItems: (category.items || category.item_list || []).map(
                (rawItem: any) => {
                  const item = {
                    ...rawItem,
                    id: rawItem.id || rawItem.item_id,
                    sizes: rawItem.sizes || rawItem.item_size_list?.map((s: any) => ({ ...s, id: s.id || s.item_size_id || s.size_id }))
                  };
                  return {
                    itemId: item.id,

                    // Default first size
                    selectedSizes:
                      item.sizes &&
                        item.sizes.length > 0
                        ? [item.sizes[0].id]
                        : [],
                  }
                }
              ),
            },
          ],
        };
      })
    );
  };
  const isCategorySelected = (category: any) => {
    const selectedCategory = getSelectedCategory(category.id);

    return (
      selectedCategory !== undefined &&
      selectedCategory.selectedItems.length > 0
    );
  };
  const handleAddItemGroup = () => {
    const newId = (itemGroups.length + 1).toString();

    setItemGroups((prev) => [
      ...prev,
      {
        id: newId,
        name: `Item Group ${newId}:`,
        selectedCount: 0,
        selectedCategories: [],
      },
    ]);
  };

  const handleRemoveItemGroup = (id: string) => {
    setItemGroups((prev) =>
      prev.filter((group) => group.id !== id)
    );
  };

  const handleOpenItemModal = (groupId: string) => {
    setEditingGroupId(groupId);
    setExpandedCategory("side");
    setIsItemModalOpen(true);
  };
  const handleItemSelection = (
    categoryId: string,
    itemId: string
  ) => {
    if (!editingGroupId) return;

    setItemGroups((prev) =>
      prev.map((group) => {
        if (group.id !== editingGroupId) {
          return group;
        }

        const category = categories.find(
          (cat) => cat.id === categoryId
        );

        const rawItem = (category?.items || category?.item_list || []).find(
          (raw: any) => (raw.id || raw.item_id) === itemId
        );

        if (!rawItem) {
          return group;
        }

        const item = {
          ...rawItem,
          id: rawItem.id || rawItem.item_id,
          sizes: rawItem.sizes || rawItem.item_size_list?.map((s: any) => ({ ...s, id: s.id || s.item_size_id || s.size_id }))
        };

        const existingCategory =
          group.selectedCategories.find(
            (cat) => cat.categoryId === categoryId
          );

        // Category does not exist yet
        if (!existingCategory) {
          return {
            ...group,
            selectedCategories: [
              ...group.selectedCategories,
              {
                categoryId,
                selectedItems: [
                  {
                    itemId,
                    selectedSizes:
                      item.sizes &&
                        item.sizes.length > 0
                        ? [item.sizes[0].id]
                        : [],
                  },
                ],
              },
            ],
          };
        }

        const itemAlreadySelected =
          existingCategory.selectedItems.some(
            (selectedItem) =>
              selectedItem.itemId === itemId
          );

        // Remove item
        if (itemAlreadySelected) {
          const remainingItems =
            existingCategory.selectedItems.filter(
              (selectedItem) =>
                selectedItem.itemId !== itemId
            );

          return {
            ...group,
            selectedCategories:
              remainingItems.length === 0
                ? group.selectedCategories.filter(
                  (cat) =>
                    cat.categoryId !== categoryId
                )
                : group.selectedCategories.map(
                  (cat) =>
                    cat.categoryId === categoryId
                      ? {
                        ...cat,
                        selectedItems:
                          remainingItems,
                      }
                      : cat
                ),
          };
        }

        // Add item
        return {
          ...group,
          selectedCategories:
            group.selectedCategories.map((cat) =>
              cat.categoryId === categoryId
                ? {
                  ...cat,
                  selectedItems: [
                    ...cat.selectedItems,
                    {
                      itemId,
                      selectedSizes:
                        item.sizes &&
                          item.sizes.length > 0
                          ? [item.sizes[0].id]
                          : [],
                    },
                  ],
                }
                : cat
            ),
        };
      })
    );
  };
  const handleSizeSelection = (
    categoryId: string,
    itemId: string,
    sizeId: string
  ) => {
    if (!editingGroupId) return;

    setItemGroups((prev) =>
      prev.map((group) => {
        if (group.id !== editingGroupId) {
          return group;
        }

        return {
          ...group,
          selectedCategories: group.selectedCategories.map(
            (category) => {
              if (category.categoryId !== categoryId) {
                return category;
              }

              return {
                ...category,
                selectedItems: category.selectedItems.map(
                  (item) => {
                    if (item.itemId !== itemId) {
                      return item;
                    }

                    // ONE item → ONE size
                    return {
                      ...item,
                      selectedSizes: [sizeId],
                    };
                  }
                ),
              };
            }
          ),
        };
      })
    );
  };
  const handleSaveItemGroup = () => {
    if (!editingGroupId) return;

    setItemGroups((prev) =>
      prev.map((group) => {
        if (group.id !== editingGroupId) {
          return group;
        }

        const selectedCount =
          group.selectedCategories.reduce(
            (total, category) =>
              total + category.selectedItems.length,
            0
          );

        return {
          ...group,
          selectedCount,
        };
      })
    );

    setIsItemModalOpen(false);
    setEditingGroupId(null);
  };
  const getSelectedCategory = (
    categoryId: string
  ) => {
    const group = itemGroups.find(
      (group) => group.id === editingGroupId
    );

    return group?.selectedCategories.find(
      (category) =>
        category.categoryId === categoryId
    );
  };

  const isItemSelected = (
    categoryId: string,
    itemId: string
  ) => {
    const category =
      getSelectedCategory(categoryId);

    return (
      category?.selectedItems.some(
        (item) => item.itemId === itemId
      ) ?? false
    );
  };
  const handleDealPriceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    setDealPrice(value);

    if (
      !value ||
      Number(value) <= 0 ||
      appliedTaxes.length === 0
    ) {
      setNetPrice(0);
      setTaxAmount(0);
      setFinalPrice(0);
      return;
    }

    const price = Number(value);

    const availableTaxes =
      taxMode === "included"
        ? includedTaxes
        : excludedTaxes;

    const taxes = availableTaxes.filter((tax) =>
      appliedTaxes.includes(tax.id)
    );

    if (taxMode === "included") {
      const totalTax = taxes.reduce((sum, tax) => {
        return sum + (price * tax.rate) / (100 + tax.rate);
      }, 0);

      setNetPrice(price - totalTax);
      setTaxAmount(totalTax);
      setFinalPrice(price);
    } else {
      const totalTax = taxes.reduce((sum, tax) => {
        return sum + (price * tax.rate) / 100;
      }, 0);

      setNetPrice(price);
      setTaxAmount(totalTax);
      setFinalPrice(price + totalTax);
    }
  };
  const handleTaxModeChange = (mode: TaxMode) => {
    setTaxMode(mode);

    // Clear current popup selections
    setSelectedTaxes([]);
  };
  const calculateTax = () => {
    const price = Number(dealPrice);

    if (!price || price <= 0) {
      showToast("Please enter a valid Deal Price first");
      return;
    }



    const availableTaxes =
      taxMode === "included"
        ? includedTaxes
        : excludedTaxes;

    const taxes = availableTaxes.filter((tax) =>
      selectedTaxes.includes(tax.id)
    );

    let totalTax = 0;
    let calculatedNetPrice = price;
    let calculatedFinalPrice = price;

    if (taxMode === "included") {
      totalTax = taxes.reduce((sum, tax) => {
        return sum + (price * tax.rate) / (100 + tax.rate);
      }, 0);

      calculatedNetPrice = price - totalTax;
      calculatedFinalPrice = price;
    } else {
      totalTax = taxes.reduce((sum, tax) => {
        return sum + (price * tax.rate) / 100;
      }, 0);

      calculatedNetPrice = price;
      calculatedFinalPrice = price + totalTax;
    }

    setAppliedTaxes([...selectedTaxes]);
    setNetPrice(calculatedNetPrice);
    setTaxAmount(totalTax);
    setFinalPrice(calculatedFinalPrice);

    setIsTaxModalOpen(false);
  };
  const handleNextStep2 = () => {
    const price = Number(dealPrice);
    const mrp = Number(dealMrp);
    const quantity = Number(minQty);

    // Deal Price validation
    if (!dealPrice.trim() || price <= 0) {
      showToast("Please enter a valid Deal Price");
      return;
    }

    // MRP validation
    if (!dealMrp.trim() || mrp <= 0) {
      showToast("Please enter a valid Deal MRP");
      return;
    }

    // Deal Price cannot be greater than MRP
    if (price >= mrp) {
      showToast("Deal Price cannot be greater than Deal MRP");
      return;
    }

    // Minimum Order Quantity validation
    if (!minQty.trim() || quantity <= 0) {
      showToast("Minimum Order Quantity must be at least 1");
      return;
    }



    // At least one item should be selected
    const hasSelectedItems = itemGroups.some(
      (group) => group.selectedCount > 0
    );

    if (!hasSelectedItems) {
      showToast("Please select at least one item group");
      return;
    }

    setCurrentStep(3);
  };
  // --- Step 3 States ---
  const [orderType, setOrderType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [allowDiscount, setAllowDiscount] = useState<string>("");
  const handleNextStep3 = () => {
    if (!orderType) {
      showToast("Please select any allowed order type.");
      return;
    }

    if (!paymentMethod) {
      showToast("Please select any allowed payment method.");
      return;
    }

    if (!allowDiscount) {
      showToast(
        "Please select Apply Discount and Offer with this Deal option."
      );
      return;
    }

    setCurrentStep(4);
  };
  const handleTaxSelection = (taxId: string) => {
    setSelectedTaxes((prev) =>
      prev.includes(taxId)
        ? prev.filter((id) => id !== taxId)
        : [...prev, taxId]
    );
  };
  const buildSelectedGroupList = (shopId: string) => {
    return itemGroups.map((group, groupIndex) => ({
      GroupNo: groupIndex + 1,

      selectedCategoryList: group.selectedCategories.map((category) => {
        const categoryData = categories.find(
          (cat) => cat.id === category.categoryId
        );

        return {
          DealCategoryId: 0,
          CategoryId: Number(category.categoryId),
          DealId: 0,
          ShopId: shopId,
          GroupNo: groupIndex + 1,

          selectedItemList: category.selectedItems.flatMap((selectedItem) => {
            const itemData = (categoryData?.items || categoryData?.item_list || []).find(
              (item: any) => (item.id || item.item_id) === selectedItem.itemId
            );

            return selectedItem.selectedSizes.map((sizeId) => ({
              DealItemId: 0,
              DealCategoryId: 0,

              categoryId: Number(category.categoryId),
              categoryName: categoryData?.name || categoryData?.cate_name || "",

              itemId: Number(selectedItem.itemId),
              itemName: itemData?.name || itemData?.item_name || "",

              sizeId: Number(sizeId),

              isAdd: 1,
              isDelete: 0,
            }));
          }),

          isDeleteCategory: 0,
          isUpdateCategory: 0,
          isAddCategory: 0,
        };
      }),
    }));
  };

  // ==========================================
  // UPDATE DEAL
  // SAME FORM - UPDATE MODE
  // ==========================================
  const handleUpdateDeal = async (dealId: string) => {

    if (!dealId) {
      showToast("Deal ID not found");
      return;
    }

    const shopId = sessionStorage.getItem("shop_id");

    if (!shopId) {
      showToast("Shop ID not found in session");
      return;
    }

    // ==========================================
    // BUILD SELECTED GROUP LIST
    // ==========================================
    const selectedGroupList = buildSelectedGroupList(shopId);

    // ==========================================
    // UPDATE PAYLOAD
    // USING FRIEND'S FORM STATES
    // ==========================================
    const payload = {
      DealId: Number(dealId),

      DealName: dealName.trim(),

      DealDesc: description.trim(),

      DealPrice: Number(dealPrice) || 0,

      DealMRP: Number(dealMrp) || 0,

      DealMinOrder: Number(minQty) || 1,

      ShopId: shopId,

      DealImage: "",

      DealTypeId: 1,

      TotalDealPrice:
        taxMode === "excluded"
          ? Number(netPrice)
          : Number(dealPrice),

      DealStatus: status === "active" ? 1 : 0,

      ContainFoodItem: 1,

      PercentDiscountOnCart: 0,

      OrderMethod: orderType,

      PaymentMethod: paymentMethod,

      selectedGroupList,

      selectedTaxList: [],

      fooddealslanlist: [
        {
          locale_name: null,
        },
      ],

      isItemGroupUpdated: 0,

      old_grouplist: "",

      new_grouplist: "",

      old_taxlist: "",

      new_taxlist: "",

      applyDiscount:
        allowDiscount === "yes" ? "1" : "0",
    };

    console.log("=================================");
    console.log("UPDATE DEAL ID:", dealId);
    console.log("UPDATE DEAL PAYLOAD:", payload);
    console.log("=================================");

    if (!payload.DealName) {
      showToast("Please enter Deal Name");
      return;
    }

    try {

      // ==========================================
      // MAIN UPDATE API
      // ==========================================
      const response = await fetch(
        "https://www.foodchow.com/api/FoodChowRMS/UpdateDealWD",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      console.log(
        "UPDATE API STATUS:",
        response.status
      );

      const responseText = await response.text();

      console.log(
        "UPDATE API RAW RESPONSE:",
        responseText
      );

      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        result = responseText;
      }

      console.log(
        "UPDATE API RESPONSE:",
        result
      );

      if (!response.ok) {
        throw new Error(
          `Update API failed with status ${response.status}`
        );
      }

      // ==========================================
      // UPDATE ACTIVE / INACTIVE STATUS
      // ==========================================
      const newStatus =
        status === "active" ? 1 : 0;

      console.log(
        "SELECTED STATUS:",
        newStatus
      );

      const statusResponse = await fetch(
        `https://www.foodchow.com/api/FoodChowRMS/UpdateDealStatusWD?dealId=${dealId}&status=${newStatus}`,
        {
          method: "GET",
        }
      );

      console.log(
        "STATUS UPDATE API STATUS:",
        statusResponse.status
      );

      if (!statusResponse.ok) {
        throw new Error(
          `Status API failed with status ${statusResponse.status}`
        );
      }

      const statusResult =
        await statusResponse.json();

      console.log(
        "STATUS UPDATE API RESPONSE:",
        statusResult
      );

      if (
        statusResult.response_code !== "1"
      ) {
        throw new Error(
          statusResult.message ||
          "Failed to update deal status"
        );
      }

      // ==========================================
      // UPDATE LOCAL DEAL LIST
      // ==========================================
      setDeals((currentDeals) =>
        currentDeals.map((deal) =>
          deal.id === String(dealId)
            ? {
              ...deal,

              name: dealName,

              description: description,

              price:
                Number(dealPrice) || 0,

              mrp:
                Number(dealMrp) || 0,

              minimumOrder:
                Number(minQty) || 1,

              active:
                status === "active",
            }
            : deal
        )
      );

      // ==========================================
      // CLOSE FORM
      // ==========================================
      setDealMode("add");

      setSelectedDealId(null);

      setCurrentStep(1);

      setIsModalOpen(false);

      showToast(
        "Deal updated successfully"
      );

    } catch (error) {

      console.error(
        "UPDATE DEAL ERROR:",
        error
      );

      showToast(
        "Something went wrong while updating the deal."
      );
    }
  };

  const handleAddDeal = async () => {
    // ==========================================
    // UPDATE MODE
    // ==========================================
    if (dealMode === "update") {

      if (!selectedDealId) {
        showToast("Deal ID not found");
        return;
      }

      await handleUpdateDeal(selectedDealId);
      return;
    }
    try {
      const shopId = sessionStorage.getItem("shop_id");

      if (!shopId) {
        showToast("Shop ID not found in session");
        return;
      }

      const selectedGroupList = buildSelectedGroupList(shopId);

      const payload = {
        DealName: dealName.trim(),

        DealDesc: description.trim(),

        DealMinOrder: Number(minQty),

        DealImage: "",

        DealTypeId: "1",

        ShopId: shopId,

        DealPrice: dealPrice,

        DealMRP: dealMrp,

        TotalDealPrice:
          taxMode === "excluded"
            ? Number(netPrice)
            : Number(dealPrice),

        DealStatus: status === "active" ? "1" : "0",

        ContainFoodItem: 1,

        PercentDiscountOnCart: 0,

        OrderMethod: orderType,

        PaymentMethod: paymentMethod,

        selectedGroupList,

        selectedTaxList: [],

        fooddealslanlist: [
          {
            locale_name: null,
          },
        ],

        isItemGroupUpdated: 0,

        applyDiscount: allowDiscount === "yes" ? "1" : "0",
      };

      console.log("ADD DEAL PAYLOAD:", payload);
      const response = await menuService.addDeal(payload);

      console.log("ADD DEAL RESPONSE:", response);

      // Refresh deals list immediately
      await fetchDeals();

      showToast("Deal added successfully");

      handleCloseModal();

    } catch (error: any) {
      console.error("ADD DEAL ERROR:", error);

      showToast(
        error?.response?.data?.message ||
        "Failed to add deal"
      );
    }
  };
  const handleDragStart = (
    e: React.DragEvent<HTMLTableRowElement>,
    dealId: string
  ) => {
    setDraggedDealId(dealId);

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", dealId);
  };
  const handleDragOver = (
    e: React.DragEvent<HTMLTableRowElement>
  ) => {
    e.preventDefault();

    e.dataTransfer.dropEffect = "move";
  };
  const handleDrop = async (
    e: React.DragEvent<HTMLTableRowElement>,
    targetDealId: string
  ) => {
    e.preventDefault();

    const sourceDealId =
      e.dataTransfer.getData("text/plain");

    if (!sourceDealId || sourceDealId === targetDealId) {
      setDraggedDealId(null);
      return;
    }

    const oldDeals = [...deals];

    const sourceIndex = deals.findIndex(
      (deal) => deal.id === sourceDealId
    );

    const targetIndex = deals.findIndex(
      (deal) => deal.id === targetDealId
    );

    if (sourceIndex === -1 || targetIndex === -1) {
      setDraggedDealId(null);
      return;
    }

    // Create new order
    const reorderedDeals = [...deals];

    const [movedDeal] = reorderedDeals.splice(
      sourceIndex,
      1
    );

    reorderedDeals.splice(
      targetIndex,
      0,
      movedDeal
    );

    // Update UI immediately
    setDeals(reorderedDeals);

    setDraggedDealId(null);
    setIsReordering(true);

    try {
      const positionPayload = reorderedDeals.map(
        (deal, index) => ({
          dealId: deal.id,
          position: index + 1,
        })
      );

      console.log(
        "CHANGE DEAL POSITION PAYLOAD:",
        positionPayload
      );

      const response =
        await menuService.changeDealPosition(
          positionPayload
        );

      console.log(
        "CHANGE DEAL POSITION RESPONSE:",
        response
      );

      showToast("Deal position updated successfully");

    } catch (error) {
      console.error(
        "CHANGE DEAL POSITION ERROR:",
        error
      );

      // Restore old order if API fails
      setDeals(oldDeals);

      showToast(
        "Failed to update deal position"
      );
    } finally {
      setIsReordering(false);
    }
  };
  const handleDragEnd = () => {
    setDraggedDealId(null);
  };

  const fetchDeals = async () => {
    try {
      const response = await menuService.getAllDeals(3161);

      console.log("GET ALL DEALS RESPONSE:", response);

      const apiDeals = JSON.parse(response.data);

      const formattedDeals: Deal[] = apiDeals.map((deal: any) => ({
        id: deal.deal_id,
        name: deal.deal_name,
        description: deal.deal_desc || "",
        price: Number(deal.deal_price) || 0,
        mrp: Number(deal.deal_mrp) || 0,
        minimumOrder: Number(deal.deal_min_order) || 1,
        photo:
          deal.deal_image ||
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=120&h=80&q=80",
        active: deal.status === "1",
      }));

      console.log("FORMATTED DEALS:", formattedDeals);

      setDeals(formattedDeals);

    } catch (error) {
      console.error("GET ALL DEALS ERROR:", error);
    }
  };

  useEffect(() => {

    fetchDeals();
  }, []);
  return (
    <div id="pg-menu-item-deals">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <div className="app-container">
        <div className="main-content">
          <div className="content-area">
            {/* Deals Table Card */}
            <div className="deals-card" id="dealsCard">
              <div className="deals-header">
                <h2 className="deals-title typ-page-heading" style={{ margin: 0 }}>Deals</h2>
                <div className="deals-actions">
                  <button
                    className="btn-action btn-brand"
                    onClick={handleOpenAddModal}
                  >
                    <svg viewBox="0 0 24 24">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    ADD NEW DEAL
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="deals-toolbar">
                <div className="toolbar-left">
                  <div className="search-container">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search deals by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="filter-pills">
                    <button
                      className={`filter-pill ${activeFilter === "all" ? "active" : ""}`}
                      onClick={() => setActiveFilter("all")}
                    >
                      All
                    </button>
                    <button
                      className={`filter-pill ${activeFilter === "active" ? "active" : ""}`}
                      onClick={() => setActiveFilter("active")}
                    >
                      Active
                    </button>
                    <button
                      className={`filter-pill ${activeFilter === "deactive" ? "active" : ""}`}
                      onClick={() => setActiveFilter("deactive")}
                    >
                      Deactivated
                    </button>
                  </div>
                </div>

                <div className="toolbar-right">
                  <span className="results-badge">
                    {filteredDeals.length} Deal{filteredDeals.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Table */}
              {filteredDeals.length > 0 ? (
                <div className="table-wrap">
                  <table className="deals-table">
                    <thead>
                      <tr>
                        <th style={{ width: "80px", textAlign: "center" }}>Sr. No.</th>
                        <th>Deals Name</th>
                        <th style={{ width: "140px", textAlign: "center" }}>Photo</th>
                        <th>Deal Price</th>
                        <th style={{ width: "180px", textAlign: "center" }}>Active/De-Active</th>
                        <th style={{ width: "150px", textAlign: "center" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeals.map((deal, idx) => (
                        <tr
                          key={deal.id}
                          draggable={
                            !isReordering &&
                            activeFilter === "all" &&
                            !searchQuery.trim()
                          }
                          title={
                            activeFilter !== "all" || searchQuery.trim()
                              ? "Clear search/filter to reorder deals"
                              : "Drag to change position"
                          }
                          onDragStart={(e) =>
                            handleDragStart(e, deal.id)
                          }
                          onDragOver={handleDragOver}
                          onDrop={(e) =>
                            handleDrop(e, deal.id)
                          }
                          onDragEnd={handleDragEnd}
                          className={
                            draggedDealId === deal.id
                              ? "dragging-row"
                              : ""
                          }
                        >
                          <td style={{ textAlign: "center", fontWeight: "600", color: "var(--text-muted)" }}>
                            {idx + 1}
                          </td>
                          <td className="deal-name-cell">{deal.name}</td>
                          <td style={{ textAlign: "center" }}>
                            <div className="deal-photo-container">
                              <div className="deal-photo-wrapper">
                                <img
                                  src={deal.photo}
                                  alt={deal.name}
                                  className="deal-photo-img"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=120&h=80&q=80";
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="deal-price-cell">Rs. {deal.price}</td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                              <button
                                className={`btn-apply-switch ${deal.active ? "active" : ""}`}
                                onClick={() => toggleDealActive(deal.id)}
                              >
                                <span className="switch-handle"></span>
                              </button>
                              <span
                                style={{
                                  fontSize: "13.5px",
                                  fontWeight: "700",
                                  minWidth: "80px",
                                  textAlign: "left",
                                  color: deal.active ? "var(--teal)" : "var(--text-secondary)",
                                }}
                              >
                                {deal.active ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div className="action-wrap">

                              {/* EDIT */}
                              <button
                                type="button"
                                className="action-circle-btn action-circle-edit"
                                onClick={() => openEditModal(deal.id)}
                                title="Edit Deal"
                              >
                                <svg viewBox="0 0 24 24">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>

                              {/* DELETE */}
                              <button
                                type="button"
                                className="action-circle-btn action-circle-delete"
                                onClick={() => deleteDeal(deal.id)}
                                title="Delete Deal"
                              >
                                <svg viewBox="0 0 24 24">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <line x1="10" y1="11" x2="10" y2="17" />
                                  <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                              </button>

                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <h3>No deals found</h3>
                  <button className="btn-action btn-brand" onClick={handleOpenAddModal}>
                    ADD NEW DEAL
                  </button>
                </div>
              )}
            </div>
            <WizardFooter />
          </div>
        </div>
      </div>

      {/* --- SIDEBAR-AWARE BLUR BACKDROP WITH STEPPER MODAL --- */}
      {isModalOpen && (
        <div className="sidebar-aware-backdrop">
          <div className="modal-container add-deal-modal">
            {/* Modal Header */}
            <div className="deal-header-section">
              <h2 className="main-heading">
                {dealMode === "update" ? "UPDATE DEAL" : "ADD NEW DEAL"}
              </h2>
              <div className="selected-deal-type">
                <span className="type-label">Selected Deal Type</span>
                <span className="type-value">Meal Deal</span>
              </div>
            </div>

            {/* Stepper Wizard Indicator */}
            <div className="stepper-wrapper">
              <div className={`stepper-item ${currentStep === 1 ? "active" : ""}`}>
                <div className="step-counter">1</div>
              </div>
              <div className="stepper-line"></div>
              <div className={`stepper-item ${currentStep === 2 ? "active" : ""}`}>
                <div className="step-counter">2</div>
              </div>
              <div className="stepper-line"></div>
              <div className={`stepper-item ${currentStep === 3 ? "active" : ""}`}>
                <div className="step-counter">3</div>
              </div>
              <div className="stepper-line"></div>
              <div className={`stepper-item ${currentStep === 4 ? "active" : ""}`}>
                <div className="step-counter">4</div>
              </div>
            </div>

            {/* STEP 1 CONTENT */}
            {currentStep === 1 && (
              <div className="step-card">
                <h3 className="card-title">Set Deal Basic Info</h3>

                <div className="form-group">
                  <label className="field-label">
                    Deal Name <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Special Combo"
                    value={dealName}
                    onChange={(e) => setDealName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="field-label">
                    Description <span className="required-star">*</span>
                  </label>
                  <textarea
                    className="textarea-input"
                    placeholder="Deal Description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="field-label">Status</label>
                  <div className="radio-group">
                    <label className="radio-label restriction-option">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={status === "active"}
                        onChange={() => setStatus("active")}
                      />
                      <h4>Active</h4>
                    </label>
                    <label className="radio-label restriction-option">
                      <input
                        type="radio"
                        name="status"
                        value="inactive"
                        checked={status === "inactive"}
                        onChange={() => setStatus("inactive")}
                      />
                      <h4>Inctive</h4>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 CONTENT */}
            {currentStep === 2 && (
              <div className="step2-scroll">
                <div className="step-card">
                  <h3 className="card-subtitle">Set which items are eligible</h3>

                  <div className="item-groups-container">
                    {itemGroups.map((group) => (
                      <div key={group.id} className="item-group-row">
                        <span className="group-title">{group.name}</span>
                        <span className="group-count-badge">{group.selectedCount} Items Selected</span>
                        <div className="group-actions">
                          <button
                            type="button"
                            className="icon-btn edit-btn"
                            onClick={() => handleOpenItemModal(group.id)}
                          >
                            <i className="fa-solid fa-pencil"></i>
                          </button>
                          <button
                            type="button"
                            className="icon-btn delete-btn"
                            onClick={() => handleRemoveItemGroup(group.id)}
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="button" className="btn-add-group" onClick={handleAddItemGroup}>
                    Add Item Group
                  </button>

                  <div className="offer-summary-section">
                    <h4 className="section-heading">Your deal offer:</h4>
                    <p className="offer-item">Item 1 - ( Side Orders )</p>
                    <p className="offer-hint">
                      <strong>Example:</strong> Buy a Pizza and cold drink would require you to select all Pizza for group 1 and all cold drinks for group 2.
                    </p>
                  </div>

                  <div className="advantage-section">
                    <h4 className="section-heading">Set deal advantage to client:</h4>

                    <div className="form-grid">
                      <div className="form-row">
                        <label className="input-label">Buy this deal only Rs.</label>
                        <input
                          type="number"
                          min="0"
                          className="number-input"
                          value={dealPrice}
                          onChange={handleDealPriceChange}
                        />
                        <div className="tax-button-wrapper">
                          <button
                            type="button"
                            className="btn-select-tax"
                            onClick={() => {
                              handleOpenTaxModal();

                              setSelectedTaxes([...appliedTaxes]);
                              setIsTaxModalOpen(true);
                            }}
                          >
                            SELECT TAX
                          </button>

                          {appliedTaxes.length > 0 && (
                            <div className="calculated-net-price">
                              Calculated Net Price: Rs. {netPrice.toFixed(2)}


                            </div>

                          )}
                        </div>
                      </div>

                      <div className="form-row">
                        <label className="input-label">Deal MRP Rs.</label>
                        <input
                          type="number"
                          min="0"
                          className="number-input"
                          value={dealMrp}
                          onChange={(e) => setDealMrp(e.target.value)}
                        />
                      </div>

                      <div className="form-row">
                        <label className="input-label">Minimum Order Quantity</label>
                        <input
                          type="number"
                          min="1"
                          className="number-input"
                          value={minQty}
                          onChange={(e) => {
                            const value = e.target.value;

                            if (value === "" || Number(value) >= 1) {
                              setMinQty(value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* STEP 3 CONTENT */}
            {currentStep === 3 && (
              <div className="step2-scroll">
                <div className="step-card">

                  <h3 className="card-title">
                    Add restriction on order type & payment
                  </h3>

                  {/* Allowed Order Type */}
                  <div className="restriction-section">

                    <h4 className="restriction-heading">
                      Allowed order type:
                    </h4>

                    <label className="radio-label restriction-option">
                      <input
                        type="radio"
                        name="orderType"
                        value="Dinein"
                        checked={orderType === "Dinein"}
                        onChange={() => setOrderType("Dinein")}
                      />
                      <span>Dinein</span>
                    </label>

                    <label className="radio-label restriction-option">
                      <input
                        type="radio"
                        name="orderType"
                        value="Take Away / Pickup"
                        checked={orderType === "Take Away / Pickup"}
                        onChange={() =>
                          setOrderType("Take Away / Pickup")
                        }
                      />
                      <span>Take Away / Pickup</span>
                    </label>

                    <label className="radio-label restriction-option">
                      <input
                        type="radio"
                        name="orderType"
                        value="Home Delivery"
                        checked={orderType === "Home Delivery"}
                        onChange={() =>
                          setOrderType("Home Delivery")
                        }
                      />
                      <span>Home Delivery</span>
                    </label>

                  </div>


                  {/* Allowed Payment Method */}
                  <div className="restriction-section">

                    <h4 className="restriction-heading">
                      Allowed payment method:
                    </h4>

                    <label className="radio-label restriction-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Cash"
                        checked={paymentMethod === "Cash"}
                        onChange={() => setPaymentMethod("Cash")}
                      />
                      <span>Cash on delivery</span>
                    </label>

                    <label className="radio-label restriction-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Online"
                        checked={paymentMethod === "Online"}
                        onChange={() =>
                          setPaymentMethod("Online")
                        }
                      />
                      <span>Online Payment</span>
                    </label>

                  </div>


                  {/* Allow Other Discounts */}
                  <div className="restriction-section">

                    <h4 className="restriction-heading">
                      Do you want to allow other discounts and offers
                      available on this deal?
                    </h4>

                    <label className="radio-label restriction-option">
                      <input
                        type="radio"
                        name="allowDiscount"
                        value="yes"
                        checked={allowDiscount === "yes"}
                        onChange={() => setAllowDiscount("yes")}
                      />
                      <span>Yes</span>
                    </label>

                    <label className="radio-label restriction-option">
                      <input
                        type="radio"
                        name="allowDiscount"
                        value="no"
                        checked={allowDiscount === "no"}
                        onChange={() => setAllowDiscount("no")}
                      />
                      <span>No</span>
                    </label>

                  </div>

                </div>
              </div>
            )}
            {/* STEP 4 CONTENT */}
            {currentStep === 4 && (
              <div className="step-card final-step-card">

                <h3 className="card-title">
                  Final Step
                </h3>

                <div className="final-step-message">
                  <span className="warning-icon">⚠️</span>

                  <span>
                    {dealMode === "update"
                      ? "A Final Step !! You are about to Update Your Deal."
                      : "A Final Step !! You are about to Add Your New Deal."}
                  </span>
                </div>

                <div className="final-step-buttons">
                  <button
                    type="button"
                    className="btn-next"
                    onClick={handleAddDeal}
                  >
                    {dealMode === "update" ? "UPDATE DEAL" : "ADD DEAL"}
                  </button>

                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={handleCloseModal}
                  >
                    CANCEL
                  </button>

                </div>

              </div>
            )}

            {/* ITEM SELECTOR MODAL */}
            {isItemModalOpen && (
              <div className="modal-backdrop">
                <div className="nested-modal">

                  {/* Header */}
                  <div className="nested-modal-header">
                    <h3>Add item in item group</h3>

                    <button
                      className="close-btn"
                      onClick={() => setIsItemModalOpen(false)}
                    >
                      &times;
                    </button>
                  </div>

                  {/* Body */}
                  <div className="nested-modal-body">

                    {categories.map((category) => (
                      <div className="accordion-item" key={category.id}>

                        {/* Category Header */}
                        <div
                          className="accordion-header"
                          onClick={() =>
                            setExpandedCategory(
                              expandedCategory === category.id
                                ? null
                                : category.id
                            )
                          }
                        >
                          <label
                            className="checkbox-container"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isCategorySelected(category)}
                              disabled={!(category.items || category.item_list) || (category.items || category.item_list).length === 0}
                              onChange={() =>
                                handleCategorySelection(category)
                              }
                            />

                            <span>{category.name || category.cate_name}</span>
                          </label>

                          <i
                            className={`fa-solid fa-caret-${expandedCategory === category.id
                              ? "up"
                              : "down"
                              }`}
                          ></i>
                        </div>

                        {/* Items */}
                        {expandedCategory === category.id && (
                          <div className="accordion-content">

                            {(category.items || category.item_list)?.map((rawItem: any) => {
                              const item = {
                                ...rawItem,
                                id: rawItem.id || rawItem.item_id,
                                name: rawItem.name || rawItem.item_name,
                                sizes: rawItem.sizes || rawItem.item_size_list?.map((s: any) => ({ ...s, id: s.id || s.item_size_id || s.size_id, name: s.name || s.size_name }))
                              };
                              return (
                                <div key={item.id}>

                                  {/* ITEM CHECKBOX */}
                                  <label className="checkbox-container sub-item">
                                    <input
                                      type="checkbox"
                                      checked={isItemSelected(
                                        category.id,
                                        item.id
                                      )}
                                      onChange={() =>
                                        handleItemSelection(
                                          category.id,
                                          item.id
                                        )
                                      }
                                    />

                                    <span>{item.name}</span>
                                  </label>

                                  {/* Sizes */}
                                  {/* Size Dropdown - shown only when item is selected */}
                                  {item.sizes &&
                                    item.sizes.length > 0 &&
                                    isItemSelected(category.id, item.id) && (
                                      <div className="item-size-dropdown">
                                        <select
                                          className="size-select"
                                          value={
                                            getSelectedCategory(category.id)
                                              ?.selectedItems.find(
                                                (selectedItem) =>
                                                  selectedItem.itemId === item.id
                                              )
                                              ?.selectedSizes[0] || item.sizes[0].id
                                          }
                                          onChange={(e) =>
                                            handleSizeSelection(
                                              category.id,
                                              item.id,
                                              e.target.value
                                            )
                                          }
                                        >
                                          {item.sizes?.map((size: ItemSize) => (
                                            <option
                                              key={size.id}
                                              value={size.id}
                                            >
                                              {size.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    )}
                                </div>
                              )
                            })}

                          </div>
                        )}

                      </div>
                    ))}

                  </div>

                  {/* Footer */}
                  <div className="nested-modal-footer">

                    <button
                      className="btn-modal-cancel"
                      onClick={() => setIsItemModalOpen(false)}
                    >
                      CANCEL
                    </button>

                    <button
                      className="btn-modal-save"
                      onClick={handleSaveItemGroup}
                    >
                      SAVE
                    </button>

                  </div>

                </div>
              </div>
            )}
            {/* TAX SELECTOR MODAL */}
            {isTaxModalOpen && (
              <div className="modal-backdrop">

                <div className="nested-modal tax-modal">

                  {/* HEADER */}
                  <div className="nested-modal-header">

                    <h3>SELECT TAX</h3>

                    <button
                      className="close-btn"
                      onClick={() => setIsTaxModalOpen(false)}
                    >
                      &times;
                    </button>

                  </div>


                  {/* BODY */}
                  <div className="nested-modal-body">

                    {/* INCLUDED / EXCLUDED */}
                    <div className="tax-mode-row">

                      <strong>Select Custom Tax</strong>

                      <label className="radio-label">

                        <input
                          type="radio"
                          name="taxMode"
                          checked={taxMode === "included"}
                          onChange={() =>
                            handleTaxModeChange("included")
                          }
                        />

                        <span>Included</span>

                      </label>


                      <label className="radio-label">

                        <input
                          type="radio"
                          name="taxMode"
                          checked={taxMode === "excluded"}
                          onChange={() =>
                            handleTaxModeChange("excluded")
                          }
                        />

                        <span>Excluded</span>

                      </label>

                    </div>


                    {/* TAX LIST */}
                    <div className="tax-options-list">

                      {getAvailableTaxes().map((tax) => (

                        <label
                          className="checkbox-container"
                          key={tax.id}
                        >

                          <input
                            type="checkbox"
                            checked={selectedTaxes.includes(tax.id)}
                            onChange={() =>
                              handleTaxSelection(tax.id)
                            }
                          />

                          <span>
                            {tax.name} ({tax.rate}%{" "}
                            {taxMode === "included"
                              ? "Included"
                              : "Excluded"}
                            )
                          </span>

                        </label>

                      ))}

                    </div>


                    {/* TAX CALCULATION */}
                    {selectedTaxes.length > 0 && (
                      <div className="tax-summary-box">

                        {(() => {

                          const taxDetails = getTaxDetails();

                          return (
                            <>

                              {/* NET PRICE */}
                              <div className="summary-row">

                                <span>
                                  Net Price (Rs.)
                                </span>

                                <span>
                                  :
                                </span>

                                <span>
                                  {taxDetails.netPrice.toFixed(2)}
                                </span>

                              </div>


                              {/* INDIVIDUAL TAXES */}
                              {taxDetails.taxes.map((tax) => (

                                <div
                                  className="summary-row"
                                  key={tax.id}
                                >

                                  <span>
                                    {tax.name} ({tax.rate}%)
                                  </span>

                                  <span>
                                    :
                                  </span>

                                  <span>
                                    {tax.amount.toFixed(2)}
                                  </span>

                                </div>

                              ))}


                              {/* FINAL PRICE */}
                              <div className="summary-row total">

                                <span>
                                  Final Price (Rs.)
                                </span>

                                <span>
                                  :
                                </span>

                                <span>
                                  {taxDetails.finalPrice.toFixed(2)}
                                </span>

                              </div>

                            </>
                          );

                        })()}

                      </div>
                    )}

                  </div>


                  {/* FOOTER */}
                  <div className="nested-modal-footer">

                    <button
                      className="btn-modal-save"
                      onClick={calculateTax}
                    >
                      APPLY
                    </button>

                  </div>

                </div>

              </div>
            )}

            {/* Bottom Footer Actions */}
            <div className="step-footer-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCloseModal}
              >
                Cancel
              </button>

              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                >
                  Previous
                </button>
              )}

              {currentStep === 1 && (
                <button
                  type="button"
                  className="btn-next"
                  onClick={handleNextStep1}
                >
                  Next
                </button>
              )}

              {currentStep === 2 && (
                <button
                  type="button"
                  className="btn-next"
                  onClick={handleNextStep2}
                >
                  Next
                </button>
              )}

              {currentStep === 3 && (
                <button
                  type="button"
                  className="btn-next"
                  onClick={handleNextStep3}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className="toast-box" id="toast">
        <svg viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span id="toastText">Changes saved successfully</span>
      </div>
    </div>
  );

  ///  update 
}