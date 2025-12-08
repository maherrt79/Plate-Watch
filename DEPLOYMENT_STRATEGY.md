# Deployment Strategy: 10-20 Camera Scale

## Executive Summary

For a deployment size of 10-20 Edge Devices (cameras), we recommend a **Phased Approach** starting with a **Local Private Cloud**. This minimizes initial OpEx (Operating Expenses) and ensures data privacy while maintaining a path to scale via Hybrid or Full Cloud architectures if needed.

| Phase | Strategy | Description | Best For |
| :--- | :--- | :--- | :--- |
| **1 (Start)** | **Local Private Cloud** | Self-hosted backend on local hardware. | Cost control, Privacy, Low Latency, Offline Capability. |
| **2 (Upgrade)** | **Hybrid Infrastructure** | Local processing/storage + Cloud control plane. | Remote access, Multi-site management, Critical alerts. |
| **3 (Fallback)** | **Full Cloud** | 100% AWS/GCP infrastructure. | Infinite scale, Zero hardware maintenance, Global access. |

---

## Phase 1: Local Private Cloud (The "Local First" Standard)

**Concept**: The entire stack (Backend API, Database, Web App) runs on a dedicated server physically located on the same network (LAN/VPN) as the Edge Devices.

### Architecture
```mermaid
graph TD
    subgraph "Local Network (Office/Home)"
        Edge[Edge Devices (x20)] -->|HTTP/POST| LoadBalancer[Nginx / Traefik]
        LoadBalancer --> API[FastAPI Container]
        API --> DB[(PostgreSQL + TimescaleDB)]
        API --> Web[Web App Container]
        User[Local User] -->|Browses| Web
    end
    
    subgraph "Remote access (Optional)"
        RemoteUser[Remote User] -->|VPN / Tunnel| LoadBalancer
    end
```

### Hardware Recommendations (for 20 Active Streams)
Since the Edge Devices handle the expensive AI processing, the central server mainly orchestrates database writes and web queries.
*   **Server**: Intel NUC 13 Pro (i7) OR Refurbished Enterprise Server (Dell R640).
*   **CPU**: 8+ Cores (e.g., Intel Core i7 or Xeon Silver).
*   **RAM**: 32GB (Postgres caching is key).
*   **Storage**: 
    *   **OS/DB**: 1TB NVMe SSD (Fast database I/O).
    *   **Images**: 4TB+ HDD (RAID 1 for redundancy) for storing vehicle images.
*   **Network**: Gigabit Switch.

### Pros & Cons
*   **✅ Pros**: 
    *   **Zero Cloud Costs**: No monthly AWS bills.
    *   **Data Sovereignty**: Data never leaves your building.
    *   **Latency**: Instantaneous dashboard updates.
    *   **Simplicity**: Uses your existing `docker-compose` setup.
*   **❌ Cons**:
    *   **Single Point of Failure**: If the server breaks, the system is down (mitigate with spare hardware).
    *   **Remote Access**: Requires VPN configuration. **Recommendation**: Use **Tailscale** ("Virtual Cable") for zero-config key-based access.
    *   **Maintenance**: You are responsible for backups and OS updates.

---

## Phase 2: Hybrid Strategy (Plan B "Hybrid")

**Concept**: "Heavy" data (images, full logs) stays local. "Light" data (critical alerts, device health, user auth) moves to the cloud.

### Architecture
```mermaid
graph TD
    subgraph "Local Private Cloud"
        Edge[Edge Devices] -->|Big Data (Images)| LocalDB[(Local Storage)]
        LocalDB --> LocalAPI[Local API]
    end
    
    subgraph "Public Cloud (AWS/VPS)"
        CloudAuth[Auth Service / Cognito]
        CloudAlerts[Alert Dispatcher]
        CloudDashboard[Lightweight Dashboard]
    end
    
    Edge -->|Metadata Only| CloudDashboard
    Edge -->|Heartbeat| CloudDashboard
    User -->|Logs In| CloudAuth
    LocalAPI -->|Syncs Hotlist| CloudDashboard
```

### Use Case
Upgrade to this if you need:
1.  **Strict User Management**: Easy login for employees without VPNs.
2.  **External Alerts**: "Stolen Vehicle" alerts must go to SMS/Email reliably.
3.  **Multi-Site**: You have 10 cameras at Location A and 10 at Location B, and want one unified dashboard.

### Pros & Cons
*   **✅ Pros**: Best of both worlds—low cost storage, high availability control plane.
*   **❌ Cons**: Complexity. You now maintain two synchronized environments.

---

## Phase 3: Full Cloud (Plan B "Cloud")

**Concept**: Lift and shift the Local Private Cloud containers to AWS ECS/Fargate + RDS.

### Architecture
(As currently described in `design.md` Phase 3)

### Use Case
Switch to this if:
1.  **Scale Explodes**: You jump from 20 to 1,000 cameras.
2.  **Hardware Fatigue**: You no longer want to manage physical hard drives or servers.
3.  **Compliance**: A client mandates ISO 27001 data center storage.

### Cost Estimate (20 Devices)
*   **Traffic**: 20 cams * 10 cars/min * 60 mins * 24 hours = ~288,000 requests/day.
*   **Database**: AWS RDS Postgres (~$50-100/mo).
*   **Compute**: Fargate (~$40/mo).
*   **Storage**: S3 (~$20/mo depending on retention).
*   **Total**: ~$150-$250/mo (Variable).

---

## Transition Plan: "Drafting Before Replacing"

To implement this without disrupting current work:

1.  **Keep** existing Phase 1 & 2 tasks (Local Dev & Advanced Features).
2.  **Rename** "Phase 3: Cloud Migration" to "Phase 3: Deployment Options".
3.  **Insert** "Local Private Cloud Setup" as the immediate next step after Advanced Features.
4.  **Move** AWS Cloud tasks to a "Future / Optional" section.

### Recommended Task List Updates

#### [NEW] Phase 3: Local Private Cloud Deployment
*   [ ] **D1. Server Prep**: Ubuntu Server setup, Docker hardening, Auto-restart policies.
*   [ ] **D2. Network Config**: Static IPs for Edge Devices, internal DNS or Hosts file.
*   [ ] **D3. Production Docker**: `docker-compose.prod.yml` with restart policies and volume mapping.
*   [ ] **D4. Remote Access**: Setup Tailscale/WireGuard/Cloudflare Tunnel.
*   [ ] **D5. Backup Strategy**: Script to `pg_dump` database to external NAS/Cloud Bucket nightly.

#### [MOVED] Phase 4: Cloud & Hybrid Options (Backlog)
*   *(Existing AWS Tasks 1-22 moved here as optional upgrade paths)*
