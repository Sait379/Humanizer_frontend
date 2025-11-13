// src/services/humanizerService.js
import { apiClient } from "../config/api";

export async function humanizeText(text, tone) {
  const body = { text, tone };

  const data = await apiClient("/api/v1/humanize", {
    method: "POST",
    body: JSON.stringify(body),
  });

  // Adjust to your backend response key
  return data?.humanized_text || data?.output || data?.result || data?.text;
}
