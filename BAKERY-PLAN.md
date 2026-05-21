# The Bakery Platform: End-to-End Build Plan

## Phase 1: Environment & Architecture Setup
**Goal:** Establish the monorepo and shared configurations.
*   [ ] **Initialize Turborepo:** Create the monorepo structure with `/apps/web`, `/apps/mobile`, and shared `/packages/ui`. 
*   [ ] **Install Design Dependencies:** Inside `/apps/web`, install Tailwind CSS, Framer Motion, and initialize shadcn/ui.
*   [ ] **Version Control:** Initialize Git, perform the initial commit, and set up your repository.

## Phase 2: Backend & Database (Supabase)
**Goal:** Create a secure, centralized data layer for both platforms.
*   [ ] **Project Creation:** Create a new Supabase project and retrieve your API keys.
*   [ ] **Database Schema:** Execute SQL commands to create tables for `Users`, `Products` (bread catalog), `Cart`, and `Orders`. Enable Row Level Security (RLS).
*   [ ] **Authentication Setup:** Configure OTP login flows and verify JWT expiry settings in the dashboard to ensure strict session management.
*   [ ] **Shared Client:** Create a shared Supabase client in the monorepo that both web and mobile apps can import.

## Phase 3: The "UI/UX Pro Max" Web Frontend
**Goal:** Build the interactive, scroll-driven website.
*   [ ] **Component Sourcing:** Browse 21st.dev and select a Hero Section, a Bento Grid, and a modern navigation bar.
*   [ ] **Landing Page Development:** Implement scroll-triggered animations using Framer Motion so high-resolution bread images scale and fade smoothly.
*   [ ] **Product & Cart State:** Connect the Bento Grid to the Supabase `Products` table. Implement a global cart state (Zustand/Context) that syncs with the Supabase `Cart` table.
*   [ ] **Web Checkout UI:** Build the checkout page and prepare the UI container for the Razorpay web element and dynamic UPI QR code.

## Phase 4: Cross-Platform Mobile App (Expo)
**Goal:** Translate the web experience into a native app.
*   [ ] **Navigation Setup:** Implement React Navigation within the Expo project.
*   [ ] **UI Adaptation:** Recreate the bread catalog and cart screens, focusing on smooth, native screen transitions and touch feedback rather than heavy hover animations.
*   [ ] **Data Sync:** Connect the mobile app to the shared Supabase client and verify real-time cart synchronization with the web app.
*   [ ] **Mobile Checkout UI:** Build the native checkout screen, prioritizing "Pay with GPay/UPI" buttons.

## Phase 5: Payment Integration (Razorpay/Cashfree)
**Goal:** Securely process UPI, GPay, and Credit Cards.
*   [ ] **Backend Order API:** Create a secure Next.js API route that accepts cart details, calculates the total, and calls the payment gateway to generate an `order_id`.
*   [ ] **Web Integration:** Integrate the Web Checkout script to display the QR code for desktop users and handle card inputs.
*   [ ] **Mobile Integration:** Configure the React Native SDK in Expo to utilize UPI Intent, seamlessly opening GPay/PhonePe on the user's phone.
*   [ ] **Webhook Listener:** Create an API endpoint (`/api/webhooks/payment`) to securely listen for success confirmations and update the `Orders` table to "Paid".

## Phase 6: AI Orchestration Integration
**Goal:** Automate bakery administration and customer service.
*   [ ] **The Handoff Endpoint:** Inside your payment success webhook, compile the finalized order data (items, customer details, delivery/pickup time).
*   [ ] **Agent Routing:** POST this order data directly to your multi-agent backend architecture. 
*   [ ] **Verification:** Ensure the data successfully reaches your two head agents to delegate administrative and customer service tasks to your six sub-agents.

## Phase 7: Testing & Launch
**Goal:** Polish and deploy.
*   [ ] **Payment Sandbox Testing:** Run end-to-end test transactions using test cards and UPI IDs on both web and mobile.
*   [ ] **Performance Audit:** Check the web app's scroll performance and Framer Motion animations on lower-end devices. 
*   [ ] **Deployment:** Deploy the Next.js web application to Vercel and build the mobile production bundles via Expo Application Services (EAS).