import axios from 'axios'

const api = axios.create({
  baseURL: '/api/ai/weather',
  headers: { 'Content-Type': 'application/json' },
})

export const getWeather = (destination) =>
  api.get('', { params: { destination } }).then((res) => res.data)
