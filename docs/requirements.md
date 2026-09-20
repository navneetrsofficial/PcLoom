# PC Store: Requirements & Project Plan

> **Note**: Update this file at `docs/requirements.md` as decisions change.  
> **Working Project Name**: `pc_buddy` (temporary placeholder)

---

## 1. Overview

* **What it is**: A demo e-commerce store for PC parts. Shoppers browse parts, compare specs side by side, assemble parts into a "Build" that is checked for compatibility, and check out.
* **Why it exists**: It is the e-commerce project on the resume. It must not look like a generic store or a PCPartPicker clone, so the depth goes into the **compatibility engine** and **safe inventory handling**, not into a long feature list.
* **How to describe it on the resume**: *"PC build configurator with a compatibility engine and atomic inventory reservation"*. Do not call it "an e-commerce website".
* **Demo store notice** (put this in the README and show a small banner on the site):
  * There are no real vendors, so the store is a demo.
  * Product data and specs are seeded from an open dataset.
  * Prices and stock levels are fake.
  * Payments run in test mode only.

---

## 2. Goals and Non-Goals

### Goals
* A compatibility engine with real depth (10+ rules, clear explanations, unit tests).
* Checkout that is safe under concurrency (no overselling, no duplicate orders).
* Finished, deployed, and demoable, with tests and documentation.
* Not very complex. Depth in one place, not spread thin.

### Non-goals (cut on purpose)
* Multi-vendor marketplace (seller accounts, seller dashboards, split orders, payouts)
* Chatbot
* Photoreal or 3D preview
* Reviews and ratings
* Wishlists
* Coupons and discount engine
* Dark mode and theming
* "Bottleneck calculators" (mostly junk science)

---

## 3. Key Decisions and Rationale

| Topic | Decision | Why |
| :--- | :--- | :--- |
| **Vendors** | Single store. The owner is the only seller. A seller/brand name may appear as plain display data. | Real vendors are not available and are not needed. Multi-vendor adds a lot of complexity and no depth. |
| **Chatbot** | Cut. | Overdone resume feature and prone to confidently wrong answers. If AI is added later, use a rule-based budget build suggester that relies on the compatibility engine. |
| **"Imagine" button** | 2D build diagram now. 3D goes in the README under future scope. No dead "coming soon" toggle in the UI. | A real 3D preview needs a model for every part and weeks of work. A dead toggle looks unfinished. |
| **Compatibility UX** | Compatibility runs only inside a Build. The cart can hold loose parts and one or more builds. | Shoppers may buy parts for different PCs or already own some parts. Constant "not compatible" warnings would annoy them. |
| **Blocking** | Warn, never block. Offer "Proceed anyway". | The buyer may already own the matching part. |
| **Database** | PostgreSQL from day one. | Row-level locking (`select_for_update`) does not work on SQLite. |
| **Payments** | Razorpay in test mode. | Realistic flow (webhooks, signatures) without real money. |
| **Data** | About 60–100 parts across 8 categories, seeded from an open dataset and cleaned by hand. No live scraping. | Accurate specs are the biggest risk, because wrong data gives wrong compatibility results. |
| **Images** | Use generic category icons, placeholders, or properly licensed images stored with the project. Do not hotlink other sites. | Avoids licensing problems and broken images. |

---

## 4. Users and Roles

* **Guest**: browse, search, compare, create a build, use a cart.
* **Customer (logged in)**: everything a guest can do, plus save builds, check out, and view order history.
* **Admin**: manage products, categories, stock, and orders (Django admin is enough for the MVP).

---

## 5. User Stories (MVP)

1. As a shopper, I can browse parts by category (CPU, Motherboard, RAM, GPU, Storage, PSU, Case, CPU Cooler).
2. As a shopper, I can filter, sort, and search parts, and the filters stay in the URL so I can share the page.
3. As a shopper, I can open a product page and see its full specs.
4. As a shopper, I can select 2–4 parts and compare their specs side by side.
5. As a shopper, I can create a build by choosing one part per category.
6. As a shopper, I can see clear compatibility errors and warnings for my build, with an explanation of each.
7. As a shopper, I can add a part to my cart as a single part or add it to a build.
8. As a shopper, I can keep more than one build in my cart (for example, buying for two PCs).
9. As a shopper, I can proceed to checkout even if a build has warnings or errors ("Proceed anyway").
10. As a shopper, I can pay in test mode and receive an order confirmation.
11. As a shopper, I can view my past orders.
12. As a shopper, I can use the "Imagine" button to see my build as a 2D layout, and tick parts on or off to see them appear.
13. As an admin, I can add and edit products, specs, prices, and stock.

---

## 6. Functional Requirements

### 6.1 Catalog
* Categories: CPU, Motherboard, RAM, GPU, Storage, PSU, Case, CPU Cooler.
* Product listing with filters (brand, price range, category-specific specs), sorting, and pagination.
* Search using PostgreSQL full-text search.
* Filters and sort are kept in the URL.
* Product detail page with structured specs.
* Specs are stored as structured, typed fields per category, not free text. The same data drives compare and the compatibility engine.

### 6.2 Compare
* Select 2–4 products and open a side-by-side table.
* "Show differences only" toggle.
* Best-value highlighting, with higher-is-better or lower-is-better defined per spec.
* Shareable compare URL (for example, `/compare?ids=1,2,3`).
* *Note*: compare is simple by itself. Do not present it as a headline feature, and do not call it "real-time".

### 6.3 Builds and Compatibility Engine (Core of the Project)

#### Build Concept
* A Build holds at most one part per category.
* Compatibility checks run only inside a Build, not across the whole cart.
* The cart can hold loose parts and one or more builds.
* When adding a part to the cart, the shopper chooses "Add as a single part" or "Add to a build".

#### Rules
* Only check parts that are present. A missing part (for example, "No motherboard selected yet") is a hint, not an error.
* Two result levels: **Error** (hard mismatch) and **Warning** (works but risky or unverifiable).
* Every failure gets a clear explanation, for example *"AM5 CPU on an LGA1700 motherboard"*.
* Rules are defined as **data plus small functions**, not one giant if/else block, so each rule can be tested and added on its own.

#### Starting Rule Set
| # | Rule | Severity |
| :--- | :--- | :--- |
| 1 | CPU socket matches motherboard socket | Error |
| 2 | RAM type (DDR4/DDR5) matches what the motherboard supports | Error |
| 3 | Motherboard form factor (ATX/mATX/ITX) fits the case | Error |
| 4 | GPU length fits within the case's GPU clearance | Error |
| 5 | CPU cooler height fits within the case's cooler clearance | Error |
| 6 | CPU cooler supports the CPU socket | Error |
| 7 | PSU wattage covers the estimated total power draw | Error |
| 8 | PSU wattage leaves recommended headroom above the estimated draw | Warning |
| 9 | Storage slots (M.2 and SATA) are available on the motherboard | Error |

#### Additional Rules (to reach 10+)
* Number of RAM sticks does not exceed the motherboard's RAM slots.
* RAM capacity and speed are within the motherboard's supported limits.
* Cooler's rated cooling capacity vs CPU TDP (Warning).
* Motherboard chipset supports the CPU generation (Warning, because a BIOS update may be needed).
* GPU power connectors are available on the PSU.
* A spec that is missing or ambiguous produces a "could not verify" Warning.
* **Power Estimator**: Sum the estimated draw of the selected parts and compare it with PSU wattage (feeds rules 7 and 8).

### 6.4 Cart
* Server-side cart, persisted per user.
* Guest cart is merged into the user's cart on login.
* Holds loose parts and builds ("Build 1", "Build 2", and so on).
* Compatibility results for each build are shown in the cart.
* Never blocks checkout because of compatibility ("Proceed anyway").

### 6.5 Checkout and Orders
* **Atomic whole-build reservation**: all parts of a build are reserved together (all or nothing) at checkout, using database transactions and row locking (`select_for_update`).
* Reservations expire after a set time, and expired stock is released.
* Payments in Razorpay test mode.
* Webhook signature verification.
* Idempotent order creation, so a repeated webhook does not create duplicate orders.
* Order state machine: `pending` → `paid` → `shipped` → `delivered`, plus `cancelled` and `refunded`. Only valid transitions are allowed, enforced by the backend.
* Async jobs: order confirmation emails, invoice PDFs, releasing expired reservations.
* Order history for each user.

### 6.6 "Imagine" (2D Build View)
* Opened from the Build page via an "Imagine" button.
* Shows a 2D SVG layout of the case (slots for GPU, RAM, PSU, storage, cooler, motherboard).
* A checkbox list has one entry per part in the build. Ticking a part makes it appear in its slot, and unticking hides it.
* Slots are coloured green or red based on the compatibility results.
* Uses generic icons per part type, not per-product images.
* This is a build diagram, not a photoreal preview. Do not describe it as a render.
* 3D preview is listed under future scope in the README. There is no 3D toggle in the UI.

### 6.7 Accounts
* Register, login, logout.
* JWT-based authentication (SimpleJWT).

### 6.8 Admin
* Django admin for managing products, specs, prices, stock, and orders.
* Optional later: a small sales dashboard with charts.

---

## 7. Non-Functional Requirements

### Correctness and Testing
* Unit tests for the compatibility rules, using a table of known-good and known-bad builds.
* A checkout concurrency test.
* Load test with Locust. Target metric to quote on the resume once it is actually measured: *"no overselling under 200 concurrent checkouts"*.

### Quality and Delivery
* Auto-generated API docs (`drf-spectacular`).
* Docker Compose for local setup.
* CI (GitHub Actions) that runs the tests.
* Deployed live demo with test credentials in the README.
* README with screenshots, an architecture diagram, setup instructions, and a "Future scope" section.

### Security Basics
* Secrets in `.env` (never committed). Provide `.env.example`.
* Webhook signature verification.
* Input validation on all API endpoints.

### Performance Basics
* Pagination on lists.
* Database indexes on filtered and searched fields.

---

## 8. Tech Stack

* **Languages**: Python, JavaScript, SQL, HTML, CSS
* **Backend**: Django, Django REST Framework, PostgreSQL, Celery, Redis, SimpleJWT, drf-spectacular, Razorpay SDK (test mode), Gunicorn
* **Frontend**: React, Vite, React Router, Axios, Tailwind CSS, SVG (2D build view), Context API (or Zustand)
* **Testing**: pytest, pytest-django, Locust
* **DevOps and Tools**: Git, GitHub, GitHub Actions, Docker, Docker Compose, Postman or Thunder Client
* **Deployment**: Render or Railway (backend + Postgres + Redis), Vercel or Netlify (frontend)
* **Extras (later phase)**: ReportLab or WeasyPrint (invoice PDFs), Django email backend (order emails)

---

## 9. Data Model

| Entity | Key Fields |
| :--- | :--- |
| **User** | email, password, name |
| **Category** | name, slug |
| **SpecDefinition** | category, key, label, unit, type, higher_is_better |
| **Product** | category, name, brand, seller_name (display only), price, stock, image, specs (structured JSON validated against SpecDefinitions), is_active |
| **Build** | user, name, created_at |
| **BuildItem** | build, product, category (denormalised with unique constraint on build + category) |
| **Cart** | user (or session key for guests) |
| **CartItem** | cart, product, build (nullable), quantity |
| **StockReservation**| product, quantity, order or cart reference, expires_at |
| **Order** | user, status, total, created_at |
| **OrderItem** | order, product, price snapshot, quantity, build label (nullable) |
| **Payment** | order, razorpay_order_id, razorpay_payment_id, status, processed webhook event IDs (for idempotency) |

---

## 10. API Endpoints (Draft)

### Auth
* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/refresh`

### Catalog
* `GET /api/categories`
* `GET /api/products?category=&brand=&min_price=&max_price=&q=&ordering=&page=`
* `GET /api/products/{id}`

### Compare
* `GET /api/compare?ids=1,2,3` (returns specs aligned by key, with best-value flags)

### Builds & Compatibility
* `GET /api/builds`, `POST /api/builds`
* `GET /api/builds/{id}`, `PATCH /api/builds/{id}`, `DELETE /api/builds/{id}`
* `POST /api/builds/{id}/items`
* `DELETE /api/builds/{id}/items/{item_id}`
* `POST /api/builds/{id}/check` (returns errors and warnings with explanations)
* `POST /api/compat/check` (stateless check on a list of product IDs)

### Cart
* `GET /api/cart`
* `POST /api/cart/items`
* `PATCH /api/cart/items/{id}`, `DELETE /api/cart/items/{id}`
* `POST /api/cart/add-build`

### Checkout, Payments, Orders
* `POST /api/checkout` (reserves stock, creates the order and the Razorpay order)
* `POST /api/payments/webhook`
* `GET /api/orders`, `GET /api/orders/{id}`

---

## 11. Project Structure

```
pc-store/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── config/          # settings, main urls
│   ├── accounts/        # users, login
│   ├── catalog/         # products, categories, specs
│   ├── builds/          # builds + compatibility engine
│   └── orders/          # cart, checkout, payments
├── frontend/            # React + Vite
│   ├── package.json
│   └── src/             # pages, components, api, hooks
├── docs/                # requirements.md, ERD, API list
├── docker-compose.yml   # add later
├── README.md
└── .gitignore
```

---

## 12. Development Process (Phases)

* **Phase 0: Scope** — Finalize user stories & requirements. *(Complete)*
* **Phase 1: Design** — Data model diagram (ERD), API endpoint spec, compatibility rules catalog.
* **Phase 2: Setup** — Git repo, folder scaffolding, virtualenv, requirements.txt, .env.example, PostgreSQL.
* **Phase 3: Backend** — Accounts → Catalog & Seeding → Compare → Builds & Engine → Cart → Orders & Reservation → Payments & Webhooks → Celery jobs.
* **Phase 4: Frontend** — Products → Detail → Compare → Build Configurator → Imagine 2D View → Cart → Checkout & Orders.
* **Phase 5: Testing** — Compatibility unit tests, concurrency tests, Locust load benchmark.
* **Phase 6: Deploy & Documentation** — Docker Compose, CI, demo deployment, final README.

---

## 13. Resume Positioning & Interview Defense

* **Resume Bullet Points**:
  * *Built a rule-based compatibility engine with 10+ rules (errors vs warnings, plain-language explanations), covered by comprehensive unit tests.*
  * *Prevented overselling under concurrent checkout using PostgreSQL row-level locking (`select_for_update`) and atomic whole-build reservation; verified via Locust load testing under 200 concurrent checkouts.*
  * *Implemented idempotent payment webhooks and an enforceable order state machine.*
  * *Containerized with Docker, automated CI with GitHub Actions, deployed live demo.*

* **Key Interview Defenses to Master**:
  * *How specs are modeled generically via `SpecDefinition` rather than hardcoding columns.*
  * *Exact concurrency mechanics of `select_for_update` when two users race for the last unit.*
  * *How missing/ambiguous specs trigger a "could not verify" Warning rather than false green.*
  * *How webhook idempotency handles duplicate network retries safely.*
