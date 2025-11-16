const API = "http://localhost:8000";

function showLogin() {
  document.getElementById("login-section").classList.remove("hidden");
  document.getElementById("register-section").classList.add("hidden");
}

function showRegister() {
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("register-section").classList.remove("hidden");
}

function showApp() {
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("register-section").classList.add("hidden");
  document.getElementById("app-section").classList.remove("hidden");
  loadTodos();
}

/* ---------------- LOGIN ---------------- */
async function login() {
  const login = document.getElementById("login").value;
  const password = document.getElementById("password").value;

  const r = await fetch(`${API}/login.php`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });

  const data = await r.json();
  if (data.user_id) {
    showApp();
  } else alert(data.error);
}

/* ---------------- REGISTER ---------------- */
async function register() {
  const username = document.getElementById("reg-username").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  const r = await fetch(`${API}/register.php`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await r.json();
  if (data.user_id) {
    showApp();
  } else alert(data.error);
}

/* ---------------- LOGOUT ---------------- */
async function logout() {
  await fetch(`${API}/logout.php`, {
    credentials: "include",
  });

  location.reload();
}

/* ---------------- TODOS ---------------- */
async function loadTodos() {
  const r = await fetch(`${API}/todos.php`, { credentials: "include" });
  const data = await r.json();

  const ul = document.getElementById("todo-list");
  ul.innerHTML = "";

  data.todos.forEach((t) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${t.title}</span>
      <button onclick="deleteTodo(${t.id})">X</button>
    `;
    ul.appendChild(li);
  });
}

async function addTodo() {
  const title = document.getElementById("todo-title").value;
  if (!title) return;

  await fetch(`${API}/todos.php`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  document.getElementById("todo-title").value = "";
  loadTodos();
}

async function deleteTodo(id) {
  await fetch(`${API}/todos.php`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  loadTodos();
}

/* ---------------- POMODORO ---------------- */
let currentPomodoroId = null;

async function startPomodoro(type) {
  const r = await fetch(`${API}/pomodoro.php`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });

  const data = await r.json();
  currentPomodoroId = data.id;

  document.getElementById(
    "pomodoro-status"
  ).textContent = `Pomodoro iniciado: ${type} (ID ${currentPomodoroId})`;

  // exemplo simples: parar automático em 5s para teste
  setTimeout(stopPomodoro, 5000);
}

async function stopPomodoro() {
  if (!currentPomodoroId) return;

  const r = await fetch(`${API}/pomodoro.php`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: currentPomodoroId }),
  });

  const data = await r.json();

  document.getElementById(
    "pomodoro-status"
  ).textContent = `Pomodoro encerrado (${data.duration_seconds}s)`;

  currentPomodoroId = null;
}
