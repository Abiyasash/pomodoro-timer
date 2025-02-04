const timer = document.querySelector(".timer");
const startBtn = document.querySelector(".startBtn");
const stopBtn = document.querySelector(".stopBtn");
const resetBtn = document.querySelector(".resetBtn");
const testRingtoneBtn = document.querySelector(".testRingtoneBtn");
const ringtoneSelection = document.querySelector(".ringtoneSelection");

const statusOfTimer = document.querySelector(".statusOfTimer");

const workTimeInput = document.querySelector(".workTimeInput");
const breakTimeInput = document.querySelector(".breakTimeInput");

let intervalId = null;
let timerRunning = false;
let timeLeft = 0;

let timerWasStarted = false;
let breakHasStarted = false;
let secondWorkTimeHasStarted = false;

let isFirstWorkTime = true;
let isBreakTime = false;
let isSecondWorkTime = false;
let timerFinished = false;

function startWorkTime() {
  return new Promise((resolve, reject) => {
    if (!timerRunning || isSecondWorkTime) {
      if (!timerWasStarted) {
        timeLeft = convertToSeconds(workTimeInput.value);
      } else if (secondWorkTimeHasStarted) {
        timeLeft = convertToSeconds(workTimeInput.value);
        secondWorkTimeHasStarted = false;
      }
      timerWasStarted = true;
      document.title = "Work Time!";
      statusOfTimer.textContent = "Work Time!";
      timerRunning = true;
      intervalId = setInterval(() => {
        if (timeLeft < 0) {
          clearInterval(intervalId);
          timerRunning = false;
          resolve();
        } else {
          displayTimer(timeLeft);
          console.log(timeLeft);
          timeLeft--;
        }
      }, 1000);
    }
  });
}

function startBreakTime() {
  return new Promise((resolve, reject) => {
    if (!timerRunning) {
      if (!breakHasStarted) {
        timeLeft = convertToSeconds(breakTimeInput.value);
        if (timeLeft <= 0) {
          alert("Break time must be at least 00:00:01.");
          return;
        }
        breakHasStarted = true;
      }
      document.title = "Break Time!";
      statusOfTimer.textContent = "Break Time!";
      timerRunning = true;
      intervalId = setInterval(() => {
        if (timeLeft < 0) {
          clearInterval(intervalId);
          timerRunning = false;
          resolve();
        } else {
          displayTimer(timeLeft);
          console.log(timeLeft);
          timeLeft--;
        }
      }, 1000);
    }
  });
}

function validateTimeFormat(timeString) {
  const regex = /^(\d{2}):(\d{2}):(\d{2})$/;
  if (!regex.test(timeString)) return false;

  let [hours, minutes, seconds] = timeString.split(":").map(Number);

  if (hours > 24) return false;
  if (hours === 24 && (minutes !== 0 || seconds !== 0)) return false;
  if (minutes > 59 || seconds > 59) return false;
  if (hours === 0 && minutes === 0 && seconds === 0) return false;

  return true;
}

function convertToSeconds(timeString) {
  if (!validateTimeFormat(timeString)) {
    alert(
      "Time must be in the format HH:MM:SS, follow the rules for hours, minutes, and seconds, and must be at least 00:00:01."
    );
    throw new Error("Invalid time format");
    return;
  }
  let [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

function displayTimer(time) {
  let hours = Math.floor(time / 3600)
    .toString()
    .padStart(2, "0");
  let minutes = Math.floor((time % 3600) / 60)
    .toString()
    .padStart(2, "0");
  let seconds = (time % 60).toString().padStart(2, "0");
  timer.textContent = `${hours}:${minutes}:${seconds}`;
  document.title = `${
    isFirstWorkTime || isSecondWorkTime ? "Work Time!" : "Break Time!"
  } ${hours}:${minutes}:${seconds}`;
}

async function startPomodoroTimer() {
  if (
    !validateTimeFormat(workTimeInput.value) ||
    !validateTimeFormat(breakTimeInput.value)
  ) {
    alert(
      "Time must be in the format HH:MM:SS, follow the rules for hours, minutes, and seconds, and must be at least 00:00:01."
    );
    throw new Error("Invalid time format");
    return;
  }

  while (!timerFinished) {
    if (isFirstWorkTime) {
      await startWorkTime();
      playRingtone();
      isFirstWorkTime = false;
      isBreakTime = true;
    }
    if (isBreakTime) {
      await startBreakTime();
      playRingtone();
      isBreakTime = false;
      isSecondWorkTime = true;
      secondWorkTimeHasStarted = true;
    }
    if (isSecondWorkTime) {
      await startWorkTime();
      playRingtone();
      isSecondWorkTime = false;
      timerFinished = true;
    }
  }
  resetTimerStates();
}

function resetTimerStates() {
  timerWasStarted = false;
  breakHasStarted = false;
  isFirstWorkTime = true;
  isBreakTime = false;
  isSecondWorkTime = false;
  timerFinished = false;
  document.title = "Pomodoro Timer";
  statusOfTimer.textContent = "";
}

function stopTimer() {
  clearInterval(intervalId);
  timerRunning = false;
}

function resetTimer() {
  clearInterval(intervalId);
  timerRunning = false;
  timeLeft = 0;
  timerWasStarted = false;
  breakHasStarted = false;
  isFirstWorkTime = true;
  isBreakTime = false;
  isSecondWorkTime = false;
  timerFinished = false;
  displayTimer(timeLeft);
  document.title = "Pomodoro Timer";
  statusOfTimer.textContent = "";
}

function playRingtone() {
  const ringtone = ringtoneSelection.value;
  const audioElement = document.createElement("audio");
  audioElement.style.display = "none";
  audioElement.preload = "none";
  audioElement.src = ringtone;
  document.body.appendChild(audioElement);

  audioElement.addEventListener("canplaythrough", () => {
    audioElement.play();
  });

  audioElement.load();
}

startBtn.addEventListener("click", startPomodoroTimer);
stopBtn.addEventListener("click", stopTimer);
resetBtn.addEventListener("click", resetTimer);
testRingtoneBtn.addEventListener("click", (event) => {
  event.preventDefault();
  playRingtone();
});
