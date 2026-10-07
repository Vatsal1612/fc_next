# FoodChow Admin — Project Modules Overview

Based on the application structure (`src/app/(admin)`), the Next.js admin dashboard is logically divided into five primary modules and numerous sub-modules.

## 1. ⚙️ Setup Module
Handles restaurant branding, profile configuration, and operational parameters.
* **Profile & Branding:** `my-profile`, `restaurantlogo`, `restaurantimgae`, `gallery`, `ambience`
* **Operations:** `timmings`, `facility`
* **Delivery & Tables:** `delivery`, `add-table`
* **Advanced:** `add-custom-domain`

## 2. 🍔 Menu Module
Manages the core catalog, pricing, variants, and taxes.
* **Core Entities:** `category`, `items`, `varient`, `extra`, `choice`
* **Pricing & Taxes:** `pricing-plan`, `my-plan`, `tax`, `apply-tax`
* **Operations:** `item-deals`, `item-code`, `additional-menu`
* **Settings:** `menu-language-page`, `upload-menu`

## 3. 🛍️ Orders Module
Configures how orders are received, processed, and fulfilled.
* **Settings & Integration:** `ordersetting`, `widget-setting`, `ordering-widget`, `category-mapper`
* **Payments & Delivery:** `payment-gateway`, `delivery-integration`

## 4. 📈 Reports Module
Extensive analytics and financial tracking.
* **Sales Summaries:** `total-sales`, `pos-total-sales-report`, `sales-by-hour`, `sales-by-trading-session`, `daily-closing-report`, `pos-end-day`
* **Item & Category Analysis:** `salesby-item`, `salesby-category`, `top-selling-items`, `sales-by-item-size-reports`, `ingredients-reports`
* **Comparisons:** `comparisionweek`, `comparisonbymonth`, `comparisionbyyear`, `comparison-by-product`
* **Financial & Operational:** `tax-summary`, `refund-history`, `declined-order`, `incomplete-payment`, `total-stripe-connect`, `weighted-average-transaction`
* **Customers & Users:** `customer-list`, `customerbyrevenue`, `sales-by-pos-user`
* **Channels:** `online-order-report`, `sales-by-order-method-report`

## 5. 📢 Marketing Module
Tools for customer acquisition and retention.
* **Coupons & Offers:** `coupon`, `real-time-offer`
* **WhatsApp Integration:** `whatsapp-marketing`, `whatsapp-notification-setting`
* **Physical Assets:** `marketing-material`, `qr-binding`
