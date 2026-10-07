# FoodChow Admin Dashboard - Security & Integration Report

This document outlines the current security vulnerabilities and API integration issues found during the frontend rewrite of the Admin Dashboard. It is written in simple terms so it can be easily shared with the backend development team or project stakeholders.

---

## 1. The "Cross-Restaurant" Security Bug (IDOR)
**Status:** Critical Security Risk 🚨
**Requires Action From:** Backend Team

### What is happening?
Currently, when a user logs into the dashboard, their unique `shop_id` is saved in their browser's storage. When the frontend asks the backend for data (like menus or orders), it simply says, *"Give me the data for Shop ID 3161."* 

The problem is that a user can easily open their browser tools, change that `shop_id` to another number (like `3162`), and refresh the page. The backend server blindly trusts the request and gives the user full access to another restaurant's data.

### Why is this bad?
Any restaurant owner on the platform could easily view, edit, or delete the menus and orders of **any other restaurant** just by guessing their Shop ID. 

### How to fix it (The Solution)
The backend must stop trusting the frontend to tell it who the user is. 
Instead, the backend should use **Secure Tokens (JWT)**:
1. When a user logs in, the backend creates a secure, mathematically locked "Token" that secretly contains their `shop_id`.
2. The frontend sends this Token with every request.
3. The backend unlocks the Token, checks the `shop_id` inside it, and **only** returns data for that specific shop. If a user asks for a different shop's data, the backend should block it (Return a `403 Forbidden` error).

---

## 2. Login Endpoint using GET instead of POST
**Status:** Architecture Issue ⚠️
**Requires Action From:** Backend Team

### What is happening?
When a user attempts to log in, they send data to the server (like their device ID, login time, etc.). Standard web security practices dictate that this should be done using a `POST` request. However, the current live backend (`api.foodchow.com`) is rejecting `POST` requests for the `/AdminUserPOSLogin` endpoint and only accepting `GET` requests.

### Why is this bad?
`GET` requests are designed for fetching public data, not for logging in or sending sensitive information. When using `GET`, the data is put directly into the web URL. This means login attempts could be accidentally saved in browser histories, server logs, or cached by internet routers, which is a bad security practice.

### How to fix it (The Solution)
The backend team needs to update the `/AdminUserPOSLogin` endpoint on the server to accept `POST` requests so that the frontend can securely send login data in the body of the request, rather than the URL. 

---

## 3. Fake Login Vulnerability (SEC-04)
**Status:** Security Risk 🚨
**Requires Action From:** Frontend & Backend Teams

### What is happening?
Currently, the frontend dashboard only checks if a simple label (`isLoggedIn=true`) exists in the browser's storage to decide if a user is allowed to see the admin pages. 

### Why is this bad?
Anyone can open their browser's developer tools, manually create that `isLoggedIn=true` label, and instantly bypass the login screen to view the dashboard layout without knowing a password.

### How to fix it
This is another reason why **Secure Tokens (JWT)** are required from the backend. Once the backend implements tokens, the frontend will check for a valid, cryptographically signed Token instead of a simple "true/false" label. Even if a hacker forces their way to the dashboard layout, the backend will refuse to send them any actual data because they don't have a valid Token.

---

## 4. Cross-Site Scripting (XSS)
**Status:** Security Risk 🚨
**Requires Action From:** Frontend Team

### What is happening?
When the dashboard displays data (like Menu Category Names or Items), it sometimes directly injects that data into the webpage's HTML code without "cleaning" it first (e.g., using `innerHTML`). 

### Why is this bad?
A malicious user could name a menu category something like `<script>StealPassword()</script>`. When another user (like a Super Admin) views that menu, their browser thinks it's a piece of code and runs it, which could be used to steal accounts or crash the site.

### How to fix it
The frontend team needs to "sanitize" or "escape" all text before displaying it. This means converting special characters (like `<` and `>`) into safe text so the browser just displays them as normal words instead of running them as malicious code.

---

## 5. SQL Injection (SQLi)
**Status:** Security Risk 🚨
**Requires Action From:** Backend Team

### What is happening?
The backend database might be vulnerable to hackers typing database commands directly into search boxes, query parameters, or login fields.

### Why is this bad?
If the backend doesn't filter out database commands, an attacker could type something like `' OR 1=1` into the email field, tricking the database into logging them in as an administrator, or even worse, deleting entire tables in the database.

### How to fix it
The backend team must ensure all database queries use "Parameterized Queries" or an ORM (Object-Relational Mapper) that automatically neutralizes any malicious database commands typed by users before they reach the database.

---

## 6. Hardcoded Shop IDs
**Status:** Fixed ✅
**Action Taken By:** Frontend Team

### What was happening?
During development, the `shop_id` was permanently written (hardcoded) into the frontend code (e.g., `const SHOP_ID = 3161;`). This meant the dashboard would always show the same restaurant, regardless of who actually logged in.

### The Fix
We have successfully removed all hardcoded Shop IDs across the application (Categories, Variants, Items, Extra Menus, Order Settings, etc.). The frontend now dynamically looks up the logged-in user's correct `shop_id` from their active session. 
