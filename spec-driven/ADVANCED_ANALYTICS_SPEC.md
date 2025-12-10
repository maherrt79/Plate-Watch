# Advanced Analytics Specification

## Overview
This document details the "Pro" analytics features inspired by industry leaders (e.g., Motorola Vigilant) to be implemented in **Phase 2 (Advanced Features)**. These features transition Plate-Watch from a passive monitoring system to an active intelligence tool.

---

## 1. Target Routine Analysis ("Best Time to Intercept")

**Goal**: Move beyond knowing *where* a suspect was to predicting *when* they will be there again.
**User Story**: "As an investigator, I want to know the user's routine so I can intercept them without waiting 24/7."

### Visualization: "Pattern of Life" Heatmap
A grid visualization displaying sighting density.
*   **X-Axis**: Time of Day (00:00 - 23:00)
*   **Y-Axis**: Day of Week (Mon - Sun)
*   **Cells**: Colored by frequency (Dark = No sightings, Bright Red = High frequency).

### Algorithm: Prediction Logic
1.  **Fetch Data**: Retrieve all `sightings` for `plate_number X` over `last N days`.
2.  **Binning**: Group sightings into 1-hour slots per day (e.g., "Monday 08:00-09:00").
3.  **Scoring**:
    *   `Raw Score`: Count of sightings in bin.
    *   `Recency Weight`: Multiply score by `1.0` if < 7 days old, `0.5` if < 30 days, `0.1` otherwise.
4.  **Output**: Return the "Top 3" highest scoring time slots.
    *   *Example Output*: "High probability of reappearance: Tuesday between 08:00 and 09:00 at North Gate."

---

## 2. Location Profiling ("Stakeout Mode")

**Goal**: Analyze a *Location* instead of a *Vehicle*. Identify suspicious behavior patterns at high-value assets (e.g., Main Entrance, Warehouse Dock).
**User Story**: "As a security manager, I want to know who hangs around the Warehouse at 3 AM."

### Visualization: Digital Stakeout Dashboard
Accessible by clicking a camera marker on the Map.

#### A. Dwell Time Distribution
A histogram showing how long vehicles stay at this location (if Entry/Exit pair exists).
*   **Buckets**: < 5 min (Pass-through), 5-30 min (Visit), > 30 min (Loitering).

#### B. Peak Activity Hours
A line graph showing sighting volume per hour of day.
*   **Anomaly Detection**: Highlight hours where volume is > 200% of average (e.g., a spike at 3 AM).

#### C. Frequent Visitor List ("Top 10")
A table of unique plates that visit this location most frequently.
*   **Data Points**: Plate ID, Total Visit Count, Last Seen.
*   **Filter**: Option to "Exclude Residents" (vehicles seen > 50 times/month) to find "New/Unknown Regulars".

---

## 3. Implementation Notes

### Backend Requirements (FastAPI)
*   New aggregation endpoints using `SQLAlchemy`'s `func.date_part` (for Postgres) to extract hour/dow efficiently.
*   Caching (Redis or Memory) is recommended for these queries as table size grows > 1M rows.

### Frontend Requirements (React)
*   **Heatmap Library**: Use `nivo` or `react-heatmap-grid` for the "Pattern of Life" grid.
*   **Charts**: Use `recharts` for Dwell Time and Peak Activity graphs.
