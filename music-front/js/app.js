import { getSongs } from "./api.js";
import {
  playSong,
  showMessage,
  stopSong,
  pauseSong,
  resumeSong,
  getSongCurrentTime,
} from "./ui.js";

const guessForm = document.querySelector("#guess-form");
const guessInput = document.querySelector("#guess-input");
const guessButton = document.querySelector("#guess-button");

const nextButton = document.querySelector("#next-button");
const skipButton = document.querySelector("#skip-button");
const listenMoreButton = document.querySelector("#listen-more-button");

const scoreElement = document.querySelector("#score");
const listenStatusElement = document.querySelector("#listen-status");

const LISTEN_END_TIMES = [3, 10, 15, Infinity]; // Thời gian nghe nhạc (giây) cho mỗi lượt nghe
const ROUND_SCORES = [4, 3, 2, 1]; // Điểm số tương ứng với lượt nghe

const gameState = {
  songs: [],
  playlist: [],
  currentSongIndex: -1,
  currentSong: null,
  score: 0,
  answered: false,

  listenLevel: 0, // Mức nghe hiện tại (0, 1, 2, 3)
  audioMonitorId: null, // ID của setInterval để theo dõi thời gian nghe nhạc
  roundScore: 4,
};

//utils-----------------------------------------------------------------
function normalizeText(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ");
}

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

//initialize--------------------------------------------------------------
async function initializeApp() {
  try {
    showMessage("Đang tải danh sách bài hát...");

    gameState.songs = await getSongs();

    if (gameState.songs.length === 0) {
      showMessage("Chưa có bài hát nào");
      return;
    }

    //danh sach playlist random
    gameState.playlist = shuffleSongs(gameState.songs);

    showMessage(`Đã tải ${gameState.songs.length} bài hát. Nhấn Bắt đầu!`);

    nextButton.disabled = false;
  } catch (error) {
    console.error(error);
    showMessage("Không thể kết nối tới backend");
  }
}

//time--------------------------------------------------------------
function stopAudioMonitor() {
  if (gameState.audioMonitorId !== null) {
    clearInterval(gameState.audioMonitorId);
    gameState.audioMonitorId = null;
  }
}

function monitorAudioTime(endTime) {
  stopAudioMonitor();

  if (endTime === Infinity) {
    listenStatusElement.textContent = `Đang nghe cả bài: ${getSongCurrentTime().toFixed(1)}s`;
    listenMoreButton.textContent = "Đã mở toàn bộ bài";
    listenMoreButton.disabled = true;

    gameState.audioMonitorId = setInterval(() => {
      listenStatusElement.textContent = `Đang nghe cả bài: ${getSongCurrentTime().toFixed(1)}s`;
    }, 100);

    return;
  }

  listenStatusElement.textContent = `Thời gian nghe: ${Math.min(getSongCurrentTime(), endTime).toFixed(1)}s / ${endTime}s`;
  listenMoreButton.disabled = true;

  gameState.audioMonitorId = setInterval(() => {
    const currentTime = getSongCurrentTime();

    listenStatusElement.textContent = `Thời gian nghe: ${Math.min(currentTime, endTime).toFixed(1)}s / ${endTime}s`;

    if (currentTime >= endTime) {
      pauseSong();
      stopAudioMonitor();
      listenStatusElement.textContent = `Đã nghe đến ${endTime} giây`;
      updateListenMoreButton();
    }
  }, 100);
}

function updateListenMoreButton() {
  if (gameState.answered) {
    listenMoreButton.textContent = "Đã trả lời";
    listenMoreButton.disabled = true;
    return;
  }

  if (gameState.listenLevel === 0) {
    listenMoreButton.textContent = "Nghe thêm đến 10 giây";
    listenMoreButton.disabled = false;
    return;
  }

  if (gameState.listenLevel === 1) {
    listenMoreButton.textContent = "Nghe thêm đến 15 giây";
    listenMoreButton.disabled = false;
    return;
  }

  if (gameState.listenLevel === 2) {
    listenMoreButton.textContent = "Nghe cả bài";
    listenMoreButton.disabled = false;
    return;
  }

  listenMoreButton.textContent = "Đã mở toàn bộ bài";
  listenMoreButton.disabled = true;
}

async function startNextRound() {
  stopAudioMonitor();

  gameState.currentSongIndex++;

  if (gameState.currentSongIndex >= gameState.playlist.length) {
    finishGame();
    return;
  }

  gameState.currentSong =
    gameState.playlist[gameState.currentSongIndex];

  gameState.answered = false;
  gameState.listenLevel = 0;
  gameState.roundScore = ROUND_SCORES[0];

  guessInput.value = "";
  guessInput.disabled = false;
  guessButton.disabled = false;

  listenMoreButton.disabled = true;
  listenMoreButton.textContent = "Nghe thêm";
  skipButton.disabled = false;

  nextButton.disabled = true;
  nextButton.textContent = "Bài tiếp theo";

  showMessage(
    `Bài ${gameState.currentSongIndex + 1}/${gameState.playlist.length}`,
  );

  await playSong(gameState.currentSong);
  monitorAudioTime(LISTEN_END_TIMES[gameState.listenLevel]);

  guessInput.focus();
}

async function handleListenMore() {
  if (gameState.answered) {
    return;
  }

  if (gameState.listenLevel >= LISTEN_END_TIMES.length - 1) {
    return;
  }

  gameState.listenLevel++;
  gameState.roundScore = ROUND_SCORES[gameState.listenLevel];

  listenMoreButton.disabled = true;

  await resumeSong();

  const endTime = LISTEN_END_TIMES[gameState.listenLevel];
  monitorAudioTime(endTime);
}

function handleSkipSong() {
  if (!gameState.currentSong || gameState.answered) {
    return;
  }

  gameState.answered = true;

  stopAudioMonitor();
  stopSong();

  showMessage(`Bạn đã bỏ qua. Đáp án là "${gameState.currentSong.title}"`);

  guessInput.disabled = true;
  guessButton.disabled = true;
  listenMoreButton.disabled = true;
  skipButton.disabled = true;
  nextButton.disabled = false;
}


//Game logic--------------------------------------------------------------

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
  stopAudioMonitor();
  stopSong();

  //logic check answer
  if (userAnswer === correctAnswer) {
    gameState.score += gameState.roundScore;
    showMessage(`Chính xác! Đây là "${gameState.currentSong.title}"`);
  } else {
    showMessage(`Chưa đúng. Đáp án là "${gameState.currentSong.title}"`);
  }

  scoreElement.textContent = `Điểm: ${gameState.score}`;

  listenMoreButton.disabled = true;
  skipButton.disabled = true;

  guessInput.disabled = true;
  guessButton.disabled = true;
  nextButton.disabled = false;
}

function finishGame() {
  stopAudioMonitor();
  stopSong();

  listenMoreButton.disabled = true;
  skipButton.disabled = true;

  showMessage(
    `Hoàn thành! Bạn đoán đúng ${gameState.score}/${gameState.playlist.length} bài.`,
  );

  guessInput.disabled = true;
  guessButton.disabled = true;
  nextButton.disabled = true;
}

listenMoreButton.addEventListener("click", handleListenMore);
skipButton.addEventListener("click", handleSkipSong);

guessForm.addEventListener("submit", checkAnswer);
nextButton.addEventListener("click", startNextRound);

initializeApp();
