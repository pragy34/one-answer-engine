const API_BASE_RAW = import.meta?.env?.VITE_API_BASE;

export const API_BASE =
  typeof API_BASE_RAW === 'string'
    ? API_BASE_RAW.trim()
    : window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://127.0.0.1:8000'
      : '';
