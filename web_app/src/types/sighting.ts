export interface Sighting {
    id: string;
    plate_number: string;
    timestamp: string;
    location_id: string;
    is_hot?: boolean;
    hotlist_category?: string;
    vehicle_make?: string;
    vehicle_model?: string;
    vehicle_color?: string;
    direction?: string;
    created_at: string;
}
