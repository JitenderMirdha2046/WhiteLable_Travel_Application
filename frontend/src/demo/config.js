export const DEMO_MODE = false

export const DEMO_USER = {
  id: 'demo-user-001',
  name: 'Demo Traveler',
  email: 'demo@travelplanner.com',
}

export const DEMO_JWT_TOKEN = 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJzdWIiOiAiZGVtby11c2VyLTAwMSIsICJlbWFpbCI6ICJkZW1vQHRyYXZlbHBsYW5uZXIuY29tIiwgIm5hbWUiOiAiRGVtbyBUcmF2ZWxlciJ9.demo-signature'

export const MOCK_TRIPS = [
  {
    id: 'trip-001',
    userId: 'demo-user-001',
    destination: 'Goa',
    budget: 25000,
    days: 4,
    travelType: 'Adventure',
    status: 'generated',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    itinerary: `Day 1: Arrival at Goa Airport - Check into North Goa beach resort - Evening at Baga Beach - Dinner at beach shack
Day 2: Morning at Calangute Beach - Afternoon water sports (parasailing, jet skiing) - Visit Fort Aguada - Sunset at Anjuna Flea Market - Night at Tito's Club
Day 3: Early morning drive to Dudhsagar Falls - Jeep safari through Bhagwan Mahavir Wildlife Sanctuary - Splash in natural pools - Return to hotel - Dinner at Fisherman's Wharf
Day 4: Morning at Candolim Beach - Explore Fontainhas Latin Quarter - Spice plantation tour - Departure`,
  },
  {
    id: 'trip-002',
    userId: 'demo-user-001',
    destination: 'Manali',
    budget: 35000,
    days: 5,
    travelType: 'Adventure',
    status: 'generated',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    itinerary: `Day 1: Arrival at Bhuntar Airport - Drive to Manali - Check-in - Evening walk at Mall Road - Dinner at German bakery
Day 2: Full day Solang Valley - Paragliding - Zorbing - Snow point - Cable car ride - Return to Manali
Day 3: Drive to Rohtang Pass (if open) - Snow activities - Photography - Back to Manali - Visit Hadimba Temple - Old Manali cafes
Day 4: Manali to Jogini Waterfall trek - Vashisht hot water springs - Visit Manu Temple - Shopping at Tibetan markets
Day 5: River rafting in Kullu - Visit Naggar Castle - Departure`,
  },
  {
    id: 'trip-003',
    userId: 'demo-user-001',
    destination: 'Jaipur',
    budget: 20000,
    days: 3,
    travelType: 'Cultural',
    status: 'generated',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    itinerary: `Day 1: Arrival in Jaipur - Check into heritage hotel - Visit Hawa Mahal - City Palace - Jantar Mantar - Evening at Chokhi Dhani
Day 2: Morning at Amber Fort - Elephant ride - Visit Jaigarh Fort - Afternoon at Jal Mahal - Albert Hall Museum - Shopping at Johari Bazaar
Day 3: Visit Birla Mandir - Nahargarh Fort for sunset view - Try traditional Rajasthani thali - Departure`,
  },
  {
    id: 'trip-004',
    userId: 'demo-user-001',
    destination: 'Kerala',
    budget: 40000,
    days: 6,
    travelType: 'Relaxation',
    status: 'generated',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    itinerary: `Day 1: Arrival at Kochi Airport - Visit Fort Kochi - Chinese fishing nets - Mattancherry Palace - Stay at houseboat
Day 2: Munnar hill station - Tea plantation tour - Eravikulam National Park - Tea museum - Camp at resort
Day 3: Munnar local sightseeing - Echo Point - Kundala Lake - Mattupetty Dam - Spice garden tour
Day 4: Drive to Thekkady - Periyar Wildlife Sanctuary - Boat safari on Periyar Lake - Ayurvedic massage
Day 5: Drive to Alleppey - Check into deluxe houseboat - Backwater cruise - Village life experience - Traditional Kerala dinner on boat
Day 6: Disembark from houseboat - Visit Kumarakom - Departure`,
  },
  {
    id: 'trip-005',
    userId: 'demo-user-001',
    destination: 'Ladakh',
    budget: 55000,
    days: 7,
    travelType: 'Adventure',
    status: 'generated',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    itinerary: `Day 1: Arrival at Leh airport - Acclimatization day - Rest at hotel - Evening walk around Leh Market
Day 2: Leh local sightseeing - Shanti Stupa - Leh Palace - Namgyal Tsemo Monastery - Magnetic Hill - Sangam (Indus & Zanskar confluence)
Day 3: Drive to Nubra Valley via Khardung La Pass (highest motorable road) - Double-humped camel ride at Hunder - Sand dunes
Day 4: Nubra to Pangong Tso - 5-hour scenic drive - Camp by the lake - Stunning sunset over the blue waters
Day 5: Pangong to Leh - Visit Hemis Monastery - Thiksey Monastery - Shey Palace
Day 6: Leh to Tso Moriri - Remote mountain lake - Bird watching - Camping overnight
Day 7: Drive back to Leh - Shopping for souvenirs - Departure`,
  },
  {
    id: 'trip-006',
    userId: 'demo-user-001',
    destination: 'Udaipur',
    budget: 22000,
    days: 3,
    travelType: 'Relaxation',
    status: 'generated',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    itinerary: `Day 1: Arrival in Udaipur - Check into lake-facing hotel - Visit City Palace - Boat ride on Lake Pichola - Evening at Ambrai Ghat
Day 2: Morning at Jag Mandir - Visit Sahelion-ki-Bari - Fateh Sagar Lake - Afternoon at Vintage Car Museum - Shopping at Hathi Pol - Sunset at Sajjangarh Monsoon Palace
Day 3: Visit Eklingji Temple - Nagda ruins - Bagore-ki-Haveli dance show - Departure`,
  },
  {
    id: 'trip-007',
    userId: 'demo-user-001',
    destination: 'Sikkim',
    budget: 30000,
    days: 5,
    travelType: 'Adventure',
    status: 'generated',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    itinerary: `Day 1: Arrival at Bagdogra Airport - Drive to Gangtok - Check-in - Evening at MG Marg - Try local momos
Day 2: Gangtok sightseeing - Tsomgo Lake - Baba Harbhajan Singh Mandir - Nathu La Pass - Return to Gangtok
Day 3: Gangtok to Pelling - 5-hour drive - View of Kanchenjunga - Visit Pemayangtse Monastery
Day 4: Pelling sightseeing - Khecheopalri Lake - Rimbi Waterfall - Darap Village walk - Hot stone bath
Day 5: Pelling to Namchi - Visit Sai Baba Temple - Tendong Hill - Departure`,
  },
]
