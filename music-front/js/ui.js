import { createAudioUrl } from "./api.js";

const messageElement = document.querySelector("#message");
const audioPlayer = document.querySelector("#audio-player");

export function showMessage(message) {
  messageElement.textContent = message;
}

export async function playSong(song) {
  audioPlayer.src = createAudioUrl(song.audio_url);
  audioPlayer.load();

  try {
    await audioPlayer.play();
  } catch (error) {
    console.error("Không thể phát nhạc:", error);
    showMessage("Hãy nhấn nút phát trên trình nghe nhạc");
  }
}

export function stopSong() {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
}

export function pauseSong() {
  audioPlayer.pause();
}

export async function resumeSong() {
  try {
    await audioPlayer.play();
  }
  catch (error) {
    console.error("Không thể phát nhạc:", error);
    showMessage("cant not play");
  }
}

export function getSongCurrentTime() {
  return audioPlayer.currentTime;
}