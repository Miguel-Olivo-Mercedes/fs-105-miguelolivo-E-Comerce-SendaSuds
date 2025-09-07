import axios from 'axios'

export const API_BASE   = import.meta.env.VITE_API_BASE   || 'http://localhost:5000/api'
export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_BASE,
})
