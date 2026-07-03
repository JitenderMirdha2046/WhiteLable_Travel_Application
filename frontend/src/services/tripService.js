import { DEMO_MODE, MOCK_TRIPS } from '../demo/config'

let localTrips = [...MOCK_TRIPS]

class TripService {
  async create(data) {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 1200))
      const newTrip = {
        id: 'trip-' + Date.now(),
        userId: 'demo-user-001',
        destination: data.destination,
        budget: data.budget,
        days: data.days,
        travelType: data.travelType,
        moodDescription: data.moodDescription || '',
        tripStatus: 'GENERATING',
        status: 'ACTIVE',
        cacheUsed: false,
        weatherSummary: '',
        totalEstimatedCost: 0,
        createdAt: new Date().toISOString(),
        itinerary: `Day 1: Arrival at ${data.destination} - Check into hotel - Local exploration
Day 2: Full day sightseeing - Main attractions and landmarks
Day 3: Adventure activities - Local cuisine tasting - Shopping
Day 4: Visit hidden gems - Sunset point - Beach/park relaxation
Day 5: Departure - Souvenir shopping`,
        budgetBreakdown: {
          hotelCost: data.budget * 0.4,
          foodCost: data.budget * 0.2,
          transportCost: data.budget * 0.2,
          activityCost: data.budget * 0.15,
          miscCost: data.budget * 0.05,
        },
      }
      localTrips.unshift(newTrip)
      return { tripId: newTrip.id, status: newTrip.tripStatus }
    }
    const { createTrip } = await import('../api/tripApi')
    const res = await createTrip(data)
    return res.data
  }

  async getAll() {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 500))
      return [...localTrips]
    }
    const { getUserTrips } = await import('../api/tripApi')
    const res = await getUserTrips()
    return res.data
  }

  async search(keyword) {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 400))
      const kw = keyword.toLowerCase()
      return localTrips.filter(t =>
        t.destination?.toLowerCase().includes(kw) ||
        t.travelType?.toLowerCase().includes(kw) ||
        (t.moodDescription || '').toLowerCase().includes(kw) ||
        (t.itinerary || '').toLowerCase().includes(kw)
      )
    }
    const { searchTrips } = await import('../api/tripApi')
    const res = await searchTrips(keyword)
    return res.data
  }

  async getById(id) {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 400))
      const trip = localTrips.find((t) => t.id === id)
      if (!trip) throw new Error('Trip not found')
      return { ...trip }
    }
    const { getTripById } = await import('../api/tripApi')
    const res = await getTripById(id)
    return res.data
  }

  async getStatus(id) {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 200))
      const trip = localTrips.find((t) => t.id === id)
      if (!trip) throw new Error('Trip not found')
      return { tripId: trip.id, tripStatus: 'COMPLETED', status: 'ACTIVE' }
    }
    const { getTripStatus } = await import('../api/tripApi')
    const res = await getTripStatus(id)
    return res.data
  }

  async getBudget(id) {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 200))
      const trip = localTrips.find((t) => t.id === id)
      if (!trip) throw new Error('Trip not found')
      return trip.budgetBreakdown || {
        hotelCost: trip.budget * 0.4,
        foodCost: trip.budget * 0.2,
        transportCost: trip.budget * 0.2,
        activityCost: trip.budget * 0.15,
        miscCost: trip.budget * 0.05,
      }
    }
    const { getTripBudget } = await import('../api/tripApi')
    const res = await getTripBudget(id)
    return res.data
  }

  async remove(id) {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 300))
      localTrips = localTrips.filter((t) => t.id !== id)
      return
    }
    const { deleteTrip } = await import('../api/tripApi')
    await deleteTrip(id)
  }

  async replan(data) {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 1500))
      const trip = localTrips.find((t) => t.id === data.tripId)
      if (trip) {
        trip.tripStatus = 'GENERATING'
        trip.itinerary += `\n\n[Re-planned: ${data.instruction}]`
      }
      return { tripId: data.tripId, tripStatus: 'GENERATING' }
    }
    const { replanTrip } = await import('../api/tripApi')
    const res = await replanTrip(data)
    return res.data
  }

  async compare(destination) {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 1000))
      return {
        destination,
        plans: [
          { type: 'BUDGET', itinerary: 'Budget-friendly plan with hostels, street food, and free attractions.' },
          { type: 'LUXURY', itinerary: 'Luxury experience with 5-star hotels, fine dining, and premium activities.' },
          { type: 'ADVENTURE', itinerary: 'Adventure-focused with hiking, camping, and extreme sports.' },
        ],
      }
    }
    const { compareTrips } = await import('../api/tripApi')
    const res = await compareTrips(destination)
    return res.data
  }

  async getCacheStats() {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 200))
      return { cachedTrips: 5, cacheHits: 42, cacheMisses: 8 }
    }
    const { getCacheStats } = await import('../api/tripApi')
    const res = await getCacheStats()
    return res.data
  }

  async getPopularDestinations() {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 300))
      return [
        { destination: 'Goa', count: 12 },
        { destination: 'Manali', count: 9 },
        { destination: 'Jaipur', count: 7 },
        { destination: 'Kerala', count: 6 },
        { destination: 'Ladakh', count: 5 },
      ]
    }
    const { getPopularDestinations } = await import('../api/tripApi')
    const res = await getPopularDestinations()
    return res.data
  }

  async getAdminAnalytics() {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 400))
      return {
        totalTrips: 42,
        cacheStats: { cachedTrips: 5, cacheHits: 42, cacheMisses: 8 },
        popularDestinations: [
          { destination: 'Goa', count: 12 },
          { destination: 'Manali', count: 9 },
          { destination: 'Jaipur', count: 7 },
        ],
        activeRateLimitBuckets: 3,
      }
    }
    const { getAdminAnalytics } = await import('../api/tripApi')
    const res = await getAdminAnalytics()
    return res.data
  }
}

export default new TripService()
