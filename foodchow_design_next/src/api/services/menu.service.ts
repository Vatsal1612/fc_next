import { adminFoodchowClient, foodchowClient, foodchowRMSClient, foodchowWDClient } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/api/types";
import axios from "axios";

/** A menu category as returned by the FoodChow MenuMaster API. */
export interface MenuCategory {
  id: number;
  shop_id: number;
  cate_name: string;
  cate_image: string;
  cate_position: number;
  description: string;
  status: number;
  created_date: string | null;
  updated_date: string | null;
  item_count: number;
  parent_id: number;
  children: MenuCategory[];
  item_list?: any[];
}

export interface MenuLanguage {
  id: number;
  shop_id: number;
  Primary_language: string;
  Secondary_language: string | null;
  Display_menu: number;
  MenuDirection: number;
  secondary_language_name: string | null;
  type_of_menu: number;
  language_code: string;
  primary_language_name: string;
}

export interface SupportedLanguage {
  id: number;
  lang_name: string;
  lang_code: string;
  lang_code_short: string;
}

/** Extras types */
export interface ExtraSize {
  item_ingredient_size_id: number;
  size_id: number;
  size_name: string | null;
  price: number;
  status: number;
  sold_out_flag: number;
}

export interface ExtraOption {
  ingredient_id: number;
  ingredient_name: string;
  is_size: number;
  is_veg: number;
  status: number;
  price: number;
  extraCategoryOptionSizeList: ExtraSize[];
  sold_out_flag: number;
}

export interface ExtraCategory {
  custom_cat_id: number;
  custom_cat_name: string;
  status: number;
  extraCategoryOptionList: ExtraOption[];
}

export interface ExtrasApiResponse {
  success: boolean;
  data: Array<{
    shop_id: number;
    extraCategoryList: ExtraCategory[];
  }>;
  message: string;
  responseCode: number;
  result: null;
}

export interface AddExtraCategoryRequest {
  shop_id: string;
  custom_cat_name: string;
}

export interface UpdateExtraCategoryRequest {
  custom_cat_id: string;
  shop_id: string;
  custom_cat_name: string;
}

export interface DeleteExtraCategoryResponse {
  success: boolean;
  message: string;
  responseCode: number;
}

export interface AddExtraItemRequest {
  ingredient_id: string;
  shop_id: string;
  ingredient_name: string;
  ingredient_category_id: string;
  is_size_available: string;
  is_veg: string;
  status: string;
  price: string;
  ItemSizeList: any[];
}
export interface UpdateExtraItemRequest {
  ingredient_id: number;
  ingredient_name: string;
  is_size: number;
  is_veg: number;
  status: number;
  price: number;
  extraCategoryOptionSizeList: any[];
}


export interface ItemCodeItem {
  item_id: number;
  item_name: string;
  item_code: string | null;
}

export interface ItemCodeTypeSetting {
  item_code_type: number; // 0 = Numeric, 1 = AlphaNumeric
}

//Tax
export interface Tax {
  food_shop_tax_id: number;
  food_country_tax_id: string;
  shop_id: number;
  tax_name: string;
  tax_percentage: number;
  is_active: boolean;
  tax_type: number;
}
export interface SaveTaxPayload {
  shop_Id: number;
  tax_Name: string;
  tax_type: number;
  tax_Percentage: number;
  food_Shop_Tax_Id: number;
  food_Country_Tax_Id: string;
  food_tax_name_lang: string;
  is_Active: boolean;
}
export interface AddMenuLanguagePayload {
  id: number;
  shop_id: number;
  primary_language: string;
  secondary_language: string;
  display_menu: number;
  menu_direction: number;
  secondary_language_name: string;
  type_of_menu: number;
  language_code: string;
  primary_language_name: string;
}
//apply tax
// export interface ItemWithSize {
//   item_id: number;
//   shop_id: number;
//   item_name: string;
//   shop_size_id: number | null;
//   size_name: string | null;
//   price: number;
// }

export interface ItemWithSize {
  item_id: number;
  item_name: string;
  item_size_id: number;
  size_name: string;
  item_price: number;
  final_amount: number;
  net_price: number;
  is_tax: boolean;
  is_diffrent_tax: boolean;
  tax_type: number;
  tax_list: any;
}

//choice
export interface ChoiceOption {
  preference_option_id: number;
  option_name: string;
  is_active: number;
  sold_out_flag: number;
  isNew?: boolean;
}

export interface MenuChoice {
  preference_id: number;
  preference_name: string;
  is_mandatory: number;
  is_active: number;
  sold_out_flag: number;
  choice_options_list: ChoiceOption[];
}

export interface ChoiceResponse {
  shop_id: number;
  choices_list: MenuChoice[];
}
export interface AddChoicePayload {
  shop_id: string;
  preference_name: string;
  is_active: string;
  choice_options: {
    option_name: string;
  }[];
}



/** Variant */
export interface MenuVariant {
  id: number;
  shop_id: number;
  size_name: string;
  status: number;
}

export interface AddVariantPayload {
  id: number;
  shop_id: number;
  size_name: string;
  status: number;
}

export interface UpdateVariantPayload {
  Size_Id: number;
  Size_Name: string;
  Update_Date: string;
}


export interface AddItemPayload {
  Cate_Id: string;
  Item_Name: string;
  Description: string;
  Is_Veg: string;
  unit: string;
  price: string;
  non_Veg_Type: string;
  Shop_Id: string;
  is_manage_stock: number;
  sold_out_flag: number;
  barcode: string;
  open_price: number;
}

export interface AddStoreCategoryPayload {
  id: number;         // 0 = insert, >0 = update
  shop_id: number;
  cate_name: string;
  cate_image: string; // image filename or empty string = no image
  description: string;
  parent_id: number;
}

export interface UploadCategoryImagePayload {
  id: number | string;
  shop_id: number | string;
  base64Image: string; // base64 string without data:image/...;base64, prefix
}

export interface EditStoreItemPayload {
  Item_Id: number;
  Cate_Id: number;
  Item_Name: string;
  Description: string;
  Is_Veg: number;
  barcode: string;
  base64Image: string; // base64 without data URI prefix, or empty string
  Item_Image: string;  // existing image filename/path (used when base64Image is empty)
}

export interface MenuItem {
  item_Id: number;
  cate_Id: number;
  item_Name: string;
  price: number;
  status: number;
  shop_Id: number;
}

//Additional Menu Interfaces
export interface ShopMenuType {
  id: number;
  shop_id: number;
  menu_name: string;
  description: string;
  start_time: string;
  end_time: string;
  status: number;
  menu_url: string;
  order_online: number;
  for_online: number;
  for_pos: number;
}

export interface MenuHeaderDetails {
  menuId: number;
  menuName: string;
  status: number;
}

export interface MenuTiming {
  day: string;
  fromTime: string;
  toTime: string;
}

export interface MenuTypeItemCategory {
  categoryId: number;
  categoryName: string;
  items: MenuItem[];
}

export interface MenuItemPayload {
  shop_id: string;
  menu_id: string;
  category_id: string;
  item_id: string;
  size_id: number;
  Price: string;
  TotalPrice: string;
  itemTaxList: string;
}

export interface TimingPayload {
  shop_id: string;
  menu_id: number;
  days_name: string;
  open_time: string;
  close_time: string;
  close_day: number;
  is_24hours: number;
}

export interface AddShopMenuPayload {
  id: string;
  menu_name: string;
  description: string;
  shop_id: string;
  status: string;
  IsItemUpdated: number;
  menuItemList: MenuItemPayload[];
  timingList: TimingPayload[];
}

export interface AdditionalMenuItem {
  ItemId: number;
  ItemName: string;
  Price: number | null;
  IsSizeAvailable: number;
  SizeId: string | null;
  SizeListWidget: any[];
  taxList: any[];
  IsVeg: number;
  IsAlcohol: number;
}

export interface AdditionalMenuCategory {
  CategryId: number;
  CategryName: string;
  ItemListWidget: AdditionalMenuItem[];
}

export interface AdditionalMenuResponse {
  CategoryList: AdditionalMenuCategory[];
  SelectedCategoryList: any;
}

//Item Deals 
export interface DealItem {
  DealItemId: number;
  DealCategoryId: number;
  categoryId: number;
  categoryName: string;
  itemId: number;
  itemName: string;
  sizeId: number;
  isAdd: number;
  isDelete: number;
}

export interface DealCategory {
  DealCategoryId: number;
  CategoryId: number;
  DealId: number;
  ShopId: string;
  GroupNo: number;
  selectedItemList: DealItem[];
  isDeleteCategory: number;
  isUpdateCategory: number;
  isAddCategory: number;
}

export interface DealGroup {
  GroupNo: number;
  selectedCategoryList: DealCategory[];
}

export interface DealTax {
  // Currently empty in your payload,
  // so we don't need fields yet.
}

export interface FoodDealsLanguage {
  locale_name: string | null;
}

export interface AddDealPayload {
  DealName: string;
  DealDesc: string;
  DealMinOrder: number;
  DealImage: string;
  DealTypeId: string;
  ShopId: string;
  DealPrice: string;
  DealMRP: string;
  TotalDealPrice: number;
  DealStatus: string;
  ContainFoodItem: number;
  PercentDiscountOnCart: number;
  OrderMethod: string;
  PaymentMethod: string;
  selectedGroupList: DealGroup[];
  selectedTaxList: DealTax[];
  fooddealslanlist: FoodDealsLanguage[];
  isItemGroupUpdated: number;
  applyDiscount: string;
}

export interface PlanFeature {
  Id: number;
  PlanId: number;
  FeatureId: number;
  Name: string;
  IsIncluded: boolean;
  ValueText: string | null;
  ExtraInfo: string | null;
  DisplayOrder: number;
}

export interface PlanBenefit {
  Id: number;
  BenefitText: string;
  DisplayOrder: number;
}

export interface PlanPricing {
  Id: number;
  Price: number;
  OriginalPrice: number;
  BillingCycle: string;
}

export interface PlanGuarantee {
  Title: string;
  Description: string;
}

export interface AddOn {
  Id: number;
  Name: string;
  Description: string;
  BadgeText: string | null;
  Price: number;
  OriginalPrice: number;
  Features: string[];
}

export interface PlanDetails {
  Id: number;
  ShopId: number;
  CategoryId: number;
  Name: string;
  Code: string;

  IsRecommended: boolean;

  BadgeText: string | null;

  SortOrder: number;

  Title: string;
  Subtitle: string;
  Description: string | null;

  BillingText: string;
  CTAText: string;

  HighlightText: string | null;

  TotalValue: number;
  TotalSavings: number;

  HeaderNote: string | null;
  FooterNote: string | null;

  Features: PlanFeature[];
  Benefits: PlanBenefit[];
  Pricing: PlanPricing[];

  Guarantee: PlanGuarantee | null;
}

export interface PlanDetailsApiResponse {
  Result: PlanDetails;
  Message: string | null;
  MessageType: number;
  Status: boolean;
}

export interface CreateSubscriptionPayload {
  amount: number;
  oneTimeAmount: number;
  addonIds: string;
  planId: number;
  billingCycle: string;
  planName: string;
  currency: string;
  shopId: number;
}

/** Menu service — FoodChow public MenuMaster endpoints. */
export const menuService = {

  async getSupportedLanguages(): Promise<SupportedLanguage[]> {
    const { data } = await foodchowWDClient.get(
      ENDPOINTS.menu.getSupportedLanguageList
    );

    console.log("Supported Languages API:", data);

    if (!data.data) {
      return [];
    }

    try {
      const languages =
        typeof data.data === "string" ? JSON.parse(data.data) : data.data;

      console.log("PARSED LANGUAGES:", languages);
      console.log("LANGUAGE COUNT:", languages.length);

      return languages ?? [];
    } catch (error) {
      console.error("Failed to parse supported languages:", error);
      return [];
    }
  },
  async getAllLanguage(shopId: number): Promise<MenuLanguage[]> {
    const { data } = await foodchowWDClient.get(
      ENDPOINTS.menu.getAllLanguage,
      {
        params: {
          shopId,
        },
      }
    );

    console.log("Shop Languages API:", data);

    if (!data.data) {
      return [];
    }

    try {
      const parsed = typeof data.data === "string" ? JSON.parse(data.data) : data.data;
      return parsed ?? [];
    } catch (error) {
      console.error("Failed to parse shop languages:", error);
      return [];
    }
  },
  async addMenuLanguage(payload: AddMenuLanguagePayload): Promise<any> {
    console.log("Sending POST request to AddMenuLanguage with payload:", payload);

    const { data } = await foodchowWDClient.post(
      `${ENDPOINTS.menu.addMenuLanguage}?Shop_id=${payload.shop_id}`,
      payload
    );

    console.log("AddMenuLanguage POST Response:", data);
    return data;
  },
  /** Shop-wise categories (with subcategories) for the given shop. */
  async categoriesByShop(shopId: number): Promise<MenuCategory[]> {
    const { data } = await foodchowClient.get<ApiResponse<MenuCategory[]>>(
      ENDPOINTS.menu.categoriesByShop,
      { params: { ShopId: shopId } }
    );
    return data.data ?? [];
  },

  /** Shop-wise extras with options and sizes for the given shop. */
  async extrasByShop(shopId: number): Promise<ExtraCategory[]> {
    const { data } = await foodchowClient.get<ExtrasApiResponse>(
      ENDPOINTS.menu.extrasByShop,
      { params: { ShopId: shopId } }
    );
    return data.data[0]?.extraCategoryList ?? [];
  },

  /** Add a new extra category */
  async addExtraCategory(shopId: number, categoryName: string): Promise<any> {
    const payload: AddExtraCategoryRequest = {
      shop_id: shopId.toString(),
      custom_cat_name: categoryName,
    };
    const { data } = await foodchowClient.post(
      ENDPOINTS.menu.addExtraCategory,
      payload
    );
    return data;
  },

  /** Update an existing extra category */
  async updateExtraCategory(categoryId: number, shopId: number, categoryName: string) {
    const payload = {
      custom_cat_id: categoryId.toString(),
      shop_id: shopId.toString(),
      custom_cat_name: categoryName,
    };

    console.log("UPDATE PAYLOAD:", payload);

    const { data } = await foodchowClient.post(
      ENDPOINTS.menu.updateExtraCategory,
      payload
    );

    console.log("UPDATE RESPONSE:", data);

    return data;
  },
  /** Delete an extra category */
  async deleteExtraCategory(categoryId: number) {
    console.log("DELETE ID:", categoryId);

    const { data } = await foodchowClient.get(
      ENDPOINTS.menu.deleteExtraCategory,
      {
        params: {
          cat_Id: categoryId,
        },
      }
    );

    console.log("DELETE RESPONSE:", data);

    return data;
  },

  async addExtraItem(payload: AddExtraItemRequest) {
    console.log("ADD EXTRA PAYLOAD:", payload);

    const { data } = await foodchowClient.post(
      ENDPOINTS.menu.addExtraItem,
      payload
    );

    console.log("ADD EXTRA RESPONSE:", data);

    return data;
  },

  async deleteExtraItem(ingredientId: number) {
    console.log("DELETE EXTRA ID:", ingredientId);

    const { data } = await foodchowClient.get(
      ENDPOINTS.menu.deleteExtraItem,
      {
        params: {
          ing_Id: ingredientId,
        },
      }
    );

    console.log("DELETE EXTRA RESPONSE:", data);

    return data;
  },
  async updateExtraItem(payload: UpdateExtraItemRequest) {
    console.log("UPDATE EXTRA PAYLOAD:", payload);

    const { data } = await foodchowClient.post(
      ENDPOINTS.menu.updateExtraItem,
      payload
    );

    console.log("UPDATE EXTRA RESPONSE:", data);

    return data;
  },
  /** Change extra item status (for individual extra items in the extras list) */
  async changeExtraItemStatus(
    ingredientId: number,
    status: number
  ) {
    console.log("EXTRA ITEM STATUS UPDATE:", {
      ingredientId,
      status,
    });

    const { data } = await foodchowClient.get(
      ENDPOINTS.menu.changeExtraItemStatus,
      {
        params: {
          extra_option_id: ingredientId, // Changed from extra_category_id to extra_option_id
          status,
        },
      }
    );

    console.log("EXTRA ITEM STATUS RESPONSE:", data);

    // The API returns: {success: true, data: "", message: "SUCCESS", responseCode: 1, result: null}
    // Check if the response indicates success
    if (data.success === true || data.responseCode === 1 || data.responseCode === 200) {
      return { success: true, message: data.message || "Status updated", ...data };
    } else {
      return { success: false, message: data.message || "Failed to update status", ...data };
    }
  },
  /** Change category status (for categories in the category list) */
  async changeCategoryStatus(
    categoryId: number,
    status: number
  ) {
    console.log("CATEGORY STATUS UPDATE:", {
      categoryId,
      status,
    });

    const { data } = await foodchowClient.get(
      ENDPOINTS.menu.changeCategoryStatus,
      {
        params: {
          extra_category_id: categoryId, // Keep this as is for categories
          status,
        },
      }
    );

    console.log("CATEGORY STATUS RESPONSE:", data);

    if (data.success === true || data.responseCode === 1 || data.responseCode === 200) {
      return { success: true, message: data.message || "Category status updated", ...data };
    } else {
      return { success: false, message: data.message || "Failed to update category status", ...data };
    }
  },
  /** Get all item names and item codes */
  /** Get Item Names */
  async getItemNames(shopId: number): Promise<ItemCodeItem[]> {
    const { data } = await foodchowWDClient.get(
      ENDPOINTS.menu.getItemNames,
      {
        params: {
          shop_id: shopId,
        },
      }
    );

    console.log("ITEM API:", data);

    return data.data ? JSON.parse(data.data) : [];
  },
  /** Get Item Code Type Setting */
  async getItemCodeTypeSetting(
    shopId: number
  ): Promise<ItemCodeTypeSetting> {
    const { data } = await foodchowWDClient.get(
      ENDPOINTS.menu.getItemCodeTypeSetting,
      {
        params: {
          shop_id: shopId,
        },
      }
    );

    console.log("SETTING API:", data);

    const setting = data.data ? JSON.parse(data.data) : [];

    return setting[0];
  },
  /** Update Item Code */
  async updateItemCode(
    shopId: number,
    itemId: number,
    itemCode: string
  ) {
    const { data } = await foodchowWDClient.get(
      ENDPOINTS.menu.updateItemCode,
      {
        params: {
          shop_id: shopId,
          item_id: itemId,
          quantity: itemCode, // API expects "quantity"
        },
      }
    );

    console.log("UPDATE ITEM CODE:", data);

    return data;
  },

  async getTaxes(shopId: number): Promise<Tax[]> {
    const { data } = await foodchowClient.get<ApiResponse<Tax[]>>(
      ENDPOINTS.menu.getAllTax,
      {
        params: {
          shop_id: shopId,
        },
      }
    );

    return data.data ?? [];
  },
  // async checkTaxApply(taxId: number): Promise<boolean> {
  //   try {
  //     const { data } = await adminFoodchowClient.get(
  //       ENDPOINTS.menu.checkTaxApply,
  //       {
  //         params: {
  //           tax_id: taxId,
  //         },
  //       }
  //     );

  //     console.log("Check Tax API Response:", data);

  //     // API returns:
  //     // {
  //     //   message: "Applied" / "Not Applied",
  //     //   data: "True" / "False"
  //     // }

  //     return String(data.data).toLowerCase() === "true";
  //   } catch (error) {
  //     console.error("Check Tax API Error:", error);
  //     throw error;
  //   }
  // },
  async deleteStoreTax(taxId: number): Promise<any> {
    const { data } = await foodchowClient.get(
      ENDPOINTS.menu.deleteStoreTax,
      {
        params: {
          tax_id: taxId,
        },
      }
    );
    return data;
  },
  async saveStoreTax(payload: SaveTaxPayload) {
    const { data } = await foodchowClient.post(
      ENDPOINTS.menu.saveStoreTax,
      payload
    );

    return data;
  },
  /** Get Including/Excluding Tax using /FoodChowWD/GetIncludingExcludingTax?shpid={shopId} */
  async getIncludingExcludingTax(shopId: number) {
    const { data } = await foodchowWDClient.get(
      ENDPOINTS.menu.getIncludingExcludingTax,
      {
        params: {
          shpid: shopId,
        },
      }
    );

    console.log("GetIncludingExcludingTax Response:", data);

    return data;
  },

  async getTaxType(shopId: number) {
    return this.getIncludingExcludingTax(shopId);
  },

  //apply tax
  /** Get Item List With Size from FoodChowWD API */
  async getItemListWithSize(shopId: number, taxId?: number, taxType?: number): Promise<ItemWithSize[]> {
    const params: any = {
      shop_id: shopId,
    };
    if (taxId !== undefined && taxId !== 0) {
      params.tax_id = taxId;
    }
    if (taxType !== undefined) {
      params.current_tax_type = taxType;
    }

    const { data } = await foodchowWDClient.get(
      ENDPOINTS.menu.getItemListWithSize,
      {
        params,
      }
    );

    console.log("GetItemListWithSize Response:", data);

    let items: any[] = [];
    if (data?.data) {
      if (typeof data.data === "string") {
        try {
          items = JSON.parse(data.data);
        } catch (e) {
          console.error("Failed to parse getItemListWithSize data string:", e);
        }
      } else if (Array.isArray(data.data)) {
        items = data.data;
      } else if (typeof data.data === "object") {
        items = data.data.item_list || data.data.ItemList || [];
      }
    } else if (Array.isArray(data)) {
      items = data;
    } else if (data?.item_list) {
      items = data.item_list;
    }

    return items;
  },
  /** Apply tax to all items using existing USP_AddTaxAllItemWithTaxID API endpoint */
  async addTaxAllItemWithTaxID(shopId: number, taxId: number) {
    const { data } = await foodchowRMSClient.get(
      ENDPOINTS.menu.addTaxAllItemWithTaxID,
      {
        params: {
          shop_id: shopId,
          tax_id: taxId,
          _: Date.now(),
        },
      }
    );

    console.log("USP_AddTaxAllItemWithTaxID Response:", data);
    return data;
  },

  /** Apply tax to all items */
  async applyTaxOnAllItems(shopId: number, taxId: number) {
    return this.addTaxAllItemWithTaxID(shopId, taxId);
  },

  /** Delete/Remove tax from all items using USP_DeleteTaxAllItemWithTaxID API endpoint */
  async deleteTaxAllItemWithTaxID(shopId: number, taxId: number) {
    const { data } = await foodchowRMSClient.get(
      ENDPOINTS.menu.deleteTaxAllItemWithTaxID,
      {
        params: {
          shop_id: shopId,
          tax_id: taxId,
          _: Date.now(),
        },
      }
    );

    console.log("USP_DeleteTaxAllItemWithTaxID Response:", data);
    return data;
  },

  /** Remove tax from all items */
  async removeTaxOnAllItems(shopId: number, taxId: number) {
    return this.deleteTaxAllItemWithTaxID(shopId, taxId);
  },


  /** Apply tax to a single item */
  async applyTaxToSingleItem(shopId: number, itemId: number, itemSizeId: number, taxId: number) {
    const { data } = await foodchowClient.get(
      ENDPOINTS.menu.applyTaxToSingleItem,
      {
        params: {
          shop_id: shopId,
          item_id: itemId,
          item_size_id: itemSizeId,
          tax_id: taxId,
        },
      }
    );

    console.log("APPLY SINGLE TAX:", data);

    return data;
  },

  /** Remove tax from a single item */
  async removeTaxFromSingleItem(shopId: number, itemId: number, itemSizeId: number, taxId: number) {
    const { data } = await foodchowClient.get(
      ENDPOINTS.menu.removeTaxFromSingleItem,
      {
        params: {
          shop_id: shopId,
          item_id: itemId,
          size_id: itemSizeId,
          tax_id: taxId,
        },
      }
    );

    console.log("REMOVE SINGLE TAX:", data);

    return data;
  },

  /** Get tax details for a specific item and size using FoodChowWD API */
  async getTaxDetailsWithSize(itemId: number, sizeId: number = 0) {
    const { data } = await foodchowWDClient.get(
      ENDPOINTS.menu.getTaxDetailsWithSize,
      {
        params: {
          item_id: itemId,
          size_id: sizeId,
        },
      }
    );

    console.log("GetTaxDetailsWithSize Response:", data);

    let taxDetails: any[] = [];
    if (data?.data) {
      if (typeof data.data === "string") {
        try {
          taxDetails = JSON.parse(data.data);
        } catch (e) {
          console.error("Failed to parse getTaxDetailsWithSize data string:", e);
        }
      } else if (Array.isArray(data.data)) {
        taxDetails = data.data;
      } else if (typeof data.data === "object") {
        taxDetails = data.data.tax_list || data.data.taxDetails || [data.data];
      }
    } else if (Array.isArray(data)) {
      taxDetails = data;
    }

    return taxDetails;
  },

  async checkTaxApply(taxId: number): Promise<boolean> {
    const { data } = await adminFoodchowClient.get(
      ENDPOINTS.menu.checkTaxApply,
      {
        params: { tax_id: taxId },
      }
    );

    return String(data.data).toLowerCase() === "true";
  },
  // Choices
  async getChoices(shopId: number): Promise<MenuChoice[]> {
    const { data } = await foodchowClient.get<
      ApiResponse<ChoiceResponse[]>
    >(
      ENDPOINTS.menu.getChoices,
      {
        params: { ShopId: shopId },
      }
    );


    return data.data?.[0]?.choices_list ?? [];
  },
  async addChoice(payload: AddChoicePayload) {
    const { data } = await foodchowClient.post(
      ENDPOINTS.menu.addChoice,
      payload
    );

    return data;
  },
  async deleteChoice(id: number) {
    const { data } = await foodchowClient.get(
      ENDPOINTS.menu.deleteChoice,
      {
        params: {
          Id: id,
        },
      }
    );

    return data;
  },
  async deleteChoiceOption(preferenceOptionId: number) {
    const { data } = await foodchowClient.get(
      ENDPOINTS.menu.deleteChoiceOption,
      {
        params: {
          preference_option_id: preferenceOptionId,
        },
      }
    );

    return data;
  },
  async updateChoice(
    choiceId: number,
    choiceName: string,
  ) {
    const { data } = await foodchowClient.get(
      ENDPOINTS.menu.updateChoiceName,
      {
        params: {
          choice_id: choiceId,
          choice_name: choiceName,
        },
      }
    );

    return data;
  },
  async changeChoiceStatus(choiceId: number, status: number) {
    const { data } = await foodchowClient.get(
      ENDPOINTS.menu.changeChoiceStatus,
      {
        params: {
          choice_id: choiceId,
          status: status,
        },
      }
    );

    console.log("Status Response:", data);

    return data;
  },
  async addChoiceOption(
    preferenceId: number,
    optionName: string
  ) {
    const { data } = await foodchowClient.post(
      ENDPOINTS.menu.addChoiceOption,
      {
        preference_id: String(preferenceId),
        option_name: optionName,
      }
    );

    return data;
  },



  /** Variants */
  async variantsByShop(shopId: number): Promise<MenuVariant[]> {
    const { data } = await foodchowClient.get<ApiResponse<MenuVariant[]>>(
      ENDPOINTS.menu.variantsByShop,
      {
        params: {
          ShopId: shopId,
        },
      }
    );

    return data.data ?? [];
  },


  async addVariant(payload: AddVariantPayload) {
    const { data } = await foodchowClient.post(
      ENDPOINTS.menu.addUpdateVariant,
      payload
    );

    return data;
  },

  async updateVariant(payload: UpdateVariantPayload) {
    const { data } = await foodchowClient.post(
      ENDPOINTS.menu.addUpdateVariant,
      payload
    );

    return data;
  },

  async deleteVariant(id: number): Promise<any> {
    const { data } = await foodchowClient.get(
      ENDPOINTS.menu.deleteVariant,
      {
        params: {
          Id: id,
        },
      }
    );
    return data;
  },

  async addItem(payload: AddItemPayload) {
    const { data } = await foodchowClient.post(
      ENDPOINTS.menu.addItem,
      payload
    );

    return data;
  },

  async getItems(shopId: number): Promise<MenuCategory[]> {
    const { data } = await foodchowClient.get<ApiResponse<MenuCategory[]>>(
      ENDPOINTS.menu.getItems,
      {
        params: {
          ShopId: shopId,
        },
      }
    );

    return data.data ?? [];
  },


  async deleteItem(itemId: number, shopId: number): Promise<any> {
    const { data } = await foodchowClient.get(
      ENDPOINTS.menu.deleteItem,
      {
        params: {
          ItemId: itemId,
          shop_id: shopId,
        },
      }
    );

    return data;
  },

  /** Add a new store category (id=0) or update an existing one (id>0) */
  async addStoreCategory(payload: AddStoreCategoryPayload): Promise<any> {
    const { data } = await foodchowClient.post(
      ENDPOINTS.menu.addStoreCategory,
      payload
    );
    return data;
  },

  /** Upload a category image using base64 string */
  async uploadCategoryImage(payload: UploadCategoryImagePayload): Promise<any> {
    const { data } = await foodchowClient.post(
      ENDPOINTS.menu.categoryImageUpload,
      {
        id: String(payload.id),
        shop_id: String(payload.shop_id),
        base64Image: payload.base64Image,
      }
    );
    return data;
  },

  /** Delete a store category by id */
  async deleteCategory(cateId: number): Promise<any> {
    const { data } = await foodchowClient.get(
      ENDPOINTS.menu.deleteCategory,
      { params: { CateID: cateId } }
    );
    return data;
  },

  /** Activate (status=1) or deactivate (status=0) a store category */
  async changeStoreCategoryStatus(cateId: number, status: number): Promise<any> {
    const { data } = await foodchowClient.get(
      ENDPOINTS.menu.changeStoreCategoryStatus,
      { params: { cate_id: cateId, status } }
    );
    return data;
  },

  /** Edit an existing store item */
  async editStoreItem(payload: EditStoreItemPayload): Promise<any> {
    const { data } = await foodchowClient.post(
      ENDPOINTS.menu.editStoreItem,
      payload
    );
    return data;
  },

  /** Activate (status=1) or deactivate (status=0) a store item */
  async changeStoreItemStatus(itemId: number, status: number): Promise<any> {
    const { data } = await foodchowClient.get(
      ENDPOINTS.menu.changeStoreItemStatus,
      { params: { ItemId: itemId, status } }
    );
    return data;
  },

  // Additional Menu
  async getAllShopMenuType(shopId: number): Promise<ShopMenuType[]> {
    const response = await foodchowWDClient.get<ApiResponse<any>>(
      ENDPOINTS.menu.getAllShopMenuType,
      {
        params: {
          ShopId: shopId,
        },
      }
    );

    return response.data.data
      ? JSON.parse(response.data.data)
      : [];
  },



  async getItemsForMenuType(
    shopId: number
  ): Promise<AdditionalMenuResponse> {
    const { data } =
      await foodchowWDClient.get<ApiResponse<string>>(
        ENDPOINTS.menu.getItemsForMenuType,
        {
          params: {
            ShopId: shopId,
          },
        }
      );

    return data.data
      ? JSON.parse(data.data)
      : {
        CategoryList: [],
        SelectedCategoryList: null,
      };
  },

  async getItemsForSelectedMenu(
    shopId: number,
    menuId: number
  ): Promise<MenuItemPayload[]> {

    const { data } =
      await foodchowWDClient.get<ApiResponse<MenuItemPayload[]>>(
        ENDPOINTS.menu.getItemsForMenuType,
        {
          params: {
            ShopId: shopId,
            MenuId: menuId,
          },
        }
      );


    console.log("Selected Menu Items API");
    console.log(data);
    return data.data ?? [];
  },

  async getShopMenuHeaderDetails(
    menuId: number
  ): Promise<MenuHeaderDetails> {

    const { data } =
      await foodchowClient.get<ApiResponse<MenuHeaderDetails>>(
        ENDPOINTS.menu.getShopMenuHeaderDetails,
        {
          params: {
            menuId: menuId,
          },
        }
      );

    return data.data;
  },

  async getShopCustomMenuTimings(
    menuId: number
  ): Promise<TimingPayload[]> {

    const { data } =
      await foodchowWDClient.get<ApiResponse<any>>(
        ENDPOINTS.menu.getShopCustomMenuTimings,
        {
          params: {
            menuId,
          },
        }
      );

    console.log("Menu Timings API");
    console.log(data);

    if (!data.data) {
      return [];
    }

    if (Array.isArray(data.data)) {
      return data.data;
    }

    try {
      return JSON.parse(data.data);
    } catch {
      return [];
    }
  },

  async getPlanDetails(
    planId: number,
    currency: string
  ): Promise<PlanDetails> {
    // Use the Next.js API proxy to avoid browser CORS restrictions
    const response = await axios.get<{
      Result: PlanDetails;
      Message: string | null;
      MessageType: number;
      Status: boolean;
    }>(
      "/api/plan-details",
      {
        params: {
          planId,
          currency,
        },
      }
    );

    console.log("PLAN DETAILS RESPONSE:", response.data);

    return response.data.Result;
  },

  async getAddOns(currency: string) {
    // Use the Next.js API proxy to avoid browser CORS restrictions
    const response = await axios.get(
      "/api/add-ons",
      {
        params: {
          currency,
        },
      }
    );

    console.log("ADD ONS RESPONSE:", response.data);

    return response.data;
  },

  async createSubscription(
    payload: CreateSubscriptionPayload
  ) {
    const formData = new FormData();

    formData.append("amount", String(payload.amount));
    formData.append("oneTimeAmount", String(payload.oneTimeAmount));
    formData.append("addonIds", payload.addonIds);
    formData.append("planId", String(payload.planId));
    formData.append("billingCycle", payload.billingCycle);
    formData.append("planName", payload.planName);
    formData.append("currency", payload.currency);
    formData.append("shopId", String(payload.shopId));

    console.log("CREATE SUBSCRIPTION PAYLOAD:", payload);

    const response = await axios.post(
      "/api/create-subscription",
      formData
    );

    console.log(
      "CREATE SUBSCRIPTION RESPONSE:",
      response.data
    );

    return response.data;
  },

  //Item Deals
  async addDeal(payload: AddDealPayload) {
    console.log("ADD DEAL PAYLOAD:", payload);

    const { data } = await foodchowWDClient.post(
      ENDPOINTS.menu.addItemDeal,
      payload
    );

    console.log("ADD DEAL RESPONSE:", data);

    return data;
  },



  async getAllDeals(shopId: number) {
    const response = await foodchowWDClient.get(
      ENDPOINTS.menu.getAllItemDeal,
      {
        params: {
          shopId,
        },
      }
    );

    return response.data;
  },

  async changeDealPosition(deals: { dealId: string; position: number }[]) {
    const dealIds = deals.map((deal) => deal.dealId).join(",");
    const positions = deals.map((deal) => deal.position).join(",");

    const response = await foodchowWDClient.get(
      `/FoodChowWD/ChangeDealPosition?deal_id=${dealIds}&pos_id=${positions}`
    );

    return response.data;
  },
  async addShopMenu(payload: AddShopMenuPayload) {
    const { data } = await foodchowWDClient.post(
      ENDPOINTS.menu.addShopMenuType,
      payload
    );

    return data;
  },

  async deleteShopMenu(menuId: number) {
    const { data } = await foodchowWDClient.get(
      ENDPOINTS.menu.deleteShopMenuType,
      {
        params: {
          MenuId: menuId,
        },
      }
    );

    return data;
  },

  async updateShopMenu(payload: AddShopMenuPayload) {
    const { data } = await foodchowWDClient.post(
      ENDPOINTS.menu.updateShopMenuType,
      payload
    );

    return data;
  },

  async updateMenuStatus(
    menuId: number,
    menuType: "online" | "pos",
    status: number,
    shopId: number
  ) {
    const { data } = await foodchowWDClient.get(
      ENDPOINTS.menu.enableMenuForPosOrOnline,
      {
        params: {
          menu_id: menuId,
          menu_type: menuType,
          status,
          shop_id: shopId,
        },
      }
    );

    return data;
  },

};

