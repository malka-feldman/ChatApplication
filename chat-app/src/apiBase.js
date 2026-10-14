// Base URL for the backend API / SignalR hub.
// In the sandbox this is provided via VITE_API_URL; locally it falls back
// to the original development URL so existing behaviour is unchanged.
export const API_BASE = import.meta.env.VITE_API_URL || "https://localhost:7087";
