import L from 'leaflet';

// Function to create custom DivIcon
export const createCustomIcon = (isHot: boolean, isSelected: boolean, orderLabel?: number) => {
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
export const EntranceIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #888;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

// Jableh Coordinates
export const JABLEH_CENTER: [number, number] = [35.3615, 35.9267];

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
