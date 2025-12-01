import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Sighting } from '../../types/sighting';

// Function to create custom DivIcon
const createCustomIcon = (isHot: boolean, isSelected: boolean) => {
    let className = 'marker-pin';
    if (isHot) className += ' hot';
    if (isSelected) className += ' selected';

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="${className}"></div>`,
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

const CityMap: React.FC<CityMapProps> = ({ sightings, selectedSighting }) => {
    return (
        <div style={{ height: '600px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0, 229, 255, 0.2)', boxShadow: '0 0 20px rgba(0, 229, 255, 0.1)' }}>
            <MapContainer center={JABLEH_CENTER} zoom={13} style={{ height: '100%', width: '100%', background: '#050b14' }}>
                <MapController selectedSighting={selectedSighting} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

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
                    const icon = createCustomIcon(!!sighting.is_hot, isSelected);

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
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default CityMap;
