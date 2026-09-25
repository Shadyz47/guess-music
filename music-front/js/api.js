const API_URL = "http://localhost:8086";

export async function getSongs(genre) {
  const params = new URLSearchParams({ genre });
  const response = await fetch(`${API_URL}/api/songs?${params}`);

  if (!response.ok) {
    throw new Error(`Không thể lấy danh sách bài hát: ${response.status}`);
  }

  return await response.json();
}

export function createAudioUrl(audioUrl) {
  return `${API_URL}${audioUrl}`;
}

export function createImageUrl(imageUrl) {
  return new URL(imageUrl, API_URL).href;
}
