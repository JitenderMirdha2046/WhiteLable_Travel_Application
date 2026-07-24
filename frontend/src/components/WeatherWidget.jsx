import { useState, useEffect } from 'react'
import { FiSun, FiCloud, FiCloudRain, FiCloudSnow, FiWind, FiLoader } from 'react-icons/fi'
import { getWeather } from '../api/weatherApi'

const weatherIcons = {
  sun: FiSun,
  cloud: FiCloud,
  rain: FiCloudRain,
  snow: FiCloudSnow,
  wind: FiWind,
}

export default function WeatherWidget({ destination, compact }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!destination) return
    setLoading(true)
    setError(null)
    getWeather(destination)
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [destination])

  if (!destination) return null

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
        <FiLoader className="w-4 h-4 animate-spin" />
        Loading weather...
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
        Weather unavailable
      </div>
    )
  }

  if (!data) return null

  const summary = data.summary || ''
  const hasTemp = summary.includes('°C')

  return (
    <div className={`flex items-start gap-2 ${compact ? 'text-xs' : 'text-sm'} text-gray-300`}>
      <FiSun className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-yellow-400 flex-shrink-0 mt-0.5`} />
      <div>
        {compact ? (
          <span className="text-gray-400">{summary}</span>
        ) : (
          <>
            <span className="font-medium text-white block mb-0.5">Weather in {destination}</span>
            <span className="text-gray-400">{summary}</span>
          </>
        )}
      </div>
    </div>
  )
}
