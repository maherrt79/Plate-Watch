import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSightings } from '../../services/api';
import type { Sighting } from '../../types/sighting';

export interface Alert {
    id: string;
    plate: string;
    timestamp: string;
    severity: 'critical' | 'warning' | 'safe';
    camera: string;
    message: string;
}

const getCategoryColor = (category: string): string => {
    const cat = category.toLowerCase();
    if (cat === 'danger') return '#FF003C'; // Red
    if (cat === 'banned') return '#FF9100'; // Orange/Amber
    if (cat === 'info') return '#00F0FF'; // Cyan
    return '#C5C6C7'; // Default Grey
};

import { ENTRANCES } from '../Map/constants';

const AlertFeed: React.FC = () => {
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [locationId, setLocationId] = React.useState('');

    // Fetch sightings every 2 seconds
    const { data: sightings } = useQuery({
        queryKey: ['sightings', 'feed', startDate, endDate, locationId],
        queryFn: () => getSightings({
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            locationId: locationId || undefined
        }),
        refetchInterval: 2000,
    });

    console.log('AlertFeed Debug:', { sightings });

    // Update alerts when new sightings arrive
    const alerts = React.useMemo(() => {
        if (!sightings) return [];
        console.log('Processing sightings:', sightings.length);


        return sightings.slice(0, 20).map((sighting: Sighting) => {
            let severity: 'critical' | 'warning' | 'safe' = 'safe';
            let message = 'LOGGED';

            // Determine severity based on category keywords
            if (sighting.hotlist_category) {
                const category = sighting.hotlist_category.toLowerCase();
                if (category === 'danger') {
                    severity = 'critical';
                } else if (category === 'banned') {
                    severity = 'warning';
                } else if (category === 'info') {
                    severity = 'safe';
                }
                message = sighting.hotlist_category.toUpperCase();
            }

            return {
                id: sighting.id,
                plate: sighting.plate_number,
                timestamp: new Date(sighting.timestamp).toLocaleTimeString('en-US', { hour12: false }),
                severity,
                camera: sighting.location_id,
                message,
            };
        });
    }, [sightings]);

    return (
        <div className="w-full h-full bg-surface/90 backdrop-blur-md border border-structure rounded-lg overflow-hidden flex flex-col font-sans">
            {/* Header */}
            <div className="bg-void/50 p-3 border-b border-structure flex justify-between items-center">
                <h3 className="text-neon-cyan font-bold tracking-widest uppercase text-sm">
                    <span className="mr-2">///</span>Alert Log
                </h3>
                <div className="flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-alert-critical animate-pulse"></span>
                    <span className="text-xs text-cool-grey font-mono">LIVE FEED</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-void/30 p-2 border-b border-structure flex gap-2 flex-wrap">
                <select
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="bg-void border border-structure text-cool-grey text-xs rounded p-1 outline-none focus:border-neon-cyan flex-1 min-w-[120px]"
                >
                    <option value="">All Locations</option>
                    {Object.entries(ENTRANCES).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-void border border-structure text-cool-grey text-xs rounded p-1 outline-none focus:border-neon-cyan"
                    placeholder="Start Date"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-void border border-structure text-cool-grey text-xs rounded p-1 outline-none focus:border-neon-cyan"
                    placeholder="End Date"
                />
            </div>

            {/* Feed List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide">
                {alerts.map((alert) => {
                    const alertColor = getCategoryColor(alert.message);
                    return (
                        <div
                            key={alert.id}
                            style={{ '--pulse-color': alertColor } as React.CSSProperties}
                            className={`
                                relative flex items-center p-2 rounded bg-void/40 transition-all duration-300
                                ${alert.severity === 'critical' || alert.severity === 'warning' ? 'animate-[pulse-dynamic_2s_infinite]' : ''}
                                hover:bg-surface hover:shadow-glow hover:translate-x-1
                            `}
                        >
                            {/* Colored Border Strip */}
                            <div
                                className="absolute left-0 top-0 bottom-0 w-1 rounded-l"
                                style={{ backgroundColor: alertColor }}
                            />

                            {/* Severity Indicator Icon */}
                            <div className="mr-3 ml-2">
                                {alert.severity === 'critical' && <span className="text-lg" style={{ color: alertColor }}>⚠</span>}
                                {alert.severity === 'warning' && <span className="text-lg" style={{ color: alertColor }}>!</span>}
                                {alert.severity === 'safe' && <span className="text-lg" style={{ color: alertColor }}>✓</span>}
                            </div>

                            {/* Content */}
                            <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                                {/* Plate */}
                                <div className="col-span-3">
                                    <div className="bg-black text-white font-mono font-bold px-2 py-0.5 rounded text-center text-sm border border-gray-700">
                                        {alert.plate}
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="col-span-5">
                                    <span
                                        className="text-sm font-bold tracking-wide"
                                        style={{ color: alertColor }}
                                    >
                                        {alert.message}
                                    </span>
                                </div>

                                {/* Meta */}
                                <div className="col-span-4 text-right flex flex-col">
                                    <span className="text-xs text-neon-cyan font-mono">{alert.camera}</span>
                                    <span className="text-[10px] text-cool-grey font-mono opacity-70">{alert.timestamp}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AlertFeed;
