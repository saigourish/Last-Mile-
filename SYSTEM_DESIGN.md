# System Design: Last-Mile Delivery Tracker with Antigravity

**Author:** Antigravity Logistics Engineering  
**Tech Stack:** MongoDB, Express.js, React.js, Node.js (MERN), Socket.IO, Framer Motion  
**Target Scope:** Autonomous Dispatch, Smart Volumetric Pricing, Dynamic Agent Assignment, and Immutable Lifecycle Tracking.

---

## 1. System Overview & Architecture

The **Antigravity Last-Mile Delivery Tracker** is an event-driven, distributed logistics architecture engineered to streamline high-volume, time-sensitive urban deliveries. The system decouples pricing computation, spatial proximity scoring, and real-time state synchronization into modular services backed by MongoDB persistence and bi-directional WebSocket channels.

```
+-------------------------------------------------------------------------------+
|                             REACT 18 FRONTEND                                 |
|  [Antigravity Orbital Radar] [Rate Simulator] [Dispatch Tower] [Live Timeline]|
+---------------------------------------+---------------------------------------+
                                        | (REST APIs & WebSocket Stream)
+---------------------------------------v---------------------------------------+
|                           EXPRESS / NODE.JS BACKEND                           |
|  +--------------------+  +----------------------+  +-----------------------+  |
|  | Smart Rate Engine  |  | Antigravity Dispatch |  | Lifecycle & Audit Log |  |
|  | (Volumetric / Zone)|  | (Gravitational Lift) |  | (Immutable Timeline)  |  |
|  +--------------------+  +----------------------+  +-----------------------+  |
|  +-------------------------------------------------------------------------+  |
|  |                  Multi-Channel Notification Dispatcher                  |  |
|  +-------------------------------------------------------------------------+  |
+---------------------------------------+---------------------------------------+
                                        | (Mongoose ODM)
+---------------------------------------v---------------------------------------+
|                           MONGODB DATA PERSISTENCE                            |
|     [Users]   [Orders]   [Agents]   [Zones]   [RateCards]   [TrackingLogs]    |
+-------------------------------------------------------------------------------+
```

---

## 2. Smart Pricing Engine & Zone Detection

The pricing engine computes upfront, deterministic freight rates using dimensional parcel data, route zones, and administrative rate cards without requiring hardcoded parameters.

### 2.1 Volumetric Weight Resolution
Parcels consume vehicle cubic volume regardless of physical deadweight. The system calculates volumetric displacement using the standard IATA air freight constant ($5000\text{ cm}^3/\text{kg}$):
$$\text{Volumetric Weight (kg)} = \frac{\text{Length} \times \text{Width} \times \text{Height (cm)}}{5000}$$
The **Chargeable Weight** is determined by selecting the dominant physical attribute:
$$\text{Chargeable Weight} = \max(\text{Actual Deadweight}, \text{Volumetric Weight})$$

### 2.2 Zone Detection Matrix
Logistics territories are categorized into four hierarchical tiers:
1. **Zone A (Intra-City Hyperlocal):** Identified when origin and destination postal codes share identical prefix clusters (e.g., `5600XX`).
2. **Zone B (Regional Express):** Identified by matching state-level sub-clusters within a $250\text{ km}$ radius.
3. **Zone C (Metro-to-Metro):** Resolved between designated Tier-1 industrial metropolitan hubs.
4. **Zone D (National Rest of India):** Default pan-India routes.

### 2.3 Pricing Calculation Algorithm
$$\text{Total Amount} = (\text{Freight Subtotal} + \text{Fuel Surcharge} + \text{COD Surcharge}) \times (1 + \text{GST})$$
- $\text{Freight Subtotal} = \text{Base Rate} + (\lceil \text{Chargeable Wt} - \text{Base Wt} \rceil \times \text{Incremental Rate})$
- $\text{COD Surcharge} = \max(\text{COD Min Fee}, \text{Declared Invoice Value} \times \text{COD Rate}\%)$
- $\text{Fuel Surcharge} = \text{Freight Subtotal} \times \text{Fuel Index}\%$

---

## 3. Antigravity-Enhanced Dynamic Auto-Assignment

Traditional assignment relies on simple nearest-neighbor checks, frequently leading to payload bottlenecks. Antigravity simulates an **orbital gravitational well** centered at the order pickup coordinate.

```
          [Agent Sneha] (Score: 94)
                 \
                  \  (Gravitational Pull)
                   v
[Agent Rahul] ---> ( ORDER WAYPOINT ) <--- [Agent Vikram] (Score: 91)
 (Score: 98.4)     ( Gravity Core )
   *LOCKED*
```

### 3.1 Proximity & Bearing Mathematics
Distance $D$ is calculated using the spherical Haversine formula over WGS84 coordinates:
$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right), \quad D = 2R \cdot \text{atan2}(\sqrt{a}, \sqrt{1-a})$$

### 3.2 Antigravity Gravitational Lift Score
Each candidate agent $i$ is assigned a composite lift index ($0 \text{ to } 100$):
$$\text{LiftScore}_i = \left( 0.45 \cdot \frac{100}{1 + 0.15 D_i} + 0.25 \cdot \frac{C_{\text{remaining}}}{C_{\text{max}}} \cdot 100 + 0.20 \cdot \frac{R_i}{5.0} \cdot 100 + B_{\text{vehicle}} - 18 \cdot L_{\text{active}} \right) \cdot S_{\text{status}}$$
- **Capacity Gate:** If $C_{\text{remaining}} < \text{Order Weight}$, the candidate receives a strict $80\%$ penalty.
- **Dynamic Orbital Visualizer:** The lift score maps directly to the UI altitude meter and orbital radius on the radar canvas, visually "elevating" optimal agents toward assignment lock.

---

## 4. Immutable Order Lifecycle & Failed Delivery Handling

To guarantee end-to-end accountability, order state transitions are recorded into an append-only `TrackingLog` collection.

```
[ORDER_CREATED] ---> [AGENT_ASSIGNED] ---> [PICKED_UP] ---> [IN_TRANSIT]
                                                                  |
                                                                  v
[DELIVERED] <------- [OUT_FOR_DELIVERY (OTP)] ---------> [DELIVERY_FAILED]
 (Verified)                                                       |
     ^                                                            v
     +-------------------- [RESCHEDULED] <------------------------+
                      (Dynamic Agent Reset)
```

### 4.1 Immutable Audit Logs
Every mutation stores:
- **Timestamp & Geographic Coordinates:** Exact point of update.
- **Actor Role:** `SYSTEM`, `ADMIN`, `AGENT`, or `CUSTOMER`.
- **Cryptographic OTP Handover:** Delivery completion requires input of an encrypted 6-digit passcode.

### 4.2 Automated Failed Delivery & Rescheduling Pipeline
1. **Exception Logging:** When an agent flags a failed attempt (`CUSTOMER_UNAVAILABLE`, `CASH_NOT_READY`, `INCORRECT_ADDRESS`), the system increments `deliveryAttempts` and emits real-time SMS/Email alerts with a secure reschedule link.
2. **Customer Reschedule Action:** The customer selects a preferred date and time slot (`Morning`, `Afternoon`, `Evening`) via the portal.
3. **Zero-G Fleet Re-lift:** The previous agent is automatically unassigned, and the order is placed into the Antigravity dispatch pool for dynamic re-assignment on the scheduled date.

---

## 5. Summary & Scalability

The Antigravity architecture ensures high throughput, zero downtime via automatic in-memory / distributed persistence, deterministic rate calculation, and a distinctive physics-driven dispatch interface that transforms complex supply chain logistics into an engaging, transparent visual experience.
