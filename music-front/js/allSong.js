import { getAllSongs, createImageUrl, deleteSong, updateSong } from "./api.js";

const list = document.querySelector("#all-songs-list");
const template = document.querySelector("#song-template");
const search = document.querySelector("#song-search");
const genreFilter = document.querySelector("#genre-filter");
const count = document.querySelector("#song-count");
const state = document.querySelector("#list-state");
const message = document.querySelector("#list-message");

const editModal = document.querySelector("#edit-modal");
const editForm = document.querySelector("#edit-form");
const editTitle = document.querySelector("#edit-title");
const editArtist = document.querySelector("#edit-artist");
const editGenre = document.querySelector("#edit-genre");
const cancelEdit = document.querySelector("#cancel-edit");
const saveButton = editForm.querySelector('button[type="submit"]');

const retryButton = document.querySelector("#retry-button");

let songs = [];

let editingSongId = null;
let isSaving = false;

function openEditModal(song) {
  editingSongId = song.id;

  editTitle.value = song.title ?? "";
  editArtist.value = song.artist ?? "";
  editGenre.value = song.genre ?? "";

  editModal.showModal();
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

function renderSongs() {
  const query = normalize(search.value.trim());

  const filtered = songs.filter(
    (song) =>
      (!genreFilter.value || song.genre === genreFilter.value) &&
      normalize(`${song.title ?? ""} ${song.artist ?? ""}`).includes(query),
  );

  const fragment = document.createDocumentFragment();

  filtered.forEach((song, index) => {
    const row = template.content.cloneNode(true);
    row.querySelector(".song-number").textContent = String(index + 1).padStart(
      2,
      "0",
    );

    row.querySelector(".song-title").textContent =
      song.title || "Chưa có tên bài hát";
    row.querySelector(".song-artist").textContent =
      song.artist || "Chưa rõ ca sĩ";
    row.querySelector(".song-genre").textContent =
      song.genre || "Chưa phân loại";

    if (song.image_url) {
      try {
        const url = createImageUrl(song.image_url);
        if (["http:", "https:"].includes(new URL(url).protocol)) {
          const image = document.createElement("img");
          image.alt = "";
          image.loading = "lazy";
          image.addEventListener("error", () => image.remove(), { once: true });
          image.src = url;
          row.querySelector(".song-cover").append(image);
        }
      } catch {}
    }

    const deleteButton = row.querySelector(".delete-button");

    deleteButton.addEventListener("click", async () => {
      if (!confirm(`Bạn có chắc muốn xóa "${song.title}"?`)) {
        return;
      }

      deleteButton.disabled = true;

      try {
        await deleteSong(song.id);

        songs = songs.filter((item) => item.id !== song.id);
        renderSongs();
      } catch (error) {
        alert(error.message);
        deleteButton.disabled = false;
      }
    });

    const editButton = row.querySelector(".edit-button");

    editButton.addEventListener("click", () => {
      openEditModal(song);
    });

    fragment.append(row);
  });

  list.replaceChildren(fragment);

  count.textContent =
    filtered.length === songs.length
      ? `${songs.length} bài hát`
      : `${filtered.length} / ${songs.length} bài hát`;

  state.hidden = filtered.length > 0;

  message.textContent =
    songs.length === 0
      ? "Thư viện chưa có bài hát. Hãy thêm bài hát đầu tiên!"
      : "Không tìm thấy bài hát. Hãy thử từ khóa hoặc thể loại khác.";
}

async function loadSongs() {
  list.setAttribute("aria-busy", "true");

  state.hidden = false;
  retryButton.hidden = true;
  search.disabled = true;
  genreFilter.disabled = true;
  message.textContent = "Đang tải danh sách bài hát…";

  try {
    const data = await getAllSongs();

    if (!Array.isArray(data)) throw new Error("Danh sách bài hát không hợp lệ");

    songs = data.filter((song) => song && typeof song === "object");

    genreFilter.replaceChildren(new Option("Tất cả thể loại", ""));

    [...new Set(songs.map((song) => song.genre).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "vi"))
      .forEach((genre) => genreFilter.add(new Option(genre, genre)));

    search.disabled = false;
    genreFilter.disabled = false;

    renderSongs();
  } catch (error) {
    message.textContent =
      "Không thể tải danh sách bài hát. Hãy kiểm tra kết nối và thử lại.";

    retryButton.hidden = false;
    console.error("Không thể tải thư viện:", error);
  } finally {
    list.setAttribute("aria-busy", "false");
  }
}

editForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isSaving || editingSongId === null) return;

  //gui requestBody về backend
  const songInfo = {
    title: editTitle.value.trim(),
    artist: editArtist.value.trim(),
    genre: editGenre.value.trim(),
  };

  if (!songInfo.title || !songInfo.artist || !songInfo.genre) {
    alert("Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  isSaving = true;
  saveButton.disabled = true;
  cancelEdit.disabled = true;

  try {
    await updateSong(editingSongId, songInfo);

    // Chỉ đóng modal khi API lưu thành công.
    editModal.close();

    // Tải lại danh sách và các lựa chọn thể loại.
    await loadSongs();
  } catch (error) {
    // Lưu lỗi thì giữ modal để người dùng sửa hoặc thử lại.
    alert(error.message);
  } finally {
    isSaving = false;
    saveButton.disabled = false;
    cancelEdit.disabled = false;
  }
});

cancelEdit.addEventListener("click", () => {
  if (!isSaving) editModal.close();
});

editModal.addEventListener("cancel", (event) => {
  if (isSaving) event.preventDefault();
});

editModal.addEventListener("close", () => {
  editingSongId = null;
  editForm.reset();
});

search.addEventListener("input", renderSongs);
genreFilter.addEventListener("change", renderSongs);
retryButton.addEventListener("click", loadSongs);
loadSongs();
