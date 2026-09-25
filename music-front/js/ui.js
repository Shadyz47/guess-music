import { createAudioUrl } from "./api.js";

const messageElement = document.querySelector("#message");
const audioPlayer = document.querySelector("#audio-player");

export function showMessage(message) {
  messageElement.classList.remove("color-red");
  messageElement.classList.remove("color-blue");
  messageElement.classList.remove("color-yellow");
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
  audioPlayer.currentTime = 0; //lần phát tiếp từ đầu -- key
}

export function pauseSong() {
  audioPlayer.pause();
}

export async function resumeSong() {
  try {
    await audioPlayer.play(); //tiếp tục phát từ currentTime hiện tại
  }
  catch (error) {
    console.error("Không thể phát nhạc:", error);
    showMessage("cant not play");
  }
}

export function replaySong() {
  audioPlayer.pause();
  audioPlayer.currentTime = 0; //phát lại từ giây 0
  return resumeSong();
}

export function getSongCurrentTime() {
  return audioPlayer.currentTime;
}
