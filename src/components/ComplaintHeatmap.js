import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Fix for default Leaflet marker icons if we were using markers (good practice to include)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const containerStyle = {
    width: '100%',
    height: '600px', // Increased height for better view
    borderRadius: '12px',
    overflow: 'hidden',
    marginTop: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    position: 'relative',
    zIndex: 0 // Ensure it doesn't overlap incorrectly
};

// Default center (New Delhi)
const defaultCenter = [28.6139, 77.2090];

// Internal component to handle the Heatmap Layer logic
function HeatmapLayer({ data }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !data || data.length === 0) return;

        // Transform data to Leaflet heat format: [lat, lng, intensity]
        const heatPoints = data.map(point => [
            point.lat,
            point.lng,
            point.intensity
        ]);

        const heat = L.heatLayer(heatPoints, {
            radius: 25, // Restore for better precision with markers
            blur: 15,   // Restore for clearer distinction
            maxZoom: 18, // Standard intensity scaling
            max: 3.0, // Max intensity
            gradient: {
                0.4: 'blue',
                0.6: 'cyan',
                0.7: 'lime',
                0.8: 'yellow',
                1.0: 'red'
            }
        }).addTo(map);

        return () => {
            map.removeLayer(heat);
        };
    }, [map, data]);

    return null;
}

// Internal component to fit map bounds to data
function FitBounds({ data }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !data || data.length === 0) return;

        const bounds = L.latLngBounds(data.map(p => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 20 });
    }, [map, data]);

    return null;
}

export default function ComplaintHeatmap({ complaints }) {
    // Transform complaints into heatmap data points
    const heatmapData = useMemo(() => {
        return complaints
            .filter(c => c.location && c.location.latitude && c.location.longitude)
            .map(c => ({
                lat: c.location.latitude,
                lng: c.location.longitude,
                intensity: c.priority === 'urgent' ? 3 : c.priority === 'high' ? 2 : 1, // Weight by priority
                // Pass full complaint data for the marker
                original: c
            }));
    }, [complaints]);

    // Debugging
    console.log("Leaflet Heatmap Data:", heatmapData);

    return (
        <div style={containerStyle}>
            {heatmapData.length === 0 && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                    background: 'rgba(255,255,255,0.9)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                }}>
                    <strong>No location data found</strong>
                    <p style={{ margin: '5px 0 0', fontSize: '0.9em', color: '#666' }}>
                        Make sure your complaints have valid latitude/longitude coordinates.
                    </p>
                </div>
            )}

            <MapContainer
                center={defaultCenter}
                zoom={11}
                maxZoom={22}
                style={{ height: '100%', width: '100%' }}
            >
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Street Map">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            maxNativeZoom={19}
                            maxZoom={22}
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="Satellite (Esri)">
                        <TileLayer
                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                            url="https://server.arcgisonline.com/ArcGis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            maxNativeZoom={18}
                            maxZoom={22}
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {heatmapData.length > 0 && (
                    <>
                        <HeatmapLayer data={heatmapData} />
                        <FitBounds data={heatmapData} />
                        {/* Markers restored for exact location visibility */}
                        {heatmapData.map((item, index) => (
                            <Marker
                                key={index}
                                position={[item.lat, item.lng]}
                            >
                                <Popup>
                                    <div style={{ minWidth: '150px' }}>
                                        <h4 style={{ margin: '0 0 5px', color: '#333' }}>{item.original.title}</h4>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                                            <strong>Status:</strong> {item.original.status}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            <strong>Priority:</strong> {item.original.priority}
                                        </div>
                                        <p style={{ margin: '8px 0 0', fontSize: '13px' }}>
                                            {item.original.description.substring(0, 50)}...
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </>
                )}
            </MapContainer>
        </div>
    );
}
