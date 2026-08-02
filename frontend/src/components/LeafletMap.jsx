import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const destinationCoords = {
  'Goa': [15.4909, 73.8278],
  'Manali': [32.2396, 77.1887],
  'Shimla': [31.1048, 77.1734],
  'Dharamshala': [32.2190, 76.3234],
  'Kasol': [32.0101, 77.3150],
  'Bir Billing': [32.0503, 76.7298],
  'Spiti Valley': [32.2460, 78.0110],
  'Jaipur': [26.9124, 75.7873],
  'Kerala': [10.8505, 76.2711],
  'Ladakh': [34.1526, 77.5771],
  'Udaipur': [24.5854, 73.7125],
  'Sikkim': [27.5330, 88.5122],
  'Andaman': [11.7401, 92.6586],
  'Delhi': [28.7041, 77.1025],
  'Mumbai': [19.0760, 72.8777],
  'Bangalore': [12.9716, 77.5946],
  'Chennai': [13.0827, 80.2707],
  'Kolkata': [22.5726, 88.3639],
  'Agra': [27.1767, 78.0081],
  'Varanasi': [25.3176, 82.9739],
  'Rishikesh': [30.0869, 78.2676],
}

const defaultCoords = [20.5937, 78.9629]

export default function LeafletMap({ destination }) {
  const center = destinationCoords[destination] || defaultCoords
  return (
    <div className="rounded-xl overflow-hidden h-64" style={{ zIndex: 0 }}>
      <MapContainer
        center={center}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>
            {destination}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
