# Plate-Watch Web App (Technical)

This is the frontend application for the Plate-Watch system, built with React, TypeScript, and Vite.

## 📚 Documentation
- **[User Guide](./USER_GUIDE.md)**: Features, Dashboards, and Usage Instructions.

## 🛠 Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v6
- **State Management**: TanStack Query (React Query) v5
- **Routing**: React Router DOM v6
- **Maps**: Leaflet + React Leaflet
- **HTTP Client**: Axios

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
cd web_app
npm install
```

### Environment Setup
Create a `.env` file in the root of `web_app`:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_API_KEY=dev-api-key-123
```

### Development
Start the development server:
```bash
npm run dev
```
Access the app at [http://localhost:5173](http://localhost:5173).

### Build
Build for production:
```bash
npm run build
```
Preview the build:
```bash
npm run preview
```

## 📂 Project Structure
```
src/
├── components/     # Reusable UI components
│   ├── Hotlist/    # Hotlist management components
│   ├── Map/        # Map and visualization components
│   └── Sightings/  # Sightings list and filter components
├── contexts/       # Global state contexts (Toast, Auth)
├── hooks/          # Custom React hooks (useDebounce, etc.)
├── pages/          # Page components (Dashboard, Map, Analytics)
├── services/       # API integration (Axios setup, endpoints)
├── types/          # TypeScript definitions
└── App.tsx         # Main application component and routing
```

## 🧪 Key Features Implementation
- **Debounced Search**: Implemented via `useDebounce` hook to optimize API calls.
- **Global Error Handling**: Centralized in `api.ts` using Axios interceptors and `ToastContext`.
- **Real-time Maps**: Uses `react-leaflet` with custom layers for heatmaps and trajectories.
