import { useEffect, useState } from 'react';
import axios, { API, auth } from '../api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


const createIcon = (color) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

export default function MapView() {
  const [bins, setBins] = useState([]);

  useEffect(() => {
    const f = async () => {
      try { const res = await axios.get(`${API}/dashboard`, auth()); setBins(res.data.bins); } catch (e) { console.error(e); }
    };
    f(); const t = setInterval(f, 10000); return () => clearInterval(t);
  }, []);

  const center = bins.length > 0 ? [bins[0].latitude, bins[0].longitude] : [28.6139, 77.2090];

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col">
      <h1 className="text-2xl font-bold">Map View</h1>
      
      <div className="flex gap-4">
        {['Normal (<50%)', 'Warning (50-80%)', 'Critical (>80%)'].map((label, i) => {
          const colors = ['#10b981', '#f59e0b', '#ef4444'];
          return (
            <div key={label} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i] }}></span>
              {label}
            </div>
          );
        })}
      </div>

      <div className="card flex-1 overflow-hidden z-0 p-0">
        <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {bins.map(bin => {
            const color = bin.level >= 80 ? '#ef4444' : bin.level >= 50 ? '#f59e0b' : '#10b981';
            return (
              <Marker key={bin.id} position={[bin.latitude, bin.longitude]} icon={createIcon(color)}>
                <Popup>
                  <div className="text-sm">
                    <strong>{bin.name}</strong><br/>
                    {bin.location}<br/>
                    Fill Level: {bin.level}%
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
