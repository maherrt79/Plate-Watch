# Plate-Watch ANPR System: Development Roadmap

> **Jira-Compatible Project Plan** | 3 Sprints | Production-Ready Prototype

---

## Executive Summary

This roadmap outlines a **3-sprint plan** to deliver a working production-ready prototype of the Plate-Watch ANPR (Automatic Number Plate Recognition) system. Based on project analysis and industry best practices, the plan covers edge device deployment, backend hardening, web dashboard enhancement, and local private cloud deployment.

### Current State Analysis

| Component | Status | Technology Stack |
|-----------|--------|------------------|
| **Backend** | Core functionality implemented | FastAPI, PostgreSQL, SQLAlchemy, Docker |
| **Edge Device** | Working prototype | Python, YOLOv8, EasyOCR, UK plate validation |
| **Web App** | Basic UI complete | React, Vite, Material UI, Leaflet maps, TanStack Query |
| **Deployment** | Development scripts ready | Docker Compose, local deployment script |

---

## Sprint Overview

| Sprint | Duration | Focus | Deliverable |
|--------|----------|-------|-------------|
| **1** | 2 weeks | Foundation & Stability | Hardened backend with real-time alerts |
| **2** | 2 weeks | Edge Device Production | Deployable Raspberry Pi edge application |
| **3** | 2 weeks | Dashboard & Deployment | Production-ready local private cloud |

---

# EPIC 1: Backend API Hardening & Real-Time Features

**Epic Key:** `PW-EPIC-001`  
**Sprint:** 1  
**Priority:** Highest

## User Stories

### Story 1.1: Implement Real-Time WebSocket Alerts
**Key:** `PW-101` | **Points:** 8 | **Priority:** High

> As an operator, I want to receive instant alerts when a hotlisted plate is detected, so I can respond immediately.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-101-1 | Create WebSocket endpoint `/ws/alerts` in FastAPI | 3h | Backend |
| PW-101-2 | Implement connection manager for multi-client broadcasts | 2h | Backend |
| PW-101-3 | Add hotlist match trigger on sighting creation | 2h | Backend |
| PW-101-4 | Create alert schema with severity levels (critical, warning, info) | 1h | Backend |
| PW-101-5 | Write integration tests for WebSocket alerts | 3h | Backend |

---

### Story 1.2: Add Device Management API
**Key:** `PW-102` | **Points:** 5 | **Priority:** High

> As an admin, I want to manage edge devices (register, monitor health, deactivate), so I can maintain system oversight.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-102-1 | Extend `Device` model with status, last_heartbeat, config fields | 2h | Backend |
| PW-102-2 | Create CRUD endpoints: `/devices`, `/devices/{id}` | 3h | Backend |
| PW-102-3 | Implement device heartbeat endpoint `/devices/{id}/heartbeat` | 2h | Backend |
| PW-102-4 | Add device status enum: online, offline, maintenance | 1h | Backend |
| PW-102-5 | Create periodic task to mark devices offline (no heartbeat >5 min) | 2h | Backend |

---

### Story 1.3: Enhance Hotlist Management
**Key:** `PW-103` | **Points:** 5 | **Priority:** Medium

> As an operator, I want to categorize hotlist entries (stolen, wanted, VIP, watchlist), so I can prioritize alerts.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-103-1 | Add `priority` and `expiry_date` fields to Hotlist model | 1h | Backend |
| PW-103-2 | Implement bulk import endpoint (CSV/JSON) | 3h | Backend |
| PW-103-3 | Add category-based filtering to hotlist API | 2h | Backend |
| PW-103-4 | Create expired hotlist cleanup task | 2h | Backend |

---

### Story 1.4: Implement API Authentication & Security
**Key:** `PW-104` | **Points:** 8 | **Priority:** Highest

> As a system admin, I want secure API access, so that only authorized devices and users can interact with the system.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-104-1 | Implement JWT-based authentication | 4h | Backend |
| PW-104-2 | Create API key system for edge devices | 3h | Backend |
| PW-104-3 | Add rate limiting middleware | 2h | Backend |
| PW-104-4 | Implement role-based access (admin, operator, viewer) | 3h | Backend |
| PW-104-5 | Add request logging and audit trail | 2h | Backend |

---

# EPIC 2: Edge Device Production Readiness

**Epic Key:** `PW-EPIC-002`  
**Sprint:** 2  
**Priority:** Highest

## User Stories

### Story 2.1: Multi-Region Plate Format Support
**Key:** `PW-201` | **Points:** 8 | **Priority:** High

> As a system operator, I want to support multiple license plate formats (UK, EU, US), so the system can be deployed globally.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-201-1 | Create pluggable plate validator architecture | 3h | Edge |
| PW-201-2 | Implement UK plate validator (current logic refactored) | 2h | Edge |
| PW-201-3 | Add EU plate validator with country codes | 3h | Edge |
| PW-201-4 | Add US plate validator (state formats) | 3h | Edge |
| PW-201-5 | Create config option for active regions | 1h | Edge |
| PW-201-6 | Add unit tests for each plate format | 3h | Edge |

---

### Story 2.2: Optimize for Raspberry Pi Deployment
**Key:** `PW-202` | **Points:** 13 | **Priority:** Highest

> As a deployment engineer, I want the edge app to run efficiently on Raspberry Pi 4, so we can minimize hardware costs.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-202-1 | Profile and optimize YOLOv8 inference (batch size, resolution) | 4h | Edge |
| PW-202-2 | Implement frame skip logic for low-power mode | 2h | Edge |
| PW-202-3 | Add memory-efficient image buffer (discard old frames) | 2h | Edge |
| PW-202-4 | Create ARM64 compatible requirements.txt | 2h | DevOps |
| PW-202-5 | Test with Pi Camera Module v2 integration | 3h | Edge |
| PW-202-6 | Benchmark: target 10 FPS @ 720p on Pi 4 | 4h | Edge |
| PW-202-7 | Document Pi-specific installation steps | 2h | Docs |

---

### Story 2.3: Implement Offline Resilience
**Key:** `PW-203` | **Points:** 8 | **Priority:** High

> As a system operator, I want edge devices to queue sightings offline and sync when reconnected, so no data is lost.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-203-1 | Create local SQLite queue for pending sightings | 3h | Edge |
| PW-203-2 | Implement background sync thread | 3h | Edge |
| PW-203-3 | Add exponential backoff for failed transmissions | 2h | Edge |
| PW-203-4 | Create queue size limit and overflow handling | 2h | Edge |
| PW-203-5 | Add sync status indicator to device heartbeat | 1h | Edge |

---

### Story 2.4: Create Systemd Service for Auto-Start
**Key:** `PW-204` | **Points:** 3 | **Priority:** High

> As a deployment engineer, I want the edge app to auto-start on boot, so devices are always operational.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-204-1 | Create systemd service file with auto-restart | 2h | DevOps |
| PW-204-2 | Add watchdog health check | 2h | Edge |
| PW-204-3 | Create install script for Pi deployment | 2h | DevOps |
| PW-204-4 | Document deployment steps | 1h | Docs |

---

### Story 2.5: Implement Image Capture & Storage
**Key:** `PW-205` | **Points:** 5 | **Priority:** Medium

> As an investigator, I want vehicle images stored with sightings, so I have visual evidence.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-205-1 | Capture and save cropped vehicle image on detection | 2h | Edge |
| PW-205-2 | Implement local image storage with retention policy | 2h | Edge |
| PW-205-3 | Add image path to sighting payload | 1h | Edge |
| PW-205-4 | Create image upload endpoint on backend | 3h | Backend |
| PW-205-5 | Implement storage cleanup (30-day rolling) | 2h | Edge |

---

# EPIC 3: Web Dashboard Enhancement

**Epic Key:** `PW-EPIC-003`  
**Sprint:** 2-3  
**Priority:** High

## User Stories

### Story 3.1: Implement Real-Time Alert Panel
**Key:** `PW-301` | **Points:** 8 | **Priority:** High

> As an operator, I want a real-time alert feed with audio/visual notifications, so I catch critical alerts immediately.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-301-1 | Create WebSocket client hook for React | 2h | Frontend |
| PW-301-2 | Implement AlertFeed component with severity colors | 3h | Frontend |
| PW-301-3 | Add audio notification for critical alerts | 2h | Frontend |
| PW-301-4 | Implement browser push notifications | 2h | Frontend |
| PW-301-5 | Add alert acknowledgement feature | 2h | Frontend |

---

### Story 3.2: Build Device Management Console
**Key:** `PW-302` | **Points:** 8 | **Priority:** High

> As an admin, I want to view all devices on a map and monitor their status, so I can manage the camera network.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-302-1 | Create DeviceList component with status indicators | 3h | Frontend |
| PW-302-2 | Add device markers to Leaflet map (green/red/yellow) | 3h | Frontend |
| PW-302-3 | Implement device detail panel (last heartbeat, sighting count) | 2h | Frontend |
| PW-302-4 | Add device configuration modal | 3h | Frontend |
| PW-302-5 | Create device health dashboard tile | 2h | Frontend |

---

### Story 3.3: Implement Command Center UI Theme
**Key:** `PW-303` | **Points:** 5 | **Priority:** Medium

> As an operator, I want a dark, high-contrast "command center" theme, so I can work 12-hour shifts without eye strain.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-303-1 | Implement "Void" dark theme palette per PROMPT_MASTER_PLAN.md | 3h | Frontend |
| PW-303-2 | Add glassmorphism HUD panels | 2h | Frontend |
| PW-303-3 | Implement alert pulse animations | 2h | Frontend |
| PW-303-4 | Create custom map tiles (dark mode) | 2h | Frontend |
| PW-303-5 | Add monospace fonts for data display | 1h | Frontend |

---

### Story 3.4: Build Sighting Search & Analytics
**Key:** `PW-304` | **Points:** 8 | **Priority:** Medium

> As an investigator, I want to search historical sightings and view analytics, so I can track vehicle patterns.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-304-1 | Create advanced search form (plate, date range, location) | 3h | Frontend |
| PW-304-2 | Implement paginated results table | 2h | Frontend |
| PW-304-3 | Add sighting detail modal with vehicle image | 2h | Frontend |
| PW-304-4 | Create time-series chart (sightings per hour) | 3h | Frontend |
| PW-304-5 | Implement heatmap layer for location frequency | 3h | Frontend |

---

# EPIC 4: Local Private Cloud Deployment

**Epic Key:** `PW-EPIC-004`  
**Sprint:** 3  
**Priority:** Highest

## User Stories

### Story 4.1: Create Production Docker Configuration
**Key:** `PW-401` | **Points:** 8 | **Priority:** Highest

> As a DevOps engineer, I want a production-ready Docker setup, so I can deploy reliably on local servers.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-401-1 | Create `docker-compose.prod.yml` with restart policies | 2h | DevOps |
| PW-401-2 | Add health checks for all services | 2h | DevOps |
| PW-401-3 | Configure PostgreSQL for production (connection pooling) | 2h | DevOps |
| PW-401-4 | Add Nginx reverse proxy with SSL | 3h | DevOps |
| PW-401-5 | Create environment variable templates | 1h | DevOps |
| PW-401-6 | Build optimized web app production bundle | 2h | Frontend |

---

### Story 4.2: Implement Database Backup & Recovery
**Key:** `PW-402` | **Points:** 5 | **Priority:** High

> As a system admin, I want automated database backups, so I can recover from data loss.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-402-1 | Create pg_dump backup script | 2h | DevOps |
| PW-402-2 | Configure cron for nightly backups | 1h | DevOps |
| PW-402-3 | Add backup rotation (keep last 30 days) | 2h | DevOps |
| PW-402-4 | Document recovery procedure | 2h | Docs |
| PW-402-5 | Test backup/restore cycle | 2h | DevOps |

---

### Story 4.3: Set Up Remote Access via Tailscale
**Key:** `PW-403` | **Points:** 3 | **Priority:** Medium

> As an admin, I want secure remote access to the dashboard, so I can monitor from anywhere.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-403-1 | Document Tailscale installation for server | 1h | Docs |
| PW-403-2 | Configure edge devices to join Tailnet | 2h | DevOps |
| PW-403-3 | Update device config for Tailscale IPs | 1h | DevOps |
| PW-403-4 | Test remote access scenario | 1h | QA |

---

### Story 4.4: Implement Monitoring & Logging
**Key:** `PW-404` | **Points:** 8 | **Priority:** High

> As an admin, I want centralized logging and system metrics, so I can troubleshoot issues quickly.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-404-1 | Add structured JSON logging to backend | 2h | Backend |
| PW-404-2 | Configure Docker log rotation | 1h | DevOps |
| PW-404-3 | Create Prometheus metrics endpoint | 3h | Backend |
| PW-404-4 | Add Grafana dashboard (optional) | 4h | DevOps |
| PW-404-5 | Document log analysis procedures | 2h | Docs |

---

### Story 4.5: Create Edge Device Deployment Package
**Key:** `PW-405` | **Points:** 5 | **Priority:** Highest

> As a deployment engineer, I want a one-click deployment for edge devices, so I can scale quickly.

#### Tasks

| Key | Task | Estimate | Assignee |
|-----|------|----------|----------|
| PW-405-1 | Create `deploy_edge.sh` script for Raspberry Pi | 3h | DevOps |
| PW-405-2 | Bundle pre-built Python wheels for ARM64 | 2h | DevOps |
| PW-405-3 | Create SD card image with pre-configured OS | 4h | DevOps |
| PW-405-4 | Document first-boot configuration steps | 2h | Docs |
| PW-405-5 | Test deployment on 3 separate Pi devices | 3h | QA |

---

# Sprint Allocation

## Sprint 1: Foundation & Stability
**Duration:** 2 weeks (10 working days)  
**Velocity Target:** ~35 story points

| Story | Points | Epic |
|-------|--------|------|
| PW-101: Real-Time WebSocket Alerts | 8 | Backend Hardening |
| PW-102: Device Management API | 5 | Backend Hardening |
| PW-103: Hotlist Management | 5 | Backend Hardening |
| PW-104: API Authentication & Security | 8 | Backend Hardening |
| PW-301: Real-Time Alert Panel | 8 | Web Dashboard |

**Sprint Goal:** *Secure, real-time backend with working alert notifications.*

---

## Sprint 2: Edge Device Production
**Duration:** 2 weeks (10 working days)  
**Velocity Target:** ~37 story points

| Story | Points | Epic |
|-------|--------|------|
| PW-201: Multi-Region Plate Support | 8 | Edge Production |
| PW-202: Raspberry Pi Optimization | 13 | Edge Production |
| PW-203: Offline Resilience | 8 | Edge Production |
| PW-204: Systemd Auto-Start | 3 | Edge Production |
| PW-205: Image Capture & Storage | 5 | Edge Production |

**Sprint Goal:** *Edge devices deployable on Raspberry Pi with offline resilience.*

---

## Sprint 3: Dashboard & Deployment
**Duration:** 2 weeks (10 working days)  
**Velocity Target:** ~37 story points

| Story | Points | Epic |
|-------|--------|------|
| PW-302: Device Management Console | 8 | Web Dashboard |
| PW-303: Command Center UI Theme | 5 | Web Dashboard |
| PW-304: Sighting Search & Analytics | 8 | Web Dashboard |
| PW-401: Production Docker Config | 8 | Deployment |
| PW-402: Database Backup | 5 | Deployment |
| PW-403: Tailscale Remote Access | 3 | Deployment |

**Sprint Goal:** *Production-ready dashboard and deployable local private cloud.*

---

# Verification Plan

## Automated Testing
- **Backend:** Run `pytest` with coverage on all new endpoints
- **Edge:** Unit tests for plate validators and offline queue
- **Web:** Component tests with React Testing Library

## Integration Testing
- End-to-end flow: Edge device → Backend → WebSocket → Dashboard
- Test hotlist alert chain with mock sightings

## Manual Verification
1. Deploy edge device on Raspberry Pi 4 and verify 10+ FPS
2. Test offline mode by disconnecting network, verify queue sync
3. Trigger critical alert and verify audio/visual notification
4. Full backup/restore cycle on test server
5. Remote access via Tailscale from external network

---

# Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Pi performance issues | High | Early benchmarking in Sprint 2, fallback to Jetson Nano |
| OCR accuracy in varied lighting | Medium | Add IR camera support, expand training data |
| WebSocket scalability | Medium | Implement connection limits, consider Redis pub/sub |
| Data loss on edge failure | High | SQLite queue with 7-day retention |

---

# Success Criteria for Production Prototype

- [ ] 3+ edge devices deployed and reporting
- [ ] Real-time hotlist alerts within 2 seconds
- [ ] 95%+ uptime over 7-day test period
- [ ] <5% false positive rate on plate recognition
- [ ] Secure remote access working
- [ ] Automated nightly backups verified
