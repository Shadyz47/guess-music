import { getSongs, createImageUrl } from "./api.js";
import {
  playSong,
  showMessage,
  stopSong,
  pauseSong,
  replaySong,
  resumeSong,
  getSongCurrentTime,
} from "./ui.js";

const guessForm = document.querySelector("#guess-form");
const guessInput = document.querySelector("#guess-input");

const guessButton = document.querySelector("#guess-button");
const nextButton = document.querySelector("#next-button");
const skipButton = document.querySelector("#skip-button");
const listenMoreButton = document.querySelector("#listen-more-button");
const replayButton = document.querySelector("#replay-button");
const genreButtons = document.querySelectorAll(".genre-button");
const resetGenreButton = document.querySelector(".reset-button");
const closeModalButton = document.querySelector(".close");
const retryButton = document.querySelector("#retry-button");

const scoreElement = document.querySelector("#score");
const listenStatusElement = document.querySelector("#listen-status");
const messageElement = document.querySelector("#message");
const songTitleElement = document.querySelector("#song-title");
const songArtistElement = document.querySelector("#song-artist");
const songGenreElement = document.querySelector("#song-genre");
const allSongsElement = document.querySelector("#all-songs-title");
const timeDownElement = document.querySelector("#time-down");
const finalScoreElement = document.querySelector("#final-score");
const modalElement = document.querySelector("#modal");

const volumeSlider = document.querySelector("#volume-slider");
const volumeValue = document.querySelector("#volume-value");

const audioPlayer = document.querySelector("#audio-player");

const gameContainer = document.querySelector("#game-container");
const allSongContainer = document.querySelector("#all-songs-container");

const allSongsList = document.querySelector("#all-songs-list");

//-----------------------------------------------------------------------
const LISTEN_END_TIMES = [3, 10, 18, Infinity]; // Thời gian nghe nhạc (giây) cho mỗi lượt nghe
const ROUND_SCORES = [4, 3, 2, 1]; // Điểm số tương ứng với lượt nghe
let nextSongTimer = null;

const gameState = {
  songs: [],
  playlist: [], //playlist đã được xáo trộn
  currentSongIndex: -1, //song hiện tại, đầu là -1
  currentSong: null,
  score: 0,
  answered: false, //nếu trả lời đúng or bỏ qua thì true, chưa trả lời false
  selectedGenre: null, // Thể loại nhạc đã chọn

  listenLevel: 0, // Mức nghe hiện tại (0: 3 giây, 1: 10 giây, 2: 18 giây, 3: cả bài)
  audioMonitorId: null, // ID cuẩ audio để setInterval để theo dõi thời gian nghe nhạc
  roundScore: 4,
};

//utils-----------------------------------------------------------------
function updateVolume() {
  audioPlayer.volume = Number(volumeSlider.value) / 100;
  volumeValue.value = `${volumeSlider.value}%`;
}

function normalizeText(value) {
  return value.trim().toLowerCase();
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

function displaySongInformation() {
  songTitleElement.textContent = `Tên bài hát: ${gameState.currentSong.title}`;
  songArtistElement.textContent = `Artist: ${gameState.currentSong.artist}`;
  songGenreElement.textContent = `Genre: ${gameState.currentSong.genre}`;
}

function resetSongInformation() {
  songTitleElement.textContent = "";
  songArtistElement.textContent = "";
  songArtistElement.classList.add("color-yellow");
  songGenreElement.textContent = "";
  songGenreElement.classList.add("color-purple");
}

function resetAllSongsContainer() {
  allSongContainer.hidden = true;
  allSongsList.replaceChildren();
  allSongsElement.textContent = "";
}


function scheduleNextSong() {
  resetScheduleNextSong();

  let seconds = 5;
  timeDownElement.textContent = `Next song in ${seconds}s`;
  nextSongTimer = setInterval(() => {
    seconds--;

    if (seconds <= 0) {

      resetScheduleNextSong();
      startNextRound();
      return;
    }

    timeDownElement.textContent = `Next song in ${seconds}s`;
  },1000);
}

function resetScheduleNextSong() {
  clearTimeout(nextSongTimer);
  nextSongTimer = null;
  timeDownElement.textContent = "";
}

function handleResetGenre() {
  stopAudioMonitor(); //dung bo dem thoi gian
  stopSong();
  resetSongInformation();
  resetScheduleNextSong();

  gameState.songs = [];
  gameState.playlist = [];
  gameState.currentSongIndex = -1;
  gameState.currentSong = null;
  gameState.score = 0;
  gameState.answered = false;
  gameState.listenLevel = 0;
  gameState.selectedGenre = null;
  gameState.roundScore = ROUND_SCORES[0];

  retryButton.hidden = true;

  gameContainer.hidden = true;
  allSongContainer.hidden = true;
  allSongsElement.textContent = "";
  allSongsList.replaceChildren();

  scoreElement.textContent = "Score: 0";
  listenStatusElement.textContent = "Mức nghe: --";
  nextButton.textContent = "Start";

  nextButton.disabled = true;
  skipButton.disabled = true;
  replayButton.disabled = true;
  listenMoreButton.disabled = true;

  genreButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.disabled = false;
  });

  showMessage("Chọn Vpop hoặc Jpop để bắt đầu");
}

//initialize--------------------------------------------------------------
async function selectGenre(genre) {
  gameContainer.hidden = true;
  retryButton.hidden = true;
  gameState.selectedGenre = genre;
  resetSongInformation();
  resetScheduleNextSong();
  resetAllSongsContainer();

  genreButtons.forEach((button) => {
    button.disabled = true;
  });
  nextButton.disabled = true;

  showMessage(`Đang tải bài hát ${genre}...`);

  try {
    gameState.songs = await getSongs(genre);
    gameState.playlist = shuffleSongs(gameState.songs);

    gameState.currentSongIndex = -1;
    gameState.currentSong = null;
    gameState.score = 0;
    scoreElement.textContent = "Score: 0";
    listenStatusElement.textContent = "Mức nghe: --";
    nextButton.textContent = "Start";

    genreButtons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.genre === genre),
      );
    });

    if (gameState.songs.length === 0) {
      showMessage(`Chưa có bài hát ${genre}`);
      return;
    }

    gameContainer.hidden = false;

    showMessage(
      `Loaded ${gameState.songs.length} bài hát ${genre}. Press to START!`,
    );

    nextButton.disabled = false;
  } catch (error) {
    console.error(error);
    showMessage("cant connect to Backend");
  } finally {
    genreButtons.forEach((button) => {
      button.disabled = false;
    });
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
    listenMoreButton.textContent = "Full song";
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
    listenMoreButton.textContent = "More";
    listenMoreButton.disabled = false;
    return;
  }

  if (gameState.listenLevel === 1) {
    listenMoreButton.textContent = "More";
    listenMoreButton.disabled = false;
    return;
  }

  if (gameState.listenLevel === 2) {
    listenMoreButton.textContent = "Full";
    listenMoreButton.disabled = false;
    return;
  }

  listenMoreButton.textContent = "Full song";
  listenMoreButton.disabled = true;
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

function handleReplay() {
  if (!gameState.currentSong || gameState.answered) return;

  stopAudioMonitor();
  replaySong();
  monitorAudioTime(LISTEN_END_TIMES[gameState.listenLevel]);
}

function handleSkipSong() {
  if (!gameState.currentSong || gameState.answered) {
    return;
  }

  gameState.answered = true;

  stopAudioMonitor();
  stopSong();

  showMessage(`Skip. Answer is "${gameState.currentSong.title}"`);

  displaySongInformation(gameState.currentSong);

  guessInput.disabled = true;
  guessButton.disabled = true;
  listenMoreButton.disabled = true;
  replayButton.disabled = true;
  skipButton.disabled = true;
  nextButton.disabled = false;

  scheduleNextSong();
}

function handleRetry() {
  stopAudioMonitor();
  stopSong();
  resetSongInformation();
  resetScheduleNextSong();
  resetAllSongsContainer();

  retryButton.hidden = true;
  gameState.playlist = shuffleSongs(gameState.songs);
  gameState.currentSongIndex = -1;
  gameState.currentSong = null;
  gameState.score = 0;
  gameState.answered = false;
  gameState.listenLevel = 0;
  gameState.roundScore = ROUND_SCORES[0];
  gameState.selectedGenre = null;

  startNextRound();
}

//Game logic--------------------------------------------------------------
async function startNextRound() {
  stopAudioMonitor();
  resetScheduleNextSong();

  genreButtons.forEach((button) => {
    button.disabled = true;
  });

  gameState.currentSongIndex++;

  if (gameState.currentSongIndex >= gameState.playlist.length) {
    finishGame();
    return;
  }

  gameState.currentSong = gameState.playlist[gameState.currentSongIndex];
  gameState.answered = false;
  gameState.listenLevel = 0;
  gameState.roundScore = ROUND_SCORES[0];

  guessInput.value = "";
  guessInput.disabled = false;
  guessButton.disabled = false;

  listenMoreButton.textContent = "More";
  listenMoreButton.disabled = true;
  replayButton.disabled = true;
  skipButton.disabled = false;

  nextButton.disabled = true;
  nextButton.textContent = "NEXT SONG 👉";

  resetSongInformation();

  showMessage(
    `Bài ${gameState.currentSongIndex + 1}/${gameState.playlist.length}`,
  );

  await playSong(gameState.currentSong);

  if (gameState.answered) return;
  replayButton.disabled = false;
  monitorAudioTime(LISTEN_END_TIMES[gameState.listenLevel]);

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
    messageElement.classList.add("color-red");
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
    messageElement.classList.add("color-red");
  }

  displaySongInformation(gameState.currentSong);

  scoreElement.textContent = `Điểm: ${gameState.score}`;
  scoreElement.setAttribute("font-weight", "700");

  listenMoreButton.disabled = true;
  replayButton.disabled = true;
  skipButton.disabled = true;

  guessInput.disabled = true;
  guessButton.disabled = true;
  nextButton.disabled = false;

  scheduleNextSong();
}

function finishGame() {
  stopAudioMonitor();
  stopSong();
  resetSongInformation();

  listenMoreButton.disabled = true;
  replayButton.disabled = true;
  skipButton.disabled = true;

  showMessage(`Total Score : ${gameState.score}`);
  messageElement.classList.add("color-blue");
  modalElement.style.display = "block";
  finalScoreElement.textContent = `Your final score is: ${gameState.score} 🎉🎉`;

  guessInput.disabled = true;
  guessButton.disabled = true;
  nextButton.disabled = true;
  retryButton.hidden = false;
  genreButtons.forEach((button) => {
    button.disabled = false;
  });

  resetAllSongsContainer();

  allSongContainer.hidden = false;
  allSongsList.replaceChildren();
  allSongsElement.textContent = `Danh sách bài hát (${gameState.playlist.length})`;
  gameState.songs.forEach((song) => {
    const songItem = document.createElement("li");

    if (song.image_url) {
      const songImage = document.createElement("img");
      songImage.src = createImageUrl(song.image_url);
      songImage.alt = `${song.title}`;
      songImage.loading = "lazy";
      songItem.appendChild(songImage);
    }

    const songDetails = document.createElement("span");
    songDetails.classList.add("song-details");
    songDetails.textContent = `${song.title} - ${song.artist} (${song.genre})`;
    songDetails.setAttribute("font-text", "bold");
    songItem.appendChild(songDetails);
    allSongsList.appendChild(songItem);
  });
}

listenMoreButton.addEventListener("click", handleListenMore);
replayButton.addEventListener("click", handleReplay);
skipButton.addEventListener("click", handleSkipSong);
volumeSlider.addEventListener("input", updateVolume);
guessForm.addEventListener("submit", checkAnswer);
nextButton.addEventListener("click", startNextRound);
resetGenreButton.addEventListener("click", handleResetGenre);
closeModalButton.addEventListener("click", () => {
  modalElement.style.display = "none";
})
retryButton.addEventListener("click", handleRetry);

genreButtons.forEach((button) => {
  button.addEventListener("click", () => selectGenre(button.dataset.genre));
});

updateVolume();
showMessage("Chọn Vpop hoặc Jpop để bắt đầu");
