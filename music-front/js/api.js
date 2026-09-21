const API_URL = "http://localhost:8085";

export async function getSongs() {
  const response = await fetch(`${API_URL}/api/songs`);

  console.log(response);

  if (!response.ok) {
    throw new Error(`Không thể lấy danh sách bài hát: ${response.status}`);
  }

  return response.json();
}

export function createAudioUrl(audioUrl) {
  return `${API_URL}${audioUrl}`;
}
