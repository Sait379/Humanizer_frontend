// src/config/api.js
const BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8000";

export async function apiClient(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const config = {
    method: "GET",
    headers: { ...defaultHeaders, ...options.headers },
    ...options,
  };

  const response = await fetch(url, config);

  // Handle HTTP errors gracefully
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData?.detail) message = errorData.detail;
    } catch (_) {}
    throw new Error(message);
  }

  return response.json();
}
