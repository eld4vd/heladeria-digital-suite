// src/config/constants.ts
export const IS_DEMO_MODE = import.meta.env.MODE === 'production' && !import.meta.env.VITE_API_URL;

export const API_BASE_URL = IS_DEMO_MODE 
  ? '' // No hacer llamadas en demo
  : import.meta.env.VITE_API_URL || 'http://localhost:3000';
