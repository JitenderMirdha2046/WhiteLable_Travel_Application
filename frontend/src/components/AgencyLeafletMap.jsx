import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const agencyIcon = L.divIcon({
  className: '',
  html: `<div style="background:#ef4444;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);width:26px;height:26px;box-shadow:0 2px 8px rgba(0,0,0,.4)"><div style="position:absolute;top:7px;left:7px;width:8px;height:8px;background:#fff;border-radius:50%"></div></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -26],
})

const userIcon = L.divIcon({
  className: '',
  html: `<div style="background:#3b82f6;border:3px solid #fff;border-radius:50%;width:22px;height:22px;box-shadow:0 2px 8px rgba(0,0,0,.4)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -11],
})

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function AgencyLeafletMap({ agency, userLocation }) {
  const center = [agency.latitude, agency.longitude]
  const distance = userLocation
    ? haversineKm(agency.latitude, agency.longitude, userLocation[0], userLocation[1])
    : null

  const distanceText = distance == null
    ? null
    : distance < 1
      ? `${Math.round(distance * 1000)} m`
      : `${distance.toFixed(1)} km`

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle center={center} radius={600} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.12 }} />
      <Marker position={center} icon={agencyIcon}>
        <Popup>
          <div className="text-sm" style={{ fontFamily: 'inherit' }}>
            <strong>{agency.name || 'Our Agency'}</strong>
            {agency.address && <div style={{ color: '#555', fontSize: 12, marginTop: 2 }}>{agency.address}</div>}
            {distanceText && (
              <div style={{ color: '#0d9488', fontSize: 12, marginTop: 4 }}>
                {distanceText} from you
              </div>
            )}
          </div>
        </Popup>
      </Marker>
      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <div className="text-sm" style={{ fontFamily: 'inherit' }}>
              <strong>You are here</strong>
              {distanceText && <div style={{ color: '#555', fontSize: 12, marginTop: 2 }}>{distanceText} from the agency</div>}
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
