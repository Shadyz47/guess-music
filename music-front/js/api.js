const API_URL = "http://localhost:8086";

export async function getSongs(genre) {
  const params = new URLSearchParams({ genre });
  const response = await fetch(`${API_URL}/api/songs?${params}`);

  if (!response.ok) {
    throw new Error(`Không thể lấy danh sách bài hát: ${response.status}`);
  }

  return await response.json();
}

export async function getAllSongs(){
  const response = await fetch(`${API_URL}/api/songs`);

  if (!response.ok) {
    throw new Error(`Không thể lấy danh sách bài hát: ${response.status}`);
  }
  
  return await response.json();
}

export async function addSong(formData) {
  const response = await fetch(`${API_URL}/api/songs`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Không thể thêm bài hát: ${response.status}`);
  }

  return response.json();
}

export async function deleteSong(songId) {
  const response = await fetch(`${API_URL}/api/songs/${songId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Không thể xóa bài hát: ${response.status}`);
  }

  return alert("Đã xóa bài hát thành công");
}

export async function updateSong(songId, songInfo) {
  const response = await fetch(`${API_URL}/api/songs/${songId}`, {
    method: "PUT",
     headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(songInfo),
  });

  if(!response.ok) {
    throw new Error(`Không thể cập nhật bài hát: ${response.status}`);
  }

  return response.json();
}

export function createAudioUrl(audioUrl) {
  return `${API_URL}${audioUrl}`;
}

export function createImageUrl(imageUrl) {
  return new URL(imageUrl, API_URL).href;
}
