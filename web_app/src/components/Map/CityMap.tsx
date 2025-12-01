import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import type { Sighting } from '../../types/sighting';

// Function to create custom DivIcon
const createCustomIcon = (isHot: boolean, isSelected: boolean, orderLabel?: number) => {
    let className = 'marker-pin';
    if (isHot) className += ' hot';
    if (isSelected) className += ' selected';
    if (orderLabel !== undefined) className += ' numbered';

    const html = orderLabel !== undefined
        ? `<div class="${className}"><span class="marker-label">${orderLabel}</span></div>`
        : `<div class="${className}"></div>`;

    return L.divIcon({
        className: 'custom-div-icon',
        html: html,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
    });
};

// Static Entrance Icon (simpler)
const EntranceIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #888;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

// Jableh Coordinates
const JABLEH_CENTER: [number, number] = [35.3615, 35.9267];

// Entrance Locations
export const ENTRANCES: Record<string, { lat: number; lng: number; label: string }> = {
    'JABLEH_NORTH': { lat: 35.3750, lng: 35.9350, label: 'North Entrance (Airport/Latakia)' },
    'JABLEH_SOUTH': { lat: 35.3450, lng: 35.9250, label: 'South Entrance (Baniyas)' },
    'JABLEH_EAST': { lat: 35.3600, lng: 35.9450, label: 'East Entrance (Inland)' },
    'JABLEH_WEST': { lat: 35.3620, lng: 35.9150, label: 'West (Corniche)' },
    'JABLEH_CENTER': { lat: 35.3615, lng: 35.9267, label: 'Center (Roman Amphitheater)' },
    'JABLEH_PORT': { lat: 35.3650, lng: 35.9200, label: 'Port Entrance' },
    'JABLEH_STADIUM': { lat: 35.3580, lng: 35.9300, label: 'Al-Baath Stadium' },
};

interface CityMapProps {
    sightings: Sighting[];
    selectedSighting?: Sighting | null;
    showHeatmap?: boolean;
    showTrajectory?: boolean;
}

// Helper component to control map view
const MapController: React.FC<{ selectedSighting?: Sighting | null }> = ({ selectedSighting }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedSighting) {
            const location = ENTRANCES[selectedSighting.location_id];
            if (location) {
                map.flyTo([location.lat, location.lng], 15, {
                    duration: 1.5
                });
            }
        }
    }, [selectedSighting, map]);

    return null;
};

// Heatmap Layer Component
const HeatmapLayer: React.FC<{ points: [number, number, number][] }> = ({ points }) => {
    const map = useMap();

    useEffect(() => {
        if (!points.length) return;

        // @ts-ignore - leaflet.heat adds heatLayer to L
        const heat = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
        }).addTo(map);

        return () => {
            map.removeLayer(heat);
        };
    }, [points, map]);

    return null;
};

const CityMap: React.FC<CityMapProps> = ({ sightings, selectedSighting, showHeatmap = false, showTrajectory = true }) => {

    // Prepare Heatmap Data
    const heatmapPoints: [number, number, number][] = sightings
        .map(s => {
            const loc = ENTRANCES[s.location_id];
            return loc ? [loc.lat, loc.lng, 1] : null; // 1 is intensity
        })
        .filter((p): p is [number, number, number] => p !== null);

    // Prepare Trajectory Data & Order Map
    let trajectoryPositions: [number, number][] = [];
    const sightingOrderMap: Record<string, number> = {};

    if (selectedSighting && showTrajectory) {
        const vehicleSightings = sightings
            .filter(s => s.plate_number === selectedSighting.plate_number)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        trajectoryPositions = vehicleSightings
            .map(s => {
                const loc = ENTRANCES[s.location_id];
                return loc ? [loc.lat, loc.lng] : null;
            })
            .filter((p): p is [number, number] => p !== null);

        // Map sighting ID to its 1-based index in the sequence
        vehicleSightings.forEach((s, index) => {
            sightingOrderMap[s.id] = index + 1;
        });
    }

    return (
        <div style={{ height: '600px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0, 229, 255, 0.2)', boxShadow: '0 0 20px rgba(0, 229, 255, 0.1)' }}>
            <MapContainer center={JABLEH_CENTER} zoom={13} style={{ height: '100%', width: '100%', background: '#050b14' }}>
                <MapController selectedSighting={selectedSighting} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Heatmap Layer */}
                {showHeatmap && <HeatmapLayer points={heatmapPoints} />}

                {/* Trajectory Line */}
                {trajectoryPositions.length > 1 && (
                    <Polyline
                        positions={trajectoryPositions}
                        pathOptions={{ color: '#00e5ff', weight: 4, opacity: 0.7, dashArray: '10, 10' }}
                    />
                )}

                {/* Static Entrance Markers */}
                {Object.entries(ENTRANCES).map(([id, { lat, lng, label }]) => (
                    <Marker key={id} position={[lat, lng]} icon={EntranceIcon} opacity={0.8}>
                        <Popup className="custom-popup">
                            <strong>{label}</strong><br />
                            Location ID: {id}
                        </Popup>
                    </Marker>
                ))}

                {/* Sighting Markers */}
                {sightings.map((sighting) => {
                    const location = ENTRANCES[sighting.location_id];
                    if (!location) return null;

                    const isSelected = selectedSighting?.id === sighting.id;
                    const orderLabel = sightingOrderMap[sighting.id];
                    const icon = createCustomIcon(!!sighting.is_hot, isSelected, orderLabel);

                    return (
                        <Marker
                            key={sighting.id}
                            position={[location.lat, location.lng]}
                            icon={icon}
                            zIndexOffset={sighting.is_hot || isSelected ? 1000 : 0}
                        >
                            <Popup className="custom-popup">
                                <strong>{sighting.plate_number}</strong><br />
                                {new Date(sighting.timestamp).toLocaleString()}<br />
                                {sighting.is_hot && <span style={{ color: '#ff1744', fontWeight: 'bold' }}>HOTLIST ALERT!</span>}
                                {sighting.vehicle_make && <br />}
                                {sighting.vehicle_make} {sighting.vehicle_model} ({sighting.vehicle_color})
                                {orderLabel && <><br /><strong>Sequence: #{orderLabel}</strong></>}
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default CityMap;
