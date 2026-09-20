import { getSongs } from "./api.js";
import { playSong, showMessage, stopSong } from "./ui.js";

const guessForm = document.querySelector("#guess-form");
const guessInput = document.querySelector("#guess-input");
const guessButton = document.querySelector("#guess-button");
const nextButton = document.querySelector("#next-button");
const scoreElement = document.querySelector("#score");
const timerElement = document.querySelector("#timer");

const ROUND_TIME = 15;

const gameState = {
  songs: [],
  playlist: [],
  currentSongIndex: -1,
  currentSong: null,
  score: 0,
  answered: false,

  remainingTime: ROUND_TIME,
  timerId: null,
};

function shuffleSongs(songs) {
  const shuffledSongs = [...songs];

  // Thuật toán Fisher-Yates.
  for (let index = shuffledSongs.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffledSongs[index], shuffledSongs[randomIndex]] = [
      shuffledSongs[randomIndex],
      shuffledSongs[index],
    ];
  }

  return shuffledSongs;
}

async function initializeApp() {
  try {
    showMessage("Đang tải danh sách bài hát...");

    gameState.songs = await getSongs();

    if (gameState.songs.length === 0) {
      showMessage("Chưa có bài hát nào");
      return;
    }

    // Tạo danh sách đã xáo trộn để một bài không xuất hiện hai lần.
    gameState.playlist = shuffleSongs(gameState.songs);

    showMessage(`Đã tải ${gameState.songs.length} bài hát. Nhấn Bắt đầu!`);

    nextButton.disabled = false;
  } catch (error) {
    console.error(error);
    showMessage("Không thể kết nối tới backend");
  }
}

function startNextRound() {
  gameState.currentSongIndex++;

  if (gameState.currentSongIndex >= gameState.playlist.length) {
    finishGame();
    return;
  }

  gameState.currentSong = gameState.playlist[gameState.currentSongIndex];

  gameState.answered = false;

  guessInput.value = "";
  guessInput.disabled = false;
  guessButton.disabled = false;
  nextButton.disabled = true;
  nextButton.textContent = "Bài tiếp theo";

  showMessage(
    `Bài ${gameState.currentSongIndex + 1}/${gameState.playlist.length}`,
  );

  playSong(gameState.currentSong);
  guessInput.focus();
}

function checkAnswer(event) {
  event.preventDefault();

  if (!gameState.currentSong || gameState.answered) {
    return;
  }

  const userAnswer = normalizeText(guessInput.value);
  const correctAnswer = normalizeText(gameState.currentSong.title);

  if (userAnswer === "") {
    showMessage("Bạn chưa nhập tên bài hát");
    return;
  }

  gameState.answered = true;
  stopSong();

  if (userAnswer === correctAnswer) {
    gameState.score++;
    showMessage(`Chính xác! Đây là "${gameState.currentSong.title}"`);
  } else {
    showMessage(`Chưa đúng. Đáp án là "${gameState.currentSong.title}"`);
  }

  scoreElement.textContent = `Điểm: ${gameState.score}`;
  guessInput.disabled = true;
  guessButton.disabled = true;
  nextButton.disabled = false;
}

function normalizeText(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ");
}

function finishGame() {
  stopSong();

  showMessage(
    `Hoàn thành! Bạn đoán đúng ${gameState.score}/${gameState.playlist.length} bài.`,
  );

  guessInput.disabled = true;
  guessButton.disabled = true;
  nextButton.disabled = true;
}

guessForm.addEventListener("submit", checkAnswer);
nextButton.addEventListener("click", startNextRound);

initializeApp();
