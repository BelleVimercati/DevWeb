const API = "http://localhost:8000";

function showLogin() {
  document.getElementById("login-section").classList.remove("hidden");
  document.getElementById("register-section").classList.add("hidden");
}

function showRegister() {
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("register-section").classList.remove("hidden");
}

/* ---------------- LOGIN ---------------- */
async function login() {
  const login = document.getElementById("login").value;
  const password = document.getElementById("password").value;

  const r = await fetch(`${API}/login.php`, {
    method: "POST",
    credentials: "include", // mantém a sessão
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });

  const data = await r.json();

  console.log("RESPONSE:", data); // debug para ver o que chega

  if (data.user_id) {
    // 🔥 redirecionar
    window.location.href = "pages/home.html";
  } else {
    alert(data.error);
  }
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
  try {
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
  } catch (error) {
    console.error("Erro ao carregar TODOs:", error);
  }
}

async function addTodo() {
  const titleInput = document.getElementById("todo-title");
  const title = titleInput.value.trim();

  if (!title) return;

  try {
    // Disable o botão para evitar múltiplos cliques
    const button = event.target;
    button.disabled = true;
    button.textContent = "Adicionando...";

    const response = await fetch(`${API}/todos.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (response.ok) {
      // Limpa o input imediatamente para feedback visual
      titleInput.value = "";

      // Recarrega a lista de TODOs
      await loadTodos();
    } else {
      console.error("Erro ao adicionar TODO");
    }
  } catch (error) {
    console.error("Erro ao adicionar TODO:", error);
  } finally {
    // Reabilita o botão
    const button = document.querySelector('button[onclick="addTodo()"]');
    button.disabled = false;
    button.textContent = "Adicionar";
  }
}

// Versão otimizada que adiciona localmente sem recarregar tudo
async function addTodoOptimized() {
  const titleInput = document.getElementById("todo-title");
  const title = titleInput.value.trim();

  if (!title) return;

  try {
    const button = event.target;
    button.disabled = true;
    button.textContent = "Adicionando...";

    const response = await fetch(`${API}/todos.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (response.ok) {
      const newTodo = await response.json();
      titleInput.value = "";

      // Adiciona o novo TODO localmente sem recarregar toda a lista
      addTodoToList(newTodo.todo);
    }
  } catch (error) {
    console.error("Erro ao adicionar TODO:", error);
  } finally {
    const button = document.querySelector(
      'button[onclick="addTodoOptimized()"]'
    );
    button.disabled = false;
    button.textContent = "Adicionar";
  }
}

// Função para adicionar um TODO à lista visualmente
function addTodoToList(todo) {
  const ul = document.getElementById("todo-list");
  const li = document.createElement("li");
  li.innerHTML = `
    <span>${todo.title}</span>
    <button onclick="deleteTodo(${todo.id})">X</button>
  `;
  ul.appendChild(li);
}

async function deleteTodo(id) {
  if (!confirm("Tem certeza que deseja excluir este TODO?")) return;

  try {
    await fetch(`${API}/todos.php`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    // Remove o item visualmente
    const items = document.querySelectorAll("#todo-list li");
    items.forEach((item) => {
      if (item.querySelector("button").onclick.toString().includes(id)) {
        item.remove();
      }
    });

    // Ou simplesmente recarrega a lista para garantir consistência
    // await loadTodos();
  } catch (error) {
    console.error("Erro ao excluir TODO:", error);
  }
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
