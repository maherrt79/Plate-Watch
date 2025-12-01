# UI/UX Overhaul: "Plate-Watch" Command Center

## Role Definition
**ACT AS:** A Lead UI/UX Architect and Sci-Fi Interface Expert (specializing in FUI - Fictional User Interfaces).
**CONTEXT:** You are designing the interface for "Plate-Watch," a high-stakes license plate recognition and surveillance system used by operators for 12-hour shifts.
**AESTHETIC GOAL:** "Minority Report" meets "Cyberpunk 2077" but grounded in usability. The interface must feel like a military-grade "Command Center" — precise, high-contrast, and data-dense, yet intuitive.

---

## 1. Color Science & Palette
**Objective:** Minimize eye strain for long-duration usage while maintaining high alert visibility.
**Base Theme:** Deep, cool darks (avoiding pure #000000 to reduce contrast vibration).

### Primary Palette (Dark Mode)
- **Void Background:** `#0B0C10` (Deepest background, main canvas)
- **Surface Layer:** `#1F2833` (Card backgrounds, panels)
- **Border/Divider:** `#45A29E` (Subtle teal, 20% opacity for structure)

### Functional Accents (Neon/Glow)
- **Primary Action (Cyan):** `#66FCF1` (Buttons, active states, main focus)
- **Secondary Data (Cool Grey):** `#C5C6C7` (Text, secondary icons)

### Alert Status Colors (High Visibility)
- **Critical Alert (Pulse Red):** `#FF003C` (Stolen vehicles, immediate danger)
- **Warning/Caution (Amber):** `#F7B500` (Suspicious activity, system warnings)
- **Safe/Normal (Emerald):** `#00F0FF` (System nominal - leaning towards cyan/teal for sci-fi feel rather than standard green)

---

## 2. Component Specifications
Apply **Material Design 3** principles (elevation, spacing, typography) but skin them with the "Command Center" aesthetic.

### A. The Live Map
- **Style:** Dark mode map tiles (e.g., Mapbox Dark or custom Google Maps styling). Muted streets, high-contrast labels.
- **Overlays:**
  - Camera cones should be semi-transparent `rgba(102, 252, 241, 0.2)` with solid borders.
  - Vehicle markers should be small, crisp geometric shapes (triangles/diamonds).
- **HUD Elements:** Floating semi-transparent panels for map controls (Zoom, Filter) with a "glassmorphism" effect (blur: 10px, border: 1px solid rgba(255,255,255,0.1)).

### B. Camera Grid
- **Layout:** Dense grid (2x2, 3x3, or 4x4).
- **Container:** Each camera feed is framed by a thin, technical border (corner brackets).
- **Overlays:**
  - Timestamp and Camera ID in a monospaced font (e.g., 'Roboto Mono' or 'JetBrains Mono') in the top-left corner.
  - "LIVE" indicator: A small pulsing red dot in the top-right.
  - No empty space between feeds; maximize screen real estate.

### C. Alert Feed
- **Aesthetic:** "Ticker" or "Log" style.
- **Item Design:**
  - Compact rows.
  - Left border strip indicates severity (Red for Critical, Amber for Warning).
  - High-contrast license plate text (e.g., White text on Black rect).
- **Typography:** Use a technical sans-serif (e.g., 'Inter' or 'Rajdhani') for headers, monospaced for data (plates, times).

---

## 3. Interaction Design & Animation
**Core Principle:** "Tactile & Responsive." The interface should feel alive.

- **Critical Alerts:**
  - **Behavior:** When a critical alert arrives, the specific card/row should flash white briefly (`#FFFFFF`) then settle into a pulsing red border (`#FF003C`).
  - **Sound:** (Optional spec) Subtle "chirp" or "ping."
- **Hover States:**
  - Interactive elements (buttons, map markers) should have a "glow" effect on hover (box-shadow: 0 0 15px var(--primary-cyan)).
  - Cursor: Consider a custom crosshair cursor for the map area.
- **Transitions:**
  - All panel openings/closings should be instant or very fast (150ms) ease-out. No sluggish fades.

---

## 4. Coding Constraints & Implementation
**Framework:** React / Next.js (assumed).
**Styling Engine:** Tailwind CSS.

### Implementation Rules:
1.  **Tailwind Config:** Extend the color palette in `tailwind.config.js` with the custom colors defined above (e.g., `bg-void`, `text-neon-cyan`).
2.  **CSS Variables:** Use CSS variables for theme colors to allow for easy tweaking of the "glow" intensity.
3.  **Glassmorphism:** Use `backdrop-filter: blur()` and `bg-opacity` utilities for HUD panels.
4.  **Grid System:** Use CSS Grid for the Camera Layout to ensure perfect alignment.
5.  **Performance:** Animations must be hardware accelerated (transform/opacity only).

---

**OUTPUT REQUIREMENT:**
Based on the above, generate the **CSS/Tailwind code** for the `AlertFeed` component and the **Global Color Variables** configuration.
