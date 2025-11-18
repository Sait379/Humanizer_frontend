// src/config/api.js
const BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8000";

export async function apiClient(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body,
    mode: "cors",
  };

  const response = await fetch(url, config);

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

