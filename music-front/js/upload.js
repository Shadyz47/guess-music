import { addSong } from "./api.js";

const form = document.querySelector("#upload-form");
const button = document.querySelector("#upload-button");
const status = document.querySelector("#upload-status");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  button.disabled = true;
  status.textContent = "Đang tải bài hát lên...";

  try {
    const song = await addSong(new FormData(form));
    status.textContent = `Đã thêm bài hát “${song.title}”.`;
    alert(`Đã thêm bài hát “${song.title}”.`);
    form.reset();
    
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
