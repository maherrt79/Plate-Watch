# Plate-Watch User Guide

Welcome to the **Plate-Watch** system. This guide will help you master the tools available for monitoring, investigation, and analysis.

## 🌟 System Overview

Plate-Watch is a comprehensive vehicle surveillance system designed for city security.
1.  **Edge Devices**: Cameras at city entrances (North, South, East) detect vehicles and read license plates.
2.  **Cloud Backend**: Processes data, checks against hotlists, and stores sightings.
3.  **Web Dashboard**: Your interface for monitoring and analysis.

---

## 🖥️ Dashboards & Features

### 1. Main Dashboard (Live Monitoring)
The **Main Dashboard** is your default view for real-time situational awareness.

*   **Live Feed**: Sightings appear instantly as vehicles pass cameras.
*   **Vehicle Attributes**: See the Make, Model, and Color (MMC) of every vehicle.
*   **Fuzzy Search**: Searching for `123` will find `ABC-123`, `123-XYZ`, etc.
*   **Filters**: Drill down by specific dates or locations (e.g., "Show me all red cars at the North Gate yesterday").

### 2. Map Dashboard (Geospatial Intelligence)
Visualize the "where" and "how" of vehicle movements.

*   **Live Markers**: Blue markers indicate normal sightings. **Red pulsing markers** indicate alerts.
*   **Heatmaps**: Toggle the **"Show Heatmap"** switch to see high-traffic zones. Useful for identifying congestion or patrol hotspots.
*   **Trajectory Tracking**:
    1.  Click on any vehicle marker.
    2.  A **blue line** will appear connecting all its sightings.
    3.  Numbered markers (1, 2, 3...) show the **direction of travel**.

### 3. Hotlist Manager (Alert Management)
Control which vehicles trigger system-wide alarms.

*   **Categories**:
    *   🔴 **Danger**: Immediate threat (e.g., Stolen, Wanted).
    *   🟡 **Warning**: Suspicious (e.g., Unpaid fines, Expired registration).
    *   🔵 **Info**: For observation (e.g., VIPs, Official vehicles).
*   **Adding a Plate**:
    1.  Go to **Hotlists**.
    2.  Enter Plate Number, Description, and Category.
    3.  Click **Add to Hotlist**.
    4.  *Next time this vehicle is seen, a red alert will flash on all dashboards.*

### 4. Analytics Dashboard (Investigation)
Deep dive into data to solve crimes and understand patterns.

#### 🕵️ Convoy Analysis
Find vehicles traveling together (e.g., a smuggler and a scout car).
1.  Select the **Convoy Analysis** tab.
2.  Enter the **Target Plate** (the known suspect).
3.  Set the **Time Window** (default 5s).
4.  Click **Analyze**.
5.  The system lists all "Followers" seen at the same location within that time window.

#### 🚦 Origin-Destination (OD) Matrix
Understand traffic flow dynamics.
1.  Select the **Origin-Destination Matrix** tab.
2.  View the grid:
    *   **Rows**: Where vehicles came *from* (Origin).
    *   **Columns**: Where they went *to* (Destination).
    *   **Cells**: The number of vehicles that made that specific trip.
3.  *Example*: A high count in the "North -> South" cell indicates heavy transit traffic.

---

## 📖 Usage Scenarios

### Scenario A: Investigating a Stolen Vehicle
1.  **Search**: Go to the **Main Dashboard** and enter the partial plate number.
2.  **Verify**: Check the "Vehicle Attributes" (Make/Model/Color) to confirm it matches the description.
3.  **Track**: Switch to the **Map Dashboard** and click the vehicle to see its **Trajectory**. Where did it enter? Where was it last seen?
4.  **Alert**: Go to **Hotlists** and add the plate to the "Danger" category to get notified of future sightings.

### Scenario B: Monitoring a Checkpoint
1.  **Filter**: On the **Main Dashboard**, set the **Location Filter** to "Jableh North".
2.  **Watch**: Monitor the live feed for that specific entrance.
3.  **Analyze**: Use the **Heatmap** on the Map Dashboard to see if traffic volume is unusual for this time of day.

---

## 🔧 Troubleshooting

| Issue | Possible Cause | Solution |
| :--- | :--- | :--- |
| **"Network Error" Toast** | Backend is unreachable. | Ensure the backend server is running (`docker-compose up`). |
| **No Sightings Appearing** | Edge device is offline. | Check if the edge simulation script (`main.py`) is running. |
| **Map Not Loading** | Internet connection. | The map requires an internet connection to load OpenStreetMap tiles. |
| **Alerts Not Triggering** | Plate not in Hotlist. | Verify the plate number in **Hotlist Manager** (check for typos). |

---

## 📚 Glossary

*   **Sighting**: A single event where a camera detects a vehicle.
*   **Hotlist**: A database of vehicles of interest.
*   **MMC**: Make, Model, Color (e.g., Toyota Camry White).
*   **Convoy**: Two or more vehicles traveling in close proximity and time.
*   **OD Matrix**: Origin-Destination Matrix, a tool for traffic flow analysis.
*   **Fuzzy Search**: Searching for text that *approximately* matches (e.g., "123" matches "ABC-123").

---

*For technical support, please contact the IT department or refer to the `README.md` for developer documentation.*
