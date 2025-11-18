const API = "http://localhost:8000";
loadTodos();

/* async function debugSession() {
  console.log("=== DEBUG SESSION ===");

  // Verifica cookies
  console.log("Cookies:", document.cookie);

  // Testa a sessão diretamente
  try {
    const response = await fetch(`${API}/check_session.php`, {
      credentials: "include",
    });
    console.log("Status:", response.status);
    const data = await response.text();
    console.log("Resposta crua:", data);

    const parsedData = JSON.parse(data);
    console.log("Dados parseados:", parsedData);

    return parsedData;
  } catch (error) {
    console.error("Erro no debug:", error);
  }
} */

async function addTodoSimple() {
  const titleInput = document.getElementById("todo-title");
  const title = titleInput.value.trim();

  if (!title) return;

  try {
    const button = document.querySelector(".botao");
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Adicionando...";

    const response = await fetch(`${API}/todos.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (response.ok) {
      const data = await response.json();
      titleInput.value = "";

      // Recarrega a lista completa para mostrar o novo item
      await loadTodos();

      console.log("TODO adicionado com ID:", data.id);
    } else {
      console.error("Erro na resposta do servidor");
    }
  } catch (error) {
    console.error("Erro ao adicionar TODO:", error);
  } finally {
    const button = document.querySelector(".botao");
    button.disabled = false;
    button.textContent = "Adicionar";
  }
}

// Função loadTodos atualizada para debug
async function loadTodos() {
  try {
    const r = await fetch(`${API}/todos.php`, { credentials: "include" });
    const data = await r.json();

    console.log("TODOs carregados:", data.todos); // Debug

    const ul = document.getElementById("todo-list");
    ul.innerHTML = "";

    if (data.todos && data.todos.length > 0) {
      data.todos.forEach((t) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${t.title}</span>
          <button onclick="deleteTodo(${t.id})">✓</button>
        `;
        ul.appendChild(li);
      });
    } else {
      ul.innerHTML = '<li style="color: #666;">Nenhuma tarefa encontrada</li>';
    }
  } catch (error) {
    console.error("Erro ao carregar TODOs:", error);
  }
}

async function deleteTodo(id) {
  if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

  try {
    await fetch(`${API}/todos.php`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    // Recarrega a lista após excluir
    await loadTodos();
  } catch (error) {
    console.error("Erro ao excluir TODO:", error);
  }
}

let currentPomodoroId = null;
let countdownInterval = null;
let remainingMs = 0;

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function startCountdown(durationMs) {
  clearInterval(countdownInterval);

  remainingMs = durationMs;
  const display = document.getElementById("pomodoro-countdown");

  display.textContent = formatTime(remainingMs);

  countdownInterval = setInterval(() => {
    remainingMs -= 1000;

    if (remainingMs <= 0) {
      clearInterval(countdownInterval);
      display.textContent = "00:00";
      stopPomodoro(); // ENCERRA AUTOMATICAMENTE NO BACKEND
      return;
    }

    display.textContent = formatTime(remainingMs);
  }, 1000);
}

async function startPomodoro(type) {
  const minutes = parseInt(document.getElementById("custom-time").value, 10);

  if (!minutes || minutes <= 0) {
    alert("Digite um tempo válido em minutos!");
    return;
  }

  const durationMs = minutes * 60 * 1000;

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
  ).textContent = `Pomodoro iniciado: ${type} (${minutes} min) – ID ${currentPomodoroId}`;

  startCountdown(durationMs);
}

async function stopPomodoro() {
  if (!currentPomodoroId) return;

  clearInterval(countdownInterval);

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

  // Zera o display após parar
  document.getElementById("pomodoro-countdown").textContent = "";

  currentPomodoroId = null;
}
