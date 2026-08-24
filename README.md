# 🌌 Gourish Last-Mile Delivery Tracker (MERN Stack)

> A cutting-edge Last-Mile Delivery Tracking & Logistics Platform powered by the **MERN Stack** (MongoDB, Express, React, Node.js), featuring a **dynamic agent assignment visualizer**, smart volumetric pricing engine, and immutable real-time audit logs.

---

## 🌟 Key Highlights & Core Features

- **🚀 Gourish Dynamic Auto-Assignment:** Visualizes delivery agent assignment by simulating an orbital radar field around the order pickup point. Nearby delivery agents dynamically lift, orbit, and get scored ($0-100$) based on proximity, remaining payload capacity, driver rating, and current active load factor.
- **⚖️ Smart Pricing Engine:** Admin-configurable dimensional weight calculation ($L \times W \times H / 5000$), chargeable weight resolver ($\max(\text{actual}, \text{volumetric})$), automated zone detection matrix (Zone A, B, C, D), B2B/B2C rate cards, COD surcharges, fuel index, and GST.
- **📜 Immutable Order Lifecycle Audit Trail:** Cryptographically verifiable lifecycle logs (`ORDER_CREATED` $\rightarrow$ `AGENT_ASSIGNED` $\rightarrow$ `PICKED_UP` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED` / `FAILED` $\rightarrow$ `RESCHEDULED`) with timestamps, actors (`ADMIN`, `AGENT`, `CUSTOMER`, `SYSTEM`), GPS coordinates, and delivery OTP verification.
- **🔄 Failed Delivery & Customer Rescheduling Engine:** Instant SMS and Email notifications on delivery exception, dedicated customer reschedule portal for next-day time slot selection, and automatic agent unassignment for dynamic Gourish re-assignment.
- **🛡️ Admin Mission Control Tower:** Comprehensive dashboard for fleet monitoring, SLA compliance, revenue analytics, real-time manual dispatch override, and dynamic rate card / zone editors.
- **👥 Multi-Role Portals & 1-Click Demo Switcher:** Dedicated role-based interfaces for Admins, Delivery Agents, and Customers with a 1-click persona switcher in the navigation bar.
- **⚡ Dual Database Mode:** Works out of the box with zero external setup using built-in in-memory MongoDB, while seamlessly supporting live MongoDB Atlas connections via `MONGODB_URI`.

---

## 🏗️ System Architecture & Tech Stack

```
+-------------------------------------------------------------------------------+
|                            REACT 18 + VITE CLIENT                             |
|    Tailwind CSS • Framer Motion • Lucide Icons • Socket.IO Client • Axios     |
+---------------------------------------+---------------------------------------+
                                        | REST API & WebSockets
+---------------------------------------v---------------------------------------+
|                           EXPRESS & NODE.JS SERVER                            |
|       Pricing Engine • Dynamic Dispatch • Socket Service • Nodemailer         |
+---------------------------------------+---------------------------------------+
                                        | Mongoose ODM
+---------------------------------------v---------------------------------------+
|                           MONGODB DATA PERSISTENCE                            |
|     (Automatic In-Memory Engine Fallback + MongoDB Atlas Cloud Support)       |
+-------------------------------------------------------------------------------+
```

---

## 📂 Project Structure

```
├── client/                          # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/              # Assignment Visualizer, Radar, Timeline, Badges, Modals
│   │   ├── context/                 # AuthContext (1-click personas), SocketContext
│   │   ├── pages/                   # AdminDashboard, CreateOrder, CustomerPortal, AgentBoard, Track
│   │   ├── services/                # Axios REST API Client
│   │   ├── App.jsx                  # Multi-role routing
│   │   ├── index.css                # Custom glassmorphic design theme
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                          # Express / Node.js Backend
│   ├── src/
│   │   ├── config/                  # Dual database manager (Atlas + Memory Server)
│   │   ├── controllers/             # Auth, Order, Agent, Zone, RateCard, Notification, Analytics
│   │   ├── middleware/              # JWT Protect & Role-Based Authorization
│   │   ├── models/                  # User, Order, Agent, Zone, RateCard, TrackingLog, Notification
│   │   ├── routes/                  # Express REST routes
│   │   ├── seed/                    # Seed dataset generator (Admins, Agents, Customers, Zones, Rates)
│   │   ├── services/                # Pricing engine, Dynamic scoring, Socket & Mailer
│   │   └── server.js                # Express & Socket.IO server entry point
│   ├── tests/                       # Automated unit test suite
│   ├── .env.example
│   └── package.json
├── package.json                     # Root orchestrator scripts
├── README.md                        # Project documentation
└── SYSTEM_DESIGN.md                 # System Design Document
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 1. Installation
Clone the repository and install all dependencies:
```bash
# Install root, server, and client dependencies in one command
npm run install:all
```
*(Or install individually: `cd server && npm install`, then `cd ../client && npm install`)*

### 2. Configure Environment (Optional)
The backend includes a pre-configured `.env` file with zero-configuration in-memory database defaults:
```env
PORT=5000
NODE_ENV=development
# Leave MONGODB_URI empty to automatically run the built-in zero-config MongoDB instance!
MONGODB_URI=
JWT_SECRET=gourish_quantum_super_secure_jwt_secret_key_2026
CLIENT_URL=http://localhost:5173
```

### 3. Run Application
Run backend and frontend concurrently:
```bash
npm start
```
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **Health Endpoint:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Automated Unit Testing

Run the automated backend test suite covering volumetric math, zone detection matrices, and Antigravity scoring:
```bash
npm run test:server
```

---

## 👥 Demo Personas & Quick Switcher

The application features a **1-Click Persona Switcher** in the navigation header to instantly evaluate different user roles:

| Persona Role | Demo User Name | Demo Email | Password | Access Capabilities |
|---|---|---|---|---|
| **Admin** | Dr. Sarah Mitchell | `admin@antigravity.logistics` | `password123` | Control Tower, Force Assignment, Zone/Rate Editor, Fleet Analytics |
| **Agent** | Rahul Sharma | `rahul.agent@antigravity.logistics` | `password123` | Mission Board, State Transitions (Pickup, Transit, Out for Delivery, OTP Verify, Report Failure) |
| **Customer** | Priya Sharma | `priya.customer@antigravity.logistics` | `password123` | Booking Wizard, Rate Calculator, Live Radar Tracking, 1-Click Rescheduling |

---

## 📐 Smart Pricing Calculation Engine

### 1. Volumetric Weight Formula
Logistics vehicles have cubic volume limits. Lightweight large packages are billed by volumetric displacement using the standard IATA constant ($5000\text{ cm}^3/\text{kg}$):
$$\text{Volumetric Weight (kg)} = \frac{\text{Length (cm)} \times \text{Width (cm)} \times \text{Height (cm)}}{5000}$$

### 2. Chargeable Weight Resolution
$$\text{Chargeable Weight} = \max(\text{Actual Deadweight}, \text{Volumetric Weight})$$

### 3. Zone Detection Matrix
- **ZONE_A (Local Intra-City):** Pincodes sharing same metropolitan prefix (e.g. `5600XX`). SLA: 8-24 hours.
- **ZONE_B (Regional Express):** Intra-state delivery up to $250\text{ km}$ radius. SLA: 24-48 hours.
- **ZONE_C (Metro-to-Metro):** Tier-1 industrial metropolitan airport routes (Bengaluru, Mumbai, Delhi, etc.). SLA: 48 hours.
- **ZONE_D (National Rest of India):** Pan-India remote destinations. SLA: 72 hours.

### 4. Complete Billable Freight Formula
$$\text{Freight Subtotal} = \text{Base Rate} + \left( \lceil \text{Chargeable Wt} - \text{Base Wt} \rceil \times \text{Incremental Rate per kg} \right)$$
$$\text{COD Fee} = \max\left(\text{Min COD Fee (₹30)}, \text{Declared Value} \times 2\%\right) \quad \text{[If Payment = COD]}$$
$$\text{Fuel Surcharge} = \text{Freight Subtotal} \times 5\%$$
$$\text{Total Billable Amount} = (\text{Freight Subtotal} + \text{COD Fee} + \text{Fuel Surcharge}) \times 1.18 \quad \text{[18% GST]}$$

---

## 🛸 Antigravity Dynamic Lift Scoring Algorithm

When an order is created or rescheduled, the system evaluates all active fleet agents using spherical Haversine GPS distance and operational metrics:

$$\text{Antigravity Lift Score} = \left( 0.45 \cdot \text{ProximityScore} + 0.25 \cdot \text{CapacityScore} + 0.20 \cdot \text{RatingScore} + \text{VehicleBonus} - \text{WorkloadPenalty} \right) \cdot \text{StatusMultiplier}$$

- $\text{ProximityScore} = \frac{100}{1 + 0.15 \cdot \text{Distance (km)}}$
- $\text{CapacityScore} = \left(\frac{\text{Remaining Capacity (kg)}}{\text{Max Capacity (kg)}}\right) \times 100$
- $\text{RatingScore} = \left(\frac{\text{Agent Rating}}{5.0}\right) \times 100$
- **Workload Penalty:** $-18$ points per active delivery mission.
- **Visual Radar Mapping:** Lift score ($0-100$) dynamically sets the vertical levitation altitude and orbital radius on the radar canvas!

---

## 📡 REST API Reference

### 🔐 Authentication
- `POST /api/auth/register` - Create new customer/agent account
- `POST /api/auth/login` - Authenticate with email & password
- `POST /api/auth/quick-persona` - 1-Click switch (`admin`, `agent`, `customer`)
- `GET /api/auth/me` - Get current session user profile

### 📦 Orders & Dispatch
- `POST /api/orders/calculate-rate` - Upfront price calculation preview
- `POST /api/orders` - Book new shipment order
- `GET /api/orders` - Filter orders by status / user role
- `GET /api/orders/track/:trackingNumber` - Public live tracking & audit trail
- `GET /api/orders/:id/antigravity-evaluate` - Get candidate fleet ranking & orbital physics telemetry
- `POST /api/orders/:id/auto-assign` - Trigger dynamic Antigravity auto-assignment
- `POST /api/orders/:id/manual-assign` - Admin manual override
- `PATCH /api/orders/:id/status` - Lifecycle transition (`PICKED_UP`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`)
- `POST /api/orders/:id/reschedule` - Customer reschedule failed delivery
- `GET /api/orders/:id/logs` - Full immutable audit timeline

### 🚚 Fleet & Zones
- `GET /api/agents` - Fleet coordinates, vehicles, and live capacity
- `GET /api/zones` - List configured logistics zones
- `POST /api/zones/lookup` - Test zone resolution for PIN pairs
- `GET /api/rate-cards` - View active B2B and B2C rate cards
- `PUT /api/rate-cards/:id` - Update base rates, incremental kg rates, COD fees
- `GET /api/analytics/overview` - Control Tower KPIs (Revenue, SLA %, Success Rate)

---

## 🌐 Deployment Guidelines

### Frontend (Vercel / Netlify)
1. Set root directory to `client`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Configure environment variable: `VITE_API_URL=https://your-backend-api.onrender.com`.

### Backend (Render / Railway / Heroku)
1. Set root directory to `server`.
2. Build command: `npm install`.
3. Start command: `npm start`.
4. Add environment variables: `PORT=5000`, `NODE_ENV=production`, `MONGODB_URI=<your_mongodb_atlas_uri>`, `JWT_SECRET=<your_secret>`.

---

## 📄 License
This project is licensed under the MIT License - built for the Google DeepMind Antigravity Logistics Engineering Challenge.
