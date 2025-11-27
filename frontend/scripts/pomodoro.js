let timerInterval = null;
let currentMode = "focus";
let timeLeft = 25 * 60;
let isRunning = false; // controla se está contando
let isPaused = false; // controla se está pausado

const modes = {
  focus: 25,
  short: 5,
  long: 15,
};

function setMode(mode) {
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));

  if (mode === "focus")
    document.querySelector(".tab:nth-child(1)").classList.add("active");
  if (mode === "short")
    document.querySelector(".tab:nth-child(2)").classList.add("active");
  if (mode === "long")
    document.querySelector(".tab:nth-child(3)").classList.add("active");

  currentMode = mode;
  timeLeft = modes[mode] * 60;

  updateTimerDisplay();
  clearInterval(timerInterval);
  timerInterval = null;

  isRunning = false;
  isPaused = false;

  document.querySelector(".pomodoro-main").textContent = "START";
}

function togglePomodoro() {
  const btn = document.querySelector(".pomodoro-main");

  // Se não está rodando, iniciar
  if (!isRunning) {
    startPomodoro();
    isRunning = true;
    btn.textContent = "PAUSE";
    return;
  }

  // Se está rodando, mas não está pausado → pausar
  if (!isPaused) {
    isPaused = true;
    btn.textContent = "RESUME";
    return;
  }

  // Se está pausado → retomar
  if (isPaused) {
    isPaused = false;
    btn.textContent = "PAUSE";
    return;
  }
}

function startPomodoro() {
  timerInterval = setInterval(() => {
    if (!isPaused) {
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;

        document.querySelector(".pomodoro-main").textContent = "START";

        document.getElementById("alarm-sound").play();
        alert("Tempo finalizado!");
        return;
      }

      timeLeft--;
      updateTimerDisplay();
    }
  }, 1000);
}

function resetPomodoro() {
  clearInterval(timerInterval);
  timerInterval = null;

  timeLeft = modes[currentMode] * 60;
  isRunning = false;
  isPaused = false;

  updateTimerDisplay();

  document.querySelector(".pomodoro-main").textContent = "START";
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  document.getElementById("pomodoro-countdown").textContent =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}
