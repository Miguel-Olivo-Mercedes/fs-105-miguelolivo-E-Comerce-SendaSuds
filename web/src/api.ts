import axios from 'axios'
export const API_BASE = import.meta.env.VITE_API_BASE as string
export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN as string
export const api = axios.create({ baseURL: API_BASE })
